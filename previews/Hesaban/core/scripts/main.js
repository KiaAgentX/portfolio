/**
 * ============================================================
 *  MAIN.JS - ENTRY POINT (نسخه ماژولار)
 *  مسئولیت: لود و راه‌اندازی ماژول‌های هسته و ویجت چت
 * ============================================================
 */

import { renderGrids } from './ui.js';
import { initScene } from './three_scene.js';
import { initParallax, initSessionEvents } from './interactions.js';
import { initChatWidget } from './chat_widget.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏛️ حسابان - هسته ماژولار شروع به کار کرد...');

    // رندر گریدهای اصلی (۲۴ جلسه، ۱۰ ابزار، سوئیت کسب‌وکار)
    renderGrids();

    // راه‌اندازی فضای سه‌بعدی پس‌زمینه
    initScene();

    // راه‌اندازی افکت‌های پارالاکس
    initParallax();

    // مدیریت کلیک‌های دکمه‌های تکمیل جلسات
    initSessionEvents();

    // راه‌اندازی ویجت چت شناور
    initChatWidget();

    console.log('✅ تمام ماژول‌های هسته با موفقیت راه‌اندازی شدند!');
});

// ثبت سرویس ورکر (آفلاین)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('✅ سرویس ورکر ثبت شد.'))
            .catch(err => console.error('❌ خطا در ثبت سرویس ورکر:', err));
    });
}
