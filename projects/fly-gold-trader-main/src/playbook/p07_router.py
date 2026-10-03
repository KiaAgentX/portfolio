# -*- coding: utf-8 -*-
"""P07 — jev-codex-router: judge difficulty, then pick the strategy tier."""
META = {"id": "P07", "name": "router", "inspired_by": "jev-codex-router",
        "desc": "Market difficulty -> strategy subset + reasoning depth."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    difficulty = min(1.0, (f.get("atr") or 0) / 1.5 * 0.5 +
                     abs((f.get("rsi") or 50) - 50) / 50 * 0.5)
    if difficulty < 0.33:
        tier, strat = "fast", ["fly_momentum", "ema_cross"]
    elif difficulty < 0.66:
        tier, strat = "balanced", ["ensemble"]
    else:
        tier, strat = "deep", ["multi_tf_trend", "rsi_reversal",
                               "bollinger_fade"]
    return {"difficulty": round(difficulty, 2), "tier": tier,
            "strategies": strat, "verdict": tier}
