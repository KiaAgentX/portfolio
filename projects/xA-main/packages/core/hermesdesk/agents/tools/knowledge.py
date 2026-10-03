from hermesdesk.rag.qdrant import search_knowledge


async def tool_search_knowledge(query: str) -> list[dict]:
    return await search_knowledge(query)
