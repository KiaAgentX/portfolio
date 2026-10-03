"""
GQR Institutional V3.3 – Generalised Single‑Symbol RL Agent
============================================================
Changes:
- SQLiteExperienceVault replaces HDF5 permanent memory.
- AuditLogger writes immutable JSON‑lines for every trade & kill‑switch event.
- ModelGuard monitors post‑update Sharpe and restores previous weights if needed.
- Emergency close failures are audited.
"""

import asyncio, sys, time, json
from pathlib import Path
from typing import Optional, Dict, List
import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.distributions import Categorical
from loguru import logger

from src.config import init_config, GQRConfig
from src.data.market_data import SimulationFeeder, AsyncMarketFeeder
from src.features.smc_engine import SMCEngine, RobustOnlineScaler
from src.models.transformer_ac import ActorCritic
from src.models.dxy_nexus import DXYNexusFusion
from src.execution.broker_gateway import TradeExecutor, SimulationGateway
from src.memory.sqlite_memory import SQLiteExperienceVault
from src.audit.audit_logger import AuditLogger
from src.monitoring.dashboard import LiveMonitor, AlertHub
from src.rl.model_guard import ModelGuard
from src.rl.ppo_trainer import PPOTrainer

STATE_PATH = Path("data/dashboard_state.json")  # shared with the dashboard server; relative so it works locally and in Docker

# ---------------------------------------------------------------------------
# Trainable cross‑asset fusion model
# ---------------------------------------------------------------------------
class FusedActorCritic(nn.Module):
    def __init__(self, gold_dim: int, dxy_dim: int,
                 embed_dim: int = 256, n_heads: int = 8,
                 n_layers: int = 4, dropout: float = 0.1):
        super().__init__()
        self.gold_proj = nn.Linear(gold_dim, embed_dim)
        self.dxy_proj  = nn.Linear(dxy_dim, embed_dim)
        self.fusion = DXYNexusFusion(embed_dim, n_heads, dropout)
        combined_dim = gold_dim + dxy_dim
        self.fusion_out = nn.Linear(embed_dim, combined_dim)
        self.ac = ActorCritic(input_dim=combined_dim,
                              embed_dim=embed_dim,
                              n_heads=n_heads,
                              n_layers=n_layers,
                              dropout=dropout,
                              n_actions=3)
        self.gold_dim = gold_dim
        self.dxy_dim = dxy_dim

    def forward(self, gold: torch.Tensor, dxy: torch.Tensor):
        g = self.gold_proj(gold)
        d = self.dxy_proj(dxy)
        fused = self.fusion(g, d)
        combined = self.fusion_out(fused)
        return self.ac(combined)

# ---------------------------------------------------------------------------
# Async risk controller (replaces legacy RiskEngine)
# ---------------------------------------------------------------------------
class AsyncRiskController:
    def __init__(self, config, executor, audit: AuditLogger):
        self.executor = executor
        self.params = config.risk_management
        self.daily_high = 0.0
        self.kill = False
        self.audit = audit

    async def validate(self, action: int, mkt: dict, conf: float) -> bool:
        if action == 0:
            return True
        if self.kill:
            return False
        if mkt.get('spread', 0) > self.params.spread_filter:
            return False
        vol = mkt.get('volatility', 0)
        if not (1e-6 < vol < self.params.max_volatility):
            return False
        if conf < 0.3:
            return False
        return True

    async def update_equity(self) -> tuple:
        acc = await self.executor.get_account()
        eq = acc.get('equity', 0)
        if eq > self.daily_high:
            self.daily_high = eq
        dd = (self.daily_high - eq) / self.daily_high if self.daily_high > 0 else 0.0
        if dd >= self.params.max_daily_drawdown:
            self.kill = True
            success = await self._emergency_close()
            if not success:
                self.audit.log_event("EMERGENCY_CLOSE_FAILED", {
                    "reason": "kill_switch",
                    "daily_drawdown": dd,
                })
            self.audit.log_event("KILL_SWITCH_ACTIVATED", {
                "daily_high": self.daily_high,
                "current_equity": eq,
                "drawdown": dd,
            })
        return eq, acc.get('balance', 0)

    async def _emergency_close(self) -> bool:
        try:
            await self.executor.emergency_close()
            return True
        except Exception as e:
            logger.exception("Emergency close failed")
            return False

    async def lot(self, volatility: float, confidence: float) -> float:
        base = self.params.fixed_lot_size
        if volatility > 1e-6:
            base *= min(2.0, 0.005 / volatility)
        base *= confidence
        return round(max(0.001, min(base, 0.1)), 3)

# ---------------------------------------------------------------------------
# Single‑symbol RL agent
# ---------------------------------------------------------------------------
class InstitutionalGQR:
    """
    A fully autonomous RL agent for a single trading symbol.
    Uses DXY as cross‑asset context.
    """

    def __init__(self, config: GQRConfig, symbol: str,
                 cross_asset: str = "DXY", shared_gateway=None):
        self.config = config
        self.device = config.device
        self.symbol = symbol
        self.cross = cross_asset

        # Independent feeder (simulation)
        self.feeder = SimulationFeeder([symbol, cross_asset])

        # Feature pipeline
        self.scaler = RobustOnlineScaler(window=1000, update_freq=20)
        self.smc = SMCEngine(swing_window=10, scaler=self.scaler)

        # Neural model (created lazily)
        self.model: Optional[FusedActorCritic] = None
        self.ppo_trainer: Optional[PPOTrainer] = None

        # Execution (shared gateway or own)
        if shared_gateway:
            self.executor = TradeExecutor.__new__(TradeExecutor)
            self.executor.gateway = shared_gateway
        else:
            self.executor = TradeExecutor(config)

        # Audit & memory
        self.audit = AuditLogger("logs/audit.jsonl")
        self.memory = SQLiteExperienceVault(f"data/memory/gqr_{symbol}.db")

        # Risk & monitoring
        self.risk = AsyncRiskController(config, self.executor, self.audit)
        self.monitor = LiveMonitor()
        self.alerts = AlertHub(config)

        # ModelGuard (created after model init)
        self.model_guard: Optional[ModelGuard] = None

        # Training buffer and counters
        self.buffer: List[Dict] = []
        self.steps = 0

        logger.success(f"[{self.symbol}] Agent initialised")

    # ---------- model initialisation ----------
    async def _init_model(self, gold_df, dxy_df):
        if self.model is not None:
            return
        g_dim = self.smc.extract(gold_df.iloc[:10]).drop(columns=["time"]).shape[1]
        d_dim = self.smc.extract(dxy_df.iloc[:10]).drop(columns=["time"]).shape[1]
        self.model = FusedActorCritic(
            gold_dim=g_dim, dxy_dim=d_dim,
            embed_dim=self.config.model.embed_dim,
            n_heads=self.config.model.n_heads,
            n_layers=self.config.model.n_layers,
            dropout=self.config.model.dropout
        ).to(self.device)
        self.ppo_trainer = PPOTrainer(
            self.model,
            lr=self.config.rl.learning_rate,
            gamma=self.config.rl.gamma,
            gae_lambda=self.config.rl.gae_lambda,
            clip_range=self.config.rl.clip_range,
            value_coeff=self.config.rl.value_coeff,
            entropy_coeff=self.config.rl.entropy_coeff,
            epochs=self.config.rl.epochs,
            batch_size=self.config.rl.batch_size
        )
        # Model guard
        self.model_guard = ModelGuard(
            self.model,
            backup_path=f"models/weights/{self.symbol}_backup.pt",
        )
        logger.info(f"[{self.symbol}] Model created | g_dim={g_dim}, d_dim={d_dim}")

    # ---------- feature extraction ----------
    def _extract_pair(self, gold_df, dxy_df):
        g = self.smc.transform_scaled(gold_df).drop(columns=["time"])
        d = self.smc.transform_scaled(dxy_df).drop(columns=["time"])
        m = min(len(g), len(d))
        g, d = g.iloc[:m], d.iloc[:m]
        return (torch.FloatTensor(g.values).unsqueeze(0).to(self.device),
                torch.FloatTensor(d.values).unsqueeze(0).to(self.device))

    # ---------- main trading loop ----------
    async def run(self):
        logger.info(f"[{self.symbol}] Starting live loop")
        try:
            while not self.risk.kill:
                batch = await self.feeder.get_synchronized_batch(
                    self.config.data_feeder.lookback_bars
                )
                if not batch or self.symbol not in batch or self.cross not in batch:
                    await asyncio.sleep(2)
                    continue

                g_df, d_df = batch[self.symbol], batch[self.cross]
                self.smc.fit_scaler(g_df)

                if self.model is None:
                    await self._init_model(g_df, d_df)

                g_t, d_t = self._extract_pair(g_df, d_df)

                # ---- forward pass ----
                self.model.eval()
                with torch.no_grad():
                    logits, value = self.model(g_t, d_t)
                    probs = torch.softmax(logits, dim=-1)
                    action = int(torch.argmax(probs, dim=-1))
                    log_p = float(torch.log(probs[0, action] + 1e-8))
                    conf = float(probs[0, action])

                tick = await self.feeder.get_latest_tick(self.symbol)
                mkt = tick or {"spread": 10, "volatility": 0.001}

                if not await self.risk.validate(action, mkt, conf):
                    continue

                lot = await self.risk.lot(mkt.get('volatility', 0.001), conf)
                prev_eq = (await self.executor.get_account())['equity']

                await self.executor.execute_action(action, self.symbol, lot)

                # Audit trade
                self.audit.log_event("TRADE_EXECUTED", {
                    "symbol": self.symbol,
                    "action": "BUY" if action == 1 else "SELL",
                    "lot": lot,
                    "equity_before": prev_eq,
                })

                # ---- fetch real next state ----
                await asyncio.sleep(1.0)
                next_batch = await self.feeder.get_synchronized_batch(50)
                if next_batch and self.symbol in next_batch and self.cross in next_batch:
                    n_g, n_d = self._extract_pair(next_batch[self.symbol],
                                                  next_batch[self.cross])
                else:
                    n_g, n_d = g_t, d_t

                new_eq = (await self.executor.get_account())['equity']
                reward = (new_eq - prev_eq) / (prev_eq + 1e-8)

                self.audit.log_event("REWARD", {
                    "symbol": self.symbol,
                    "equity_after": new_eq,
                    "reward": reward,
                })

                # Model guard: track return
                if self.model_guard:
                    self.model_guard.add_return(reward)
                    if self.model_guard.check_and_rollback():
                        self.audit.log_event("MODEL_ROLLBACK", {"reward": reward})

                # store transition
                self.buffer.append({
                    'gold': g_t.squeeze(0).cpu(),
                    'dxy': d_t.squeeze(0).cpu(),
                    'action': action,
                    'log_prob': log_p,
                    'reward': reward,
                    'next_gold': n_g.squeeze(0).cpu(),
                    'next_dxy': n_d.squeeze(0).cpu(),
                    'value': value.item(),
                    'done': False
                })
                self.steps += 1

                # SQLite memory commit
                self.memory.commit_experience(
                    state=torch.cat([g_t.squeeze(0), d_t.squeeze(0)], dim=-1).cpu(),
                    action=action,
                    reward=reward,
                    next_state=torch.cat([n_g.squeeze(0), n_d.squeeze(0)], dim=-1).cpu(),
                    symbol=self.symbol,
                )

                eq, bal = await self.risk.update_equity()
                self.monitor.record_trade(self.symbol, action, lot, mkt.get('bid', 0), eq)
                self.monitor.update_state(eq, bal,
                    (self.risk.daily_high - eq) / self.risk.daily_high if self.risk.daily_high > 0 else 0,
                    self.risk.kill)

                self._write_dashboard_state(eq, bal)

                if self.steps >= self.config.rl.train_every_n_steps:
                    await self._train_step()
                    self.steps = 0

                await asyncio.sleep(0.5)

        except KeyboardInterrupt:
            pass
        finally:
            await self._shutdown()

    # ---------- PPO update ----------
    async def _train_step(self):
        if not self.buffer:
            return
        logger.info(f"[{self.symbol}] Training on {len(self.buffer)} experiences")

        # Backup and start monitoring
        if self.model_guard:
            self.model_guard.backup()
            self.model_guard.start_monitoring()

        self.model.train()
        loss = self.ppo_trainer.update(self.buffer)

        self.audit.log_event("PPO_UPDATE", {
            "symbol": self.symbol,
            "buffer_size": len(self.buffer),
            "loss": loss,
        })

        torch.save({'model': self.model.state_dict()},
                   f"models/weights/{self.symbol}_latest.pt")
        self.buffer.clear()
        logger.info(f"[{self.symbol}] PPO update complete")

    # ---------- helpers ----------
    def _write_dashboard_state(self, equity, balance):
        try:
            state = {
                "equity": equity,
                "balance": balance,
                "drawdown": (self.risk.daily_high - equity) / self.risk.daily_high
                            if self.risk.daily_high > 0 else 0,
                "kill_switch": self.risk.kill,
                "trades": [
                    {
                        "time": time.time(),
                        "action": "BUY" if e['action'] == 1 else "SELL",
                        "lot": 0.01,
                        "equity_after": equity
                    }
                    for e in self.buffer[-20:]
                ]
            }
            STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(STATE_PATH, "w") as f:
                json.dump(state, f)
        except Exception:
            pass

    async def _shutdown(self):
        if self.model:
            torch.save({'model': self.model.state_dict()},
                       f"models/weights/{self.symbol}_final.pt")
        await self.executor.shutdown()
        self.feeder.shutdown()
        self.memory.close()
        self.audit.verify_chain()
        await self.alerts.close()
        logger.success(f"[{self.symbol}] Shutdown complete")

# ---------------------------------------------------------------------------
# Standalone entry point (for single‑symbol test)
# ---------------------------------------------------------------------------
async def main():
    config = init_config()
    config.simulation_only = True
    agent = InstitutionalGQR(config, symbol="XAUUSD")
    await agent.run()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())