# -*- coding: utf-8 -*-
"""P19 — Canny: don't trust the 'I'm done' claim; verify loop health."""
META = {"id": "P19", "name": "canny", "inspired_by": "Canny",
        "desc": "Watchdog: is the completion claim backed by evidence?"}


def run(ctx):
    checks = {
        "loop_running": bool(ctx.get("running")),
        "cycles_advancing": (ctx.get("cycles") or 0) > 0,
        "data_fresh": (ctx.get("fresh_sec") or 0) < 10,
        "account_readable": (ctx.get("account") or {}).get("balance")
        is not None,
    }
    ok = all(checks.values())
    return {"checks": checks,
            "verdict": "trustworthy" if ok else
            "claim-unverified:" + ",".join(k for k, v in checks.items()
                                           if not v)}
