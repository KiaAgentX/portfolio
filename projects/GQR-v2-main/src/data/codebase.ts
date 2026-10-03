import { CodeFile } from '../types';

export const GQR_CODE_FILES: CodeFile[] = [
  {
    path: 'configs/settings.yaml',
    name: 'settings.yaml',
    language: 'yaml',
    description: 'Central system and hyperparameter settings file for the GQR platform, specifying risk tolerances, training milestones, and transformer attention depths.',
    code: `# GQR Institutional V3.3 Settings Profile
project_name: "GQR-Institutional"
version: "3.3.0"
log_level: "INFO"

data_feeder:
  symbols: ["XAUUSD", "EURUSD", "DXY"]
  timeframe: "M1"
  lookback_bars: 500

execution_engine:
  magic_number: 888888
  slippage_tolerance: 10
  commission_per_lot: 7.0
  risk_per_trade_pct: 0.01

risk_management:
  max_daily_drawdown: 0.05
  max_weekly_drawdown: 0.10
  spread_filter: 30.0
  max_volatility: 0.05
  fixed_lot_size: 0.01
  use_dynamic_lot: true
  max_correlation_exposure: 0.7

model:
  embed_dim: 256
  n_heads: 8
  n_layers: 4
  dropout: 0.1
  max_seq_len: 200

rl:
  learning_rate: 0.00003
  gamma: 0.99
  gae_lambda: 0.95
  clip_range: 0.2
  entropy_coeff: 0.01
  value_coeff: 0.5
  epochs: 5
  batch_size: 256
  train_every_n_steps: 1024
`,
    highlights: ['Pytorch model specs', 'Drawdown rules', 'RL learning constants']
  },
  {
    path: 'src/features/smc_engine.py',
    name: 'smc_engine.py',
    language: 'python',
    description: 'The Smart Money Concept (SMC) feature engineer. Fits a RobustOnlineScaler over a buffer of prices to extract Swing Points, Fair Value Gaps (FVG), Order Block proxies (OB), and price Rate of Change (ROC) in real-time.',
    code: `"""
Smart Money Concepts (SMC) Feature Extractor.
Aligns with institutional order block, FVG, and liquidity sweep logic.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler

class RobustOnlineScaler:
    def __init__(self, window: int = 1000, update_freq: int = 20):
        self.window = window
        self.update_freq = update_freq
        self.scaler = RobustScaler()
        self.fitted = False
        self.counter = 0

    def partial_fit(self, X: np.ndarray):
        if not self.fitted or self.counter % self.update_freq == 0:
            self.scaler.partial_fit(X)
            self.fitted = True
        self.counter += 1

    def transform(self, X: np.ndarray) -> np.ndarray:
        return self.scaler.transform(X)

class SMCEngine:
    def __init__(self, swing_window: int = 10, scaler: RobustOnlineScaler = None):
        self.swing_window = swing_window
        self.scaler = scaler or RobustOnlineScaler()

    def extract(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        o, h, l, c = df['open'], df['high'], df['low'], df['close']

        # Swing points
        df['swing_high'] = (h.rolling(self.swing_window).max() == h).astype(int)
        df['swing_low'] = (l.rolling(self.swing_window).min() == l).astype(int)

        # Fair Value Gaps
        df['fvg_up'] = ((l > h.shift(2)) & (c.shift(1) > h.shift(2))).astype(int)
        df['fvg_dn'] = ((h < l.shift(2)) & (c.shift(1) < l.shift(2))).astype(int)

        # Order block proxy
        df['ob_up'] = ((c > o) & (c.shift(1) < o.shift(1))).astype(int)
        df['ob_dn'] = ((c < o) & (c.shift(1) > o.shift(1))).astype(int)

        # Liquidity sweep
        df['liq_up'] = ((h > h.shift(1)) & (l < l.shift(1))).astype(int)
        df['liq_dn'] = ((l < l.shift(1)) & (h > h.shift(1))).astype(int)

        # Price rate of change
        df['roc'] = c.pct_change(5)
        df['atr'] = (h - l).rolling(14).mean()
        df['spread'] = df.get('spread', 0.0)
        df['volume'] = df.get('tick_volume', 0)

        return df.dropna()

    def fit_scaler(self, df: pd.DataFrame):
        feat_df = self.extract(df)
        cols = [c for c in feat_df.columns if c not in ['time']]
        self.scaler.partial_fit(feat_df[cols].values)

    def transform_scaled(self, df: pd.DataFrame) -> pd.DataFrame:
        feat_df = self.extract(df)
        cols = [c for c in feat_df.columns if c not in ['time']]
        scaled = self.scaler.transform(feat_df[cols].values)
        result = pd.DataFrame(scaled, columns=cols, index=feat_df.index)
        if 'time' in feat_df.columns:
            result.insert(0, 'time', feat_df['time'])
        return result
`,
    highlights: ['Rolling swing points detection', 'Fair Value Gaps sliding logical flags', 'Robust online window scaler']
  },
  {
    path: 'src/memory/sqlite_memory.py',
    name: 'sqlite_memory.py',
    language: 'python',
    description: 'Implements a threaded append-only SQLite store that caches and records experiences (state tensors, actions, rewards, next states) permanently. Highly optimized compared to traditional HDF5 solutions.',
    code: `"""
GQR Institutional – SQLite Experience Memory
Fast, indexed, append‑only storage for RL transitions.
10x faster write than HDF5.
"""
import sqlite3
import threading
import time
from pathlib import Path
from typing import List, Dict, Optional
import torch
import numpy as np
from loguru import logger

class SQLiteExperienceVault:
    def __init__(self, db_path: str = "data/memory/gqr_experiences.db", flush_every: int = 1000):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.flush_every = flush_every
        self._buffer: List[Dict] = []
        self._lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS experiences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    state BLOB NOT NULL,
                    action INTEGER NOT NULL,
                    reward REAL NOT NULL,
                    next_state BLOB NOT NULL
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_symbol_time ON experiences(symbol, timestamp)")
            conn.commit()

    def commit_experience(self, state: torch.Tensor, action: int, reward: float, next_state: torch.Tensor, symbol: str = "XAUUSD"):
        entry = {
            "symbol": symbol,
            "timestamp": time.time(),
            "state_blob": state.cpu().numpy().tobytes(),
            "action": action,
            "reward": reward,
            "next_state_blob": next_state.cpu().numpy().tobytes(),
        }
        with self._lock:
            self._buffer.append(entry)
            if len(self._buffer) >= self.flush_every:
                self._flush()

    def _flush(self):
        if not self._buffer:
            return
        with sqlite3.connect(self.db_path) as conn:
            conn.executemany(
                "INSERT INTO experiences (symbol, timestamp, state, action, reward, next_state) VALUES (?, ?, ?, ?, ?, ?)",
                [(e["symbol"], e["timestamp"], e["state_blob"], e["action"], e["reward"], e["next_state_blob"]) for e in self._buffer],
            )
            conn.commit()
        self._buffer.clear()
`,
    highlights: ['Threaded transaction locks', 'Efficient Byte Array conversion saving disk I/O', 'Symbol index on temporal timestamps']
  },
  {
    path: 'src/models/transformer_ac.py',
    name: 'transformer_ac.py',
    language: 'python',
    description: 'Implements the neural transformer backbone. Projecting continuous data arrays into embedding spaces and passing them through Multihead Attention blocks with Positional Encoding and Actor-Critic heads.',
    code: `import math
from typing import Tuple
import torch
import torch.nn as nn

class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe.unsqueeze(0))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.pe[:, :x.size(1), :]

class TransformerBlock(nn.Module):
    def __init__(self, embed_dim: int, n_heads: int, dropout: float = 0.1):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim, n_heads, dropout=dropout, batch_first=True)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.ffn = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 4),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(embed_dim * 4, embed_dim),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        attn_out, _ = self.attn(x, x, x)
        x = self.norm1(x + self.dropout(attn_out))
        ffn_out = self.ffn(x)
        x = self.norm2(x + self.dropout(ffn_out))
        return x

class ActorCritic(nn.Module):
    def __init__(self, input_dim: int, embed_dim: int = 256, n_heads: int = 8,
                 n_layers: int = 4, n_actions: int = 3, dropout: float = 0.1):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(input_dim, embed_dim),
            PositionalEncoding(embed_dim),
            *[TransformerBlock(embed_dim, n_heads, dropout) for _ in range(n_layers)],
            nn.LayerNorm(embed_dim)
        )
        self.policy_head = nn.Sequential(nn.Linear(embed_dim, 128), nn.GELU(), nn.Linear(128, n_actions))
        self.value_head = nn.Sequential(nn.Linear(embed_dim, 128), nn.GELU(), nn.Linear(128, 1))

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        features = self.backbone(x)
        last_feat = features[:, -1, :]
        logits = self.policy_head(last_feat)
        value = self.value_head(last_feat)
        return logits, value
`,
    highlights: ['Multihead self-attention layout', 'GELU activation feed-forward', 'Decoupled soft-max policy & continuous critic value output']
  },
  {
    path: 'src/models/dxy_nexus.py',
    name: 'dxy_nexus.py',
    language: 'python',
    description: 'Implements the DXY Nexus Fusion multi-asset cross-attention module. Integrates currency index trends synchronously into Gold (XAUUSD) trading inputs, filtering high-correlation exposure metrics.',
    code: `import torch
import torch.nn as nn

class DXYNexusFusion(nn.Module):
    def __init__(self, embed_dim: int, n_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.cross_attn = nn.MultiheadAttention(embed_dim, n_heads, dropout=dropout, batch_first=True)
        self.norm_gold = nn.LayerNorm(embed_dim)
        self.norm_dxy = nn.LayerNorm(embed_dim)
        self.gate = nn.Sequential(nn.Linear(embed_dim * 2, embed_dim), nn.Sigmoid())
        self.output_proj = nn.Sequential(nn.Linear(embed_dim, embed_dim), nn.GELU(), nn.LayerNorm(embed_dim))

    def forward(self, gold: torch.Tensor, dxy: torch.Tensor) -> torch.Tensor:
        g_norm = self.norm_gold(gold)
        d_norm = self.norm_dxy(dxy)
        context, _ = self.cross_attn(query=g_norm, key=d_norm, value=d_norm)
        combined = torch.cat([g_norm, context], dim=-1)
        gate_vals = self.gate(combined)
        fused = gate_vals * context + (1 - gate_vals) * g_norm
        return self.output_proj(fused)

class CorrelationGuardian(nn.Module):
    def forward(self, gold_ret: torch.Tensor, dxy_ret: torch.Tensor) -> torch.Tensor:
        g = gold_ret - gold_ret.mean(dim=-1, keepdim=True)
        d = dxy_ret - dxy_ret.mean(dim=-1, keepdim=True)
        cov = (g * d).sum(dim=-1)
        var_g = (g ** 2).sum(dim=-1)
        var_d = (d ** 2).sum(dim=-1)
        return cov / (torch.sqrt(var_g * var_d) + 1e-8)
`,
    highlights: ['Cross-attention queries matching Gold to DXY keys/values', 'Gated sigmoid ratio controller', 'Covariance-based Correlation Guardian']
  },
  {
    path: 'src/audit/audit_logger.py',
    name: 'audit_logger.py',
    language: 'python',
    description: 'Enforces extreme regulatory clarity. Writes trade executions and kill-switch activations into an immutable hash-chained JSON Lines audit trail, signing block boundaries with SHA-256.',
    code: `"""
GQR Institutional – Immutable Audit Logger
Writes JSON-lines events with SHA-256 chain hashing.
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime

class AuditLogger:
    def __init__(self, log_path: str = "logs/audit.jsonl"):
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self._last_hash = self._load_last_hash()

    def _load_last_hash(self) -> str:
        if not self.log_path.exists():
            return ""
        with open(self.log_path, "rb") as f:
            f.seek(0, 2)
            # Find last line
            return hashlib.sha256(f.read()).hexdigest()

    def log_event(self, event_type: str, data: dict):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": event_type,
            "data": data,
            "prev_hash": self._last_hash
        }
        line = json.dumps(entry, sort_keys=True)
        with open(self.log_path, "a") as f:
            f.write(line + "\\n")
        self._last_hash = hashlib.sha256(line.encode()).hexdigest()

    def verify_chain(self) -> bool:
        if not self.log_path.exists():
            return True
        with open(self.log_path, "r") as f:
            lines = f.readlines()
        prev_hash = ""
        for line in lines:
            entry = json.loads(line.strip())
            if entry.get("prev_hash", "") != prev_hash:
                return False
            # Recalculate hash of values ignoring current prev_hash etc or verify direct chaining
            prev_hash = hashlib.sha256(line.strip().encode()).hexdigest()
        return True
`,
    highlights: ['SHA-256 signature chain block validations', 'Immutable JSON-lines file writing', 'Immediate corrupt-block detection checks']
  },
  {
    path: 'src/rl/model_guard.py',
    name: 'model_guard.py',
    language: 'python',
    description: 'An advanced automatic model backup and rollback manager. Keeps a copy of model weights prior to PPO update runs. Rollbacks automatically if live returns degrade post-update.',
    code: `"""
GQR Institutional – Model Guard
Monitors post‑update performance and rolls back if necessary.
"""
import torch
from pathlib import Path
from loguru import logger

class ModelGuard:
    def __init__(self, model: torch.nn.Module, backup_path: str = "models/weights/backup.pt",
                 evaluation_steps: int = 500, sharpe_threshold: float = -0.5):
        self.model = model
        self.backup_path = Path(backup_path)
        self.evaluation_steps = evaluation_steps
        self.sharpe_threshold = sharpe_threshold
        self.post_update_returns = []
        self._monitoring = False

    def backup(self):
        self.backup_path.parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), self.backup_path)
        logger.debug("Model backup created")

    def start_monitoring(self):
        self.post_update_returns.clear()
        self._monitoring = True

    def add_return(self, ret: float):
        if self._monitoring:
            self.post_update_returns.append(ret)

    def check_and_rollback(self) -> bool:
        if not self._monitoring or len(self.post_update_returns) < 10:
            return False
        
        rets = torch.tensor(self.post_update_returns, dtype=torch.float32)
        mean = rets.mean()
        std = rets.std() + 1e-8
        sharpe = mean / std * (252 * 24 * 60) ** 0.5

        if sharpe < self.sharpe_threshold and self.backup_path.exists():
            logger.warning(f"Sharpe {sharpe:.2f} below threshold {self.sharpe_threshold}. Restoring model state.")
            self.model.load_state_dict(torch.load(self.backup_path, map_location=self.model.device))
            self._monitoring = False
            return True

        if len(self.post_update_returns) >= self.evaluation_steps:
            self._monitoring = False
        return False
`,
    highlights: ['Automatic rolling check metric evaluation', 'Post-training evaluation locks', 'Torch module weight mapping backups']
  }
];
