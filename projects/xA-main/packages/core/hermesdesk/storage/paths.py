from __future__ import annotations

from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


def inbound_key(tenant: str, provider_message_id: str) -> str:
    n = _now()
    return f"inbound/{tenant}/{n:%Y}/{n:%m}/{n:%d}/{provider_message_id}.json"


def attachment_key(tenant: str, ticket_id: str, sha256: str, ext: str) -> str:
    return f"attachments/{tenant}/{ticket_id}/{sha256}.{ext.lstrip('.')}"


def agent_key(tenant: str, ticket_id: str, run_id: str, name: str) -> str:
    return f"agent/{tenant}/{ticket_id}/{run_id}/{name}"


def archive_key(tenant: str, ticket_id: str, name: str) -> str:
    n = _now()
    return f"archive/{tenant}/{n:%Y}/{n:%m}/{ticket_id}/{name}"
