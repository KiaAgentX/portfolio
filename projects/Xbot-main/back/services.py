"""back layer: business logic shared by the Telegram bot and the webapp.

No Telegram/Flask imports here — front layers call these with plain data
and do the sending themselves. (front.i18n is a leaf utility, safe to use.)
"""
from __future__ import annotations

from data import store
from front.i18n import t  # leaf utility: dotted keys + fa fallback, zero deps


# ------------------------------------------------------- validation (single source)

def validate_setting(key: str, value: str, lang: str = "fa") -> str:
    """Validate an admin variable. Returns '' when OK, else a localized error."""
    if key == "tts_provider" and value not in ("edge", "openai"):
        return t("set.v_provider", lang)
    if key == "tts_gender" and value not in ("female", "male"):
        return t("set.v_gender", lang)
    if key == "default_mode" and value not in ("text", "voice"):
        return t("set.v_mode", lang)
    if key in ("max_tokens", "max_history"):
        if not value.isdigit() or not (1 <= int(value) <= 100000):
            return t("set.v_int", lang, name=key)
    if key == "temperature":
        try:
            num = float(value)
        except ValueError:
            return t("set.v_float", lang)
        if not (0.0 <= num <= 2.0):
            return t("set.v_range", lang)
    return ""


# ------------------------------------------------------- order flows

def approve_order(ref: str) -> dict | None:
    """pending → approved. Returns the order, or None if not actionable."""
    o = store.get_order(ref)
    if not o or o["status"] != "pending":
        return None
    store.set_order(ref, "approved")
    o["status"] = "approved"
    return o


def reject_order(ref: str, why: str) -> dict | None:
    """pending → rejected with a reason. Returns the order, or None."""
    o = store.get_order(ref)
    if not o or o["status"] != "pending":
        return None
    store.set_order(ref, "rejected", why)
    o["status"] = "rejected"
    o["why"] = why
    return o


# ------------------------------------------------------- ticket flows

def reply_ticket(ref: str, from_mgr: bool, text: str) -> dict | None:
    """Append a reply + run status transitions. Returns the ticket, or None.

    Rules: manager reply moves open → waiting; customer reply on a
    resolved ticket reopens it (→ open).
    """
    ticket = store.get_ticket(ref)
    if not ticket:
        return None
    store.add_msg(ref, 1 if from_mgr else 0, text[:500])
    if from_mgr and ticket["status"] == "open":
        store.set_ticket(ref, "waiting")
        ticket["status"] = "waiting"
    elif not from_mgr and ticket["status"] == "resolved":
        store.set_ticket(ref, "open")
        ticket["status"] = "open"
    return ticket


# ------------------------------------------------------- localized texts

def texts_for_admins(admin_ids, key: str, **kw) -> list[tuple[int, str]]:
    """Same message rendered in EACH admin's own language. [(admin_id, text)].

    A kwarg may be a callable taking lang — resolved per admin (e.g. a
    service name rendered in each admin's own language).
    """
    out = []
    for aid in admin_ids:
        lang = store.user_lang(aid)
        resolved = {k: (v(lang) if callable(v) else v) for k, v in kw.items()}
        out.append((aid, t(key, lang, **resolved)))
    return out


def badge(status: str, lang: str) -> str:
    """Localized status label shared by bot lists and web badges."""
    return t(f"badge.{status}", lang)


def sev_label(sev: str, lang: str) -> str:
    return t(f"sev.{sev}", lang)


def svc_display(catalog: dict, code: str, lang: str) -> tuple[str, str]:
    """(icon+name, desc) for a service in the requested language."""
    s = store.svc_by_code(catalog, code or "")
    if not s:
        return code or "-", ""
    fa = lang == "fa"
    lang_block = s.get("fa" if fa else "en", {}) or s.get("en", {})
    name = f"{s.get('icon', '📦')} {lang_block.get('name', s.get('code'))}"
    return name, lang_block.get("desc", "")


def price_display(catalog: dict, svc: dict | None, lang: str) -> str:
    if not svc or svc.get("price") is None:
        return t("price.onrequest", lang)
    fa = lang == "fa"
    cur = (catalog.get("currency") or {}).get("fa" if fa else "en", "")
    num = f"{svc['price']:,}".replace(",", "٬") if fa else f"{svc['price']:,}"
    return f"{num} {cur}".strip()
