# -*- coding: utf-8 -*-
"""P06 — SemDecide: classify / score / filter from the shell."""
META = {"id": "P06", "name": "semdecide", "inspired_by": "SemDecide",
        "desc": "CLI-grade semantic decisions for pipelines & hooks."}


def classify(text):
    t = text.lower()
    if any(w in t for w in ("overbought", "bear", "sell", "down")):
        return "bearish"
    if any(w in t for w in ("oversold", "bull", "buy", "up")):
        return "bullish"
    return "neutral"


def score(text):
    return round(min(1.0, len(text.split()) / 12.0), 2)


def filter_items(items, min_score=0.3):
    return [i for i in items if score(str(i)) >= min_score]


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    txt = f"rsi {f.get('rsi')} mom {f.get('mom')} " + \
        ("bull" if f.get("ema_trend") == "bull" else "bear")
    return {"classify": classify(txt), "score": score(txt),
            "filter_example": len(filter_items(["short", "a much longer and "
                                                "informative market note"])),
            "verdict": classify(txt)}
