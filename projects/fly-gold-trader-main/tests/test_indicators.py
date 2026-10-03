# -*- coding: utf-8 -*-
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src import indicators as ind


class TestIndicators(unittest.TestCase):
    closes = [100 + i * 0.5 + (i % 5) * 0.3 for i in range(80)]
    highs = [c + 1 for c in closes]
    lows = [c - 1 for c in closes]
    opens = [c - 0.2 for c in closes]
    vols = [100.0] * 80

    def test_rsi_bounds(self):
        for _ in range(5):
            v = ind.calc_rsi(self.closes)
            self.assertGreaterEqual(v, 0)
            self.assertLessEqual(v, 100)

    def test_rsi_uptrend_high(self):
        up = [100 + i for i in range(40)]
        self.assertGreater(ind.calc_rsi(up), 90)

    def test_ema_matches_manual(self):
        c = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        e = ind.calc_ema(c, 5)
        k = 2 / 6
        ema = sum(c[:5]) / 5
        for p in c[5:]:
            ema = p * k + ema * (1 - k)
        self.assertAlmostEqual(e, round(ema, 5), places=5)

    def test_atr_positive(self):
        self.assertGreater(ind.calc_atr(self.highs, self.lows, self.closes), 0)

    def test_stoch_range(self):
        v = ind.calc_stoch_rsi(self.closes)
        self.assertGreaterEqual(v, 0)
        self.assertLessEqual(v, 100)

    def test_bollinger_contains_price(self):
        lo, mid, up, pb = ind.calc_bollinger(self.closes)
        self.assertLess(lo, mid)
        self.assertLess(mid, up)

    def test_macd_zero_on_flat(self):
        flat = [100.0] * 60
        m, s, h = ind.calc_macd(flat)
        self.assertAlmostEqual(m, 0, places=4)
        self.assertAlmostEqual(h, 0, places=4)

    def test_calc_all_keys(self):
        f = ind.calc_all(self.closes, self.highs, self.lows,
                         self.opens, self.vols)
        for key in ("ema21", "rsi", "atr", "macd_hist", "bb_pb", "cci",
                    "wr", "pivots", "pattern"):
            self.assertIn(key, f)


if __name__ == "__main__":
    unittest.main()
