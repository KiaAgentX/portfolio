# -*- coding: utf-8 -*-
"""Gold Fly+Jev HFT Trader - PRO Server.

Fly brain + strategy ensemble + TypeSafe Jev + MT5 / paper simulator,
guarded by an account-level risk manager, persisted in a SQLite journal,
optionally pushed out as alerts, and fully observable from the
multi-tab dashboard. All 9 original critical bugs remain fixed.

NEW (PRO): strategy engine (7 strategies + ensemble), risk manager,
journal, notifications, backtest & sweep APIs, config API, CLI sibling.
"""
import sys
import io
import os
import traceback

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8",
                                  line_buffering=True)
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8",
                                  line_buffering=True)

import threading
import time
from datetime import datetime

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO

from src.config import CFG
from src.fly_brain import FlyBrain
from src import indicators as ind
from src import mt5_trader as mt5
from src.strategies import StrategyEngine, REGISTRY
from src.risk_manager import RiskManager
from src.journal import Journal
from src.notifications import Notifier
from src import backtest
from src import playbook

app = Flask(
    __name__,
    template_folder=os.path.join(_REPO_ROOT, "templates"),
    static_folder=os.path.join(_REPO_ROOT, "static"),
)
app.config["SECRET_KEY"] = CFG.secret_key
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

try:
    from typesafe_sdk import TypeSafeClient, Choice, Score  # type: ignore
    client = TypeSafeClient()
    JEV_AVAILABLE = True
except Exception:
    JEV_AVAILABLE = False
    print("[WARN] TypeSafe SDK not available - ensemble strategies drive signals")

TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"]

trading_state = {
    "running": False, "cycle": 0, "last_analysis": None,
    "price_history": [], "actions_log": [], "error": None,
    "indicators": {}, "mode": "paper", "feats": {}, "latencies": [],
    "fly_brain": {"status": "loading"},
}

_state_lock = threading.Lock()
_loop_thread = None
_trail_peaks = {}
_open_meta = {}

fly_brain = None
engine = StrategyEngine(CFG.strategy)
risk = RiskManager(CFG)
journal = Journal()
notifier = Notifier(CFG)


def init_fly():
    global fly_brain
    fly_brain = FlyBrain()
    trading_state["fly_brain"]["status"] = fly_brain.status


def current_mode():
    return "paper" if mt5.use_paper() else "live"


# ------------------------------------------------------------------ data ---
def get_multi_tf_data():
    data, feats = {}, {}
    for name in TIMEFRAMES:
        rates = mt5.get_rates(mt5.GOLD, name, 60)
        if rates is None or len(rates["closes"]) < 21:
            continue
        c, h, l, o, v = (rates["closes"], rates["highs"], rates["lows"],
                         rates["opens"], rates["volumes"])
        f = ind.calc_all(c, h, l, o, v)
        feats[name] = f
        data[name] = {
            "close": round(c[-1], 2), "open": round(o[-1], 2),
            "high": round(h[-1], 2), "low": round(l[-1], 2),
            "ema21": f["ema21"], "ema9": f["ema9"], "rsi": f["rsi"],
            "atr": f["atr"], "stoch_k": f["stoch_k"],
            "ema_trend": "bull" if c[-1] > f["ema21"] else "bear",
            "rsi_zone": ("overbought" if f["rsi"] > 70
                         else "oversold" if f["rsi"] < 30 else "neutral"),
            "closes": c[-20:], "highs": h[-20:],
            "lows": l[-20:], "opens": o[-20:],
        }
    return data, feats


def fly_analyze(tf_data):
    if fly_brain is None:
        return {"score": 0, "label": "no_brain", "confidence": 0,
                "pam11": 0, "ppl101": 0, "kc": 0, "spikes": 0, "status": "off"}
    m1 = tf_data.get("M1", {})
    if not m1:
        return {"score": 0, "label": "no_data", "confidence": 0,
                "pam11": 0, "ppl101": 0, "kc": 0, "spikes": 0,
                "status": fly_brain.status}
    return fly_brain.analyze(m1["closes"], m1["highs"], m1["lows"], m1["opens"])


def analyze(tf_data, feats, fly_signal, pos_count):
    """Jev if available, otherwise the strategy ensemble."""
    if JEV_AVAILABLE:
        try:
            state = {"asset": "XAUUSD",
                     "current_price": tf_data.get("M1", {}).get("close", 0),
                     "fly_brain": fly_signal, "positions_count": pos_count}
            resp = client.system_one(
                state=state,
                questions={
                    "trade_signal": Choice(
                        instructions="Combine fly brain score, EMA21, RSI, ATR.",
                        criteria={"strong_buy": "Fly>0.5 & EMA bull & RSI<70",
                                  "buy": "Fly>0.2 or EMA bull",
                                  "hold": "Mixed",
                                  "sell": "Fly<-0.2 or EMA bear",
                                  "strong_sell": "Fly<-0.5 & EMA bear & RSI>30"}),
                    "position_action": Choice(
                        instructions="Position management?",
                        criteria={"hold_all": "Keep", "close_all": "Close all",
                                  "add_buy": "Add buys", "add_sell": "Add sells",
                                  "reverse": "Reverse"}),
                    "confidence": Score(instructions="Confidence?",
                                        criteria=["Very low", "Low", "Medium",
                                                  "High", "Very high"])}).answers
            return {"signal": resp["trade_signal"].choice,
                    "conf": round(resp["confidence"].score, 2),
                    "pos_action": resp["position_action"].choice,
                    "votes": {}, "source": "jev"}
        except Exception as e:
            print(f"[WARN] Jev call failed: {e}")

    m1 = {**feats.get("M1", {}), **tf_data.get("M1", {})}
    tfs = {name: {**feats.get(name, {}), **tf_data.get(name, {})}
           for name in tf_data}
    ctx = {"m1": m1, "tfs": tfs, "fly": fly_signal}
    res = engine.evaluate(ctx)
    return {"signal": res["signal"], "conf": res["conf"],
            "pos_action": "hold_all", "votes": res["votes"],
            "score": res["score"], "source": CFG.strategy}


# ------------------------------------------------------------------ risk ---
def manage_positions():
    """TP / SL / trailing + journal + alerts on every close."""
    closed = []
    positions = mt5.get_raw_positions(mt5.GOLD)
    alive = set()
    for pos in positions:
        pnl = round(pos.profit, 2)
        alive.add(pos.ticket)
        peak = max(_trail_peaks.get(pos.ticket, pnl), pnl)
        _trail_peaks[pos.ticket] = peak
        reason = None
        if pnl >= CFG.tp_usd:
            reason = "TP"
        elif pnl <= -CFG.sl_usd:
            reason = "SL"
        elif CFG.trail_usd > 0 and peak >= CFG.trail_usd \
                and pnl <= peak - CFG.trail_usd:
            reason = "TRAIL"
        if reason and mt5.close_position(pos):
            meta = _open_meta.pop(pos.ticket, {})
            acct = mt5.get_account()
            risk.register_close(pnl, equity=acct["equity"] if acct else None)
            side = "BUY" if pos.type == 0 else "SELL"
            sign = 1.0 if pos.type == 0 else -1.0
            close_px = round(pos.price_open + sign * pnl /
                             max(pos.volume * 100.0, 1e-9), 2)
            journal.record(mt5.GOLD, side, pos.volume, pos.price_open,
                           close_px, pnl, reason,
                           meta.get("strategy", "?"), current_mode())
            notifier.notify("CLOSE", f"{reason} {side} PnL {pnl:+.2f}")
            closed.append({"ticket": pos.ticket, "reason": reason,
                           "side": side, "pnl": pnl})
    for t in [t for t in _trail_peaks if t not in alive]:
        _trail_peaks.pop(t, None)
    return closed


def open_with_meta(side, strategy_label):
    acct = mt5.get_account()
    balance = acct["balance"] if acct else 10000.0
    vol, _ = CFG.size_volume(balance)
    before = {p.ticket for p in mt5.get_raw_positions(mt5.GOLD)}
    ok, price = mt5.open_position(side, vol)
    if ok:
        for p in mt5.get_raw_positions(mt5.GOLD):
            if p.ticket not in before:
                _open_meta[p.ticket] = {"strategy": strategy_label,
                                        "ts": time.time()}
        notifier.notify("OPEN", f"{side} {vol} @ {price}")
    return ok, price


# ------------------------------------------------------------------ loop ---
def trading_loop():
    try:
        ok, msg = mt5.connect()
        if not ok:
            trading_state["error"] = f"connect failed: {msg}"
            print(f"[LOOP] connect failed: {msg}")
            return
        trading_state["running"] = True
        trading_state["error"] = None
        print(f"[LOOP] Started | {msg} | mode={current_mode()} "
              f"| strategy={CFG.strategy}")

        while trading_state["running"]:
            try:
                trading_state["cycle"] += 1
                c = trading_state["cycle"]
                now = datetime.now().strftime("%H:%M:%S")

                tf_data, feats = get_multi_tf_data()
                m1f = feats.get("M1", {})
                indicators = {f"{tf}_{k}": v for tf, f in feats.items()
                              for k, v in f.items()
                              if k in ("ema21", "rsi", "atr", "stoch_k",
                                       "macd_hist", "bb_pb", "cci", "wr")}
                trading_state["indicators"] = indicators

                fly_signal = fly_analyze(tf_data)
                trading_state["fly_brain"].update(fly_signal)

                positions_raw = mt5.get_raw_positions(mt5.GOLD)
                pos_count = len(positions_raw)
                t0 = time.perf_counter()
                analysis = analyze(tf_data, feats, fly_signal, pos_count)
                ms = (time.perf_counter() - t0) * 1000.0
                trading_state["latencies"].append(round(ms, 1))
                trading_state["latencies"] = trading_state["latencies"][-100:]
                signal, conf = analysis["signal"], analysis["conf"]

                prism = playbook.gate({"feats": feats, "fly": fly_signal})
                prism_ok = prism.get("gate", 1.0) >= 0.6

                exec_results = []

                if analysis["pos_action"] == "close_all" and positions_raw:
                    for pos in positions_raw:
                        if mt5.close_position(pos):
                            pnl = round(pos.profit, 2)
                            risk.register_close(pnl)
                            journal.record(mt5.GOLD,
                                           "BUY" if pos.type == 0 else "SELL",
                                           pos.volume, pos.price_open,
                                           pos.price_open, pnl, "SIGNAL",
                                           CFG.strategy, current_mode())
                            exec_results.append(f"CLOSED PnL:{pnl:+.2f}")

                for cl in manage_positions():
                    exec_results.append(f"{cl['reason']}-CLOSED {cl['side']} "
                                        f"PnL:{cl['pnl']:+.2f}")

                pos_count = len(mt5.get_raw_positions(mt5.GOLD))
                tick = mt5.get_tick(mt5.GOLD)
                spread = tick["spread"] if tick else None
                acct = mt5.get_account() or {}

                gate_ok, gate_reason = risk.can_trade(
                    balance=acct.get("balance", 0),
                    equity=acct.get("equity"), spread=spread)

                if gate_ok and prism_ok and pos_count < CFG.max_positions:
                    if signal == "strong_buy" and conf >= 3:
                        ok_o, d = open_with_meta("BUY", CFG.strategy)
                        if ok_o:
                            exec_results.append(f"BUY @ {d}")
                    elif signal == "strong_sell" and conf >= 3:
                        ok_o, d = open_with_meta("SELL", CFG.strategy)
                        if ok_o:
                            exec_results.append(f"SELL @ {d}")
                    elif signal == "buy" and conf >= 2 \
                            and fly_signal["score"] > 0.3:
                        ok_o, d = open_with_meta("BUY", CFG.strategy)
                        if ok_o:
                            exec_results.append(f"BUY @ {d}")
                    elif signal == "sell" and conf >= 2 \
                            and fly_signal["score"] < -0.3:
                        ok_o, d = open_with_meta("SELL", CFG.strategy)
                        if ok_o:
                            exec_results.append(f"SELL @ {d}")

                pos_list = mt5.get_positions()
                detail = " | ".join(exec_results) if exec_results else "HOLD"
                price = tf_data.get("M1", {}).get("close", 0)

                log = {"time": now, "cycle": c, "price": price,
                       "trend": fly_signal["label"], "action": signal,
                       "risk": conf, "executed": bool(exec_results),
                       "detail": detail}
                trading_state["actions_log"].append(log)
                trading_state["actions_log"] = \
                    trading_state["actions_log"][-100:]
                trading_state["price_history"].append(
                    {"time": now, "price": price})
                trading_state["price_history"] = \
                    trading_state["price_history"][-200:]

                usd_tick = mt5.get_tick(mt5.USDCAD)
                eur_tick = mt5.get_tick(mt5.EURUSD)

                update = {
                    "time": now, "cycle": c, "price": price,
                    "usdcad": usd_tick["bid"] if usd_tick else 0,
                    "eurusd": eur_tick["bid"] if eur_tick else 0,
                    "trend": fly_signal["label"],
                    "trend_conf": fly_signal["confidence"],
                    "action": signal, "action_conf": conf,
                    "risk": conf, "votes": analysis.get("votes", {}),
                    "signal_source": analysis.get("source", "?"),
                    "mode": current_mode(), "error": None,
                    "gate": gate_reason,
                    "result": {"executed": bool(exec_results),
                               "detail": detail},
                    "positions": pos_list,
                    "balance": acct.get("balance", 0),
                    "equity": acct.get("equity", 0),
                    "profit": acct.get("profit", 0),
                    "indicators": indicators,
                    "fly_brain": fly_signal,
                    # live candles for the 3D Fly Brain Room (25-module UI)
                    "m1": {"closes": tf_data.get("M1", {}).get("closes"),
                           "highs": tf_data.get("M1", {}).get("highs"),
                           "lows": tf_data.get("M1", {}).get("lows"),
                           "opens": tf_data.get("M1", {}).get("opens")},
                    "analysis": {"signal": signal,
                                 "pos_action": analysis["pos_action"],
                                 "confidence": conf},
                }
                trading_state["last_analysis"] = update
                socketio.emit("update", update)

                print(f"[{c}] {now} P={price} Fly={fly_signal['label']}"
                      f"({fly_signal['score']:.3f}) Sig={signal}"
                      f"[{analysis.get('source')}] gate={gate_reason} "
                      f"Pos={pos_count} | {detail}")
                time.sleep(CFG.loop_delay)

            except Exception as e:
                trading_state["error"] = f"{type(e).__name__}: {e}"
                print(f"[ERROR] {e}\n{traceback.format_exc()}")
                time.sleep(CFG.loop_delay)
    except Exception as e:
        trading_state["error"] = f"FATAL: {e}"
        print(f"[FATAL] {e}\n{traceback.format_exc()}")
    finally:
        mt5.disconnect()
        trading_state["running"] = False
        print("[LOOP] Stopped")


# ---------------------------------------------------------------- routes ---
@app.route("/")
def index():
    return render_template("dashboard.html")


@app.route("/api/state")
def api_state():
    return jsonify(trading_state)


@app.route("/api/start")
def api_start():
    global _loop_thread
    with _state_lock:
        if trading_state["running"] or \
                (_loop_thread is not None and _loop_thread.is_alive()):
            return jsonify({"status": "already_running"})
        trading_state["error"] = None
        _loop_thread = threading.Thread(target=trading_loop, daemon=True)
        _loop_thread.start()
    return jsonify({"status": "started", "mode": current_mode()})


@app.route("/api/stop")
def api_stop():
    trading_state["running"] = False
    return jsonify({"status": "stopping"})


@app.route("/api/mode", methods=["GET", "POST"])
def api_mode():
    if request.method == "POST":
        wanted = (request.json or {}).get("mode", "").lower() \
            if request.is_json else request.form.get("mode", "").lower()
        if wanted not in ("paper", "live"):
            return jsonify({"error": "mode must be 'paper' or 'live'"}), 400
        if wanted == "live" and not mt5.MT5_AVAILABLE:
            return jsonify({"error": "MetaTrader5 unavailable on this "
                                     "platform - staying in paper",
                            "mode": "paper"}), 409
        if trading_state["running"]:
            return jsonify({"error": "stop the loop before switching",
                            "mode": current_mode()}), 409
        os.environ["TRADE_MODE"] = wanted
        return jsonify({"mode": current_mode()})
    return jsonify({"mode": current_mode(), "mt5_available": mt5.MT5_AVAILABLE,
                    "jev_available": JEV_AVAILABLE})


@app.route("/api/config")
def api_config():
    return jsonify({"config": CFG.safe_dict(),
                    "problems": CFG.validate()})

@app.route("/api/config", methods=["POST"])
def api_config_update():
    data = request.get_json(silent=True) or {}
    results = []
    for key, value in data.items():
        if key in ("secret_key", "tg_token", "fly_root"):
            continue
        ok, msg = CFG.update(key, value)
        results.append(msg)
        if ok:
            print(f"[CONFIG] {msg}")
    return jsonify({"updated": results})

@app.route("/api/strategies")
def api_strategies():
    return jsonify({"current": engine.mode,
                    "available": ["ensemble"] + list(REGISTRY),
                    "weights": {n: s.weight for n, s in REGISTRY.items()}})


@app.route("/api/risk")
def api_risk():
    return jsonify(risk.stats())


@app.route("/api/journal")
def api_journal():
    limit = request.args.get("limit", 200, type=int)
    return jsonify({"trades": journal.trades(limit), "stats": journal.stats()})


@app.route("/api/backtest", methods=["POST"])
def api_backtest():
    p = request.json or {}
    res = backtest.run_backtest(
        seed=int(p.get("seed", 7)),
        candles=min(int(p.get("candles", 2000)), 20000),
        tp=float(p.get("tp", CFG.tp_usd)),
        sl=float(p.get("sl", CFG.sl_usd)),
        trail=float(p.get("trail", CFG.trail_usd)),
        strategy=p.get("strategy", "ensemble"))
    return jsonify(res)


@app.route("/api/sweep")
def api_sweep():
    return jsonify(backtest.sweep(seed=int(request.args.get("seed", 7))))


@app.route("/api/notify", methods=["POST"])
def api_notify():
    return jsonify(notifier.test())


@app.route("/api/playbook")
def api_playbook():
    la = trading_state.get("last_analysis") or {}
    lats = trading_state.get("latencies") or []
    ctx = {
        "feats": trading_state.get("feats", {}),
        "tf_data": {},
        "fly": trading_state.get("fly_brain", {}),
        "positions": la.get("positions") or [],
        "account": {"balance": la.get("balance"), "equity": la.get("equity"),
                    "profit": la.get("profit")},
        "risk": risk.stats(),
        "journal": journal.stats(),
        "journal_trades": journal.trades(50),
        "cfg": CFG.to_dict(),
        "latency_ms": lats[-1] if lats else 0,
        "latencies": lats,
        "cycles": trading_state["cycle"],
        "running": trading_state["running"],
        "fresh_sec": CFG.loop_delay * 2,
        "tick": mt5.get_tick(mt5.GOLD),
        "now": time.time(),
    }
    return jsonify({"modules": playbook.run_all(ctx),
                    "count": len(playbook.MODULES)})


if __name__ == "__main__":
    print(f"[SERVER] Fly-Gold PRO -> http://{CFG.host}:{CFG.port}")
    print(f"[SERVER] mode={current_mode()} strategy={CFG.strategy} "
          f"mt5={mt5.MT5_AVAILABLE} jev={JEV_AVAILABLE}")
    for prob in CFG.validate():
        print(f"[CONFIG] {prob}")
    init_fly()
    if CFG.auto_start:
        threading.Thread(target=trading_loop, daemon=True).start()
    socketio.run(app, host=CFG.host, port=CFG.port, debug=False,
                 allow_unsafe_werkzeug=True)
