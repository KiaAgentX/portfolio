# -*- coding: utf-8 -*-
"""Typed, validated runtime configuration.

PRO edition: every knob the system uses lives here, is loaded from the
environment / .env file, is type-coerced, range-checked and exposed both
to the server and to the CLI/backtester. `safe_dict()` hides secrets for
the dashboard.
"""
import os
from dotenv import load_dotenv

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_REPO_ROOT, ".env"))


def _num(key, default, cast=float, lo=None, hi=None):
    try:
        v = cast(os.environ.get(key, default))
    except (TypeError, ValueError):
        v = cast(default)
    if lo is not None and v < lo:
        v = cast(lo)
    if hi is not None and v > hi:
        v = cast(hi)
    return v


class Config:
    """All runtime parameters, validated on construction."""

    def __init__(self):
        # --- mode / server -------------------------------------------------
        self.trade_mode = os.environ.get("TRADE_MODE", "paper").lower()
        if self.trade_mode not in ("paper", "live"):
            self.trade_mode = "paper"
        self.host = os.environ.get("HOST", "0.0.0.0")
        self.port = _num("PORT", 5000, int, 1, 65535)
        self.secret_key = os.environ.get("SECRET_KEY", "gold-fly-hft")
        self.auto_start = os.environ.get("AUTO_START", "0") == "1"

        # --- market ---------------------------------------------------------
        self.symbol = os.environ.get("SYMBOL", "XAUUSD!")
        self.symbols = [s.strip() for s in
                        os.environ.get("SYMBOLS",
                                       "XAUUSD!,USDCAD!,EURUSD!").split(",")
                        if s.strip()]
        self.loop_delay = _num("LOOP_DELAY", 2, float, 0.2, 60)
        self.sim_speed = _num("SIM_SPEED", 30, float, 1, 10000)
        self.sim_seed = _num("SIM_SEED", 20240101, int)

        # --- execution ------------------------------------------------------
        self.base_volume = _num("BASE_VOLUME", 0.01, float, 0.01, 10)
        self.max_positions = _num("MAX_POSITIONS", 5, int, 1, 50)
        self.tp_usd = _num("TP_USD", 8.0, float, 0.5, 10000)
        self.sl_usd = _num("SL_USD", 4.0, float, 0.5, 10000)
        self.trail_usd = _num("TRAIL_USD", 3.0, float, 0.0, 10000)
        self.spread_max = _num("SPREAD_MAX", 0.0, float, 0, 100)  # 0=off

        # --- risk ------------------------------------------------------------
        self.risk_pct = _num("RISK_PCT", 0.5, float, 0.05, 5)
        self.max_daily_loss_usd = _num("MAX_DAILY_LOSS_USD", 60, float, 5, 100000)
        self.max_drawdown_pct = _num("MAX_DRAWDOWN_PCT", 10, float, 1, 90)
        self.cooldown_losses = _num("COOLDOWN_AFTER_LOSSES", 3, int, 1, 20)
        self.cooldown_sec = _num("COOLDOWN_SEC", 300, float, 10, 86400)
        self.session_start = _num("SESSION_START", 0, int, 0, 23)
        self.session_end = _num("SESSION_END", 24, int, 1, 24)

        # --- intelligence -----------------------------------------------------
        self.strategy = os.environ.get("STRATEGY", "ensemble")
        self.ensemble = os.environ.get("ENSEMBLE", "1") == "1"
        self.fly_root = os.environ.get("FLY_ROOT", "")

        # --- notifications -----------------------------------------------------
        self.notify_url = os.environ.get("NOTIFY_URL", "")
        self.tg_token = os.environ.get("TELEGRAM_TOKEN", "")
        self.tg_chat = os.environ.get("TELEGRAM_CHAT", "")

    # ------------------------------------------------------------------ utils
    def validate(self):
        """Return a list of human-readable configuration problems."""
        problems = []
        if self.tp_usd <= self.trail_usd and self.trail_usd > 0:
            problems.append("TRAIL_USD should be smaller than TP_USD")
        if self.sl_usd <= 0 or self.tp_usd <= 0:
            problems.append("TP/SL must be positive")
        if not (0 <= self.session_start < self.session_end <= 24):
            problems.append("SESSION_START/END must satisfy 0<=start<end<=24")
        if self.trade_mode == "live":
            problems.append("LIVE mode trades real money - double check risk caps")
        return problems

    def size_volume(self, balance):
        """Scale volume with account growth; report $-risk per SL hit."""
        vol = max(0.01, round(self.base_volume * max(0.0, balance) / 10000.0, 2))
        vol = min(vol, self.base_volume * 10)
        risk_usd = round(max(0.0, balance) * self.risk_pct / 100.0, 2)
        return vol, risk_usd

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items()}

    def safe_dict(self):
        """Dashboard-safe copy: secrets masked."""
        d = self.to_dict()
        d["secret_key"] = "***"
        d["tg_token"] = "***" if self.tg_token else ""
        return d

    def update(self, key, value):
        """Update a single config attribute at runtime."""
        if not hasattr(self, key):
            return False, f"Unknown key: {key}"
        old = getattr(self, key)
        if isinstance(old, bool):
            setattr(self, key, value in (True, "1", "true", "True", "yes"))
        elif isinstance(old, int):
            setattr(self, key, int(value))
        elif isinstance(old, float):
            setattr(self, key, float(value))
        else:
            setattr(self, key, str(value))
        return True, f"{key}: {old} -> {getattr(self, key)}"


def _cfg():
    global _CFG
    if _CFG is None:
        _CFG = Config()
    return _CFG


CFG = Config()
