/**
 * ============================================================
 *  TRADING_GODS.JS — خدایان هوش مصنوعی و سیستم نبرد (Battle Arena)
 * ============================================================
 */

import { TRADING_STATE, randomRange, randomInt, saveTradingState } from './trading_state.js';
import { generateTick } from './trading_market.js';
import { updateGodsPanel, updateBattleField, addBattleLogUI } from './trading_ui.js';

const GODS_CONFIG = [
    { id: 'elon', name: 'خدای ایلان', icon: '🚀', color: '#ffd700', strategy: 'momentum', desc: 'توییت به ماه!' },
    { id: 'vitalik', name: 'خدای ویتالیک', icon: '🦄', color: '#ff6bff', strategy: 'mean_reversion', desc: 'اتریوم ماکسی' },
    { id: 'whale', name: 'خدای نهنگ', icon: '🐋', color: '#00d4ff', strategy: 'volume', desc: 'دستکاری بازار' },
    { id: 'chaos', name: 'خدای هرج‌ومرج', icon: '💥', color: '#ff1744', strategy: 'random', desc: 'وحشی و غیرقابل پیش‌بینی' },
    { id: 'cyber', name: 'خدای سایبر', icon: '🤖', color: '#7c3aed', strategy: 'trend', desc: 'دقت مبتنی بر AI' },
    { id: 'moon', name: 'خدای ماه', icon: '🌙', color: '#ff8a4a', strategy: 'breakout', desc: 'چرخه‌های قمری' },
    { id: 'doge', name: 'خدای داوج', icon: '🐕', color: '#ffd700', strategy: 'meme', desc: 'به ماه! 🚀' },
    { id: 'satosh', name: 'خدای ساتوشی', icon: '₿', color: '#00ff88', strategy: 'hodl', desc: 'بیت‌کوین ماکسی' },
];

let battleInterval = null;

export function initGods() {
    if (TRADING_STATE.gods.length === 0) {
        TRADING_STATE.gods = GODS_CONFIG.map(g => ({
            ...g,
            balance: 10000 + randomRange(0, 5000),
            position: null,
            trades: [],
            pnl: 0,
            wins: 0,
            losses: 0,
            active: true,
            skillLevel: randomInt(1, 3)
        }));
    }
}

export function godTrade(god, price) {
    const dir = Math.random() < 0.5 ? 'buy' : 'sell';
    const vol = 0.01 + Math.random() * 0.05;
    const entry = dir === 'buy' ? price + 0.05 : price - 0.05;
    const exit = dir === 'buy' ? price - 0.1 + Math.random() * 0.2 : price + 0.1 - Math.random() * 0.2;
    const diff = (exit - entry) * (dir === 'buy' ? 1 : -1) * 100 * vol * 10;
    const pnl = diff - (entry * vol * 100 * 0.0005) - (exit * vol * 100 * 0.0005);
    god.pnl += pnl;
    god.trades.push({ dir, entry, exit, pnl });
    if (pnl > 0) god.wins++;
    else god.losses++;
    return pnl;
}

export function startBattle() {
    if (TRADING_STATE.battleActive) {
        showToast('⚔️ نبرد در حال انجام است!', 'error');
        return;
    }
    const mode = document.getElementById('battleModeSelect')?.value || '1v1';
    TRADING_STATE.battleMode = mode;
    TRADING_STATE.battleActive = true;
    TRADING_STATE.battleLog = [];
    TRADING_STATE.battleReplay = [];
    addBattleLogUI('⚔️ نبرد آغاز شد! حالت: ' + mode.toUpperCase());
    initGods();
    TRADING_STATE.gods.forEach(g => { g.position = null; g.pnl = 0; g.trades = []; g.wins = 0; g.losses = 0; });
    battleLoop();
    updateBattleField();
    saveTradingState();
}

function battleLoop() {
    if (battleInterval) clearInterval(battleInterval);
    battleInterval = setInterval(() => {
        if (!TRADING_STATE.battleActive) {
            clearInterval(battleInterval);
            battleInterval = null;
            return;
        }
        const price = TRADING_STATE.price;
        TRADING_STATE.gods.forEach((g, idx) => {
            if (Math.random() < 0.15) {
                const pnl = godTrade(g, price);
                if (Math.abs(pnl) > 50) {
                    const action = pnl > 0 ? '📈' : '📉';
                    addBattleLogUI(action + ' ' + g.name + ' ' + (pnl > 0 ? 'سود' : 'ضرر') + ': ' + pnl.toFixed(0));
                }
            }
        });

        // بررسی پایان نبرد بر اساس حالت
        const playerPnl = TRADING_STATE.arenaPnl;
        const totalGodPnl = TRADING_STATE.gods.reduce((s, g) => s + g.pnl, 0);
        if (Math.abs(playerPnl - totalGodPnl) > 500) {
            endBattle(playerPnl > totalGodPnl ? 'player' : 'god');
        }
        updateBattleField();
        updateGodsPanel();
    }, 3000);
}

function endBattle(winner) {
    TRADING_STATE.battleActive = false;
    if (battleInterval) { clearInterval(battleInterval);
        battleInterval = null; }
    if (winner === 'player') {
        addBattleLogUI('🏆 شما پیروز شدید! +200 XP');
        // addXP(200);
        TRADING_STATE.arenaWins++;
    } else {
        addBattleLogUI('💀 شما شکست خوردید!');
        TRADING_STATE.arenaLosses++;
    }
    saveTradingState();
}

function showToast(msg, type) {
    // یک توست ساده
}
