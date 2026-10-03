/**
 * ============================================================
 *  STATE.JS - مدیریت داده‌های اصلی داشبورد و LocalStorage
 * ============================================================
 */

export const STORAGE_KEY = 'hesaban_completed_sessions';
export let completedSessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// آرایه‌ی ۲۴ جلسه آموزشی
export const SESSIONS = [
    { id: 1, title: 'مبانی حسابداری', icon: '📐', path: 'education/Session/Day1.html' },
    { id: 2, title: 'دفتر روزنامه', icon: '📓', path: 'education/Session/Day2.html' },
    { id: 3, title: 'دفتر کل', icon: '📔', path: 'education/Session/Day3.html' },
    { id: 4, title: 'تراز آزمایشی', icon: '⚖️', path: 'education/Session/Day4.html' },
    { id: 5, title: 'صورت سود و زیان', icon: '📈', path: 'education/Session/Day5.html' },
    { id: 6, title: 'ترازنامه', icon: '📋', path: 'education/Session/Day6.html' },
    { id: 7, title: 'جریان وجوه نقد', icon: '💧', path: 'education/Session/Day7.html' },
    { id: 8, title: 'ثبت‌های تعدیلی', icon: '🔧', path: 'education/Session/Day8.html' },
    { id: 9, title: 'موجودی کالا', icon: '📦', path: 'education/Session/Day9.html' },
    { id: 10, title: 'استهلاک دارایی', icon: '🏗️', path: 'education/Session/Day10.html' },
    { id: 11, title: 'بستن حساب‌ها', icon: '🏁', path: 'education/Session/Day11.html' },
    { id: 12, title: 'بودجه‌بندی', icon: '💰', path: 'education/Session/Day12.html' },
    { id: 13, title: 'حقوق و دستمزد', icon: '💼', path: 'education/Session/Day13.html' },
    { id: 14, title: 'حسابداری مالیاتی', icon: '🧾', path: 'education/Session/Day14.html' },
    { id: 15, title: 'حسابداری صنعتی', icon: '🏭', path: 'education/Session/Day15.html' },
    { id: 16, title: 'سفارش کار', icon: '📋', path: 'education/Session/Day16.html' },
    { id: 17, title: 'نقطه سربه‌سر', icon: '📍', path: 'education/Session/Day17.html' },
    { id: 18, title: 'کنترل داخلی', icon: '🛡️', path: 'education/Session/Day18.html' },
    { id: 19, title: 'صورت‌های مالی', icon: '📊', path: 'education/Session/Day19.html' },
    { id: 20, title: 'تحلیل مالی', icon: '📉', path: 'education/Session/Day20.html' },
    { id: 21, title: 'مبانی IFRS', icon: '🌍', path: 'education/Session/Day21.html' },
    { id: 22, title: 'حسابداری پیمانکاری', icon: '🏗️', path: 'education/Session/Day22.html' },
    { id: 23, title: 'حسابداری پیشرفته', icon: '🧠', path: 'education/Session/Day23.html' },
    { id: 24, title: 'پروژه نهایی', icon: '🏆', path: 'education/Session/Day24.html' }
];

// آرایه‌ی ۱۰ ابزار حسابرسی
export const AUDIT_TOOLS = [
    { title: 'تراز آزمایشی', icon: '📊', path: 'audit_tools/trial_balance.html' },
    { title: 'نسبت‌های مالی', icon: '📈', path: 'audit_tools/ratios.html' },
    { title: 'کنترل داخلی (ICQ)', icon: '🔍', path: 'audit_tools/icq.html' },
    { title: 'آزمون‌های محتوا', icon: '📋', path: 'audit_tools/substantive.html' },
    { title: 'تعدیلات حسابرسی', icon: '✏️', path: 'audit_tools/adjustments.html' },
    { title: 'نمونه‌گیری آماری', icon: '🎲', path: 'audit_tools/sampling.html' },
    { title: 'کشف تقلب', icon: '🕵️', path: 'audit_tools/fraud.html' },
    { title: 'تطبیق مالیات', icon: '💰', path: 'audit_tools/tax.html' },
    { title: 'گزارش حسابرسی', icon: '📝', path: 'audit_tools/report.html' },
    { title: 'حل‌کننده مسائل', icon: '📒', path: 'audit_tools/accounting_problem_solver.html' }
];

// آرایه‌ی سوئیت کسب‌وکار
export const BUSINESS_SUITES = [
    { title: 'حسابک', icon: '🧮', path: 'business_suites/Hesabak/index.html' },
    { title: 'دفتر', icon: '📒', path: 'business_suites/Daftar/index.html' },
    { title: 'انبارک', icon: '📦', path: 'business_suites/Anbarak/index.html' },
    { title: 'فاکتورساز', icon: '🧾', path: 'business_suites/Faktorsaz/index.html' },
    { title: 'حقوق‌ساز', icon: '💰', path: 'business_suites/Hoqouqsaz/index.html' },
    { title: 'بودجه‌بان', icon: '📊', path: 'business_suites/Budjeban/index.html' },
    { title: 'پروفایل مشتریان', icon: '👥', path: 'business_suites/Customer_Profiles/index.html' },
    { title: 'هدایا', icon: '🎁', path: 'business_suites/Gifts/index.html' }
];

// توابع مدیریت وضعیت
export function toggleSession(id) {
    if (completedSessions.includes(id)) {
        completedSessions = completedSessions.filter(s => s !== id);
    } else {
        completedSessions.push(id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSessions));
    return completedSessions;
}

export function getProgress() {
    return Math.floor((completedSessions.length / SESSIONS.length) * 100);
}
