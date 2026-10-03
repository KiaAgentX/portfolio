"""
GQR Institutional – Live Dashboard Backend
===========================================
FastAPI + WebSocket server that reads the shared JSON state
and pushes real‑time updates to the frontend.
"""

import asyncio
import json
from pathlib import Path
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from loguru import logger

SHARED_STATE_FILE = Path("data/dashboard_state.json")  # same relative path the engine writes

app = FastAPI(title="GQR Live Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, data: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(data)
            except Exception:
                self.active_connections.discard(connection)

manager = ConnectionManager()

def read_shared_state() -> dict:
    try:
        if SHARED_STATE_FILE.exists():
            with open(SHARED_STATE_FILE, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return {"equity": 0.0, "balance": 0.0, "drawdown": 0.0, "kill_switch": False, "trades": []}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        state = read_shared_state()
        await websocket.send_json(state)
        while True:
            await asyncio.sleep(1)
            new_state = read_shared_state()
            await websocket.send_json(new_state)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.exception(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)