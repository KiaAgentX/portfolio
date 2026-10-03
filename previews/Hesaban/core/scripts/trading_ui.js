/**
 * ============================================================
 *  TRADING_UI.JS — رندر داشبورد ترید، موقعیت‌ها، جدول رهبری و …
 * ============================================================
 */

import { TRADING_STATE, fmt, currency } from './trading_state.js';

export function updateUI() {
    const price = TRADING_STATE.ticks.length > 0 ? TRADING_STATE.ticks[TRADING_STATE.ticks.length - 1].price : TRADING_STATE.price;
    TRADING_STATE.price = price;
    TRADING_STATE.bid = price - 0.1;
    TRADING_STATE.ask = price + 0.1;

    document.getElementById('headerBalance').textContent = TRADING_STATE.balance.toFixed(0);
    document.getElementById('headerLevel').textContent = TRADING_STATE.level;
    document.getElementById('headerStreak').textContent = TRADING_STATE.winStreak;

    document.getElementById('arenaBalance').textContent = TRADING_STATE.balance.toFixed(2);
    document.getElementById('arenaEquity').textContent = TRADING_STATE.equity.toFixed(2);
    document.getElementById('arenaFreeMargin').textContent = (TRADING_STATE.equity - (TRADING_STATE.position ? 500 : 0)).toFixed(2);
    document.getElementById('arenaLevel').textContent = TRADING_STATE.level;
    document.getElementById('arenaXP').textContent = TRADING_STATE.xp + ' XP';
    document.getElementById('arenaRank').textContent = TRADING_STATE.arenaRank;
    document.getElementById('arenaTrades').textContent = TRADING_STATE.trades.length;
    const wins = TRADING_STATE.trades.filter(t => t.pnl > 0).length;
    const winRate = TRADING_STATE.trades.length > 0 ? (wins / TRADING_STATE.trades.length) * 100 : 0;
    document.getElementById('arenaWinRate').textContent = winRate.toFixed(1) + '%';
    document.getElementById('arenaPnl').textContent = TRADING_STATE.arenaPnl.toFixed(2);
    document.getElementById('arenaStreak').textContent = TRADING_STATE.winStreak;
    document.getElementById('arenaGodKills').textContent = TRADING_STATE.godKills;
    document.getElementById('mt5SellPrice').textContent = TRADING_STATE.bid.toFixed(2);
    document.getElementById('mt5BuyPrice').textContent = TRADING_STATE.ask.toFixed(2);
    updatePositionUI();
    updateGodsPanel();
    updateLeaderboard();
}

export function updatePositionUI() {
    const pos = TRADING_STATE.position;
    if (pos) {
        const current = pos.direction === 'buy' ? TRADING_STATE.bid : TRADING_STATE.ask;
        const diff = (current - pos.entry) * (pos.direction === 'buy' ? 1 : -1) * 100 * pos.volume * pos.leverage;
        const netPnl = diff - (pos.entry * pos.volume * 100 * 0.0005) - (current * pos.volume * 100 * 0.0005);
        document.getElementById('posDir').textContent = pos.direction === 'buy' ? '📈 خرید' : '📉 فروش';
        document.getElementById('posDir').className = 'pos-value ' + (pos.direction === 'buy' ? 'green' : 'red');
        document.getElementById('posEntry').textContent = pos.entry.toFixed(2);
        document.getElementById('posVol').textContent = pos.volume.toFixed(2);
        document.getElementById('posSLTP').textContent = (pos.sl ? 'SL:' + pos.sl.toFixed(2) : '—') + ' / ' + (pos.tp ? 'TP:' + pos.tp.toFixed(2) : '—');
        document.getElementById('posPL').textContent = (netPnl >= 0 ? '+' : '') + netPnl.toFixed(2);
        document.getElementById('posPL').className = 'pos-value ' + (netPnl >= 0 ? 'green' : 'red');
        document.getElementById('posLev').textContent = pos.leverage + 'x';
        document.getElementById('posDuration').textContent = Math.floor((Date.now() - TRADING_STATE.positionStartTime) / 1000) + 's';
    } else {
        document.getElementById('posDir').textContent = '—';
        document.getElementById('posEntry').textContent = '—';
        document.getElementById('posVol').textContent = '—';
        document.getElementById('posSLTP').textContent = '— / —';
        document.getElementById('posPL').textContent = '0.00';
        document.getElementById('posPL').className = 'pos-value';
        document.getElementById('posLev').textContent = '—';
        document.getElementById('posDuration').textContent = '—';
    }
}

export function updateGodsPanel() {
    const container = document.getElementById('godsGrid');
    if (!container) return;
    container.innerHTML = TRADING_STATE.gods.map((g, idx) => {
        const pnl = g.pnl || 0;
        const statusClass = pnl > 0 ? 'green' : (pnl < 0 ? 'red' : 'gold');
        const statusText = pnl > 0 ? 'سود' : (pnl < 0 ? 'ضرر' : 'ثابت');
        return `
            <div class="god-card" onclick="showGodInfo(${idx})">
                <div class="god-icon">${g.icon}</div>
                <div class="god-name">${g.name}</div>
                <div class="god-status"><span class="dot ${statusClass}"></span>${statusText}</div>
                <div class="god-pnl ${statusClass}">${pnl>=0?'+':''}${pnl.toFixed(0)}</div>
            </div>
        `;
    }).join('');
}

export function updateBattleField() {
    const container = document.getElementById('battleField');
    if (!container) return;
    const playerPnl = TRADING_STATE.arenaPnl;
    container.innerHTML = `
        <div class="fighter ${playerPnl > 0 ? 'active' : ''}">
            <div class="f-icon">👑</div>
            <div class="f-name">شما</div>
            <div class="f-pnl ${playerPnl>=0?'green':'red'}">${playerPnl>=0?'+':''}${playerPnl.toFixed(0)}</div>
        </div>
    ` + TRADING_STATE.gods.map(g => `
        <div class="fighter ${g.pnl > 0 ? 'active' : ''}">
            <div class="f-icon">${g.icon}</div>
            <div class="f-name">${g.name}</div>
            <div class="f-pnl ${g.pnl>=0?'green':'red'}">${g.pnl>=0?'+':''}${g.pnl.toFixed(0)}</div>
        </div>
    `).join('');
}

export function updateLeaderboard() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    const entries = [
        { name: 'شما', pnl: TRADING_STATE.arenaPnl },
        ...TRADING_STATE.gods.map(g => ({ name: g.name, pnl: g.pnl || 0 }))
    ];
    entries.sort((a, b) => b.pnl - a.pnl);
    container.innerHTML = entries.map((e, idx) => `
        <div class="lb-item ${idx===0?'lb-top1':idx===1?'lb-top2':idx===2?'lb-top3':''}">
            <span class="lb-rank">${idx+1}</span>
            <span class="lb-name">${e.name}</span>
            <span class="lb-pnl ${e.pnl>=0?'green':'red'}">${e.pnl>=0?'+':''}${e.pnl.toFixed(0)}</span>
        </div>
    `).join('');
}

export function addBattleLogUI(text) {
    TRADING_STATE.battleLog.push(text);
    const logEl = document.getElementById('battleLog');
    if (logEl) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = text;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
    }
}
