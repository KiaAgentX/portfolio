# -*- coding: utf-8 -*-
"""Fly brain integration for gold trading.

Converts price data to visual representations and processes them
through the reconstructed fly connectome (166,700 neurons).

DEBUGGED EDITION - fixes applied here:
  BUG-9: _load() used os.chdir(FLY_ROOT) *without* try/finally. If the
         import failed, the whole process was left inside a wrong working
         directory, which broke Flask's template/static resolution. The
         default FLY_ROOT was also wrong (pointed *above* the repo root).
         Now: no chdir at all, path normalized, env-overridable.
  BUG-3: If the real connectome engine is unavailable the class no longer
         dies silently - it falls back to a clearly-labelled deterministic
         "simulated" engine so the rest of the system keeps working.
"""
import os
import sys
import numpy as np


_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# BUG-9 fix: default now resolves to <repo_root>/fly-wirehead and is an
# absolute, normalized path. Override with the FLY_ROOT environment var.
FLY_ROOT = os.path.abspath(
    os.environ.get("FLY_ROOT", os.path.join(_REPO_ROOT, "fly-wirehead"))
)


def price_to_image(closes, highs, lows, opens, width=90, height=160):
    """Convert price data to 90x160 RGB image for fly brain.

    Creates a candlestick chart visualization that the fly brain
    can process as visual input.

    NOTE: callers must pass correctly-ordered OHLC arrays. The original
    codebase fed swapped high/low columns here (see BUG-1 in mt5_trader).
    """
    frame = np.zeros((height, width, 3), dtype=np.uint8)
    frame[:, :] = [15, 15, 25]

    n = min(len(closes), 20)
    if n < 2:
        return frame

    prices = closes[-n:]
    hi = highs[-n:]
    lo = lows[-n:]
    op = opens[-n:]

    all_prices = list(prices) + list(hi) + list(lo) + list(op)
    p_min = min(all_prices)
    p_max = max(all_prices)
    p_range = p_max - p_min if p_max != p_min else 1

    candle_w = max(1, (width - 4) // n)
    start_x = (width - candle_w * n) // 2

    for i in range(n):
        x = start_x + i * candle_w
        is_green = prices[i] >= op[i]

        body_top = max(prices[i], op[i])
        body_bot = min(prices[i], op[i])

        y_top = int((1 - (body_top - p_min) / p_range) * (height - 20)) + 10
        y_bot = int((1 - (body_bot - p_min) / p_range) * (height - 20)) + 10
        y_high = int((1 - (hi[i] - p_min) / p_range) * (height - 20)) + 10
        y_low = int((1 - (lo[i] - p_min) / p_range) * (height - 20)) + 10

        color = [0, 200, 80] if is_green else [220, 50, 50]
        wick_color = [100, 100, 120]

        wick_x = x + candle_w // 2
        for y in range(min(y_high, y_low), max(y_high, y_low) + 1):
            if 0 <= y < height and 0 <= wick_x < width:
                frame[y, wick_x] = wick_color

        for y in range(min(y_top, y_bot), max(y_top, y_bot) + 1):
            for cx in range(x, min(x + candle_w, width)):
                if 0 <= y < height:
                    frame[y, cx] = color

    if n > 1:
        ema_vals = []
        ema = prices[0]
        k = 2 / (min(21, n) + 1)
        for p in prices:
            ema = p * k + ema * (1 - k)
            ema_vals.append(ema)

        prev_y = None
        for i, ema_val in enumerate(ema_vals):
            x = start_x + i * candle_w + candle_w // 2
            y = int((1 - (ema_val - p_min) / p_range) * (height - 20)) + 10
            if prev_y is not None and 0 <= x < width:
                for yy in range(min(prev_y, y), max(prev_y, y) + 1):
                    if 0 <= yy < height:
                        frame[yy, x] = [100, 150, 255]
            prev_y = y

    return frame


class FlyBrain:
    """Wrapper around FlyEngine for trading signals."""

    def __init__(self):
        self.engine = None
        self.simulated = False
        self.status = "loading"
        self._load()

    def _load(self):
        # BUG-9 fix: never chdir. Only touch sys.path, and guard everything.
        try:
            if os.path.isdir(FLY_ROOT) and FLY_ROOT not in sys.path:
                # Set data path for flywirehead before importing
                fly_data = os.path.join(FLY_ROOT, "data")
                if not os.environ.get("FLYWIREHEAD_DATA") and os.path.isdir(fly_data):
                    os.environ["FLYWIREHEAD_DATA"] = fly_data
                sys.path.insert(0, FLY_ROOT)
                from flywirehead.engine import FlyEngine  # noqa: WPS433

                self.engine = FlyEngine()
                self.status = "ready"
                print(f"[FLY] Ready: {self.engine.brain.n:,} neurons")
                return
            raise ImportError(f"fly-wirehead not found at {FLY_ROOT}")
        except Exception as e:
            # BUG-3 fix: graceful, clearly-labelled fallback instead of a
            # half-dead object that returns zeros forever.
            self.engine = None
            self.simulated = True
            self.status = "simulated"
            print(f"[FLY] Real connectome unavailable ({e}); "
                  f"using deterministic simulated fly brain")

    def analyze(self, closes, highs, lows, opens):
        """Process price data through fly brain and return signal.

        Returns dict with pam11, ppl101, kc, score, label, confidence.
        """
        if not closes or not highs or not lows or not opens:
            return {
                "pam11": 0, "ppl101": 0, "kc": 0,
                "score": 0, "label": "no_data", "confidence": 0,
                "spikes": 0, "status": self.status,
            }

        if self.engine is not None:
            try:
                frame = price_to_image(closes, highs, lows, opens)
                result = self.engine.observe(frame, 50.0, video_reward=True)
                pam = result["pam11_hz"]
                ppl = result["ppl101_hz"]
                kc = result["kc_hz"]
                score = result["running_score"]
                spikes = result["total_spikes"]
            except Exception as e:  # keep the trading loop alive
                self.status = f"error: {e}"
                return self._sim_signal(closes, highs, lows, opens)
        else:
            return self._sim_signal(closes, highs, lows, opens)

        if score > 0.05:
            label = "like"
        elif score < -0.05:
            label = "dislike"
        else:
            label = "neutral"

        conf = abs(pam - ppl) / max(max(pam, ppl), 1.0)
        conf = min(1.0, conf)

        return {
            "pam11": round(pam, 2),
            "ppl101": round(ppl, 2),
            "kc": round(kc, 2),
            "score": round(score, 4),
            "label": label,
            "confidence": round(conf, 3),
            "spikes": spikes,
            "status": self.status,
        }

    # ------------------------------------------------------------------
    # BUG-3 fix: deterministic simulated dopaminergic signal, derived from
    # the same candle features the real eye would see (momentum, EMA cross,
    # body/wick balance). No randomness -> reproducible backtests.
    # ------------------------------------------------------------------
    def _sim_signal(self, closes, highs, lows, opens):
        c = list(closes)[-20:]
        h = list(highs)[-20:]
        lo = list(lows)[-20:]
        o = list(opens)[-20:]

        rng = max(max(h) - min(lo), 1e-9)
        momentum = (c[-1] - c[-min(6, len(c))]) / rng          # -1..1 ish
        ema9, ema21 = c[0], c[0]
        for p in c:
            ema9 = p * (2 / 10) + ema9 * (1 - 2 / 10)
            ema21 = p * (2 / 22) + ema21 * (1 - 2 / 22)
        cross = 1.0 if ema9 > ema21 else -1.0
        body = (c[-1] - o[-1]) / rng
        raw = 0.55 * momentum + 0.30 * cross + 0.15 * body
        score = max(-1.0, min(1.0, raw))

        pam = 55.0 * max(score, 0.0) + 8.0
        ppl = 55.0 * max(-score, 0.0) + 6.0
        kc = 120.0 * abs(score) + 15.0

        if score > 0.05:
            label = "like"
        elif score < -0.05:
            label = "dislike"
        else:
            label = "neutral"

        return {
            "pam11": round(pam, 2),
            "ppl101": round(ppl, 2),
            "kc": round(kc, 2),
            "score": round(score, 4),
            "label": label,
            "confidence": round(min(1.0, abs(score) * 1.4), 3),
            "spikes": int(kc * 3),
            "status": self.status,
        }
