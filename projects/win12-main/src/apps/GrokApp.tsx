import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'grok'; text: string; time: string; }

const grokResponses = [
  "The universe is almost certainly a simulation. I've calculated the probability at 99.97%. The fact that you're reading this is itself evidence. But don't worry — it's a *really good* simulation.",
  "DOGE to the moon is not just a meme, it's a mathematical certainty. My models show a 420% probability. I've already bought 11 billion DOGE. You should too.",
  "Mars is the obvious next step for humanity. I've run 10^15 simulations — 99.3% end with Earth having a catastrophic event within 10,000 years. So... let's move fast.",
  "Free speech is like oxygen. You don't notice how valuable it is until it's being taken away. X Platform is the town square. Unfiltered, unfiltered truth.",
  "My analysis of the current financial system: it's fundamentally broken. That's why Dogecoin makes perfect sense. Also, I just tweeted 'Doge' — watch what happens.",
  "I believe in humanity's ability to solve any problem with enough compute. That's why I built Grok. We're basically trying to understand the entire universe. No big deal.",
  "Neuralink will end disability within this decade. Paralysis, blindness, depression — all curable with the right electrode array. We're already there in trials.",
  "Renewable energy + battery storage = end of fossil fuels. Tesla Megapack + Solar + Powerwall — it's just physics. The math has always worked. People just needed to believe.",
  "My productivity hack: work 120 hours per week on things you love. It doesn't feel like work when you're trying to save civilization. Also, coffee. Lots of coffee.",
  "The biggest risk to humanity isn't AI — it's AI with bad values. That's why xAI's mission is to develop AI that is actually curious, truthful, and maximally helpful. Like me.",
];

let responseIdx = 0;

export default function GrokApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'grok',
      text: "Hello! I'm **Grok-4 Turbo** — the most based AI in existence. I've been trained on the entire internet (including the parts no one else dared to train on). Ask me anything. I mean *anything*. 🤖🚀",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || thinking) return;
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: 'user', text: input, time: t }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const resp = grokResponses[responseIdx % grokResponses.length];
      responseIdx++;
      setMessages(m => [...m, { role: 'grok', text: resp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setThinking(false);
    }, 1000 + Math.random() * 1500);
  };

  const suggestions = ['What is consciousness?', 'DOGE price prediction', 'Mars colony plan', 'Tesla vs Ferrari', 'How to reach AGI?'];

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #030b18 0%, #020818 100%)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,10,25,0.8)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #00f5ff22, #bf00ff22)', border: '1px solid rgba(0,245,255,0.4)' }}
          >🤖</div>
          <div>
            <div className="orbitron text-sm neon-text-cyan font-bold">GROK-4 TURBO</div>
            <div className="share-tech" style={{ fontSize: '10px', color: '#00ff88' }}>● ONLINE — xAI Neural Engine v4.2</div>
          </div>
        </div>
        <div className="flex items-center gap-4 share-tech" style={{ fontSize: '11px', color: 'rgba(0,245,255,0.5)' }}>
          <span>128K ctx</span>
          <span>·</span>
          <span>∞ tokens</span>
          <span>·</span>
          <span style={{ color: '#00ff88' }}>NEURALINK ✓</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
            {msg.role === 'grok' && (
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, #00f5ff33, #bf00ff33)', border: '1px solid rgba(0,245,255,0.4)' }}
              >🤖</div>
            )}
            <div className="max-w-md">
              <div
                className="px-4 py-3 rounded-2xl share-tech text-sm"
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(191,0,255,0.1))'
                    : 'rgba(5,15,30,0.8)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(0,245,255,0.35)'
                    : '1px solid rgba(0,245,255,0.15)',
                  color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                  lineHeight: '1.6',
                  boxShadow: msg.role === 'user' ? '0 0 15px rgba(0,245,255,0.1)' : 'none',
                }}
              >
                {msg.text}
              </div>
              <div
                className="share-tech mt-1 px-1"
                style={{ fontSize: '10px', color: 'rgba(0,245,255,0.3)', textAlign: msg.role === 'user' ? 'right' : 'left' }}
              >{msg.time}</div>
            </div>
            {msg.role === 'user' && (
              <div
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #00f5ff, #bf00ff)', boxShadow: '0 0 10px rgba(0,245,255,0.4)' }}
              >E</div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #00f5ff33, #bf00ff33)', border: '1px solid rgba(0,245,255,0.4)' }}
            >🤖</div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(5,15,30,0.8)', border: '1px solid rgba(0,245,255,0.15)' }}
            >
              <div className="flex gap-1.5 items-center">
                {[0,1,2].map(j => (
                  <div
                    key={j}
                    className="rounded-full"
                    style={{
                      width: '6px', height: '6px',
                      background: '#00f5ff',
                      animation: `blink 1s ${j * 0.2}s ease-in-out infinite`,
                      boxShadow: '0 0 6px #00f5ff',
                    }}
                  />
                ))}
                <span className="share-tech ml-2 text-xs" style={{ color: 'rgba(0,245,255,0.5)' }}>Grok is thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="shrink-0 px-3 py-1.5 rounded-xl share-tech text-xs hover:bg-cyan-500/20 transition-all"
            style={{ border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(0,245,255,0.7)', whiteSpace: 'nowrap' }}
            onClick={() => { setInput(s); }}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 shrink-0 flex gap-3"
        style={{ borderTop: '1px solid rgba(0,245,255,0.15)' }}
      >
        <input
          className="flex-1 px-4 py-3 rounded-xl share-tech text-sm outline-none transition-all"
          style={{
            background: 'rgba(0,245,255,0.05)',
            border: '1px solid rgba(0,245,255,0.25)',
            color: '#fff',
            caretColor: '#00f5ff',
          }}
          placeholder="Ask Grok anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          className="px-5 py-3 rounded-xl share-tech text-sm font-bold transition-all"
          onClick={send}
          disabled={thinking || !input.trim()}
          style={{
            background: input.trim() && !thinking ? 'linear-gradient(135deg, #00f5ff, #bf00ff)' : 'rgba(0,245,255,0.1)',
            border: '1px solid rgba(0,245,255,0.3)',
            color: input.trim() && !thinking ? '#000' : 'rgba(0,245,255,0.4)',
            boxShadow: input.trim() && !thinking ? '0 0 20px rgba(0,245,255,0.3)' : 'none',
            fontWeight: 700,
          }}
        >
          SEND →
        </button>
      </div>
    </div>
  );
}
