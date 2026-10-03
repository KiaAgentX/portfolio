from __future__ import annotations

from hermesdesk.agents.intent import heuristic_intent
from hermesdesk.agents.prompts import ROUTER
from hermesdesk.config import get_settings
from hermesdesk.hermes_client.client import hermes_json


async def classify(text: str) -> dict:
    intent = heuristic_intent(text)
    s = get_settings()
    if not s.openai_api_key and not s.hermes_api_key:
        return {"intent": intent, "reason": "heuristic"}
    try:
        data = await hermes_json(
            [
                {"role": "system", "content": ROUTER},
                {"role": "user", "content": text},
            ],
            model=s.router_model,
        )
        value = data.get("intent") or intent
        if value not in {"knowledge", "sales", "support", "other"}:
            value = intent
        return {"intent": value, "reason": data.get("reason", "")}
    except Exception:
        return {"intent": intent, "reason": "fallback-heuristic"}
