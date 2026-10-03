# -*- coding: utf-8 -*-
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import Config
from src.risk_manager import RiskManager


class TestRisk(unittest.TestCase):
    def setUp(self):
        self.cfg = Config()
        self.cfg.max_daily_loss_usd = 20
        self.cfg.cooldown_losses = 2
        self.cfg.cooldown_sec = 60
        self.rm = RiskManager(self.cfg)

    def test_daily_loss_cap_blocks(self):
        self.rm.register_close(-25, equity=10000)
        ok, reason = self.rm.can_trade(balance=10000, equity=9975)
        self.assertFalse(ok)
        self.assertEqual(reason, "daily_loss_cap")

    def test_allows_when_profitable(self):
        self.rm.register_close(+5, equity=10005)
        ok, _ = self.rm.can_trade(balance=10005, equity=10005)
        self.assertTrue(ok)

    def test_cooldown_after_losses(self):
        self.rm.register_close(-1, equity=9999)
        self.rm.register_close(-1, equity=9998)
        ok, reason = self.rm.can_trade(balance=9998, equity=9998)
        self.assertFalse(ok)
        self.assertEqual(reason, "cooldown")

    def test_sizing_scales(self):
        v1, _ = self.cfg.size_volume(10000)
        v2, _ = self.cfg.size_volume(20000)
        self.assertGreaterEqual(v2, v1)

    def test_spread_filter(self):
        self.cfg.spread_max = 0.5
        ok, reason = self.rm.can_trade(balance=10000, spread=2.0)
        self.assertFalse(ok)
        self.assertEqual(reason, "spread")


if __name__ == "__main__":
    unittest.main()
