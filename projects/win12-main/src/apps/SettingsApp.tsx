import { useState } from 'react';

const sections = ['System', 'Display', 'Network', 'Neuralink', 'AI Engine', 'Security', 'Tesla', 'About'];

export default function SettingsApp() {
  const [active, setActive] = useState('System');
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(75);
  const [neuralBW, setNeuralBW] = useState(99);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    neuralink: true, grokAssist: true, autopilot: true, quantumEnc: true,
    starlink: true, aiCamera: true, holoDis: false, neuralTyping: true,
    dogePay: true, xIntegration: true, marsSync: true, ftl: false,
  });

  const toggle = (k: string) => setToggles(t => ({ ...t, [k]: !t[k] }));

  const Toggle = ({ k, label, color = '#00f5ff', sub = '' }: { k: string; label: string; color?: string; sub?: string }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
      <div>
        <div className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</div>
        {sub && <div className="share-tech" style={{ fontSize: '11px', color: 'rgba(0,245,255,0.4)', marginTop: '2px' }}>{sub}</div>}
      </div>
      <button
        onClick={() => toggle(k)}
        className="relative rounded-full transition-all duration-300"
        style={{
          width: '48px', height: '26px',
          background: toggles[k] ? `linear-gradient(90deg, ${color}66, ${color})` : 'rgba(255,255,255,0.1)',
          border: `1px solid ${toggles[k] ? color : 'rgba(255,255,255,0.2)'}`,
          boxShadow: toggles[k] ? `0 0 10px ${color}44` : 'none',
        }}
      >
        <div
          className="absolute top-0.5 rounded-full transition-all duration-300"
          style={{
            width: '20px', height: '20px',
            background: toggles[k] ? '#fff' : 'rgba(255,255,255,0.4)',
            left: toggles[k] ? '24px' : '2px',
            boxShadow: toggles[k] ? `0 0 8px ${color}` : 'none',
          }}
        />
      </button>
    </div>
  );

  const Slider = ({ label, value, onChange, color = '#00f5ff', unit = '%' }: any) => (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
      <div className="flex justify-between mb-2">
        <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</span>
        <span className="share-tech text-sm" style={{ color }}>{value}{unit}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)} className="w-full" />
    </div>
  );

  const renderContent = () => {
    switch (active) {
      case 'System': return (
        <div className="space-y-1">
          <Slider label="Display Brightness" value={brightness} onChange={setBrightness} color="#ffd700" />
          <Slider label="System Volume" value={volume} onChange={setVolume} color="#00f5ff" />
          <Toggle k="neuralTyping" label="Neural Typing (Neuralink)" sub="Type with your thoughts @ 18Mbps" color="#bf00ff" />
          <Toggle k="grokAssist" label="Grok AI Suggestions" sub="Context-aware AI everywhere" />
          <Toggle k="aiCamera" label="AI Vision Mode" sub="Object recognition & AR overlay" color="#00ff88" />
          <Toggle k="holoDis" label="Holographic Display Mode" sub="Requires HoloLens X attachment" color="#ff0090" />
          <div className="py-3 flex items-center justify-between">
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Theme</span>
            <span className="share-tech text-sm neon-text-cyan">Dark Neon ✓</span>
          </div>
        </div>
      );
      case 'Display': return (
        <div className="space-y-1">
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Resolution</span>
            <span className="share-tech text-sm neon-text-cyan">8K @ 240Hz</span>
          </div>
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Color Mode</span>
            <span className="share-tech text-sm" style={{ color: '#bf00ff' }}>Neon Quantum HDR</span>
          </div>
          <Slider label="Neon Intensity" value={80} onChange={() => {}} color="#00f5ff" />
          <Slider label="Glow Strength" value={65} onChange={() => {}} color="#bf00ff" />
          <Toggle k="holoDis" label="Holographic Projection" sub="Requires HoloLens X Pro" color="#ff0090" />
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Accent Color</span>
            <div className="flex gap-2">
              {['#00f5ff', '#bf00ff', '#ff0090', '#00ff88', '#ffd700', '#ff6600'].map(c => (
                <div key={c} className="w-5 h-5 rounded-full cursor-pointer" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
              ))}
            </div>
          </div>
        </div>
      );
      case 'Network': return (
        <div className="space-y-1">
          <div className="py-3 space-y-2" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <div className="flex justify-between">
              <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Connection</span>
              <span className="share-tech text-sm" style={{ color: '#00ff88' }}>Starlink V3 ●</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[['↓ Download', '1.2 Gbps', '#00f5ff'], ['↑ Upload', '480 Mbps', '#bf00ff'], ['Latency', '12ms', '#00ff88']].map(([l,v,c]) => (
                <div key={l} className="p-2 rounded-lg text-center" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
                  <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                  <div className="share-tech text-sm font-bold" style={{ color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <Toggle k="starlink" label="Starlink Auto-Connect" sub="Priority: Starlink > 5G > WiFi" />
          <Toggle k="marsSync" label="Mars Colony Sync" sub="3m 28s delay — ISP: Starlink Deep Space" color="#ff6600" />
          <Toggle k="xIntegration" label="X Platform Integration" sub="Posts, DMs, and Trending" />
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>IP Address</span>
            <span className="share-tech text-sm neon-text-cyan">2001:db8:elon::1 (IPv6)</span>
          </div>
        </div>
      );
      case 'Neuralink': return (
        <div className="space-y-1">
          <div className="py-4 flex flex-col items-center gap-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
              style={{ background: 'radial-gradient(circle, rgba(191,0,255,0.3), rgba(191,0,255,0.05))', border: '2px solid #bf00ff', boxShadow: '0 0 30px rgba(191,0,255,0.4)' }}
            >🧠</div>
            <div className="text-center">
              <div className="orbitron text-sm" style={{ color: '#bf00ff' }}>N2 IMPLANT v5.2.1</div>
              <div className="share-tech text-xs" style={{ color: '#00ff88' }}>● CONNECTED — 99.97% bandwidth</div>
            </div>
          </div>
          <Slider label="Neural Bandwidth" value={neuralBW} onChange={setNeuralBW} color="#bf00ff" />
          <Toggle k="neuralink" label="Neuralink Active" sub="N2 implant — 4,096 channels" color="#bf00ff" />
          <Toggle k="neuralTyping" label="Neural Typing" sub="Thought-to-text @ 120 WPM" color="#bf00ff" />
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Electrode Channels</span>
            <span className="share-tech text-sm" style={{ color: '#bf00ff' }}>4,096 active</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Battery</span>
            <span className="share-tech text-sm" style={{ color: '#00ff88' }}>100% (wireless)</span>
          </div>
        </div>
      );
      case 'AI Engine': return (
        <div className="space-y-1">
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Active Model</span>
            <span className="share-tech text-sm neon-text-cyan">Grok-4 Turbo</span>
          </div>
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Context Window</span>
            <span className="share-tech text-sm neon-text-cyan">128,000 tokens</span>
          </div>
          <Toggle k="grokAssist" label="Grok Everywhere™" sub="AI suggestions in all apps" />
          <Toggle k="aiCamera" label="AI Vision Processing" sub="Real-time scene understanding" color="#00ff88" />
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>GPU Compute</span>
            <span className="share-tech text-sm" style={{ color: '#00ff88' }}>100,000 H200s ✓</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>AGI Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,245,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: '80%', background: 'linear-gradient(90deg, #00f5ff, #bf00ff)', boxShadow: '0 0 8px #00f5ff' }} />
              </div>
              <span className="share-tech text-xs neon-text-cyan">80%</span>
            </div>
          </div>
        </div>
      );
      case 'Security': return (
        <div className="space-y-1">
          <Toggle k="quantumEnc" label="Quantum Encryption (256-qubit)" sub="NSA-proof military grade" color="#ff0090" />
          <Toggle k="neuralink" label="Neuralink Biometric Auth" sub="Brainwave pattern verification" color="#bf00ff" />
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Firewall</span>
            <span className="share-tech text-sm" style={{ color: '#00ff88' }}>ACTIVE — Blocking 1,337 threats/min</span>
          </div>
          <div className="py-3 flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>VPN</span>
            <span className="share-tech text-sm neon-text-cyan">Starlink Onion Route ✓</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Last Security Scan</span>
            <span className="share-tech text-sm" style={{ color: '#00ff88' }}>2 min ago — CLEAN</span>
          </div>
        </div>
      );
      case 'Tesla': return (
        <div className="space-y-1">
          <Toggle k="autopilot" label="Autopilot Integration" sub="FSD v13.2.8 connected" color="#ff0090" />
          <Toggle k="dogePay" label="Dogecoin Payments" sub="Pay with DOGE at Tesla Superchargers" color="#ffd700" />
          <div className="py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <div className="share-tech text-sm mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>Connected Vehicles</div>
            {['Cybertruck X — PARKED', 'Roadster Gen3 — IN TRANSIT', 'Model S Plaid+ — SENTRY', 'Semi #42 — AUTOPILOT'].map((v, i) => (
              <div key={i} className="flex justify-between py-1">
                <span className="share-tech" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{v.split('—')[0]}</span>
                <span className="share-tech" style={{ fontSize: '12px', color: '#ff0090' }}>{v.split('—')[1]}</span>
              </div>
            ))}
          </div>
          <div className="py-3 flex justify-between">
            <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Optimus Bot</span>
            <span className="share-tech text-sm" style={{ color: '#00ff88' }}>● ONLINE — Office Mode</span>
          </div>
        </div>
      );
      case 'About': return (
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}
          >
            <div className="text-4xl mb-3">
              <svg width="48" height="48" viewBox="0 0 88 88" fill="none" style={{ display: 'inline-block' }}>
                <rect x="2" y="2" width="38" height="38" rx="3" fill="#00f5ff" opacity="0.9"/>
                <rect x="48" y="2" width="38" height="38" rx="3" fill="#bf00ff" opacity="0.9"/>
                <rect x="2" y="48" width="38" height="38" rx="3" fill="#00ff88" opacity="0.9"/>
                <rect x="48" y="48" width="38" height="38" rx="3" fill="#ff0090" opacity="0.9"/>
              </svg>
            </div>
            <div className="orbitron text-lg font-black neon-text-cyan">WINDOWS 12 PRO</div>
            <div className="orbitron text-xs neon-text-gold mt-1" style={{ letterSpacing: '4px' }}>ELON MUSK EDITION</div>
            <div className="share-tech text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Version 12.0.0.1000000-EM</div>
          </div>
          {[
            ['Edition', 'Dark Neon Ultimate Pro Max+'],
            ['Build', '12.0.0.1000000-EM (2025)'],
            ['License', '$1,000,000 MVP — VALID ✓'],
            ['Processor', 'xAI HyperCore™ 128-core @ 12GHz'],
            ['Installed RAM', '4,096 GB DDR7'],
            ['System Type', '512-bit Neural OS'],
            ['AI Engine', 'Grok-4 Turbo'],
            ['Encryption', '256-qubit Quantum'],
            ['Mars Edition', 'YES — Base Alpha Ready'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)', paddingBottom: '8px' }}>
              <span className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
              <span className="share-tech text-sm neon-text-cyan">{v}</span>
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-full flex" style={{ background: '#030810' }}>
      {/* Sidebar */}
      <div
        className="w-48 shrink-0 flex flex-col py-2"
        style={{ borderRight: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,5,15,0.8)' }}
      >
        {sections.map(s => (
          <button
            key={s}
            className="text-left px-4 py-3 share-tech text-sm transition-all"
            style={{
              color: active === s ? '#00f5ff' : 'rgba(255,255,255,0.55)',
              background: active === s ? 'rgba(0,245,255,0.08)' : 'transparent',
              borderLeft: active === s ? '2px solid #00f5ff' : '2px solid transparent',
              boxShadow: active === s ? 'inset 0 0 20px rgba(0,245,255,0.05)' : 'none',
            }}
            onClick={() => setActive(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="orbitron text-sm neon-text-cyan mb-4" style={{ letterSpacing: '3px' }}>{active.toUpperCase()}</div>
        {renderContent()}
      </div>
    </div>
  );
}
