from __future__ import annotations


def tool_stage_quote_payload(*, sku: str, qty: float, unit: str, currency: str, list_price: float) -> dict:
    return {
        "type": "draft_quote",
        "payload": {
            "currency": currency,
            "lines": [
                {
                    "sku": sku,
                    "qty": qty,
                    "unit": unit,
                    "list_price": list_price,
                }
            ],
            "total": round(qty * list_price, 2),
        },
        "reversible": True,
    }
