from __future__ import annotations

import io
import json
from typing import Any

from hermesdesk.storage.paths import archive_key
from hermesdesk.storage.s3 import put_bytes, put_json


def write_transcript(*, tenant: str, ticket_id: str, record: dict[str, Any]) -> dict[str, str]:
    json_key = archive_key(tenant, ticket_id, "transcript.json")
    put_json(json_key, record)
    parquet_key = archive_key(tenant, ticket_id, "transcript.parquet")
    try:
        import pyarrow as pa
        import pyarrow.parquet as pq

        table = pa.Table.from_pylist([record])
        buf = io.BytesIO()
        pq.write_table(table, buf)
        put_bytes(parquet_key, buf.getvalue(), "application/vnd.apache.parquet")
    except Exception:
        put_bytes(parquet_key, json.dumps(record).encode(), "application/json")
    return {"json": json_key, "parquet": parquet_key}
