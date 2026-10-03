# -*- coding: utf-8 -*-
"""P02 — fast-jev-compaction: prune useless state, keep originals."""
META = {"id": "P02", "name": "compaction", "inspired_by":
        "fast-jev-compaction",
        "desc": "Drop near-zero-information indicators before the Jev call."}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    scale = {"rsi": 50.0, "stoch_k": 50.0, "cci": 100.0, "wr": 50.0,
             "bb_pb": 0.5, "macd_hist": 0.3, "mom": 0.3}
    kept, dropped = [], []
    for k, norm in scale.items():
        val = f.get(k)
        if val is None:
            dropped.append(k)
            continue
        info = abs(val - (0 if k in ("macd_hist", "mom") else norm)) \
            / max(abs(norm), 1e-9)
        (kept if info > 0.12 else dropped).append(k)
    total = len(kept) + len(dropped) or 1
    return {"kept": kept, "dropped": dropped,
            "ratio": round(len(kept) / total, 2),
            "verdict": f"keep {len(kept)}/{total}"}
