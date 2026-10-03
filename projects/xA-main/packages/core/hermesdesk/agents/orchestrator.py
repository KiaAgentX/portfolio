from __future__ import annotations

import json
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.agents.prompts import specialist_prompt
from hermesdesk.agents.router import classify
from hermesdesk.agents.tools.catalog import tool_get_price_list, tool_search_products
from hermesdesk.agents.tools.customers import tool_get_contact
from hermesdesk.agents.tools.knowledge import tool_search_knowledge
from hermesdesk.arabic import looks_critical, truncate
from hermesdesk.config import get_settings
from hermesdesk.db.models import Contact, Ticket
from hermesdesk.hermes_client.client import hermes_json
from hermesdesk.types import ProposedResponse


def _offline_proposal(text: str, specialist: str, extras: dict[str, Any]) -> dict:
    if specialist == "sales":
        reply = "شكراً لتواصلكم. سنراجع طلب التسعير وفق قائمة الأسعار المعتمدة ونوافيكم بعد اعتماد المشرف."
    elif specialist == "support":
        reply = "تم تسجيل ملاحظتكم الفنية. سيتابعها مختص الدعم بعد اعتماد المشرف. إذا كان الأمر طارئاً اتصلوا بفريق السلامة لديكم فوراً."
    else:
        reply = "شكراً لرسالتكم. سنراجع المواصفات من قاعدة المعرفة ونرد عليكم بعد اعتماد المشرف."
    if looks_critical(text):
        reply = "إذا كان هناك حريق أو إصابة أو تسرّب خطر فاتصلوا بجهات الطوارئ المحلية فوراً. تم تصعيد الطلب للمشرف."
        risk = "critical"
        specialist = "support"
    else:
        risk = "medium" if specialist == "sales" else "low"
    actions = []
    if specialist == "support":
        actions = [{"type": "create_support_ticket", "payload": {"severity": risk, "body_ar": text}, "reversible": True}]
    citations = [c.get("id") or c.get("sku") for c in extras.get("knowledge", []) if c]
    return {
        "customer_reply_ar": truncate(reply),
        "customer_reply_en": None,
        "rationale_ar": "مسار احتياطي بدون نموذج أو بعد فشل التحليل.",
        "risk": risk,
        "specialist": specialist,
        "citations": [c for c in citations if c][:6],
        "actions": actions,
        "language": "ar",
    }


async def _context_bundle(session: AsyncSession, ticket: Ticket, text: str, contact: Contact) -> dict[str, Any]:
    knowledge = await tool_search_knowledge(text)
    products = await tool_search_products(session, text[:80] or "oil")
    prices = []
    for p in products[:3]:
        prices.extend(await tool_get_price_list(session, p["sku"]))
    profile = await tool_get_contact(session, contact.id)
    return {
        "ticket_public_id": ticket.public_id,
        "channel": ticket.channel,
        "customer_text": text,
        "contact": profile,
        "knowledge": knowledge,
        "products": products,
        "prices": prices,
    }


def _lead_score(text: str, contact: Contact) -> tuple[int, str]:
    score = contact.lead_score or 0
    reasons = []
    t = text.lower()
    if contact.company:
        score = max(score, score)
        reasons.append("شركة معروفة")
    if any(w in t for w in ("شرك", "مصنع", "شركة")):
        score += 20
        reasons.append("ذكر جهة")
    if any(w in t for w in ("برميل", "طن", "drum", "qty", "كمية")):
        score += 20
        reasons.append("كمية")
    if any(w in t for w in ("sku", "iso", "sae")):
        score += 15
        reasons.append("منتج")
    if "@" in t or "هاتف" in t:
        score += 15
        reasons.append("تواصل")
    if any(w in t for w in ("مناقصة", "tender", "rfq")):
        score += 20
        reasons.append("مناقصة")
    return min(score, 100), "، ".join(reasons) or "أساسي"


async def run_specialists(session: AsyncSession, ticket: Ticket, contact: Contact, text: str) -> ProposedResponse:
    settings = get_settings()
    routed = await classify(text)
    intent = routed["intent"]
    specialist = "support" if intent == "other" else intent
    if looks_critical(text):
        specialist = "support"

    bundle = await _context_bundle(session, ticket, text, contact)
    score, reason = _lead_score(text, contact)
    contact.lead_score = score
    contact.lead_reason = reason
    bundle["lead_score"] = score
    bundle["lead_reason"] = reason

    user_payload = json.dumps(bundle, ensure_ascii=False, default=str)
    messages = [
        {"role": "system", "content": specialist_prompt(specialist)},
        {"role": "user", "content": user_payload},
    ]

    data: dict[str, Any]
    try:
        if not settings.openai_api_key:
            data = _offline_proposal(text, specialist, bundle)
        else:
            data = await hermes_json(messages)
    except Exception:
        data = _offline_proposal(text, specialist, bundle)

    data["specialist"] = data.get("specialist") or specialist
    data.setdefault("rationale_ar", routed.get("reason") or "")
    data.setdefault("customer_reply_ar", "شكراً لتواصلكم، سيتم الرد بعد المراجعة.")
    data.setdefault("risk", "critical" if looks_critical(text) else "low")
    data.setdefault("citations", [])
    data.setdefault("actions", [])
    data["language"] = "ar"
    if looks_critical(text):
        data["risk"] = "critical"
        data["specialist"] = "support"

    proposal = ProposedResponse.model_validate(data)
    proposal.lead_score = score
    return proposal
