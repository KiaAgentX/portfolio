#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages", "core"))

from hermesdesk.rag.ingest import ingest_faq


async def main():
    n = await ingest_faq()
    print("ingested", n, "chunks")


if __name__ == "__main__":
    asyncio.run(main())
