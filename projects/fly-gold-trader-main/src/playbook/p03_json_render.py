# -*- coding: utf-8 -*-
"""P03 — json-render: generative UI spec (Jev picks components, not pixels)."""
META = {"id": "P03", "name": "json_render", "inspired_by": "json-render",
        "desc": "Emit a widget spec for the dashboard instead of raw HTML."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    widgets = [{"type": "price_card", "props": {"symbol": "XAUUSD"}}]
    if (f.get("atr") or 0) > 0:
        widgets.append({"type": "volatility_banner",
                        "props": {"atr": f["atr"],
                                  "level": "high" if f["atr"] > 1 else "normal"}})
    if ctx.get("positions"):
        widgets.append({"type": "positions_table",
                        "props": {"rows": len(ctx["positions"])}})
    if abs((f.get("rsi") or 50) - 50) > 20:
        widgets.append({"type": "rsi_gauge", "props": {"value": f["rsi"]}})
    widgets.append({"type": "fly_room_3d", "props": {"quality": "auto"}})
    return {"widgets": widgets, "count": len(widgets),
            "verdict": f"{len(widgets)} widgets"}
