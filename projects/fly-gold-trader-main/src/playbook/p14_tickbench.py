# -*- coding: utf-8 -*-
"""P14 — OneVOneJev / jev-trader style: decision-tick benchmark (~81ms goal)."""
META = {"id": "P14", "name": "tick_bench", "inspired_by":
        "OneVOneJev + jev-trader",
        "desc": "p50/p95 of the decision tick vs the 81ms HFT target."}


def run(ctx):
    lats = sorted(ctx.get("latencies") or [ctx.get("latency_ms", 0)] or [0])
    if not lats:
        return {"verdict": "no samples"}
    p50 = lats[len(lats) // 2]
    p95 = lats[min(len(lats) - 1, int(len(lats) * 0.95))]
    return {"p50_ms": round(p50, 1), "p95_ms": round(p95, 1),
            "target_ms": 81,
            "verdict": "within HFT budget" if p95 <= 81 else "too slow"}
