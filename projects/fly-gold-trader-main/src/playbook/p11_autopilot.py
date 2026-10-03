# -*- coding: utf-8 -*-
"""P11 — agent-desktop style: read the account tree, pick the next action."""
META = {"id": "P11", "name": "autopilot", "inspired_by": "agent-desktop",
        "desc": "Structured account tree -> next best click (action)."}


def run(ctx):
    pos = ctx.get("positions") or []
    acct = ctx.get("account") or {}
    if not pos:
        return {"action": "wait_for_signal", "verdict": "idle"}
    worst = min(pos, key=lambda p: p.get("pnl", 0))
    best = max(pos, key=lambda p: p.get("pnl", 0))
    cfg = ctx.get("cfg") or {}
    if worst.get("pnl", 0) <= -cfg.get("sl_usd", 4) * 0.9:
        act = f"close_worst({worst.get('type')})"
    elif best.get("pnl", 0) >= cfg.get("tp_usd", 8) * 0.9:
        act = f"take_profit({best.get('type')})"
    elif acct.get("profit", 0) > 0:
        act = "trail_all"
    else:
        act = "hold"
    return {"action": act, "positions": len(pos), "verdict": act}
