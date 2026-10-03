import os
from pathlib import Path
from typing import Optional, List

import torch
import yaml
from loguru import logger
from pydantic import BaseModel, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class DataFeederConfig(BaseModel):
    symbols: List[str] = Field(default=["XAUUSD", "EURUSD", "DXY"])
    timeframe: str = "M1"
    lookback_bars: int = Field(default=500, ge=50, le=5000)
    backtest_csv_path: Optional[str] = None
    precomputed_features_path: Optional[str] = None

class ExecutionEngineConfig(BaseModel):
    magic_number: int = 888888
    slippage_tolerance: int = 10
    commission_per_lot: float = 7.0
    risk_per_trade_pct: float = 0.01

class RiskManagementConfig(BaseModel):
    max_daily_drawdown: float = Field(default=0.05, ge=0.001, le=0.5)
    max_weekly_drawdown: float = Field(default=0.10, ge=0.001, le=0.5)
    spread_filter: float = 30.0
    max_volatility: float = 0.05
    fixed_lot_size: float = 0.01
    use_dynamic_lot: bool = True
    max_correlation_exposure: float = 0.7

class ModelConfig(BaseModel):
    embed_dim: int = Field(default=256, ge=64, le=1024)
    n_heads: int = Field(default=8, ge=2, le=16)
    n_layers: int = Field(default=4, ge=2, le=12)
    dropout: float = Field(default=0.1, ge=0.0, le=0.5)
    max_seq_len: int = Field(default=200, ge=10, le=1000)

class RLConfig(BaseModel):
    learning_rate: float = Field(default=3e-5, ge=1e-6, le=1e-2)
    gamma: float = Field(default=0.99, ge=0.8, le=0.9999)
    gae_lambda: float = Field(default=0.95, ge=0.8, le=1.0)
    clip_range: float = Field(default=0.2, ge=0.01, le=0.5)
    entropy_coeff: float = Field(default=0.01, ge=0.0, le=0.1)
    value_coeff: float = Field(default=0.5, ge=0.0, le=1.0)
    epochs: int = Field(default=5, ge=1, le=20)
    batch_size: int = Field(default=256, ge=32, le=4096)
    train_every_n_steps: int = Field(default=1024, ge=100, le=100000)

class BacktestConfig(BaseModel):
    initial_capital: float = 10000.0
    start_date: str = "2020-01-01"
    end_date: str = "2023-12-31"
    output_report_path: str = "reports/backtest_report.html"

class MonitoringConfig(BaseModel):
    dashboard_port: int = 8501
    telegram_bot_token: Optional[SecretStr] = None
    telegram_chat_id: Optional[int] = None
    discord_webhook_url: Optional[SecretStr] = None
    alert_on_drawdown: bool = True
    alert_on_order: bool = False

class GQRConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="GQR_",
        env_nested_delimiter="__",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "GQR-Institutional"
    version: str = "3.3.0"
    log_level: str = "INFO"
    yaml_config_path: Optional[str] = "configs/settings.yaml"

    data_feeder: DataFeederConfig = DataFeederConfig()
    execution_engine: ExecutionEngineConfig = ExecutionEngineConfig()
    risk_management: RiskManagementConfig = RiskManagementConfig()
    model: ModelConfig = ModelConfig()
    rl: RLConfig = RLConfig()
    backtest: BacktestConfig = BacktestConfig()
    monitoring: MonitoringConfig = MonitoringConfig()

    simulation_only: bool = True
    device: Optional[torch.device] = None

    def load_yaml(self) -> None:
        yaml_path = self.yaml_config_path
        if not yaml_path or not os.path.exists(yaml_path):
            return
        with open(yaml_path, "r") as f:
            data = yaml.safe_load(f)
        if not data:
            return
        for section, values in data.items():
            if hasattr(self, section) and isinstance(values, dict):
                existing = getattr(self, section)
                if isinstance(existing, BaseModel):
                    updated = existing.__class__(**{**existing.model_dump(), **values})
                    setattr(self, section, updated)

    def detect_hardware(self) -> torch.device:
        if self.device is not None:
            return self.device
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            logger.success("CUDA GPU detected")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            self.device = torch.device("mps")
            logger.success("Apple MPS detected")
        else:
            self.device = torch.device("cpu")
            logger.info("Running on CPU")
        return self.device

    def setup_logging(self) -> None:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        logger.remove()
        logger.add(
            log_dir / "gqr_{time:YYYY-MM-DD}.log",
            rotation="10 MB",
            retention="30 days",
            level=self.log_level,
        )
        logger.add(lambda msg: print(msg, end=""), level=self.log_level, colorize=True)

    def create_directories(self) -> None:
        for d in ["logs", "configs", "data/raw", "data/processed", "data/memory",
                  "models/weights", "models/backups", "reports"]:
            Path(d).mkdir(parents=True, exist_ok=True)

def init_config(yaml_path: Optional[str] = None) -> GQRConfig:
    config = GQRConfig(yaml_config_path=yaml_path) if yaml_path else GQRConfig()
    config.load_yaml()
    config.setup_logging()
    config.create_directories()
    config.detect_hardware()
    return config