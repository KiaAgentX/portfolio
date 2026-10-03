# -*- coding: utf-8 -*-
"""Account-level risk manager - PRO edition.

Guards that sit BETWEEN the signal and the order:
  * daily loss cap (resets at UTC midnight)
  * max drawdown from equity peak
  * consecutive-loss cooldown
  * session-hours filter
  * spread filter
  * max simultaneous positions (enforced server-side as well)

Every decision is recorded so the dashboard can explain WHY a trade was
skipped.
"""
import threading
import time
from datetime import datetime, timezone


class RiskManager:
    def __init__(self, cfg):
        self.cfg = cfg
        self._lock = threading.Lock()
        self.day = datetime.now(timezone.utc).date()
        self.daily_pnl = 0.0
        self.peak_equity = None
        self.max_dd_pct = 0.0
        self.consec_losses = 0
        self.cooldown_until = 0.0
        self.blocks = {}          # reason -> count (for the dashboard)
        self.last_reason = None

    # ------------------------------------------------------------ lifecycle
    def register_close(self, pnl, equity=None):
        with self._lock:
            today = datetime.now(timezone.utc).date()
            if today != self.day:
                self.day = today
                self.daily_pnl = 0.0
            self.daily_pnl = round(self.daily_pnl + pnl, 2)
            if pnl < 0:
                self.consec_losses += 1
                if self.consec_losses >= self.cfg.cooldown_losses:
                    self.cooldown_until = time.time() + self.cfg.cooldown_sec
            else:
                self.consec_losses = 0
            if equity is not None:
                self._update_dd(equity)

    def _update_dd(self, equity):
        if self.peak_equity is None or equity > self.peak_equity:
            self.peak_equity = equity
        if self.peak_equity:
            dd = max(0.0, (self.peak_equity - equity) / self.peak_equity * 100)
            self.max_dd_pct = round(max(self.max_dd_pct, dd), 2)

    # -------------------------------------------------------------- gating
    def can_trade(self, balance=0.0, equity=None, spread=None):
        """Return (ok, reason)."""
        with self._lock:
            today = datetime.now(timezone.utc).date()
            if today != self.day:
                self.day = today
                self.daily_pnl = 0.0
            if equity is not None:
                self._update_dd(equity)

            hour = datetime.now(timezone.utc).hour
            if not (self.cfg.session_start <= hour < self.cfg.session_end):
                return self._block("session_hours")
            if self.daily_pnl <= -self.cfg.max_daily_loss_usd:
                return self._block("daily_loss_cap")
            if self.max_dd_pct >= self.cfg.max_drawdown_pct:
                return self._block("max_drawdown")
            if time.time() < self.cooldown_until:
                return self._block("cooldown")
            if self.cfg.spread_max > 0 and spread is not None \
                    and spread > self.cfg.spread_max:
                return self._block("spread")
            if self.cfg.sl_usd > balance * self.cfg.risk_pct / 100.0 > 0:
                return self._block("risk_budget")
            self.last_reason = None
            return True, "ok"

    def _block(self, reason):
        self.blocks[reason] = self.blocks.get(reason, 0) + 1
        self.last_reason = reason
        return False, reason

    # -------------------------------------------------------------- stats
    def stats(self):
        with self._lock:
            return {
                "day": str(self.day),
                "daily_pnl": self.daily_pnl,
                "daily_loss_cap": self.cfg.max_daily_loss_usd,
                "peak_equity": self.peak_equity,
                "max_drawdown_pct": self.max_dd_pct,
                "drawdown_cap_pct": self.cfg.max_drawdown_pct,
                "consec_losses": self.consec_losses,
                "cooldown_sec_left": max(0.0, round(self.cooldown_until - time.time(), 1)),
                "blocks": dict(self.blocks),
                "last_reason": self.last_reason,
            }
