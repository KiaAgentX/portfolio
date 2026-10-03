import asyncio
from typing import Dict, Any
from loguru import logger

class SimulationGateway:
    def __init__(self, initial_balance: float = 10000.0, spread_points: float = 0.5, commission_per_lot: float = 7.0):
        self.balance = initial_balance
        self.equity = initial_balance
        self.open_positions = []
        self.spread = spread_points
        self.commission = commission_per_lot

    async def get_account(self) -> Dict[str, Any]:
        return {"balance": self.balance, "equity": self.equity, "margin": 0.0}

    async def execute_action(self, action: int, symbol: str, lot: float):
        if action == 0:
            return
        logger.info(f"Simulated { 'BUY' if action==1 else 'SELL' } {lot} {symbol}")

    async def emergency_close(self):
        self.open_positions.clear()
        logger.info("Simulated emergency close")

    async def shutdown(self):
        pass

class TradeExecutor:
    def __init__(self, config, gateway=None):
        self.gateway = gateway or SimulationGateway()

    async def execute_action(self, action: int, symbol: str, lot: float):
        await self.gateway.execute_action(action, symbol, lot)

    async def get_account(self):
        return await self.gateway.get_account()

    async def emergency_close(self):
        await self.gateway.emergency_close()

    async def shutdown(self):
        await self.gateway.shutdown()