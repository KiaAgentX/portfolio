import { useState } from 'react';

const bookmarks = [
  { icon: '🚀', name: 'SpaceX', url: 'spacex.com' },
  { icon: '🚗', name: 'Tesla', url: 'tesla.com' },
  { icon: '✖️', name: 'X.com', url: 'x.com' },
  { icon: '🤖', name: 'xAI', url: 'x.ai' },
  { icon: '🛰️', name: 'Starlink', url: 'starlink.com' },
  { icon: '🧠', name: 'Neuralink', url: 'neuralink.com' },
  { icon: '🐕', name: 'DOGE', url: 'dogecoin.com' },
];

const newsItems = [
  { icon: '🚀', title: 'Starship SX-42 Launch: Elon\'s "Biggest Yet" — Full Coverage', source: 'X.com', time: '2m ago', tag: 'BREAKING', tagColor: '#ff0090' },
  { icon: '🤖', title: 'Grok-4 Turbo Surpasses GPT-5 in All Benchmarks by 400%', source: 'xAI Blog', time: '15m ago', tag: 'AI', tagColor: '#00f5ff' },
  { icon: '🐕', title: 'Dogecoin Officially Adopted as US Treasury Reserve Currency', source: 'DogeNews', time: '1h ago', tag: 'CRYPTO', tagColor: '#ffd700' },
  { icon: '🧠', title: 'Neuralink Patient Types at 240 WPM Using Thoughts Alone', source: 'Neuralink', time: '3h ago', tag: 'NEURO', tagColor: '#bf00ff' },
  { icon: '🚗', title: 'Tesla FSD v14 Achieves Zero Accident Rate in 10B Miles', source: 'Tesla', time: '5h ago', tag: 'TESLA', tagColor: '#ff0090' },
  { icon: '🏠', title: 'The Boring Company Completes Mars Tunnel Network Phase 1', source: 'Boring Co', time: '8h ago', tag: 'MARS', tagColor: '#ff6600' },
];

export default function BrowserApp() {
  const [inputUrl, setInputUrl] = useState('neochrome://xai-home');
  const [tab, setTab] = useState(0);
  const [_url, setUrl] = useState('neochrome://xai-home');

  const tabs = [
    { title: 'xAI Home', url: 'neochrome://xai-home', icon: '🤖' },
    { title: 'X.com', url: 'x.com', icon: '✖️' },
    { title: 'Starlink Status', url: 'starlink.com/status', icon: '🛰️' },
  ];

  const navigate = () => { setUrl(inputUrl); };

  return (
    <div className="h-full flex flex-col" style={{ background: '#020a18' }}>
      {/* Browser chrome */}
      <div style={{ background: 'rgba(3,8,20,0.95)', borderBottom: '1px solid rgba(0,245,255,0.15)' }}>
        {/* Tabs */}
        <div className="flex items-end px-3 pt-2 gap-1">
          {tabs.map((t, i) => (
            <button
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-t-lg share-tech text-xs transition-all"
              style={{
                background: tab === i ? 'rgba(0,245,255,0.08)' : 'transparent',
                border: `1px solid ${tab === i ? 'rgba(0,245,255,0.3)' : 'rgba(0,245,255,0.1)'}`,
                borderBottom: tab === i ? '1px solid rgba(3,8,20,0.95)' : '1px solid rgba(0,245,255,0.1)',
                color: tab === i ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                maxWidth: '160px',
              }}
              onClick={() => { setTab(i); setUrl(t.url); setInputUrl(t.url); }}
            >
              <span>{t.icon}</span>
              <span className="truncate">{t.title}</span>
              <span className="ml-1 opacity-50 hover:opacity-100" style={{ fontSize: '10px' }}>✕</span>
            </button>
          ))}
          <button
            className="px-3 py-2 rounded-t-lg share-tech text-xs"
            style={{ border: '1px solid rgba(0,245,255,0.1)', color: 'rgba(0,245,255,0.4)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}
          >+</button>
        </div>

        {/* Address bar */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button className="share-tech text-xs px-2 py-1 rounded hover:bg-white/5" style={{ color: 'rgba(0,245,255,0.5)' }}>←</button>
          <button className="share-tech text-xs px-2 py-1 rounded hover:bg-white/5" style={{ color: 'rgba(0,245,255,0.5)' }}>→</button>
          <button className="share-tech text-xs px-2 py-1 rounded hover:bg-white/5" style={{ color: 'rgba(0,245,255,0.5)' }}>↻</button>
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}
          >
            <span style={{ fontSize: '12px' }}>🔒</span>
            <input
              className="flex-1 bg-transparent outline-none share-tech text-xs"
              style={{ color: '#00f5ff' }}
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate()}
            />
          </div>
          <div className="flex gap-1">
            {bookmarks.map((b, i) => (
              <button key={i} title={b.name} className="text-sm hover:scale-110 transition-transform" onClick={() => { setUrl(b.url); setInputUrl(b.url); }}>{b.icon}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto">
        {/* New Tab Page */}
        <div className="min-h-full p-6">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="orbitron text-3xl font-black neon-text-cyan mb-2">NeoChrome</div>
            <div className="share-tech text-sm" style={{ color: 'rgba(0,245,255,0.5)' }}>Powered by xAI Engine v4.2 · Quantum Encrypted · Starlink Connected</div>
          </div>

          {/* Quick search */}
          <div className="max-w-xl mx-auto mb-8">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 30px rgba(0,245,255,0.05)' }}
            >
              <span>🤖</span>
              <input
                className="flex-1 bg-transparent outline-none share-tech"
                style={{ fontSize: '14px', color: '#fff', caretColor: '#00f5ff' }}
                placeholder="Search with Grok AI or enter a URL…"
              />
              <span style={{ color: 'rgba(0,245,255,0.4)', fontSize: '12px' }}>↵</span>
            </div>
          </div>

          {/* Bookmarks */}
          <div className="flex justify-center gap-4 mb-8">
            {bookmarks.map((b, i) => (
              <button
                key={i}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-cyan-500/10 transition-all group"
                style={{ border: '1px solid rgba(0,245,255,0.1)', minWidth: '64px' }}
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">{b.icon}</div>
                <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{b.name}</div>
              </button>
            ))}
          </div>

          {/* News */}
          <div className="max-w-2xl mx-auto">
            <div className="orbitron text-xs neon-text-cyan mb-4" style={{ letterSpacing: '3px' }}>TRENDING ON X</div>
            <div className="space-y-3">
              {newsItems.map((n, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-2xl">{n.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="share-tech px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: `${n.tagColor}22`, color: n.tagColor, border: `1px solid ${n.tagColor}44` }}
                      >{n.tag}</span>
                      <span className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.source} · {n.time}</span>
                    </div>
                    <div className="share-tech text-sm group-hover:text-cyan-400 transition-colors" style={{ color: 'rgba(255,255,255,0.85)' }}>{n.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
