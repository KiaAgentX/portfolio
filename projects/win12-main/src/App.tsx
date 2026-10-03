import { useState, useEffect, useCallback } from 'react';
import MatrixRain from './components/MatrixRain';
import BootScreen from './components/BootScreen';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import Window from './components/Window';
import TerminalApp from './apps/TerminalApp';
import GrokApp from './apps/GrokApp';
import SettingsApp from './apps/SettingsApp';
import BrowserApp from './apps/BrowserApp';
import TeslaApp from './apps/TeslaApp';
import SpaceXApp from './apps/SpaceXApp';
import DogeApp from './apps/DogeApp';
import FilesApp from './apps/FilesApp';
import StarlinkApp from './apps/StarlinkApp';
import wallpaperUrl from './assets/wallpaper.jpg';

interface AppWindow {
  id: string;
  title: string;
  icon: string;
  minimized: boolean;
  pos: { x: number; y: number };
  size: { w: number; h: number };
  accentColor: string;
}

const APP_CONFIGS: Record<string, Omit<AppWindow, 'id' | 'minimized'>> = {
  terminal: { title: 'Terminal — xAI Shell', icon: '⬛', pos: { x: 80, y: 40 }, size: { w: 820, h: 540 }, accentColor: '#00ff88' },
  browser: { title: 'NeoChrome — Quantum Browser', icon: '🌐', pos: { x: 120, y: 30 }, size: { w: 960, h: 600 }, accentColor: '#00f5ff' },
  files: { title: 'File Explorer — StarDrive™', icon: '📁', pos: { x: 100, y: 60 }, size: { w: 860, h: 540 }, accentColor: '#ffd700' },
  settings: { title: 'Settings — Windows 12 PRO', icon: '⚙️', pos: { x: 140, y: 50 }, size: { w: 780, h: 560 }, accentColor: '#bf00ff' },
  grok: { title: 'Grok AI — xAI Neural Assistant', icon: '🤖', pos: { x: 160, y: 40 }, size: { w: 800, h: 580 }, accentColor: '#00f5ff' },
  tesla: { title: 'Tesla Hub — Fleet Control', icon: '🚗', pos: { x: 100, y: 50 }, size: { w: 820, h: 560 }, accentColor: '#ff0090' },
  starlink: { title: 'Starlink — Orbital Network', icon: '🛰️', pos: { x: 90, y: 40 }, size: { w: 840, h: 580 }, accentColor: '#00f5ff' },
  spacex: { title: 'SpaceX — Mission Control', icon: '🚀', pos: { x: 110, y: 35 }, size: { w: 880, h: 580 }, accentColor: '#ff6600' },
  doge: { title: 'Dogecoin — Crypto Wallet', icon: '🐕', pos: { x: 130, y: 45 }, size: { w: 760, h: 580 }, accentColor: '#ffd700' },
  neuralink: { title: 'Neuralink — BCI Interface', icon: '🧠', pos: { x: 150, y: 55 }, size: { w: 800, h: 540 }, accentColor: '#bf00ff' },
  xtwitter: { title: 'X — The Everything App', icon: '✖️', pos: { x: 120, y: 45 }, size: { w: 820, h: 560 }, accentColor: '#ffffff' },
};

// Desktop icons
const desktopIcons = [
  { id: 'terminal', icon: '⬛', label: 'Terminal' },
  { id: 'grok', icon: '🤖', label: 'Grok AI' },
  { id: 'tesla', icon: '🚗', label: 'Tesla Hub' },
  { id: 'spacex', icon: '🚀', label: 'SpaceX' },
  { id: 'starlink', icon: '🛰️', label: 'Starlink' },
  { id: 'doge', icon: '🐕', label: 'Dogecoin' },
  { id: 'files', icon: '📁', label: 'Files' },
  { id: 'browser', icon: '🌐', label: 'NeoChrome' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'neuralink', icon: '🧠', label: 'Neuralink' },
];

function NeuralinkPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-8" style={{ background: 'linear-gradient(180deg, #080012 0%, #030008 100%)' }}>
      <div className="text-8xl float-anim" style={{ filter: 'drop-shadow(0 0 30px #bf00ff)' }}>🧠</div>
      <div className="text-center">
        <div className="orbitron text-2xl font-black" style={{ color: '#bf00ff' }}>NEURALINK N2</div>
        <div className="share-tech text-sm mt-2" style={{ color: 'rgba(191,0,255,0.6)' }}>BCI Neural Interface — v5.2.1</div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {[
          ['Status', 'CONNECTED ●', '#00ff88'],
          ['Bandwidth', '99.97%', '#bf00ff'],
          ['Channels', '4,096 active', '#00f5ff'],
          ['Latency', '0.3ms', '#ffd700'],
          ['Battery', '100% wireless', '#00ff88'],
          ['Mode', 'TYPING + CURSOR', '#bf00ff'],
        ].map(([k, v, c]) => (
          <div key={k} className="p-3 rounded-xl text-center" style={{ background: 'rgba(191,0,255,0.08)', border: '1px solid rgba(191,0,255,0.25)' }}>
            <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{k}</div>
            <div className="share-tech text-sm font-bold mt-1" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <button
        className="px-8 py-3 rounded-xl orbitron text-sm font-bold"
        style={{ background: 'linear-gradient(135deg, #bf00ff, #7700ff)', boxShadow: '0 0 30px rgba(191,0,255,0.4)', color: '#fff' }}
      >
        CALIBRATE NEURAL LINK
      </button>
    </div>
  );
}

function XTwitterPlaceholder() {
  const posts = [
    { user: 'Elon Musk', handle: '@elonmusk', content: 'DOGE 🚀🌙', likes: '2.4M', time: '1m', verified: true },
    { user: 'Elon Musk', handle: '@elonmusk', content: 'Starship SX-42 launches in 3 hours. This one is special. 🔥', likes: '1.8M', time: '45m', verified: true },
    { user: 'xAI', handle: '@xai', content: 'Grok-4 Turbo is now live. 128K context. Smarter than ever. Try it now.', likes: '892K', time: '2h', verified: true },
    { user: 'Tesla', handle: '@Tesla', content: 'FSD v14 ships next week. Zero interventions in 10 billion miles of testing.', likes: '445K', time: '3h', verified: true },
    { user: 'SpaceX', handle: '@SpaceX', content: 'Mechazilla catches booster #12 successfully. Reuse record: 22 flights.', likes: '1.1M', time: '5h', verified: true },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: '#030608' }}>
      <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px #fff)' }}>✖️</div>
        <div className="orbitron text-lg font-black" style={{ color: '#fff' }}>X — The Everything App</div>
        <div className="ml-auto share-tech text-xs" style={{ color: '#00f5ff' }}>● Starlink Connected</div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {posts.map((p, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'linear-gradient(135deg, #00f5ff, #bf00ff)' }}>
                {p.user[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="share-tech text-sm font-bold" style={{ color: '#fff' }}>{p.user}</span>
                  {p.verified && <span style={{ color: '#00f5ff', fontSize: '14px' }}>✓</span>}
                  <span className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.handle} · {p.time}</span>
                </div>
                <div className="share-tech text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>{p.content}</div>
                <div className="flex gap-5 mt-2 share-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span>💬 Reply</span>
                  <span>🔁 Repost</span>
                  <span>❤️ {p.likes}</span>
                  <span>📊 Stats</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <input
          className="flex-1 px-4 py-2 rounded-xl share-tech text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', caretColor: '#00f5ff' }}
          placeholder="What is happening?!"
        />
        <button className="px-5 py-2 rounded-xl orbitron text-xs font-bold" style={{ background: '#00f5ff', color: '#000' }}>POST</button>
      </div>
    </div>
  );
}

function ContextMenu({ pos, onClose }: { pos: { x: number; y: number }; onClose: () => void }) {
  const items = [
    { icon: '🖼️', label: 'Change Wallpaper' },
    { icon: '⚙️', label: 'Display Settings' },
    { icon: '🔃', label: 'Refresh Desktop' },
    { icon: '📋', label: 'Paste' },
    { icon: '🤖', label: 'Ask Grok AI' },
    null,
    { icon: '✖️', label: 'Exit to X.com' },
  ];

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: 800 }} onClick={onClose} />
      <div
        className="context-menu fixed rounded-xl overflow-hidden"
        style={{ left: pos.x, top: pos.y, minWidth: '180px', zIndex: 801 }}
      >
        {items.map((item, i) => item === null ? (
          <div key={i} style={{ height: '1px', background: 'rgba(0,245,255,0.15)', margin: '2px 0' }} />
        ) : (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-cyan-500/10 transition-all share-tech text-sm"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onClick={onClose}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  return (
    <div
      className="absolute top-4 right-4 rounded-2xl p-3 text-center"
      style={{
        background: 'rgba(3,8,20,0.7)',
        border: '1px solid rgba(0,245,255,0.2)',
        backdropFilter: 'blur(10px)',
        minWidth: '120px',
      }}
    >
      <div className="orbitron text-xl font-black neon-text-cyan" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
      </div>
      <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.5)', marginTop: '2px' }}>
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

function SystemWidget() {
  const [cpu, setCpu] = useState(42);
  const [ram] = useState(68);

  useEffect(() => {
    const t = setInterval(() => setCpu(Math.max(20, Math.min(90, cpu + (Math.random() - 0.5) * 10))), 1500);
    return () => clearInterval(t);
  }, [cpu]);

  return (
    <div
      className="absolute top-4 left-4 rounded-2xl p-3"
      style={{
        background: 'rgba(3,8,20,0.7)',
        border: '1px solid rgba(0,245,255,0.2)',
        backdropFilter: 'blur(10px)',
        width: '160px',
      }}
    >
      <div className="orbitron text-xs neon-text-cyan mb-2" style={{ letterSpacing: '2px', fontSize: '9px' }}>SYSTEM STATUS</div>
      {[
        { label: 'CPU', value: Math.round(cpu), color: cpu > 70 ? '#ff4444' : '#00f5ff' },
        { label: 'RAM', value: ram, color: '#bf00ff' },
        { label: 'GPU', value: 34, color: '#00ff88' },
        { label: 'NET', value: 89, color: '#ffd700' },
      ].map(s => (
        <div key={s.label} className="mb-1.5">
          <div className="flex justify-between share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            <span>{s.label}</span>
            <span style={{ color: s.color }}>{s.value}%</span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.value}%`, background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
          </div>
        </div>
      ))}
      <div className="mt-2 share-tech" style={{ fontSize: '9px', color: '#00ff88' }}>● Grok-4 ACTIVE</div>
      <div className="share-tech" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.4)' }}>● Starlink 12ms</div>
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; title: string; msg: string; icon: string; color: string }[]>([]);
  const [notifId, setNotifId] = useState(0);

  const pushNotification = useCallback((title: string, msg: string, icon: string, color: string) => {
    const id = notifId + 1;
    setNotifId(id);
    setNotifications(n => [...n, { id, title, msg, icon, color }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000);
  }, [notifId]);

  useEffect(() => {
    if (!booted) return;
    const msgs = [
      ['Grok AI', 'Ready to assist, Elon', '🤖', '#00f5ff'],
      ['Starlink', '12ms · 1.2 Gbps Connected', '🛰️', '#00f5ff'],
      ['Neuralink', 'BCI v5.2.1 — Synced 99.97%', '🧠', '#bf00ff'],
      ['Tesla', 'Cybertruck X — Fully Charged', '🚗', '#ff0090'],
      ['SpaceX', 'Starship SX-42 T-3h 22m', '🚀', '#ff6600'],
      ['Dogecoin', 'DOGE +420.69% — $1.00 ✓', '🐕', '#ffd700'],
    ];
    let delay = 500;
    msgs.forEach(([t, m, i, c]) => {
      setTimeout(() => pushNotification(t as string, m as string, i as string, c as string), delay);
      delay += 1000;
    });
  }, [booted]);

  const launchApp = useCallback((id: string) => {
    const existing = windows.find(w => w.id === id);
    if (existing) {
      setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: false } : w));
      setActiveWindow(id);
      return;
    }
    const cfg = APP_CONFIGS[id];
    if (!cfg) return;
    const offset = windows.length * 25;
    const newWin: AppWindow = {
      id,
      minimized: false,
      ...cfg,
      pos: { x: cfg.pos.x + offset, y: cfg.pos.y + offset },
    };
    setWindows(ws => [...ws, newWin]);
    setActiveWindow(id);
  }, [windows]);

  const closeApp = useCallback((id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    setActiveWindow(null);
  }, []);

  const minimizeApp = useCallback((id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true } : w));
    if (activeWindow === id) setActiveWindow(null);
  }, [activeWindow]);

  const focusApp = useCallback((id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: false } : w));
    setActiveWindow(id);
  }, []);

  const renderAppContent = (id: string) => {
    switch (id) {
      case 'terminal': return <TerminalApp />;
      case 'browser': return <BrowserApp />;
      case 'files': return <FilesApp />;
      case 'settings': return <SettingsApp />;
      case 'grok': return <GrokApp />;
      case 'tesla': return <TeslaApp />;
      case 'starlink': return <StarlinkApp />;
      case 'spacex': return <SpaceXApp />;
      case 'doge': return <DogeApp />;
      case 'neuralink': return <NeuralinkPlaceholder />;
      case 'xtwitter': return <XTwitterPlaceholder />;
      default: return <div className="p-8 text-center share-tech" style={{ color: '#00f5ff' }}>App coming soon…</div>;
    }
  };

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div
      className="win12-desktop relative overflow-hidden"
      style={{ width: '100vw', height: '100vh', background: '#010205' }}
      onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); setStartOpen(false); }}
      onClick={() => { setStartOpen(false); setContextMenu(null); setSelectedDesktopIcon(null); }}
    >
      {/* Wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.75) 100%)',
          zIndex: 1,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          zIndex: 2,
        }}
      />

      {/* Matrix Rain */}
      <div style={{ zIndex: 3 }}>
        <MatrixRain />
      </div>

      {/* Scan line */}
      <div className="scan-line" style={{ zIndex: 4 }} />

      {/* System widget */}
      <div style={{ zIndex: 10 }}>
        <SystemWidget />
      </div>

      {/* Clock widget */}
      <div style={{ zIndex: 10 }}>
        <Clock />
      </div>

      {/* Elon signature badge */}
      <div
        className="absolute share-tech"
        style={{
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: 'rgba(0,245,255,0.3)',
          letterSpacing: '4px',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        ⚡ WINDOWS 12 PRO — ELON MUSK EDITION — $1,000,000 MVP — xAI POWERED ⚡
      </div>

      {/* Desktop Icons */}
      <div
        className="absolute flex flex-col gap-3"
        style={{ top: '20px', right: '20px', zIndex: 10 }}
        onClick={e => e.stopPropagation()}
      >
        {desktopIcons.map(icon => (
          <div
            key={icon.id}
            className="flex flex-col items-center gap-1 cursor-pointer app-icon"
            style={{ width: '72px' }}
            onClick={() => setSelectedDesktopIcon(icon.id)}
            onDoubleClick={() => launchApp(icon.id)}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl transition-all duration-200"
              style={{
                background: selectedDesktopIcon === icon.id ? 'rgba(0,245,255,0.15)' : 'rgba(0,0,0,0.35)',
                border: selectedDesktopIcon === icon.id ? '1px solid rgba(0,245,255,0.6)' : '1px solid rgba(0,245,255,0.1)',
                backdropFilter: 'blur(8px)',
                boxShadow: selectedDesktopIcon === icon.id ? '0 0 15px rgba(0,245,255,0.3)' : 'none',
              }}
            >
              {icon.icon}
            </div>
            <div
              className="share-tech text-center"
              style={{
                fontSize: '11px',
                color: selectedDesktopIcon === icon.id ? '#00f5ff' : 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                lineHeight: '1.2',
              }}
            >{icon.label}</div>
          </div>
        ))}
      </div>

      {/* Windows */}
      {windows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          icon={win.icon}
          isActive={activeWindow === win.id}
          isMinimized={win.minimized}
          onClose={() => closeApp(win.id)}
          onMinimize={() => minimizeApp(win.id)}
          onMaximize={() => {}}
          onFocus={() => focusApp(win.id)}
          defaultPos={win.pos}
          defaultSize={win.size}
          accentColor={win.accentColor}
        >
          {renderAppContent(win.id)}
        </Window>
      ))}

      {/* Start Menu */}
      {startOpen && (
        <StartMenu
          onClose={() => setStartOpen(false)}
          onAppLaunch={id => { launchApp(id); setStartOpen(false); }}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu pos={contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {/* Notifications */}
      <div
        className="fixed flex flex-col gap-2"
        style={{ top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9000, pointerEvents: 'none' }}
      >
        {notifications.map(n => (
          <div
            key={n.id}
            className="notification flex items-center gap-3 px-4 py-3 rounded-xl share-tech text-sm"
            style={{
              background: 'rgba(3,8,20,0.96)',
              border: `1px solid ${n.color}55`,
              boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 15px ${n.color}22`,
              minWidth: '300px',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <span style={{ fontSize: '20px' }}>{n.icon}</span>
            <div>
              <div className="font-bold" style={{ color: n.color, fontSize: '12px' }}>{n.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{n.msg}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Taskbar */}
      <div style={{ zIndex: 1000 }}>
        <Taskbar
          openWindows={windows.map(w => w.id)}
          activeWindow={activeWindow}
          onWindowClick={id => focusApp(id)}
          onStartClick={() => { setStartOpen(s => !s); setContextMenu(null); }}
          onAppLaunch={launchApp}
          startOpen={startOpen}
        />
      </div>
    </div>
  );
}
