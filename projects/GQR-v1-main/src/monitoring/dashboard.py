"""
GQR Institutional – Monitoring
================================
LiveMonitor  : in-memory trade/equity state fed by the trading engine.
AlertHub     : Telegram/Discord alert dispatcher (best-effort, never raises).
Streamlit UI : legacy dashboard below; runs only under `streamlit run`
               (guarded by `__main__`, so importing this module is side-effect free).
"""
import json
from collections import deque
from pathlib import Path
from typing import Deque, Dict, Optional

from loguru import logger

STATE_FILE = Path("data/dashboard_state.json")


class LiveMonitor:
    """In-memory view of the running engine (trades + account state)."""

    def __init__(self, max_trades: int = 200):
        self.trades: Deque[Dict] = deque(maxlen=max_trades)
        self.equity = 0.0
        self.balance = 0.0
        self.drawdown = 0.0
        self.kill_switch = False

    def record_trade(self, symbol: str, action: int, lot: float, price: float, equity: float) -> None:
        self.trades.append({"symbol": symbol, "action": int(action), "lot": float(lot),
                            "price": float(price), "equity": float(equity)})

    def update_state(self, equity: float, balance: float, drawdown: float, kill_switch: bool) -> None:
        self.equity, self.balance, self.drawdown, self.kill_switch = (
            float(equity), float(balance), float(drawdown), bool(kill_switch))

    def snapshot(self) -> dict:
        return {"equity": self.equity, "balance": self.balance, "drawdown": self.drawdown,
                "kill_switch": self.kill_switch, "trades": list(self.trades)}


class AlertHub:
    """Best-effort Telegram/Discord alerts. Missing credentials or network
    errors are logged, never raised, so alerting can never crash the engine."""

    def __init__(self, config=None):
        mon = getattr(config, "monitoring", None)
        tg_token = getattr(mon, "telegram_bot_token", None)
        self.telegram_token: Optional[str] = tg_token.get_secret_value() if tg_token else None
        self.telegram_chat_id = getattr(mon, "telegram_chat_id", None)
        dc = getattr(mon, "discord_webhook_url", None)
        self.discord_webhook: Optional[str] = dc.get_secret_value() if dc else None
        self._session = None

    async def _session_or_none(self):
        if self._session is None:
            try:
                import aiohttp
                self._session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10))
            except Exception as e:
                logger.debug(f"AlertHub: aiohttp unavailable ({e})")
        return self._session

    async def send(self, text: str) -> None:
        try:
            session = await self._session_or_none()
            if session is None:
                logger.info(f"[alert] {text}")
                return
            if self.telegram_token and self.telegram_chat_id:
                await session.post(
                    f"https://api.telegram.org/bot{self.telegram_token}/sendMessage",
                    json={"chat_id": self.telegram_chat_id, "text": text})
            if self.discord_webhook:
                await session.post(self.discord_webhook, json={"content": text})
        except Exception as e:
            logger.debug(f"AlertHub send failed: {e}")

    async def close(self) -> None:
        try:
            if self._session is not None:
                await self._session.close()
        except Exception:
            pass
        finally:
            self._session = None


if __name__ == "__main__":
    import streamlit as st

    st.title("GQR Institutional Dashboard")
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            data = json.load(f)
        st.metric("Equity", f"${data['equity']:,.2f}")
        st.metric("Balance", f"${data['balance']:,.2f}")
        st.metric("Drawdown", f"{data['drawdown']*100:.2f}%")
        if data["kill_switch"]:
            st.error("KILL SWITCH ACTIVE")
    else:
        st.info("Waiting for trading engine...")
