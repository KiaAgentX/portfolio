const messagesEl = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const modelEl = document.getElementById("model");
const jevModelEl = document.getElementById("jevModel");
const analyzeBtn = document.getElementById("analyze");
const resultEl = document.getElementById("result");
let history = [];
let lastUserMessage = "";

function add(text, who) {
  const d = document.createElement("div");
  d.className = "msg " + who;
  d.textContent = text;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return d;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  lastUserMessage = text;
  add(text, "user");
  const thinking = add("...", "bot");
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: text, history, model: modelEl.value.trim()})
    });
    const data = await r.json();
    thinking.remove();  // safe if already removed
    if (!r.ok) throw new Error(data.error?.message || JSON.stringify(data));
    const reply = data.choices[0].message.content;
    add(reply, "bot");
    history.push({role: "user", content: text}, {role: "assistant", content: reply});
  } catch (err) {
    thinking.remove();  // safe if already removed
    add("خطا: " + err.message, "bot");
  }
});

analyzeBtn.addEventListener("click", async () => {
  if (!lastUserMessage) { resultEl.textContent = "اول پیام بفرست"; return; }
  resultEl.textContent = "در حال تحلیل...";
  try {
    const r = await fetch("/api/decisions", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({state: lastUserMessage, model: jevModelEl.value.trim()})
    });
    const data = await r.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    resultEl.textContent = "خطا: " + err.message;
  }
});
