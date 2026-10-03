from __future__ import annotations

from hermesdesk.config import get_settings
from hermesdesk.llm.client import make_client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    s = get_settings()
    if not texts:
        return []
    client = make_client()
    resp = await client.embeddings.create(model=s.embedding_model, input=texts)
    return [d.embedding for d in resp.data]
