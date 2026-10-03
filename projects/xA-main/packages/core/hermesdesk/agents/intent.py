from __future__ import annotations

from hermesdesk.arabic import looks_critical, normalize

SALES_KW = ("سعر", "عرض", "كمية", "برميل", "شراء", "توريد", "quote", "price", "drum")
SUPPORT_KW = ("عطل", "تسرب", "تلوث", "شكوى", "تأخير", "leak", "contaminat", "broken")
KNOW_KW = ("لزوجة", "مواصف", "msds", "tds", "sae", "api", "توافق", "viscosity")


def heuristic_intent(text: str) -> str:
    t = normalize(text).lower()
    if looks_critical(t):
        return "support"
    scores = {
        "sales": sum(1 for k in SALES_KW if k in t),
        "support": sum(1 for k in SUPPORT_KW if k in t),
        "knowledge": sum(1 for k in KNOW_KW if k in t),
    }
    best = max(scores, key=scores.get)
    return best if scores[best] else "other"
