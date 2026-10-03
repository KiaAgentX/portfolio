# -*- coding: utf-8 -*-
"""P01 — jev-ultrafast: latency-tiered decision path.
Jev judges the speed tier; heavy compute only when the loop is fast."""
META = {"id": "P01", "name": "ultrafast", "inspired_by": "jev-ultrafast",
        "desc": "Pick the decision path by measured latency (full ensemble "
                "only on the fast tier)."}


def run(ctx):
    ms = ctx.get("latency_ms", 999)
    if ms < 100:
        tier, path = "ultrafast", "full ensemble + fly brain"
    elif ms < 400:
        tier, path = "balanced", "top-3 strategies only"
    else:
        tier, path = "minimal", "fly score only"
    return {"latency_ms": round(ms, 1), "tier": tier, "path": path,
            "verdict": tier}
