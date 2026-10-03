# -*- coding: utf-8 -*-
"""P12 — typesafe-mario: Jev plays a micro market game from RAM-like state.
No charts — only structured state; actions = run(buy)/jump(hold)/dodge(sell)."""
import random

META = {"id": "P12", "name": "arcade", "inspired_by": "typesafe-mario",
        "desc": "Structured-state arcade policy scored over a micro-sim."}


def run(ctx):
    rng = random.Random(int(ctx.get("cycles", 1)))
    fly = ctx.get("fly", {}).get("score", 0)
    price, lives, pts = 100.0, 3, 0
    for _ in range(120):
        shock = rng.gauss(0, 0.8) + (0.3 if fly > 0 else -0.3)
        action = "run" if fly > 0.1 else "dodge" if fly < -0.1 else "jump"
        if action == "run":
            pts += shock
        elif action == "dodge":
            pts -= shock * 0.5
        if shock < -2.2 and action == "run":
            lives -= 1
        price += shock
        if lives <= 0:
            break
    return {"game_points": round(pts, 1), "lives": lives,
            "policy": "fly-follow", "verdict":
            "win" if lives > 0 and pts > 0 else "game-over"}
