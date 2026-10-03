# -*- coding: utf-8 -*-
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src import backtest


class TestBacktest(unittest.TestCase):
    def test_run_produces_metrics(self):
        m = backtest.run_backtest(seed=11, candles=800)
        for k in ("trades", "winrate", "profit_factor", "net_pnl",
                  "max_drawdown_pct", "equity"):
            self.assertIn(k, m)
        self.assertGreater(len(m["equity"]), 10)

    def test_deterministic(self):
        a = backtest.run_backtest(seed=3, candles=500)
        b = backtest.run_backtest(seed=3, candles=500)
        self.assertEqual(a["net_pnl"], b["net_pnl"])
        self.assertEqual(a["trades"], b["trades"])

    def test_single_strategy(self):
        m = backtest.run_backtest(seed=5, candles=600, strategy="ema_cross")
        self.assertEqual(m["strategy"], "ema_cross")

    def test_gen_candles_ohlc(self):
        bars = backtest.gen_candles(1, 200)
        for b in bars:
            self.assertGreaterEqual(b["h"], max(b["o"], b["c"]))
            self.assertLessEqual(b["l"], min(b["o"], b["c"]))


if __name__ == "__main__":
    unittest.main()
