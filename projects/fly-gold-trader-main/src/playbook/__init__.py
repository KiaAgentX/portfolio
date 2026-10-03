# -*- coding: utf-8 -*-
"""Jev Playbook — 20 adapted patterns from the community checklist.

Each pNN_*.py module exposes META + run(ctx) and is auto-registered.
All modules are deterministic and work WITHOUT the TypeSafe SDK (local
judges mimic Choice/Score); when the SDK exists they may enrich output.
"""
import importlib
import pkgutil

MODULES = []
for _m in sorted(pkgutil.iter_modules(__path__), key=lambda m: m.name):
    if _m.name.startswith("p") and _m.name[1:3].isdigit():
        MODULES.append(importlib.import_module(f"src.playbook.{_m.name}"))

BY_ID = {m.META["id"]: m for m in MODULES}


def run_all(ctx):
    out = {}
    for m in MODULES:
        try:
            out[m.META["id"]] = {**m.META, "result": m.run(ctx)}
        except Exception as e:  # a playbook module must never kill the app
            out[m.META["id"]] = {**m.META,
                                 "result": {"verdict": "error", "detail": str(e)}}
    return out


def gate(ctx):
    """P16 Prism as a live entry gate (used by the trading loop)."""
    try:
        return BY_ID["P16"].run(ctx)
    except Exception:
        return {"gate": 1.0, "verdict": "neutral"}
