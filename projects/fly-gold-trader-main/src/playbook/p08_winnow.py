# -*- coding: utf-8 -*-
"""P08 — Winnow: context garbage collection for indicator dumps."""
META = {"id": "P08", "name": "winnow", "inspired_by": "Winnow",
        "desc": "Keep only indicators relevant to the current task."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    relevant, gc = [], []
    checks = [("rsi_extreme", abs((f.get("rsi") or 50) - 50) > 18),
              ("band_touch", (f.get("bb_pb") or 0.5) < 0.15 or
               (f.get("bb_pb") or 0.5) > 0.85),
              ("macd_push", abs(f.get("macd_hist") or 0) > 0.1),
              ("pattern_edge", (f.get("pattern") or ("", 0))[1] != 0),
              ("volume_spike", (f.get("volume") or "normal") != "normal")]
    for name, hot in checks:
        (relevant if hot else gc).append(name)
    return {"relevant": relevant, "collected": gc,
            "saved_pct": round(len(gc) / len(checks) * 100),
            "verdict": f"gc {len(gc)}/{len(checks)}"}
