/**
 * ============================================================
 *  TRADING_STATE.JS — وضعیت جهانی موتور ترید
 * ============================================================
 */

export const TRADING_STATE = {
    balance: 10000.00,
    equity: 10000.00,
    freeMargin: 10000.00,
    position: null,
    trades: [],
    positionStartTime: null,
    leverage: 10,
    winStreak: 0,
    lossStreak: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    arenaWins: 0,
    arenaLosses: 0,
    arenaKills: 0,
    arenaTrades: 0,
    arenaPnl: 0,
    arenaRank: 'Bronze',
    rankPoints: 0,
    price: 4713.69,
    bid: 0,
    ask: 0,
    spread: 0.2,
    _basePrice: 4713.69,
    ticks: [],
    candles: {},
    tickCounter: 0,
    maxCandles: 150,
    timeframe: '15s',
    _currentCandle: null,
    _candleStartTime: 0,
    currentPair: 'XAUUSD',
    indicators: { MA: true, BB: true, RSI: true, MACD: true, ATR: false, Stoch: false },
    chartType: 'candle',
    theme: 'dark',
    colors: { up: '#00ff88', down: '#ff2255', bg: '#0a0015' },
    soundSettings: { trade: true, win: true, elon: true, battle: true },
    dailyLoss: 0,
    lastResetDay: new Date().toDateString(),
    maxDailyLoss: 500,
    gods: [],
    battleMode: '1v1',
    battleActive: false,
    battleLog: [],
    battleReplay: [],
    skillPoints: 0,
    skills: {},
    leaderboard: [],
    elonFeed: [],
    elonSignals: [],
    elonScore: 0,
    godKills: 0,
    maxPositionSize: 1.0,
    elonBias: 0,
    elonBiasTimer: 0
};

// توابع کمکی
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function randomRange(min, max) { return min + Math.random() * (max - min); }
export function randomInt(min, max) { return Math.floor(randomRange(min, max + 1)); }
export function fmt(n) { return Number(n).toLocaleString('fa-IR'); }
export function currency(n) { return fmt(n) + ' ریال'; }

// ذخیره و بازیابی وضعیت از LocalStorage
export function saveTradingState() {
    try {
        const data = {
            balance: TRADING_STATE.balance,
            equity: TRADING_STATE.equity,
            freeMargin: TRADING_STATE.freeMargin,
            position: TRADING_STATE.position,
            trades: TRADING_STATE.trades,
            leverage: TRADING_STATE.leverage,
            winStreak: TRADING_STATE.winStreak,
            lossStreak: TRADING_STATE.lossStreak,
            level: TRADING_STATE.level,
            xp: TRADING_STATE.xp,
            xpToNext: TRADING_STATE.xpToNext,
            arenaWins: TRADING_STATE.arenaWins,
            arenaLosses: TRADING_STATE.arenaLosses,
            arenaKills: TRADING_STATE.arenaKills,
            arenaTrades: TRADING_STATE.arenaTrades,
            arenaPnl: TRADING_STATE.arenaPnl,
            arenaRank: TRADING_STATE.arenaRank,
            rankPoints: TRADING_STATE.rankPoints,
            price: TRADING_STATE.price,
            _basePrice: TRADING_STATE._basePrice,
            ticks: TRADING_STATE.ticks,
            candles: TRADING_STATE.candles,
            timeframe: TRADING_STATE.timeframe,
            currentPair: TRADING_STATE.currentPair,
            indicators: TRADING_STATE.indicators,
            chartType: TRADING_STATE.chartType,
            theme: TRADING_STATE.theme,
            colors: TRADING_STATE.colors,
            soundSettings: TRADING_STATE.soundSettings,
            dailyLoss: TRADING_STATE.dailyLoss,
            maxDailyLoss: TRADING_STATE.maxDailyLoss,
            gods: TRADING_STATE.gods,
            battleMode: TRADING_STATE.battleMode,
            battleActive: TRADING_STATE.battleActive,
            battleLog: TRADING_STATE.battleLog,
            battleReplay: TRADING_STATE.battleReplay,
            skillPoints: TRADING_STATE.skillPoints,
            skills: TRADING_STATE.skills,
            leaderboard: TRADING_STATE.leaderboard,
            elonFeed: TRADING_STATE.elonFeed,
            elonSignals: TRADING_STATE.elonSignals,
            elonScore: TRADING_STATE.elonScore,
            godKills: TRADING_STATE.godKills,
            maxPositionSize: TRADING_STATE.maxPositionSize,
            elonBias: TRADING_STATE.elonBias,
            elonBiasTimer: TRADING_STATE.elonBiasTimer
        };
        localStorage.setItem('hesaban_trading_state', JSON.stringify(data));
    } catch (e) { console.warn('Save trading error:', e); }
}

export function loadTradingState() {
    try {
        const raw = localStorage.getItem('hesaban_trading_state');
        if (raw) {
            const data = JSON.parse(raw);
            Object.assign(TRADING_STATE, data);
            return true;
        }
    } catch (e) { console.warn('Load trading error:', e); }
    return false;
}
