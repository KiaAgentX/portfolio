from __future__ import annotations

import re

_TATWEEL = "\u0640"
_ALEF = dict.fromkeys(list("أإآٱ"), "ا")
_WS = re.compile(r"\s+")


def normalize(text: str) -> str:
    if not text:
        return ""
    text = text.replace(_TATWEEL, "")
    for src, dst in _ALEF.items():
        text = text.replace(src, dst)
    return _WS.sub(" ", text).strip()


def truncate(text: str, max_len: int = 4000) -> str:
    text = text or ""
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"


CRITICAL_MARKERS = (
    "حريق",
    "انفجار",
    "إصابة",
    "اصابة",
    "تسرب نفطي",
    "تسرّب",
    "spill",
    "fire",
    "explosion",
    "injury",
    "killed",
)


def looks_critical(text: str) -> bool:
    t = (text or "").lower()
    return any(m.lower() in t for m in CRITICAL_MARKERS)
