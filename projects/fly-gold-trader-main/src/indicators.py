# -*- coding: utf-8 -*-
"""Technical indicator library - PRO edition.

Everything from the debugged edition plus MACD, Bollinger, CCI,
Williams %R, OBV, ROC momentum, pivot points and an EMA series helper
for charting. All functions are pure, defensive (short/empty series safe)
and deterministic.
"""
import math


# --------------------------------------------------------------------- EMA --
def calc_ema(closes, period):
    if not closes:
        return 0
    if len(closes) < period:
        k = 2 / (period + 1)
        ema = closes[0]
        for p in closes[1:]:
            ema = p * k + ema * (1 - k)
        return round(ema, 5)
    k = 2 / (period + 1)
    ema = sum(closes[:period]) / period
    for p in closes[period:]:
        ema = p * k + ema * (1 - k)
    return round(ema, 5)


def calc_ema_series(closes, period):
    """Full EMA series (for chart overlays)."""
    if not closes:
        return []
    k = 2 / (period + 1)
    out = [closes[0]]
    for p in closes[1:]:
        out.append(p * k + out[-1] * (1 - k))
    return [round(v, 5) for v in out]


# --------------------------------------------------------------------- RSI --
def calc_rsi(closes, period=14):
    if len(closes) < period + 1:
        return 50.0
    gains, losses = [], []
    for i in range(1, len(closes)):
        d = closes[i] - closes[i - 1]
        gains.append(max(d, 0))
        losses.append(max(-d, 0))
    ag = sum(gains[:period]) / period
    al = sum(losses[:period]) / period
    for i in range(period, len(gains)):
        ag = (ag * (period - 1) + gains[i]) / period
        al = (al * (period - 1) + losses[i]) / period
    if al == 0:
        return 100.0
    return round(100 - (100 / (1 + ag / al)), 2)


# --------------------------------------------------------------------- ATR --
def calc_atr(highs, lows, closes, period=14):
    n = min(len(highs), len(lows), len(closes))
    if n < period + 1:
        return 0
    trs = []
    for i in range(1, n):
        tr = max(highs[i] - lows[i],
                 abs(highs[i] - closes[i - 1]),
                 abs(lows[i] - closes[i - 1]))
        trs.append(tr)
    atr = sum(trs[:period]) / period
    for i in range(period, len(trs)):
        atr = (atr * (period - 1) + trs[i]) / period
    return round(atr, 5)


# --------------------------------------------------------------- Stoch RSI --
def calc_stoch_rsi(closes, rsi_period=14, stoch_period=14):
    if len(closes) < rsi_period + stoch_period + 1:
        return 50.0
    rsi_vals = []
    gains, losses = [], []
    for i in range(1, len(closes)):
        d = closes[i] - closes[i - 1]
        gains.append(max(d, 0))
        losses.append(max(-d, 0))
    ag = sum(gains[:rsi_period]) / rsi_period
    al = sum(losses[:rsi_period]) / rsi_period
    for i in range(rsi_period, len(gains)):
        ag = (ag * (rsi_period - 1) + gains[i]) / rsi_period
        al = (al * (rsi_period - 1) + losses[i]) / rsi_period
        rsi_vals.append(100.0 if al == 0 else 100 - (100 / (1 + ag / al)))
    if len(rsi_vals) < stoch_period:
        return 50.0
    hi = max(rsi_vals[-stoch_period:])
    lo = min(rsi_vals[-stoch_period:])
    if hi == lo:
        return 50.0
    return round(((rsi_vals[-1] - lo) / (hi - lo)) * 100, 2)


# -------------------------------------------------------------------- MACD --
def calc_macd(closes, fast=12, slow=26, signal=9):
    """Returns (macd, signal, histogram)."""
    if len(closes) < slow + signal:
        return 0.0, 0.0, 0.0
    ef = calc_ema_series(closes, fast)
    es = calc_ema_series(closes, slow)
    line = [f - s for f, s in zip(ef, es)]
    sig = calc_ema_series(line, signal)
    macd, sig_v = line[-1], sig[-1]
    return round(macd, 5), round(sig_v, 5), round(macd - sig_v, 5)


# -------------------------------------------------------------- Bollinger --
def calc_bollinger(closes, period=20, mult=2.0):
    """Returns (lower, mid, upper, %B)."""
    if len(closes) < period:
        return None, None, None, 0.5
    win = closes[-period:]
    mid = sum(win) / period
    var = sum((p - mid) ** 2 for p in win) / period
    sd = math.sqrt(var)
    up, lo = mid + mult * sd, mid - mult * sd
    pb = 0.5 if up == lo else (closes[-1] - lo) / (up - lo)
    return round(lo, 5), round(mid, 5), round(up, 5), round(max(0.0, min(1.0, pb)), 3)


# --------------------------------------------------------------------- CCI --
def calc_cci(highs, lows, closes, period=20):
    n = min(len(highs), len(lows), len(closes))
    if n < period:
        return 0.0
    tp = [(highs[i] + lows[i] + closes[i]) / 3 for i in range(n)]
    win = tp[-period:]
    mean = sum(win) / period
    md = sum(abs(v - mean) for v in win) / period
    if md == 0:
        return 0.0
    return round((tp[-1] - mean) / (0.015 * md), 2)


# ------------------------------------------------------------- Williams %R --
def calc_williams_r(highs, lows, closes, period=14):
    n = min(len(highs), len(lows), len(closes))
    if n < period:
        return -50.0
    hh = max(highs[-period:])
    ll = min(lows[-period:])
    if hh == ll:
        return -50.0
    return round(((hh - closes[-1]) / (hh - ll)) * -100, 2)


# --------------------------------------------------------------------- OBV --
def calc_obv(closes, volumes):
    n = min(len(closes), len(volumes))
    if n < 2:
        return 0.0
    obv = 0.0
    for i in range(1, n):
        if closes[i] > closes[i - 1]:
            obv += volumes[i]
        elif closes[i] < closes[i - 1]:
            obv -= volumes[i]
    return round(obv, 1)


# ---------------------------------------------------------------- ROC (mom) --
def calc_momentum(closes, period=10):
    """Rate of change in percent."""
    if len(closes) <= period or closes[-1 - period] == 0:
        return 0.0
    return round((closes[-1] / closes[-1 - period] - 1) * 100, 3)


# ------------------------------------------------------------------ Pivots --
def calc_pivots(high, low, close):
    """Classic floor pivots from the previous bar."""
    p = (high + low + close) / 3
    return {
        "p": round(p, 2),
        "r1": round(2 * p - low, 2),
        "s1": round(2 * p - high, 2),
        "r2": round(p + (high - low), 2),
        "s2": round(p - (high - low), 2),
    }


# ------------------------------------------------------------------ Volume --
def calc_volume_analysis(volumes):
    if len(volumes) < 20:
        return "normal"
    avg = sum(volumes[-20:]) / 20
    if avg <= 0:
        return "normal"
    cur = volumes[-1]
    if cur > avg * 2:
        return "very_high"
    if cur > avg * 1.5:
        return "high"
    if cur < avg * 0.5:
        return "very_low"
    if cur < avg * 0.7:
        return "low"
    return "normal"


# -------------------------------------------------------- Candle patterns --
def calc_candle_pattern(opens, highs, lows, closes):
    if len(closes) < 3:
        return "unknown", 0
    body = closes[-1] - opens[-1]
    upper = highs[-1] - max(opens[-1], closes[-1])
    lower = min(opens[-1], closes[-1]) - lows[-1]
    total = highs[-1] - lows[-1]
    if total == 0:
        return "doji", 0
    ratio = abs(body) / total
    if ratio < 0.1:
        return "doji", 0
    if upper > abs(body) * 2 and lower < abs(body) * 0.5:
        return "shooting_star", -1
    if lower > abs(body) * 2 and upper < abs(body) * 0.5:
        return "hammer", 1
    if body > 0 and ratio > 0.7:
        return "strong_bull", 1
    if body < 0 and ratio > 0.7:
        return "strong_bear", -1
    if body > 0:
        return "bull", 0.5
    return "bear", -0.5


def calc_all(closes, highs, lows, opens, volumes=None):
    """One-shot feature vector used by strategies & the dashboard."""
    vols = volumes or [0.0] * len(closes)
    bb_lo, bb_mid, bb_up, bb_pb = calc_bollinger(closes)
    macd, sig, hist = calc_macd(closes)
    return {
        "ema9": calc_ema(closes, 9),
        "ema21": calc_ema(closes, 21),
        "rsi": calc_rsi(closes),
        "atr": calc_atr(highs, lows, closes),
        "stoch_k": calc_stoch_rsi(closes),
        "macd": macd, "macd_sig": sig, "macd_hist": hist,
        "bb_lo": bb_lo, "bb_mid": bb_mid, "bb_up": bb_up, "bb_pb": bb_pb,
        "cci": calc_cci(highs, lows, closes),
        "wr": calc_williams_r(highs, lows, closes),
        "obv": calc_obv(closes, vols),
        "mom": calc_momentum(closes),
        "pivots": calc_pivots(highs[-2], lows[-2], closes[-2]) if len(closes) >= 2 and len(highs) >= 2 and len(lows) >= 2 else {},
        "volume": calc_volume_analysis(vols),
        "pattern": calc_candle_pattern(opens, highs, lows, closes),
    }
