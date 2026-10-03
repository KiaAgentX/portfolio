from __future__ import annotations

from pathlib import Path

from hermesdesk.rag.qdrant import COLLECTION, _faq_chunks, _qdrant


async def ingest_faq() -> int:
    client = _qdrant()
    chunks = _faq_chunks()
    if not client or not chunks:
        return 0
    from qdrant_client.models import Distance, PointStruct, VectorParams

    from hermesdesk.rag.embed import embed_texts

    texts = [c["text"] for c in chunks]
    vectors = await embed_texts(texts)
    if not vectors:
        return 0
    dim = len(vectors[0])
    try:
        client.get_collection(COLLECTION)
    except Exception:
        client.recreate_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
    points = [
        PointStruct(id=i, vector=vectors[i], payload=chunks[i])
        for i in range(len(chunks))
    ]
    client.upsert(collection_name=COLLECTION, points=points)
    return len(points)


def knowledge_dir() -> Path:
    return Path(__file__).resolve().parents[4] / "data" / "knowledge"
