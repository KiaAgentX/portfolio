def tool_stage_support_payload(*, severity: str, body_ar: str, category: str | None = None) -> dict:
    return {
        "type": "create_support_ticket",
        "payload": {"severity": severity, "body_ar": body_ar, "category": category},
        "reversible": True,
    }
