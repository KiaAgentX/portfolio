/**
 * ============================================================
 *  INTERACTIONS.JS - افکت پارالاکس و کلیک روی دکمه‌های تکمیل
 * ============================================================
 */

import { toggleSession } from './state.js';
import { renderGrids } from './ui.js';

// پارالاکس کارت‌ها با حرکت موس
export function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        document.querySelectorAll('.card3d').forEach(el => {
            el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-10px) scale(1.02)`;
        });
    });
}

// مدیریت کلیک روی دکمه‌های تکمیل جلسات
export function initSessionEvents() {
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.session-toggle');
        if (toggle) {
            const parent = toggle.closest('.card3d');
            if (!parent) return;
            const id = parseInt(parent.dataset.id);
            toggleSession(id);
            renderGrids(); // به‌روزرسانی گریدها و وضعیت تکمیل
        }
    });
}
