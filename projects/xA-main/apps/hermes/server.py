from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel

app = FastAPI(title="Hermes Desk Brain")
SKILLS_DIR = Path(__file__).parent / "skills"


def load_skills() -> str:
    parts = []
    if SKILLS_DIR.exists():
        for skill in sorted(SKILLS_DIR.glob("*/SKILL.md")):
            parts.append(f"# Skill {skill.parent.name}\n{skill.read_text(encoding='utf-8')}")
    return "\n\n".join(parts)


SKILLS = load_skills()


class Message(BaseModel):
    role: str
    content: str | None = None


class ChatIn(BaseModel):
    model: str | None = None
    messages: list[Message]
    temperature: float | None = 0.2


@app.get("/health")
async def health():
    return {"ok": True, "skills": [p.parent.name for p in SKILLS_DIR.glob("*/SKILL.md")]}


@app.get("/v1/models")
async def models():
    return {"data": [{"id": "hermes-agent", "object": "model"}]}


@app.post("/v1/chat/completions")
async def chat(body: ChatIn, authorization: str | None = Header(default=None)):
    expected = os.getenv("HERMES_API_KEY", "")
    if expected:
        token = (authorization or "").replace("Bearer ", "")
        if token != expected:
            raise HTTPException(401, "unauthorized")
    base = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
    key = os.getenv("OPENAI_API_KEY", "")
    model = body.model if body.model and body.model != "hermes-agent" else os.getenv("LLM_MODEL", "openai/gpt-4o")
    messages = [{"role": m.role, "content": m.content or ""} for m in body.messages]
    if SKILLS:
        messages = [{"role": "system", "content": "المهارات المتاحة:\n" + SKILLS[:12000]}, *messages]
    if not key:
        last = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        content = (
            '{"customer_reply_ar":"شكراً لتواصلكم. سيتم إعداد الرد بعد اعتماد المشرف.",'
            '"rationale_ar":"لا يوجد مفتاح مزود. مسار احتياطي.",'
            '"risk":"low","specialist":"knowledge","citations":[],'
            '"actions":[],"language":"ar"}'
        )
        return {
            "id": "hermes-offline",
            "object": "chat.completion",
            "model": "hermes-agent",
            "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
        }
    client = AsyncOpenAI(base_url=base, api_key=key, timeout=60.0)
    resp = await client.chat.completions.create(model=model, messages=messages, temperature=body.temperature or 0.2)
    return resp.model_dump()
