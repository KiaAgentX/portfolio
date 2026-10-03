/**
 * ============================================================
 *  TRADING_ENGINE.JS — منطق خرید، فروش، SL/TP، اهرم و ریسک
 * ============================================================
 */

import { TRADING_STATE, clamp, saveTradingState } from './trading_state.js';
import { generateTick, processTick } from './trading_market.js';
import { updateUI, updatePositionUI } from './trading_ui.js';

export function openTrade(direction, volume, sl, tp) {
    if (TRADING_STATE.position) {
        showToast('⚠️ ابتدا پوزیشن فعلی را ببندید.', 'error');
        return false;
    }
    if (volume <= 0 || volume > TRADING_STATE.maxPositionSize) {
        showToast('حجم معامله نامعتبر است.', 'error');
        return false;
    }
    const lev = TRADING_STATE.leverage;
    const entry = direction === 'buy' ? TRADING_STATE.ask : TRADING_STATE.bid;

    // بررسی محدودیت ضرر روزانه
    const today = new Date().toDateString();
    if (TRADING_STATE.lastResetDay !== today) {
        TRADING_STATE.dailyLoss = 0;
        TRADING_STATE.lastResetDay = today;
    }
    const potentialLoss = (entry * volume * 100 * 0.0005) * 2;
    if (TRADING_STATE.dailyLoss + potentialLoss > TRADING_STATE.maxDailyLoss) {
        showToast('⚠️ محدودیت ضرر روزانه به پایان رسیده!', 'error');
        return false;
    }

    TRADING_STATE.position = {
        direction: direction,
        entry: entry,
        volume: volume,
        sl: sl || 0,
        tp: tp || 0,
        leverage: lev,
        timestamp: Date.now(),
        skillActive: null
    };
    TRADING_STATE.positionStartTime = Date.now();
    TRADING_STATE.arenaTrades++;
    updatePositionUI();
    saveTradingState();
    showToast(`✅ ${direction === 'buy' ? 'خرید' : 'فروش'} در ${entry.toFixed(2)} با اهرم ${lev}x`, 'success');
    return true;
}

export function closeTrade() {
    if (!TRADING_STATE.position) {
        showToast('⚠️ پوزیشن بازی وجود ندارد.', 'error');
        return;
    }
    const pos = TRADING_STATE.position;
    const exit = pos.direction === 'buy' ? TRADING_STATE.bid : TRADING_STATE.ask;
    const diff = (exit - pos.entry) * (pos.direction === 'buy' ? 1 : -1) * 100 * pos.volume * pos.leverage;
    const commission = (pos.entry * pos.volume * 100 * 0.0005) + (exit * pos.volume * 100 * 0.0005);
    let net = diff - commission;

    // اعمال مهارت‌ها (در صورت وجود)
    if (TRADING_STATE.skills.doge_boost && TRADING_STATE.skills.doge_boost > 0 && net > 0) {
        net *= 1.5;
        TRADING_STATE.skills.doge_boost--;
        showToast('🐕 Doge Boost فعال! +50% سود', 'gold');
    }

    TRADING_STATE.balance += net;
    TRADING_STATE.arenaPnl += net;
    addXP(Math.abs(net) / 10);
    addRankPoints(Math.abs(net) / 5);
    if (net < 0) TRADING_STATE.dailyLoss += Math.abs(net);

    const holdTime = (Date.now() - TRADING_STATE.positionStartTime) / 1000;
    TRADING_STATE.trades.push({
        pair: TRADING_STATE.currentPair,
        direction: pos.direction,
        entry: pos.entry,
        exit: exit,
        volume: pos.volume,
        leverage: pos.leverage,
        sl: pos.sl,
        tp: pos.tp,
        pnl: net,
        commission: commission,
        result: net > 0 ? 'profit' : (net < 0 ? 'loss' : 'breakeven'),
        holdTime: holdTime,
        timestamp: Date.now(),
    });
    TRADING_STATE.position = null;
    TRADING_STATE.positionStartTime = null;
    updatePositionUI();
    saveTradingState();

    if (net > 0) {
        TRADING_STATE.winStreak++;
        TRADING_STATE.lossStreak = 0;
        TRADING_STATE.arenaWins++;
        showDopamineFeedback(true, net);
        if (TRADING_STATE.battleActive) {
            TRADING_STATE.arenaKills++;
            TRADING_STATE.godKills++;
            addBattleLog('⚔️ شما یک خدا را حذف کردید! +1 کش');
        }
    } else if (net < 0) {
        TRADING_STATE.winStreak = 0;
        TRADING_STATE.lossStreak++;
        TRADING_STATE.arenaLosses++;
        showDopamineFeedback(false, net);
    }
    updateUI();
    return net;
}

// ===== توابع کمکی =====
function addXP(amount) {
    let bonus = 1;
    if (TRADING_STATE.skills.moon_shot && TRADING_STATE.skills.moon_shot > 0) bonus = 1.5;
    TRADING_STATE.xp += Math.floor(amount * bonus);
    while (TRADING_STATE.xp >= TRADING_STATE.xpToNext) {
        TRADING_STATE.xp -= TRADING_STATE.xpToNext;
        TRADING_STATE.level++;
        TRADING_STATE.xpToNext = Math.floor(TRADING_STATE.xpToNext * 1.5);
        TRADING_STATE.skillPoints++;
        showToast(`🎉 سطح افزایش یافت! سطح ${TRADING_STATE.level} +1 امتیاز مهارت`, 'gold');
        addBattleLog(`🎉 سطح افزایش یافت! سطح ${TRADING_STATE.level}`);
    }
}

function addRankPoints(amount) {
    TRADING_STATE.rankPoints += Math.floor(amount);
    const xpPerRank = 200;
    const currentRankIdx = Math.min(Math.floor(TRADING_STATE.rankPoints / xpPerRank), 8);
    const ranks = ['برنز', 'نقره', 'طلا', 'پلاتین', 'الماس', 'عالی', 'افسانه', 'الهی', 'خداگونه'];
    TRADING_STATE.arenaRank = ranks[currentRankIdx] || 'برنز';
}

// ===== توابع نمایش =====
function showToast(msg, type) {
    // یک توست ساده برای ترید
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: var(--card-bg); backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border); border-radius: 12px;
        padding: 8px 16px; color: var(--text-primary); font-size: 0.85rem;
        z-index: 9999; animation: fadeUp 0.3s ease-out;
        max-width: 90%;
    `;
    if (type === 'error') toast.style.borderColor = 'var(--neon-red)';
    if (type === 'gold') toast.style.borderColor = 'var(--gold)';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showDopamineFeedback(isWin, pnl) {
    // نمایش بنر دوپامین (اختیاری)
}

function addBattleLog(text) {
    TRADING_STATE.battleLog.push(text);
    if (TRADING_STATE.battleLog.length > 50) TRADING_STATE.battleLog.shift();
}
