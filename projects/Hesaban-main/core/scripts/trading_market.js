/**
 * ============================================================
 *  TRADING_MARKET.JS — شبیه‌سازی بازار، کندل‌ها و نوسان
 * ============================================================
 */

import { TRADING_STATE, clamp, randomRange } from './trading_state.js';

export function getCandleSeconds() {
    const map = { '5s': 5, '15s': 15, '30s': 30, '1m': 60, '5m': 300, '15m': 900, '1h': 3600 };
    return map[TRADING_STATE.timeframe] || 15;
}

export function generateTick() {
    let move = (Math.random() - 0.5) * 0.8;
    if (TRADING_STATE.elonBiasTimer > 0) {
        move += TRADING_STATE.elonBias * 0.15;
        TRADING_STATE.elonBiasTimer--;
    }
    TRADING_STATE._basePrice += move;
    const pair = TRADING_STATE.currentPair;
    let minP = 4600, maxP = 4850;
    if (pair === 'EURUSD') { minP = 1.05; maxP = 1.15; }
    else if (pair === 'GBPUSD') { minP = 1.20; maxP = 1.35; }
    else if (pair === 'BTCUSD') { minP = 60000; maxP = 70000; }
    else if (pair === 'ETHUSD') { minP = 3000; maxP = 4000; }
    else if (pair === 'SOLUSD') { minP = 150; maxP = 200; }
    else if (pair === 'DOGEUSD') { minP = 0.15; maxP = 0.25; }
    else if (pair === 'AUDUSD') { minP = 0.63; maxP = 0.68; }
    else if (pair === 'NZDUSD') { minP = 0.58; maxP = 0.63; }
    else if (pair === 'USDCAD') { minP = 1.35; maxP = 1.40; }
    else if (pair === 'USDJPY') { minP = 148; maxP = 152; }
    TRADING_STATE._basePrice = clamp(TRADING_STATE._basePrice, minP, maxP);
    return TRADING_STATE._basePrice;
}

export function startNewCandle(openPrice) {
    const now = Date.now();
    TRADING_STATE._currentCandle = {
        open: openPrice,
        high: openPrice,
        low: openPrice,
        close: openPrice,
        volume: 0,
        timestamp: now,
        ticks: [openPrice]
    };
    TRADING_STATE._candleStartTime = now;
}

export function updateCurrentCandle(price, volume) {
    if (!TRADING_STATE._currentCandle) return;
    const c = TRADING_STATE._currentCandle;
    c.close = price;
    if (price > c.high) c.high = price;
    if (price < c.low) c.low = price;
    c.volume += volume || 1;
    c.ticks.push(price);
}

export function closeCurrentCandle() {
    if (!TRADING_STATE._currentCandle) return;
    const tf = TRADING_STATE.timeframe;
    const candles = TRADING_STATE.candles[tf] || [];
    const c = TRADING_STATE._currentCandle;
    candles.push({
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || Math.floor(Math.random() * 800) + 200,
        timestamp: c.timestamp,
    });
    if (candles.length > TRADING_STATE.maxCandles) candles.shift();
    TRADING_STATE.candles[tf] = candles;
    TRADING_STATE._currentCandle = null;
}

export function processTick(price) {
    TRADING_STATE.ticks.push({ price, time: Date.now() });
    if (TRADING_STATE.ticks.length > 10000) TRADING_STATE.ticks.shift();

    const candleSeconds = getCandleSeconds();
    if (!TRADING_STATE._currentCandle) {
        startNewCandle(price);
    } else {
        const now = Date.now();
        const elapsed = (now - TRADING_STATE._candleStartTime) / 1000;
        if (elapsed >= candleSeconds) {
            closeCurrentCandle();
            startNewCandle(price);
        } else {
            updateCurrentCandle(price, 1);
        }
    }
    TRADING_STATE.tickCounter++;
}
