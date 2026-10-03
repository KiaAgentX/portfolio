# -*- coding: utf-8 -*-
"""P18 — jev-curate: tag journal trades for the next training round."""
META = {"id": "P18", "name": "curate", "inspired_by": "jev-curate",
        "desc": "Quality/relevance/risk pass over the trade journal."}


def tag(t):
    if t.get("pnl", 0) > 0 and t.get("reason") == "TP":
        return "high_quality"
    if t.get("pnl", 0) > 0:
        return "lucky_review"
    if t.get("reason") == "SL":
        return "expected_loss"
    return "risky_review"


def run(ctx):
    trades = ctx.get("journal_trades") or []
    counts = {}
    for t in trades:
        k = tag(t)
        counts[k] = counts.get(k, 0) + 1
    if not trades:
        j = ctx.get("journal") or {}
        counts = {"high_quality": int(j.get("winrate", 0) * j.get("trades", 0)
                                     / 100), "expected_loss":
                  j.get("trades", 0) - int(j.get("winrate", 0) *
                                           j.get("trades", 0) / 100)}
    keep = counts.get("high_quality", 0)
    total = sum(counts.values()) or 1
    return {"tags": counts, "keep_ratio": round(keep / total, 2),
            "verdict": f"keep {keep}/{total} for training"}
