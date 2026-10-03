# -*- coding: utf-8 -*-
"""Backtesting engine - PRO edition.

Deterministic synthetic market (regime-switching random walk) replayed
candle-by-candle through the SAME StrategyEngine + risk rules used live.
Fills model the spread; TP/SL/trailing are evaluated inside each candle
with high/low so results are honest. Produces standard metrics and an
equity curve, plus a small TP/SL parameter sweep.
"""
import math
import random

from src import indicators as ind
from src.strategies import StrategyEngine


def gen_candles(seed, count=2000, base=3650.0, tf_vol=0.9):
    """Regime-switching random walk -> list of (o,h,l,c,v) dicts."""
    rng = random.Random(seed)
    candles, price, trend = [], base, 0.0
    for _ in range(count):
        if rng.random() < 0.03:
            trend = rng.uniform(-0.5, 0.5)
        o = price
        c = o + rng.gauss(0, tf_vol) + trend * tf_vol * 0.6
        c += (base - o) * 0.0015                      # mild mean reversion
        h = max(o, c) + abs(rng.gauss(0, tf_vol * 0.5))
        l = min(o, c) - abs(rng.gauss(0, tf_vol * 0.5))
        v = abs(rng.gauss(120, 60))
        candles.append({"o": round(o, 2), "h": round(h, 2),
                        "l": round(l, 2), "c": round(c, 2), "v": round(v)})
        price = c
    return candles


def _fly_proxy(closes):
    """Deterministic stand-in for the fly score (momentum based)."""
    if len(closes) < 7:
        return 0.0
    rng_ = max(closes[-20:]) - min(closes[-20:]) if len(closes) >= 20 else 1e-9
    return max(-1.0, min(1.0, (closes[-1] - closes[-6]) / max(rng_, 1e-9)))


def run_backtest(seed=7, candles=2000, tp=8.0, sl=4.0, trail=3.0,
                 spread=0.3, volume=0.01, strategy="ensemble",
                 max_positions=3):
    data = gen_candles(seed, candles)
    engine = StrategyEngine(strategy)

    balance, start = 10000.0, 10000.0
    positions = []          # dicts: side, entry, peak
    equity_curve = []
    trades = []
    WARM = 60

    for i in range(WARM, len(data)):
        win = data[max(0, i - 60):i + 1]
        closes = [d["c"] for d in win]
        highs = [d["h"] for d in win]
        lows = [d["l"] for d in win]
        opens = [d["o"] for d in win]
        vols = [d["v"] for d in win]
        feats = ind.calc_all(closes, highs, lows, opens, vols)
        ctx = {"m1": {**feats, "closes": closes, "highs": highs,
                      "lows": lows, "opens": opens},
               "tfs": {"M15": feats, "H1": feats, "H4": feats},
               "fly": {"score": _fly_proxy(closes)}}
        bar = data[i]
        bid, ask = bar["c"] - spread / 2, bar["c"] + spread / 2

        # ---- manage open positions with intra-bar TP/SL/trail ----
        still = []
        for pos in positions:
            cur = bid if pos["side"] == "BUY" else ask
            sign = 1 if pos["side"] == "BUY" else -1
            worst = bar["l"] if pos["side"] == "BUY" else bar["h"]
            best = bar["h"] if pos["side"] == "BUY" else bar["l"]
            pnl = (cur - pos["entry"]) * sign * volume * 100
            peak = max(pos["peak"], (best - pos["entry"]) * sign * volume * 100)
            reason = None
            if pnl >= tp:
                reason = "TP"
            elif pnl <= -sl:
                reason = "SL"
            elif trail > 0 and peak >= trail and pnl <= peak - trail:
                reason = "TRAIL"
            if reason:
                balance += pnl
                trades.append({"side": pos["side"], "entry": pos["entry"],
                               "exit": round(cur, 2), "pnl": round(pnl, 2),
                               "reason": reason, "bar": i})
            else:
                pos["peak"] = peak
                still.append(pos)
        positions = still

        # ---- entries ----
        if len(positions) < max_positions:
            res = engine.evaluate(ctx)
            sig, conf = res["signal"], res["conf"]
            fly = ctx["fly"]["score"]
            side = None
            if sig == "strong_buy" and conf >= 3:
                side = "BUY"
            elif sig == "strong_sell" and conf >= 3:
                side = "SELL"
            elif sig == "buy" and conf >= 2 and fly > 0.3:
                side = "BUY"
            elif sig == "sell" and conf >= 2 and fly < -0.3:
                side = "SELL"
            if side:
                entry = ask if side == "BUY" else bid
                positions.append({"side": side, "entry": entry, "peak": 0.0})

        equity = balance + sum(
            (( (bid if p["side"] == "BUY" else ask) - p["entry"]) *
             (1 if p["side"] == "BUY" else -1) * volume * 100)
            for p in positions)
        equity_curve.append(round(equity, 2))

    # ---- close leftovers at the last bar ----
    for pos in positions:
        cur = data[-1]["c"]
        sign = 1 if pos["side"] == "BUY" else -1
        pnl = (cur - pos["entry"]) * sign * volume * 100
        balance += pnl
        trades.append({"side": pos["side"], "entry": pos["entry"],
                       "exit": round(cur, 2), "pnl": round(pnl, 2),
                       "reason": "EOD", "bar": len(data) - 1})

    return _metrics(trades, equity_curve, start, balance, strategy)


def _metrics(trades, curve, start, end, strategy):
    n = len(trades)
    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]
    gross_w = sum(t["pnl"] for t in wins)
    gross_l = abs(sum(t["pnl"] for t in losses)) or 1e-9
    pf = round(gross_w / gross_l, 2)
    peak, mdd = curve[0] if curve else start, 0.0
    for e in curve:
        peak = max(peak, e)
        mdd = max(mdd, (peak - e) / peak * 100 if peak else 0)
    rets = [t["pnl"] for t in trades]
    mean = sum(rets) / n if n else 0
    var = (sum((r - mean) ** 2 for r in rets) / n) if n else 0
    sharpe = round(mean / math.sqrt(var) * math.sqrt(n), 2) if n and var else 0
    return {
        "strategy": strategy,
        "trades": n,
        "winrate": round(len(wins) / n * 100, 1) if n else 0,
        "profit_factor": pf,
        "net_pnl": round(end - start, 2),
        "final_balance": round(end, 2),
        "max_drawdown_pct": round(mdd, 2),
        "sharpe": sharpe,
        "avg_win": round(gross_w / len(wins), 2) if wins else 0,
        "avg_loss": round(-gross_l / len(losses), 2) if losses else 0,
        "equity": curve[:: max(1, len(curve) // 200)],
        "last_trades": trades[-12:],
    }


def sweep(seed=7, candles=1500):
    """Small TP/SL grid -> comparison table."""
    out = []
    for tp in (6.0, 8.0, 12.0):
        for sl in (3.0, 4.0, 6.0):
            m = run_backtest(seed=seed, candles=candles, tp=tp, sl=sl)
            out.append({"tp": tp, "sl": sl, "trades": m["trades"],
                        "winrate": m["winrate"], "pf": m["profit_factor"],
                        "net": m["net_pnl"], "mdd": m["max_drawdown_pct"]})
    return out
