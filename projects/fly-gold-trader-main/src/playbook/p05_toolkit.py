# -*- coding: utf-8 -*-
"""P05 — jev-mcp: five ready-made judgments per cycle."""
META = {"id": "P05", "name": "toolkit", "inspired_by": "jev-mcp",
        "desc": "Fact-check, screening, ranking, classification, extraction."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    candles_ok = f.get("atr", 0) > 0 and f.get("ema21", 0) > 0
    regime = ("trending" if abs((f.get("mom") or 0)) > 0.25
              else "volatile" if (f.get("atr") or 0) > 1.2 else "ranging")
    rank = sorted(
        [("fly", abs(ctx.get("fly", {}).get("score", 0))),
         ("trend", 1 if f.get("ema9", 0) != f.get("ema21", 0) else 0.2),
         ("reversion", abs((f.get("rsi") or 50) - 50) / 50)],
        key=lambda kv: -kv[1])
    return {
        "fact_check": {"data_sane": candles_ok},
        "screening": {"signal_quality":
                      round(abs(ctx.get("fly", {}).get("score", 0)), 2)},
        "ranking": rank,
        "classification": regime,
        "extraction": {"support": (f.get("pivots") or {}).get("s1"),
                       "resistance": (f.get("pivots") or {}).get("r1")},
        "verdict": regime,
    }
