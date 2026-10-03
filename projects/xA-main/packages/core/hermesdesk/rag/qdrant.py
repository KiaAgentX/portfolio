from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from hermesdesk.config import get_settings

COLLECTION = "knowledge"
FAQ_PATH = Path(__file__).resolve().parents[4] / "data" / "knowledge" / "faq.md"


@lru_cache
def _faq_chunks() -> list[dict]:
    if not FAQ_PATH.exists():
        return []
    text = FAQ_PATH.read_text(encoding="utf-8")
    parts = [p.strip() for p in text.split("\n## ") if p.strip()]
    chunks = []
    for i, p in enumerate(parts):
        body = p if p.startswith("#") else "## " + p
        chunks.append({"id": f"faq-{i}", "text": body, "doc_type": "faq"})
    return chunks


def _qdrant():
    s = get_settings()
    try:
        from qdrant_client import QdrantClient

        return QdrantClient(url=s.qdrant_url, api_key=s.qdrant_api_key or None, timeout=5)
    except Exception:
        return None


async def search_knowledge(query: str, top_k: int = 6) -> list[dict]:
    query_l = (query or "").lower()
    hits: list[dict] = []
    client = _qdrant()
    if client:
        try:
            from hermesdesk.rag.embed import embed_texts

            vectors = await embed_texts([query])
            if vectors:
                res = client.search(collection_name=COLLECTION, query_vector=vectors[0], limit=top_k)
                for p in res:
                    if p.score and p.score < 0.25:
                        continue
                    payload = p.payload or {}
                    hits.append(
                        {
                            "id": str(p.id),
                            "text": payload.get("text", ""),
                            "sku": payload.get("sku"),
                            "score": p.score,
                        }
                    )
        except Exception:
            hits = []
    if hits:
        return hits[:top_k]
    scored = []
    for ch in _faq_chunks():
        score = sum(1 for w in query_l.split() if w in ch["text"].lower())
        if score:
            scored.append({**ch, "score": float(score)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k] or _faq_chunks()[:2]
