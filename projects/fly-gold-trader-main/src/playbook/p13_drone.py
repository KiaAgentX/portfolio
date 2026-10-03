# -*- coding: utf-8 -*-
"""P13 — jev-drone: layered control audit. Low layer keeps stability,
Jev only makes high-level calls."""
META = {"id": "P13", "name": "drone_layers", "inspired_by": "jev-drone",
        "desc": "Verify low-level safety layer before high-level freedom."}


def run(ctx):
    risk = ctx.get("risk") or {}
    low_ok = risk.get("cooldown_sec_left", 0) == 0 and \
        risk.get("daily_pnl", 0) > -risk.get("daily_loss_cap", 60)
    high = "climb" if (ctx.get("fly") or {}).get("score", 0) > 0.2 \
        else "brake" if abs((ctx.get("fly") or {}).get("score", 0)) <= 0.2 \
        else "descend"
    if not low_ok:
        high = "land (safety override)"
    return {"low_level": "stable" if low_ok else "OVERRIDE",
            "high_level": high, "verdict": high}
