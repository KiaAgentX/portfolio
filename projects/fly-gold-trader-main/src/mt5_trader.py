# -*- coding: utf-8 -*-
"""MetaTrader 5 trading functions.

DEBUGGED EDITION - fixes applied here:
  BUG-1: MT5 rate tuples are (time, open, HIGH, LOW, close, ...). The
         original code read highs=r[3] and lows=r[2] - swapped. Every ATR,
         candle pattern and fly-brain image was built from inverted wicks.
  BUG-3: `import MetaTrader5` was unconditional, but the MT5 python package
         only exists for Windows, so the whole server was un-importable on
         Linux/macOS (and pip install failed there too). Now optional.
  BUG-5: None-guards everywhere (symbol_info_tick / order_send / account_info
         can all return None on a dropped terminal connection).
  BUG-1b: close_position() hard-coded the GOLD symbol, ignoring the actual
          position's symbol.

NEW OPTION: built-in SimBroker -> PAPER trading mode (TRADE_MODE=paper).
Identical public API, deterministic random-walk market, real position /
PnL / balance accounting, zero risk.
"""
import math
import os
import random
import time


GOLD = "XAUUSD!"
USDCAD = "USDCAD!"
EURUSD = "EURUSD!"

MAGIC = 202401

# ---------------------------------------------------------------------------
# BUG-3 fix: MT5 is optional. On Linux/macOS (or when TRADE_MODE=paper)
# the SimBroker below provides the exact same API.
# ---------------------------------------------------------------------------
try:
    import MetaTrader5 as _real_mt5  # noqa: N813  (Windows only)
    MT5_AVAILABLE = True
except Exception:  # ImportError or DLL load failure
    _real_mt5 = None
    MT5_AVAILABLE = False


# MT5 candle tuple layout - single source of truth (BUG-1 fix)
_T_OPEN, _T_HIGH, _T_LOW, _T_CLOSE, _T_VOL = 1, 2, 3, 4, 5


def parse_rates(rates):
    """Convert MT5 (or sim) candle tuples to OHLCV dict. BUG-1 fixed."""
    return {
        "opens": [float(r[_T_OPEN]) for r in rates],
        "highs": [float(r[_T_HIGH]) for r in rates],
        "lows": [float(r[_T_LOW]) for r in rates],
        "closes": [float(r[_T_CLOSE]) for r in rates],
        "volumes": [float(r[_T_VOL]) for r in rates],
    }


# ===========================================================================
# SimBroker - deterministic paper-trading market (NEW OPTION)
# ===========================================================================
class SimPosition:
    __slots__ = ("ticket", "symbol", "type", "volume", "price_open",
                 "time", "profit")

    def __init__(self, ticket, symbol, ptype, volume, price):
        self.ticket = ticket
        self.symbol = symbol
        self.type = ptype            # 0 = BUY, 1 = SELL (MT5 convention)
        self.volume = volume
        self.price_open = price
        self.time = time.time()
        self.profit = 0.0


class SimBroker:
    """Random-walk market with real position/PnL accounting."""

    TF_SECONDS = {"M1": 60, "M5": 300, "M15": 900, "M30": 1800,
                  "H1": 3600, "H4": 14400, "D1": 86400}
    CONTRACT = {GOLD: 100.0, USDCAD: 100000.0, EURUSD: 100000.0}
    SPREAD = {GOLD: 0.30, USDCAD: 0.00012, EURUSD: 0.00010}
    BASE = {GOLD: 3650.0, USDCAD: 1.3650, EURUSD: 1.0850}

    def __init__(self, seed=20240101, balance=10000.0, speed=None):
        self.rng = random.Random(seed)
        self.speed = float(speed or os.environ.get("SIM_SPEED", "30"))
        self.t0 = time.time()   # sim epoch: real start, speed-multiplied
        self.mid = dict(self.BASE)
        self.trend = {s: 0.0 for s in self.BASE}
        self.candles = {}        # (symbol, tf) -> list of tuples
        self.cursor = {}         # (symbol, tf) -> sim time of last candle
        self.balance = balance
        self.positions = []
        self._ticket = 100000
        self._connected = False

    # -- market model ------------------------------------------------------
    def _vol(self, symbol):
        return self.BASE[symbol] * 0.00012

    def _step(self, symbol):
        # regime-switching drift + gaussian noise + mild mean reversion
        if self.rng.random() < 0.02:
            self.trend[symbol] = self.rng.uniform(-0.6, 0.6)
        drift = self.trend[symbol] * self._vol(symbol) * 0.4
        revert = (self.BASE[symbol] - self.mid[symbol]) * 0.002
        noise = self.rng.gauss(0.0, self._vol(symbol))
        self.mid[symbol] += drift + revert + noise

    def tick(self, symbol):
        self._step(symbol)
        half = self.SPREAD.get(symbol, 0.0) / 2.0
        p = self.mid[symbol]
        digits = 2 if symbol == GOLD else 5
        return {"bid": round(p - half, digits),
                "ask": round(p + half, digits),
                "spread": round(half * 2, digits)}

    # -- candles ------------------------------------------------------------
    def _seed_history(self, symbol, tf, count):
        key = (symbol, tf)
        if key in self.candles:
            return
        tf_s = self.TF_SECONDS[tf]
        vol = self._vol(symbol) * math.sqrt(tf_s / 60.0)
        rows = []
        price = self.mid[symbol] - self.rng.uniform(-6, 6) * vol
        # simulated timestamps (epoch 0 == process start, speed-multiplied)
        t = int((time.time() - self.t0) * self.speed) - count * tf_s
        for _ in range(count):
            o = price
            c = o + self.rng.gauss(0.0, vol) + self.trend[symbol] * vol * 0.3
            hi = max(o, c) + abs(self.rng.gauss(0.0, vol * 0.5))
            lo = min(o, c) - abs(self.rng.gauss(0.0, vol * 0.5))
            tv = abs(self.rng.gauss(120, 60))
            rows.append((t, round(o, 2), round(hi, 2), round(lo, 2),
                         round(c, 2), round(tv, 0), 0, 0.0))
            price = c
            t += tf_s
        self.candles[key] = rows
        self.cursor[key] = t - tf_s
        self.mid[symbol] = price

    def _advance(self, symbol, tf):
        """Roll new candles while simulated time passes (SIM_SPEED x)."""
        key = (symbol, tf)
        tf_s = self.TF_SECONDS[tf]
        vol = self._vol(symbol) * math.sqrt(tf_s / 60.0)
        now_sim = (time.time() - self.t0) * self.speed
        guard = 0
        while self.cursor[key] + tf_s <= now_sim and guard < 240:
            last = self.candles[key][-1]
            o = last[4]
            c = o + self.rng.gauss(0.0, vol) + self.trend[symbol] * vol * 0.3
            hi = max(o, c) + abs(self.rng.gauss(0.0, vol * 0.5))
            lo = min(o, c) - abs(self.rng.gauss(0.0, vol * 0.5))
            tv = abs(self.rng.gauss(120, 60))
            t = self.cursor[key] + tf_s
            self.candles[key].append(
                (t, round(o, 2), round(hi, 2), round(lo, 2),
                 round(c, 2), round(tv, 0), 0, 0.0))
            self.cursor[key] = t
            self.mid[symbol] = c
            if len(self.candles[key]) > 400:
                self.candles[key] = self.candles[key][-400:]
            guard += 1
        # live the current candle with the ticking price
        self._step(symbol)
        last = list(self.candles[key][-1])
        last[4] = round(self.mid[symbol], 2)
        last[2] = round(max(last[2], self.mid[symbol]), 2)
        last[3] = round(min(last[3], self.mid[symbol]), 2)
        self.candles[key][-1] = tuple(last)

    def rates(self, symbol, tf, count):
        self._seed_history(symbol, tf, max(count, 60))
        self._advance(symbol, tf)
        return self.candles[(symbol, tf)][-count:]

    # -- trading -------------------------------------------------------------
    def _mark(self):
        for p in self.positions:
            t = self.tick(p.symbol)
            cur = t["bid"] if p.type == 0 else t["ask"]
            sign = 1.0 if p.type == 0 else -1.0
            p.profit = round(
                (cur - p.price_open) * sign * p.volume * self.CONTRACT[p.symbol], 2)

    def open(self, direction, volume, symbol):
        t = self.tick(symbol)
        price = t["ask"] if direction == "BUY" else t["bid"]
        self._ticket += 1
        self.positions.append(
            SimPosition(self._ticket, symbol, 0 if direction == "BUY" else 1,
                        volume, price))
        return True, price

    def close(self, position):
        t = self.tick(position.symbol)
        self._mark()
        pos = next((p for p in self.positions
                    if p.ticket == position.ticket), None)
        if pos is None:
            return False
        self.balance = round(self.balance + pos.profit, 2)
        self.positions = [p for p in self.positions
                          if p.ticket != position.ticket]
        return True

    def account(self):
        self._mark()
        profit = round(sum(p.profit for p in self.positions), 2)
        margin = round(sum(p.volume * self.mid[p.symbol]
                           * self.CONTRACT[p.symbol] / 500.0
                           for p in self.positions), 2)
        return {
            "balance": self.balance,
            "equity": round(self.balance + profit, 2),
            "profit": profit,
            "margin": margin,
            "free_margin": round(self.balance + profit - margin, 2),
        }


_SIM = None


def _sim():
    global _SIM
    if _SIM is None:
        _SIM = SimBroker()
    return _SIM


def use_paper():
    """True when running on the simulator instead of the MT5 terminal."""
    return _mode() == "paper"


def _mode():
    mode = os.environ.get("TRADE_MODE", "paper").strip().lower()
    if mode == "live" and not MT5_AVAILABLE:
        return "paper"
    return mode


# ===========================================================================
# Public API (identical signatures to the original module)
# ===========================================================================
def connect():
    """Initialize market connection (MT5 terminal or simulator)."""
    if use_paper():
        _sim()._connected = True
        a = _sim().account()
        return True, (f"[PAPER] Simulator ready | Balance: {a['balance']:.2f} "
                      f"(MT5 lib available: {MT5_AVAILABLE})")
    # BUG-5 fix: guard account_info() == None
    if not _real_mt5.initialize():
        return False, str(_real_mt5.last_error())
    for s in (GOLD, USDCAD, EURUSD):
        _real_mt5.symbol_select(s, True)
    account = _real_mt5.account_info()
    if account is None:
        return False, f"MT5 connected but account_info failed: {_real_mt5.last_error()}"
    return True, f"Connected: {account.login} | Balance: {account.balance}"


def disconnect():
    """Shutdown market connection."""
    if not use_paper() and _real_mt5 is not None:
        _real_mt5.shutdown()


def get_tick(symbol=GOLD):
    """Get current tick data."""
    if use_paper():
        return _sim().tick(symbol)
    tick = _real_mt5.symbol_info_tick(symbol)
    if tick is None:
        return None
    return {"bid": tick.bid, "ask": tick.ask,
            "spread": round(tick.ask - tick.bid, 2)}


def timeframe(name):
    """Map 'M1'..'D1' -> MT5 constant (live) or passthrough (paper)."""
    if use_paper():
        return name
    return getattr(_real_mt5, f"TIMEFRAME_{name}")


def get_rates(symbol, timeframe_, count=50):
    """Get candle data. Accepts a TF name ('M1'..'D1') or MT5 constant."""
    if use_paper():
        tf = timeframe_ if isinstance(timeframe_, str) else timeframe_
        rates = _sim().rates(symbol, tf, count)
    else:
        tf = timeframe_
        if isinstance(tf, str):
            tf = getattr(_real_mt5, f"TIMEFRAME_{tf}")
        rates = _real_mt5.copy_rates_from_pos(symbol, tf, 0, count)
    if rates is None or len(rates) == 0:
        return None
    return parse_rates(rates)  # BUG-1 fix: correct column order


def open_position(direction, volume=0.01, symbol=GOLD):
    """Open a market position."""
    if use_paper():
        return _sim().open(direction, volume, symbol)

    # BUG-5 fix: tick may be None
    tick = _real_mt5.symbol_info_tick(symbol)
    if tick is None:
        return False, "No tick data"

    req = {
        "action": _real_mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": (_real_mt5.ORDER_TYPE_BUY if direction == "BUY"
                 else _real_mt5.ORDER_TYPE_SELL),
        "price": tick.ask if direction == "BUY" else tick.bid,
        "deviation": 30,
        "magic": MAGIC,
        "comment": "FLY-TRADER",
        "type_time": _real_mt5.ORDER_TIME_GTC,
        "type_filling": _real_mt5.ORDER_FILLING_IOC,
    }
    r = _real_mt5.order_send(req)
    # BUG-5 fix: order_send() can return None
    if r is None:
        return False, f"order_send returned None: {_real_mt5.last_error()}"
    if r.retcode == _real_mt5.TRADE_RETCODE_DONE:
        return True, r.price
    return False, r.comment


def close_position(position):
    """Close an existing position."""
    if use_paper():
        return _sim().close(position)

    # BUG-1b fix: use the position's own symbol, not hard-coded GOLD.
    symbol = getattr(position, "symbol", GOLD)
    tick = _real_mt5.symbol_info_tick(symbol)
    if tick is None:
        return False
    req = {
        "action": _real_mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": position.volume,
        "type": (_real_mt5.ORDER_TYPE_SELL if position.type == 0
                 else _real_mt5.ORDER_TYPE_BUY),
        "position": position.ticket,
        "price": tick.bid if position.type == 0 else tick.ask,
        "deviation": 30,
        "magic": MAGIC,
        "comment": "FLY-CLOSE",
        "type_time": _real_mt5.ORDER_TIME_GTC,
        "type_filling": _real_mt5.ORDER_FILLING_IOC,
    }
    r = _real_mt5.order_send(req)
    if r is None:
        return False
    return r.retcode == _real_mt5.TRADE_RETCODE_DONE


def get_positions(symbol=GOLD):
    """Get open positions."""
    if use_paper():
        sim = _sim()
        sim._mark()
        return [
            {
                "ticket": p.ticket,
                "type": "BUY" if p.type == 0 else "SELL",
                "volume": p.volume,
                "open_price": p.price_open,
                "current": (sim.tick(p.symbol)["bid"] if p.type == 0
                            else sim.tick(p.symbol)["ask"]),
                "pnl": round(p.profit, 2),
            }
            for p in sim.positions if p.symbol == symbol
        ]
    positions = _real_mt5.positions_get(symbol=symbol)
    if positions is None:
        return []
    return [
        {
            "ticket": p.ticket,
            "type": "BUY" if p.type == 0 else "SELL",
            "volume": p.volume,
            "open_price": p.price_open,
            "current": p.price_current,
            "pnl": round(p.profit, 2),
        }
        for p in positions
    ]


def get_raw_positions(symbol=GOLD):
    """Raw position objects (needed by close_position / PnL tracking)."""
    if use_paper():
        _sim()._mark()
        return [p for p in _sim().positions if p.symbol == symbol]
    positions = _real_mt5.positions_get(symbol=symbol)
    return list(positions) if positions else []


def get_account():
    """Get account info."""
    if use_paper():
        return _sim().account()
    info = _real_mt5.account_info()
    if info is None:
        return None
    return {
        "balance": info.balance,
        "equity": info.equity,
        "profit": info.profit,
        "margin": info.margin,
        "margin_free": info.margin_free,
    }
