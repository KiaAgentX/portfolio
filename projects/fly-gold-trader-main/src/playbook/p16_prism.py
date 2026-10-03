# -*- coding: utf-8 -*-
"""P16 — Prism: Jev never places orders; it judges toxic flow / pressure /
mean-reversion and gates the base strategy."""
META = {"id": "P16", "name": "prism", "inspired_by": "Prism",
        "desc": "Market-quality judge -> 0..1 gate for the base strategy."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    toxic = (f.get("volume") or "normal") in ("very_high",) and \
        (f.get("pattern") or ("", 0))[1] != 0
    pressure = abs(ctx.get("fly", {}).get("score", 0))
    revert = (f.get("bb_pb") or 0.5) < 0.08 or (f.get("bb_pb") or 0.5) > 0.92
    gate = 1.0
    labels = []
    if toxic:
        gate -= 0.6; labels.append("toxic_flow")
    if pressure > 0.7:
        gate -= 0.2; labels.append("extreme_pressure")
    if revert:
        gate += 0.0; labels.append("mean_reversion_zone")
    gate = round(max(0.0, min(1.0, gate)), 2)
    return {"gate": gate, "labels": labels,
            "verdict": "pass" if gate >= 0.6 else "block-entries"}
