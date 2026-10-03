"""
Smart Money Concepts (SMC) Feature Extractor.
Aligns with institutional order block, FVG, and liquidity sweep logic.
"""

import pandas as pd
import numpy as np
from collections import deque
from sklearn.preprocessing import RobustScaler

class RobustOnlineScaler:
    """Rolling-window RobustScaler (sklearn's RobustScaler has no partial_fit,
    so the last `window` rows are buffered and re-fit every `update_freq` calls)."""
    def __init__(self, window: int = 1000, update_freq: int = 20):
        self.window = window
        self.update_freq = update_freq
        self.scaler = RobustScaler()
        self.fitted = False
        self.counter = 0
        self._buf: deque = deque(maxlen=window)

    def partial_fit(self, X: np.ndarray):
        self._buf.extend(np.asarray(X))
        if not self.fitted or self.counter % self.update_freq == 0:
            self.scaler.fit(np.asarray(self._buf))
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

        # Volatility
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