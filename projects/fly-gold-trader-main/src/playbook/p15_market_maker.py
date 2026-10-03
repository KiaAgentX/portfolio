# -*- coding: utf-8 -*-
"""P15 — jev-trader: spread+flow driven market-making quotes (paper)."""
META = {"id": "P15", "name": "market_maker", "inspired_by": "jev-trader",
        "desc": "Judge buy/sell pressure from spread & flow, quote both sides."}


def run(ctx):
    tick = ctx.get("tick") or {}
    f = (ctx.get("feats") or {}).get("M1", {})
    spread = tick.get("spread") or 0.3
    flow = 1 if (f.get("volume") or "normal") in ("high", "very_high") else 0
    pressure = (ctx.get("fly") or {}).get("score", 0) * 0.5 + flow * 0.2
    if spread > 0.6:
        return {"quoting": False, "verdict": "spread too wide, stand down"}
    mid = (tick.get("bid", 0) + tick.get("ask", 0)) / 2
    skew = -pressure * spread
    return {"quoting": True,
            "bid_quote": round(mid - spread / 2 + skew, 2),
            "ask_quote": round(mid + spread / 2 + skew, 2),
            "pressure": round(pressure, 2),
            "verdict": "quote-both-sides" if abs(pressure) < 0.4
            else "skew-" + ("buy" if pressure > 0 else "sell")}
