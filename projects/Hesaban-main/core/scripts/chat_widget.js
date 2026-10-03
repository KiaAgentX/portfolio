/**
 * ============================================================
 *  CHAT_WIDGET.JS - ویجت چت شناور در صفحه اصلی
 * ============================================================
 */

import { initChatNova, sendMessage, clearChat } from './chat_nova.js';

export function initChatWidget() {
    const toggleBtn = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('chatClose');
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');
    const modelSelect = document.getElementById('chatModelSelect');
    const clearBtn = document.getElementById('clearChatBtn');
    const messagesContainer = document.getElementById('chatMessages');

    // باز و بسته کردن ویجت
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) input.focus();
    });
    closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

    // ارسال پیام
    const send = () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text, messagesContainer, modelSelect.value);
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    // پاک کردن چت
    clearBtn.addEventListener('click', () => {
        if (confirm('آیا از پاک کردن مکالمه اطمینان دارید؟')) {
            clearChat(messagesContainer);
        }
    });

    // پر کردن لیست مدل‌ها (نمونه اولیه)
    const models = ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma-2-9b-it'];
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
    });
    modelSelect.value = 'llama-3.3-70b-versatile';

    // راه‌اندازی موتور چت
    initChatNova();
}
