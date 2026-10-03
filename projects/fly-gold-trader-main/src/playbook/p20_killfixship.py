# -*- coding: utf-8 -*-
"""P20 — killmyidea: multi-angle scoring of the current strategy config.
Final verdict: KILL / FIX / SHIP."""
META = {"id": "P20", "name": "killfixship", "inspired_by": "killmyidea",
        "desc": "Score edge, risk, stability -> KILL / FIX / SHIP."}


def run(ctx):
    j = ctx.get("journal") or {}
    wr = j.get("winrate", 0)
    pnl = j.get("total_pnl", 0)
    dd = (ctx.get("risk") or {}).get("max_drawdown_pct", 99)
    worst = j.get("worst", -99)
    angles = {
        "edge": pnl > 0 and wr >= 50,
        "risk": dd < 5 and worst > -10,
        "stability": j.get("trades", 0) >= 20,
    }
    score = sum(angles.values())
    verdict = "SHIP" if score == 3 else "FIX" if score == 2 else "KILL"
    return {"angles": angles, "score": f"{score}/3", "verdict": verdict}
