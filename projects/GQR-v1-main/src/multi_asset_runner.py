"""
GQR Institutional V3.3 – Multi‑Asset Orchestrator
==================================================
Spawns separate RL agents for each symbol, shares a common DXY feed,
and enforces a portfolio‑wide drawdown limit.
"""

import asyncio
from loguru import logger
from src.config import init_config
from src.execution.broker_gateway import SimulationGateway
from src.main import InstitutionalGQR

class PortfolioRiskManager:
    """Monitors total equity across all agents and fires a global kill‑switch."""

    def __init__(self, initial_total: float, max_total_drawdown: float = 0.10):
        self.initial = initial_total
        self.max_dd = max_total_drawdown
        self.kill = False

    async def update(self, agents_equity: list) -> None:
        total = sum(agents_equity)
        dd = (self.initial - total) / self.initial if self.initial > 0 else 0.0
        if dd >= self.max_dd:
            self.kill = True
            logger.critical(
                f"PORTFOLIO KILL‑SWITCH: total DD = {dd:.2%} >= {self.max_dd:.2%}"
            )

async def run_multi_asset(config):
    """Start one agent per trading symbol with a shared execution gateway."""

    symbols = ["XAUUSD", "EURUSD"]   # easily extendable
    cross = "DXY"

    total_capital = config.backtest.initial_capital
    shared_gateway = SimulationGateway(
        initial_balance=total_capital,
        spread_points=0.5,
        commission_per_lot=config.execution_engine.commission_per_lot,
    )

    # Create agents
    agents = []
    tasks = []
    for sym in symbols:
        agent = InstitutionalGQR(config, sym, cross, shared_gateway=shared_gateway)
        agents.append(agent)
        tasks.append(asyncio.create_task(agent.run()))

    # Portfolio risk manager
    portfolio = PortfolioRiskManager(
        initial_total=total_capital,
        max_total_drawdown=config.risk_management.max_weekly_drawdown,
    )

    # Monitor loop
    try:
        while not portfolio.kill and any(not t.done() for t in tasks):
            equities = []
            for agent in agents:
                try:
                    acc = await agent.executor.get_account()
                    equities.append(acc.get("equity", 0.0))
                except Exception:
                    equities.append(0.0)

            await portfolio.update(equities)

            if portfolio.kill:
                logger.critical("Propagating kill‑switch to all agents")
                for agent in agents:
                    agent.risk.kill = True
                break

            await asyncio.sleep(1)

    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    finally:
        # Graceful shutdown
        for agent in agents:
            agent.risk.kill = True   # signal all to stop
        for t in tasks:
            t.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        logger.success("Multi‑asset system shut down")

if __name__ == "__main__":
    cfg = init_config()
    cfg.simulation_only = True  # always simulation for competition/demo
    asyncio.run(run_multi_asset(cfg))