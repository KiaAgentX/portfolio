# -*- coding: utf-8 -*-
"""Shared context builder: live (server) and demo (CLI/tests) modes."""
import time

from src import indicators as ind
from src import backtest


def demo_ctx(seed=7):
    """Synthetic but realistic ctx for CLI / tests / offline dashboard."""
    bars = backtest.gen_candles(seed, 120)
    c = [b["c"] for b in bars]
    h = [b["h"] for b in bars]
    l = [b["l"] for b in bars]
    o = [b["o"] for b in bars]
    v = [b["v"] for b in bars]
    f = ind.calc_all(c, h, l, o, v)
    feats = {"M1": f, "M15": f, "H1": f, "H4": f}
    tf_data = {tf: {"close": c[-1], "ema21": f["ema21"], "rsi": f["rsi"],
                    "atr": f["atr"], "ema_trend":
                    "bull" if c[-1] > f["ema21"] else "bear"}
               for tf in feats}
    return {
        "feats": feats, "tf_data": tf_data,
        "fly": {"score": 0.31, "label": "like", "confidence": 0.44,
                "pam11": 41, "ppl101": 12, "kc": 88, "spikes": 260},
        "positions": [{"type": "BUY", "volume": 0.01, "pnl": 1.8,
                       "open_price": c[-1] - 1.8}],
        "account": {"balance": 10042.5, "equity": 10044.3, "profit": 1.8,
                    "margin": 14.6, "free_margin": 10029.7},
        "risk": {"daily_pnl": 4.3, "daily_loss_cap": 60, "max_drawdown_pct": 0.4,
                 "drawdown_cap_pct": 10, "consec_losses": 0,
                 "cooldown_sec_left": 0, "blocks": {}},
        "journal": {"trades": 42, "total_pnl": 42.5, "winrate": 57.1,
                    "best": 8.1, "worst": -4.2, "equity": []},
        "cfg": {"tp_usd": 8, "sl_usd": 4, "trail_usd": 3, "max_positions": 5,
                "risk_pct": 0.5, "strategy": "ensemble"},
        "latency_ms": 12.4,
        "latencies": [9.1, 11.0, 12.4, 14.8, 22.0, 81.5],
        "cycles": 120, "running": True, "fresh_sec": 1.2,
        "tick": {"bid": c[-1] - 0.15, "ask": c[-1] + 0.15, "spread": 0.3},
        "now": time.time(),
    }
