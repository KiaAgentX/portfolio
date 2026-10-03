from __future__ import annotations

import json
from typing import Any

from openai import AsyncOpenAI

from hermesdesk.config import get_settings


def make_client(base_url: str | None = None, api_key: str | None = None) -> AsyncOpenAI:
    s = get_settings()
    return AsyncOpenAI(
        base_url=(base_url or s.openai_base_url).rstrip("/"),
        api_key=api_key if api_key is not None else s.openai_api_key,
        timeout=60.0,
        max_retries=2,
    )


def _extract_json(text: str) -> dict[str, Any]:
    text = (text or "").strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start >= 0 and end > start:
        text = text[start : end + 1]
    return json.loads(text)


async def chat_json(
    *,
    messages: list[dict[str, str]],
    model: str | None = None,
    client: AsyncOpenAI | None = None,
) -> dict[str, Any]:
    s = get_settings()
    client = client or make_client()
    resp = await client.chat.completions.create(
        model=model or s.llm_model,
        messages=messages,
        temperature=0.2,
    )
    content = resp.choices[0].message.content or "{}"
    try:
        return _extract_json(content)
    except json.JSONDecodeError:
        repair = await client.chat.completions.create(
            model=model or s.llm_model,
            messages=[
                *messages,
                {"role": "assistant", "content": content},
                {"role": "user", "content": "أعد المخرجات ككائن JSON صالح فقط بدون أي نص آخر."},
            ],
            temperature=0,
        )
        return _extract_json(repair.choices[0].message.content or "{}")
