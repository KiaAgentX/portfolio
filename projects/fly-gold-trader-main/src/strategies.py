# -*- coding: utf-8 -*-
"""Strategy engine - PRO edition.

Seven independent strategies vote with a strength in [0, 1] and a
direction in {-1, 0, +1}. The ensemble combines them with per-strategy
weights into a single score in [-1, 1] which the server maps onto the
legacy signal vocabulary (strong_buy/buy/hold/sell/strong_sell) so the
execution gates stay unchanged.

Context (`ctx`) layout produced by the server / backtester:
    ctx = {
      "m1": {"closes","highs","lows","opens","volumes", feats...},
      "tfs": {name: feats...},
      "fly": {"score","label","confidence",...},
    }
"""


class Strategy:
    name = "base"
    weight = 1.0

    def evaluate(self, ctx):
        """Return (vote in {-1,0,1}, strength in [0,1])."""
        raise NotImplementedError


def _clamp(v):
    return max(0.0, min(1.0, v))


class FlyMomentum(Strategy):
    """The original idea: dopaminergic fly-brain score."""
    name, weight = "fly_momentum", 1.4

    def evaluate(self, ctx):
        s = (ctx.get("fly") or {}).get("score", 0)
        if abs(s) < 0.05:
            return 0, 0.0
        return (1 if s > 0 else -1), _clamp(abs(s) * 1.6)


class EmaCross(Strategy):
    """EMA9 vs EMA21 trend with price confirmation."""
    name, weight = "ema_cross", 1.0

    def evaluate(self, ctx):
        f = ctx["m1"]
        if f["ema9"] > f["ema21"] and f["closes"][-1] > f["ema21"]:
            return 1, _clamp(abs(f["ema9"] - f["ema21"]) / max(f["atr"], 1e-9))
        if f["ema9"] < f["ema21"] and f["closes"][-1] < f["ema21"]:
            return -1, _clamp(abs(f["ema9"] - f["ema21"]) / max(f["atr"], 1e-9))
        return 0, 0.0


class RsiReversal(Strategy):
    """Fade the extremes."""
    name, weight = "rsi_reversal", 0.8

    def evaluate(self, ctx):
        r = ctx["m1"]["rsi"]
        if r < 28:
            return 1, _clamp((30 - r) / 25)
        if r > 72:
            return -1, _clamp((r - 70) / 25)
        return 0, 0.0


class BollingerFade(Strategy):
    """Mean reversion off the bands."""
    name, weight = "bollinger_fade", 0.8

    def evaluate(self, ctx):
        pb = ctx["m1"]["bb_pb"]
        if pb <= 0.05:
            return 1, _clamp(0.4 + (0.05 - pb) * 4)
        if pb >= 0.95:
            return -1, _clamp(0.4 + (pb - 0.95) * 4)
        return 0, 0.0


class MacdMomentum(Strategy):
    """Histogram direction + sign."""
    name, weight = "macd_momentum", 1.0

    def evaluate(self, ctx):
        f = ctx["m1"]
        h = f["macd_hist"]
        atr = max(f["atr"], 1e-9)
        if abs(h) < atr * 0.02:
            return 0, 0.0
        return (1 if h > 0 else -1), _clamp(abs(h) / (atr * 0.35))


class CandlePatternStrategy(Strategy):
    """Classic single-candle edges (hammer / shooting star / marubozu)."""
    name, weight = "candle_pattern", 0.9

    def evaluate(self, ctx):
        _, bias = ctx["m1"]["pattern"]
        if bias == 0:
            return 0, 0.0
        return (1 if bias > 0 else -1), _clamp(abs(bias))


class MultiTFTrend(Strategy):
    """Higher-timeframe trend alignment (M15/H1/H4 EMA21)."""
    name, weight = "multi_tf_trend", 1.2

    def evaluate(self, ctx):
        votes = []
        for tf in ("M15", "H1", "H4"):
            info = (ctx.get("tfs") or {}).get(tf)
            if not info:
                continue
            bull = info.get("close", 0) > info.get("ema21", 0)
            votes.append(1 if bull else -1)
        if not votes:
            return 0, 0.0
        avg = sum(votes) / len(votes)
        if abs(avg) < 0.34:
            return 0, 0.0
        return (1 if avg > 0 else -1), _clamp(abs(avg))


REGISTRY = {s.name: s for s in (
    FlyMomentum(), EmaCross(), RsiReversal(), BollingerFade(),
    MacdMomentum(), CandlePatternStrategy(), MultiTFTrend(),
)}


class StrategyEngine:
    """Runs one named strategy or the weighted ensemble."""

    def __init__(self, mode="ensemble"):
        self.mode = mode if mode in REGISTRY else "ensemble"

    def evaluate(self, ctx):
        """-> dict(signal, score, conf, votes)"""
        if self.mode != "ensemble":
            st = REGISTRY[self.mode]
            vote, strength = st.evaluate(ctx)
            score = vote * strength
            return self._shape(score, {st.name: (vote, strength)})

        num = 0.0
        den = 0.0
        votes = {}
        for st in REGISTRY.values():
            vote, strength = st.evaluate(ctx)
            votes[st.name] = (vote, round(strength, 2))
            num += st.weight * vote * strength
            den += st.weight
        score = num / den if den else 0.0
        return self._shape(score, votes)

    @staticmethod
    def _shape(score, votes):
        score = max(-1.0, min(1.0, score))
        if score >= 0.55:
            signal = "strong_buy"
        elif score >= 0.22:
            signal = "buy"
        elif score <= -0.55:
            signal = "strong_sell"
        elif score <= -0.22:
            signal = "sell"
        else:
            signal = "hold"
        conf = min(5, round(abs(score) * 6))
        return {"signal": signal, "score": round(score, 3),
                "conf": conf, "votes": votes}
