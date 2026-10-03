/**
 * ============================================================
 *  CHAT_NOVA.JS - موتور چت سبک برای ویجت
 * ============================================================
 */

let apiKeys = [];
let activeKeyIndex = 0;
let isProcessing = false;
let systemPrompt = 'You are a helpful AI assistant.';
let currentModel = 'llama-3.3-70b-versatile';
let chatHistory = [];

// بارگذاری کلید API از localStorage
function loadApiKey() {
    try {
        const key = localStorage.getItem('nova_api_key');
        if (key) apiKeys = [key];
        const idx = localStorage.getItem('nova_active_key_index');
        if (idx) activeKeyIndex = parseInt(idx) || 0;
    } catch (e) { /* ignore */ }
}

// ذخیره کلید API
export function saveApiKey(key) {
    try {
        localStorage.setItem('nova_api_key', key);
        apiKeys = [key];
        activeKeyIndex = 0;
    } catch (e) { /* ignore */ }
}

export function initChatNova() {
    loadApiKey();
    console.log('✅ Chat Nova Widget Ready');
}

export function sendMessage(text, messagesContainer, model = currentModel) {
    if (isProcessing) return;
    if (!apiKeys.length) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg bot';
        msgDiv.textContent = '❌ لطفاً کلید API را در تنظیمات وارد کنید.';
        messagesContainer.appendChild(msgDiv);
        return;
    }

    const key = apiKeys[activeKeyIndex];
    if (!key) return;

    // افزودن پیام کاربر
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user';
    userDiv.textContent = text;
    messagesContainer.appendChild(userDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    chatHistory.push({ role: 'user', content: text });

    // نمایش نشانگر تایپ
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    isProcessing = true;
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-20).map(m => ({ role: m.role, content: m.content }))
    ];

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
            stream: true
        })
    })
    .then(async response => {
        if (!response.ok) {
            let msg = `خطای API: ${response.status}`;
            try { const err = await response.json(); if (err.error?.message) msg += `: ${err.error.message}`; } catch(e){}
            throw new Error(msg);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', full = '';
        const assistantDiv = document.createElement('div');
        assistantDiv.className = 'chat-msg bot';
        messagesContainer.appendChild(assistantDiv);
        if (typingEl.parentNode) typingEl.remove();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) {
                        full += content;
                        assistantDiv.innerHTML = marked.parse(full);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                } catch(e) { /* ignore */ }
            }
        }
        chatHistory.push({ role: 'assistant', content: full });
        isProcessing = false;
    })
    .catch(error => {
        if (typingEl.parentNode) typingEl.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'chat-msg bot';
        errDiv.style.color = 'var(--neon-red)';
        errDiv.textContent = `❌ ${error.message}`;
        messagesContainer.appendChild(errDiv);
        isProcessing = false;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

export function clearChat(container) {
    chatHistory = [];
    container.innerHTML = '';
    const initMsg = document.createElement('div');
    initMsg.className = 'chat-msg bot';
    initMsg.textContent = 'سلام! دستیار شناور شما.';
    container.appendChild(initMsg);
}
