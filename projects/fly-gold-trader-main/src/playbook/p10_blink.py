# -*- coding: utf-8 -*-
"""P10 — Blink: navigate timeframes, dig where relevance is highest."""
META = {"id": "P10", "name": "blink", "inspired_by": "Blink",
        "desc": "Rank TFs by relevance to the current question, then focus."}


def run(ctx):
    scores = {}
    for tf, f in (ctx.get("feats") or {}).items():
        trend = abs((f.get("ema9", 0) - f.get("ema21", 0)) /
                    max(f.get("atr") or 1e-9, 1e-9))
        scores[tf] = round(min(1.0, trend), 2)
    order = sorted(scores.items(), key=lambda kv: -kv[1])
    return {"ranking": order, "focus": order[0][0] if order else "M1",
            "verdict": f"focus {order[0][0]}" if order else "no data"}
