# -*- coding: utf-8 -*-
"""P09 — jev-review: triage proposed orders; risky ones go to a human."""
META = {"id": "P09", "name": "review", "inspired_by": "jev-review",
        "desc": "Pre-trade review: high-risk orders routed away from auto."}


def run(ctx):
    acct = ctx.get("account") or {}
    tick = ctx.get("tick") or {}
    cfg = ctx.get("cfg") or {}
    flags = []
    bal = acct.get("balance", 0)
    if bal and cfg.get("sl_usd", 4) > bal * cfg.get("risk_pct", 0.5) / 100:
        flags.append("sl_exceeds_risk_budget")
    if (tick.get("spread") or 0) > 0.6:
        flags.append("wide_spread")
    if (ctx.get("risk") or {}).get("consec_losses", 0) >= 3:
        flags.append("tilt_state")
    route = "human_or_big_model" if flags else "auto"
    return {"flags": flags, "route": route,
            "verdict": "HOLD-for-review" if flags else "auto-clear"}
