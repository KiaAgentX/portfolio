# -*- coding: utf-8 -*-
"""P04 — typesafe-mcp: expose the trader as MCP-style tools."""
META = {"id": "P04", "name": "mcp_bridge", "inspired_by": "typesafe-mcp",
        "desc": "Tool descriptors so Claude Code/Desktop/Codex can drive it."}

TOOLS = [
    ("get_state", "Current price, signals, positions, account", {}),
    ("start_loop", "Start the trading loop (paper or live)", {}),
    ("stop_loop", "Stop the trading loop", {}),
    ("run_backtest", "Backtest a config", {"tp": "number", "sl": "number",
                                           "seed": "number"}),
    ("judge_trade", "Choice/Score a proposed order", {"side": "BUY|SELL",
                                                      "volume": "number"}),
]


def run(ctx):
    return {"tools": [{"name": n, "description": d, "inputSchema": s}
                      for n, d, s in TOOLS],
            "endpoint": "/api/playbook", "verdict": f"{len(TOOLS)} tools"}
