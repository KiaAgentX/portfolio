"""
GQR Institutional – Event-Driven Backtester with Monte Carlo Analysis
"""
import asyncio
from pathlib import Path
import time
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from loguru import logger
from src.data.market_data import ParquetFeeder
from src.config import GQRConfig

class MonteCarloResult:
    def __init__(self, var_95: float, cvar_95: float, risk_of_ruin: float, sharpe: float):
        self.var_95 = var_95
        self.cvar_95 = cvar_95
        self.risk_of_ruin = risk_of_ruin
        self.sharpe = sharpe

class BacktestResult:
    def __init__(self, returns: list, equity_curve: list, trades: list, monte_carlo: MonteCarloResult):
        self.returns = returns
        self.equity_curve = equity_curve
        self.trades = trades
        self.monte_carlo = monte_carlo
        self.sharpe_ratio = np.mean(returns) / (np.std(returns) + 1e-8) * np.sqrt(252*24*60)

class BacktestEngine:
    def __init__(self, config: GQRConfig, model):
        self.config = config
        self.model = model
        self.initial_capital = config.backtest.initial_capital

    async def run(self, file_map: dict) -> BacktestResult:
        feeder = ParquetFeeder(file_map)
        capital = self.initial_capital
        equity = [capital]
        returns = []
        trades = []
        lookback = self.config.data_feeder.lookback_bars

        while True:
            batch = await feeder.get_synchronized_batch(lookback)
            if batch is None:
                break
            # Mock prediction & execution (simplified)
            ret = np.random.normal(0, 0.001)
            capital *= (1 + ret)
            equity.append(capital)
            returns.append(ret)

        returns = np.array(returns)
        mc = self._monte_carlo(returns, capital)
        return BacktestResult(returns, equity, trades, mc)

    def _monte_carlo(self, daily_returns: np.ndarray, final_equity: float) -> MonteCarloResult:
        n_simulations = 1000
        n_days = 252
        simulated_equities = []
        for _ in range(n_simulations):
            sampled = np.random.choice(daily_returns, size=n_days, replace=True)
            path = self.initial_capital * np.exp(np.cumsum(sampled))
            simulated_equities.append(path[-1])
        eq_array = np.array(simulated_equities)
        var_95 = final_equity - np.percentile(eq_array, 5)
        cvar_95 = final_equity - eq_array[eq_array <= np.percentile(eq_array, 5)].mean()
        risk_of_ruin = np.mean(eq_array < self.initial_capital * 0.5)
        sharpe = np.mean(daily_returns) / (np.std(daily_returns) + 1e-8) * np.sqrt(252)
        return MonteCarloResult(var_95, cvar_95, risk_of_ruin, sharpe)