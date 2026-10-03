# -*- coding: utf-8 -*-
"""P17 — neo4jev: knowledge-graph walk over regimes & strategies."""
META = {"id": "P17", "name": "neo4graph", "inspired_by": "neo4jev",
        "desc": "At each node pick the most worthwhile edge, follow it."}

EDGES = {
    "root": [("trending", 0.8), ("ranging", 0.5), ("volatile", 0.4)],
    "trending": [("ema_cross", 0.9), ("multi_tf_trend", 0.8),
                 ("macd_momentum", 0.6)],
    "ranging": [("bollinger_fade", 0.8), ("rsi_reversal", 0.7)],
    "volatile": [("fly_momentum", 0.7), ("candle_pattern", 0.5)],
}


def run(ctx):
    f = (ctx.get("feats") or {}).get("M1", {})
    regime = ("trending" if abs(f.get("mom") or 0) > 0.25
              else "volatile" if (f.get("atr") or 0) > 1.2 else "ranging")
    path = ["root", regime]
    node = regime
    for _ in range(2):
        edges = EDGES.get(node)
        if not edges:
            break
        node = max(edges, key=lambda e: e[1])[0]
        path.append(node)
    return {"path": path, "recommend": path[-1],
            "verdict": "->".join(path)}
