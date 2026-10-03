# Skill: Browser Extension Development

**Source:** dollar-toman-extension.zip (Currency Conversion Extension)

## Core Techniques

### 1. Manifest V3 Structure
```json
{
    "manifest_version": 3,
    "name": "Dollar Toman",
    "version": "1.0",
    "permissions": ["storage", "alarms"],
    "background": {
        "service_worker": "background.js"
    },
    "content_scripts": [{
        "matches": ["<all_urls>"],
        "js": ["content.js"]
    }]
}
```

### 2. Content Script Injection
```javascript
// content.js - Injected into web pages
function findAndReplacePrices() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.textContent.match(/\$[\d,]+/)) {
            const price = parseFloat(node.textContent.replace(/[$,]/g, ''));
            const toman = price * exchangeRate;
            node.textContent = node.textContent.replace(
                /\$[\d,]+/,
                `${toman.toLocaleString('fa-IR')} تومان`
            );
        }
    }
}
```

### 3. Background Service Worker
```javascript
// background.js - Fetch exchange rate periodically
chrome.alarms.create('fetchRate', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'fetchRate') {
        const response = await fetch('https://api.example.com/rate');
        const data = await response.json();
        chrome.storage.local.set({ exchangeRate: data.rate });
    }
});
```

### 4. Popup UI
```html
<!-- popup.html -->
<div class="popup">
    <h1>نرخ ارز</h1>
    <div class="rate">۱ دلار = <span id="rate">...</span> تومان</div>
    <button id="refresh">بروزرسانی</button>
</div>
```

### 5. Storage API
```javascript
// Save
chrome.storage.local.set({ key: value });

// Read
chrome.storage.local.get(['key'], (result) => {
    console.log(result.key);
});
```

## Application to Our Game
- Build browser extension for game companion tools
- Create overlay UI for game statistics
- Implement background data fetching for live updates
- Use content scripts for in-page game integrations
