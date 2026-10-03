from __future__ import annotations

from typing import Any

from hermesdesk.config import get_settings
from hermesdesk.llm.client import chat_json, make_client


async def hermes_json(messages: list[dict[str, str]], model: str | None = None) -> dict[str, Any]:
    """Call internal Hermes OpenAI-compatible API; fall back to provider directly."""
    s = get_settings()
    try:
        client = make_client(base_url=s.hermes_base_url, api_key=s.hermes_api_key)
        return await chat_json(messages=messages, model=model or "hermes-agent", client=client)
    except Exception:
        return await chat_json(messages=messages, model=model or s.llm_model)
