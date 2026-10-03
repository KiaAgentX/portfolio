/**
 * ============================================================
 *  UI.JS - رندر گریدهای آموزشی، حسابرسی و کسب‌وکار
 * ============================================================
 */

import { completedSessions, SESSIONS, AUDIT_TOOLS, BUSINESS_SUITES } from './state.js';

export function renderGrids() {
    // رندر ۲۴ جلسه آموزشی
    const sContainer = document.getElementById('sessionsGrid');
    if (sContainer) {
        sContainer.innerHTML = SESSIONS.map(item => {
            const isDone = completedSessions.includes(item.id);
            return `
                <a href="${item.path}" class="card3d ${isDone ? 'completed' : ''}" data-id="${item.id}">
                    <div class="icon">${item.icon}</div>
                    <h3>روز ${item.id}</h3>
                    <p>${item.title}</p>
                    <span class="badge">${isDone ? '✅ تکمیل' : '📖 شروع'}</span>
                    <div class="session-toggle">✓</div>
                </a>
            `;
        }).join('');
    }

    // رندر ۱۰ ابزار حسابرسی
    const aContainer = document.getElementById('auditGrid');
    if (aContainer) {
        aContainer.innerHTML = AUDIT_TOOLS.map(item => `
            <a href="${item.path}" class="card3d">
                <div class="icon">${item.icon}</div>
                <h3>${item.title}</h3>
            </a>
        `).join('');
    }

    // رندر سوئیت کسب‌وکار
    const bContainer = document.getElementById('businessGrid');
    if (bContainer) {
        bContainer.innerHTML = BUSINESS_SUITES.map(item => `
            <a href="${item.path}" class="card3d">
                <div class="icon">${item.icon}</div>
                <h3>${item.title}</h3>
            </a>
        `).join('');
    }
}
