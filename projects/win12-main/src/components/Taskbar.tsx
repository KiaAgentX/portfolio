import { useState, useEffect } from 'react';

interface TaskbarProps {
  openWindows: string[];
  activeWindow: string | null;
  onWindowClick: (id: string) => void;
  onStartClick: () => void;
  onAppLaunch: (app: string) => void;
  startOpen: boolean;
}

const pinnedApps = [
  { id: 'terminal', icon: '⬛', label: 'Terminal', color: '#00ff88' },
  { id: 'browser', icon: '🌐', label: 'NeoChrome', color: '#00f5ff' },
  { id: 'files', icon: '📁', label: 'Files', color: '#ffd700' },
  { id: 'settings', icon: '⚙️', label: 'Settings', color: '#bf00ff' },
  { id: 'grok', icon: '🤖', label: 'Grok AI', color: '#00f5ff' },
  { id: 'tesla', icon: '🚗', label: 'Tesla Hub', color: '#ff0090' },
  { id: 'starlink', icon: '🛰️', label: 'Starlink', color: '#00f5ff' },
  { id: 'spacex', icon: '🚀', label: 'SpaceX', color: '#ff6600' },
  { id: 'doge', icon: '🐕', label: 'Dogecoin', color: '#ffd700' },
  { id: 'xtwitter', icon: '✖️', label: 'X Platform', color: '#ffffff' },
];

export default function Taskbar({ openWindows, activeWindow, onWindowClick, onStartClick, onAppLaunch, startOpen }: TaskbarProps) {
  const [time, setTime] = useState(new Date());
  const [hovered, setHovered] = useState<string | null>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="taskbar fixed bottom-0 left-0 right-0 flex items-center justify-between px-3"
      style={{ height: '52px', zIndex: 1000 }}
    >
      {/* Left - Start + System tray left */}
      <div className="flex items-center gap-2">
        {/* Start Button */}
        <button
          onClick={onStartClick}
          className={`relative flex items-center justify-center rounded-lg transition-all duration-200 ${startOpen ? 'bg-cyan-500/20' : ''}`}
          style={{
            width: '42px',
            height: '38px',
            border: `1px solid ${startOpen ? 'rgba(0,245,255,0.8)' : 'rgba(0,245,255,0.3)'}`,
            boxShadow: startOpen ? '0 0 20px rgba(0,245,255,0.4)' : 'none',
          }}
          title="Start"
        >
          <svg width="20" height="20" viewBox="0 0 88 88" fill="none">
            <rect x="2" y="2" width="38" height="38" rx="3" fill="#00f5ff" opacity="0.9"/>
            <rect x="48" y="2" width="38" height="38" rx="3" fill="#bf00ff" opacity="0.9"/>
            <rect x="2" y="48" width="38" height="38" rx="3" fill="#00ff88" opacity="0.9"/>
            <rect x="48" y="48" width="38" height="38" rx="3" fill="#ff0090" opacity="0.9"/>
          </svg>
        </button>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:border-cyan-400/60"
          style={{
            height: '36px',
            background: 'rgba(0,245,255,0.05)',
            border: '1px solid rgba(0,245,255,0.2)',
            width: '200px',
          }}
          onClick={() => onAppLaunch('search')}
        >
          <span style={{ fontSize: '13px', color: 'rgba(0,245,255,0.5)' }}>🔍</span>
          <span style={{ fontSize: '12px', color: 'rgba(0,245,255,0.4)', fontFamily: 'Rajdhani, sans-serif' }}>Search Windows 12…</span>
        </div>
      </div>

      {/* Center - Pinned + Open Apps */}
      <div className="flex items-center gap-1">
        {pinnedApps.map(app => {
          const isOpen = openWindows.includes(app.id);
          const isActive = activeWindow === app.id;
          return (
            <div
              key={app.id}
              className="relative app-icon flex flex-col items-center justify-center"
              style={{ width: '40px', height: '40px' }}
              onClick={() => isOpen ? onWindowClick(app.id) : onAppLaunch(app.id)}
              onMouseEnter={() => setHovered(app.id)}
              onMouseLeave={() => setHovered(null)}
              title={app.label}
            >
              <div
                className="flex items-center justify-center rounded-lg text-lg transition-all duration-200"
                style={{
                  width: '36px',
                  height: '34px',
                  background: isActive ? `${app.color}22` : isOpen ? `${app.color}11` : 'transparent',
                  border: isActive ? `1px solid ${app.color}88` : isOpen ? `1px solid ${app.color}44` : '1px solid transparent',
                  fontSize: '16px',
                }}
              >
                {app.icon}
              </div>
              {/* Active indicator dot */}
              {isOpen && (
                <div
                  className="absolute bottom-0 rounded-full"
                  style={{
                    width: isActive ? '18px' : '6px',
                    height: '3px',
                    background: app.color,
                    boxShadow: `0 0 6px ${app.color}`,
                    transition: 'all 0.2s',
                  }}
                />
              )}
              {/* Tooltip */}
              {hovered === app.id && (
                <div
                  className="absolute share-tech text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
                  style={{
                    bottom: '46px',
                    background: 'rgba(4,10,22,0.95)',
                    border: '1px solid rgba(0,245,255,0.3)',
                    color: '#00f5ff',
                    boxShadow: '0 0 10px rgba(0,245,255,0.2)',
                    fontSize: '11px',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  {app.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right - System tray */}
      <div className="flex items-center gap-3">
        {/* System icons */}
        <div className="flex items-center gap-2" style={{ fontSize: '14px' }}>
          <span title="Starlink Connected" style={{ filter: 'drop-shadow(0 0 4px #00f5ff)', cursor: 'pointer' }}>📶</span>
          <span title="Sound" style={{ cursor: 'pointer' }}>🔊</span>
          <span title="Battery 100%" style={{ cursor: 'pointer' }}>🔋</span>
          <span title="Neuralink Paired" style={{ filter: 'drop-shadow(0 0 4px #bf00ff)', cursor: 'pointer' }}>🧠</span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'rgba(0,245,255,0.2)' }} />

        {/* Clock */}
        <div
          className="text-center cursor-pointer px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-all"
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          style={{ border: '1px solid transparent' }}
        >
          <div className="orbitron neon-text-cyan" style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '1px' }}>
            {timeStr}
          </div>
          <div className="share-tech" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.5)', letterSpacing: '0.5px' }}>
            {dateStr}
          </div>
        </div>

        {/* Notif */}
        <button
          className="flex items-center justify-center rounded-lg transition-all hover:bg-cyan-500/10"
          style={{
            width: '30px', height: '30px',
            border: '1px solid rgba(0,245,255,0.2)',
            color: 'rgba(0,245,255,0.7)',
            fontSize: '14px',
          }}
          onClick={() => setShowNotifPanel(!showNotifPanel)}
        >
          🔔
        </button>

        {/* Notification Panel */}
        {showNotifPanel && (
          <div
            className="notification fixed right-2 rounded-xl p-4 space-y-3"
            style={{
              bottom: '58px',
              width: '320px',
              background: 'rgba(4,10,22,0.97)',
              border: '1px solid rgba(0,245,255,0.3)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,245,255,0.1)',
              zIndex: 2000,
            }}
            onClick={() => setShowNotifPanel(false)}
          >
            <div className="orbitron text-xs neon-text-cyan" style={{ letterSpacing: '3px' }}>NOTIFICATIONS</div>
            {[
              { icon: '🚀', title: 'SpaceX Launch', msg: 'Starship SX-42 launch in T-03:22:15', color: '#ff6600', time: '2m ago' },
              { icon: '🧠', title: 'Grok AI', msg: 'New model: Grok-4 Turbo deployed', color: '#bf00ff', time: '5m ago' },
              { icon: '🐕', title: 'Dogecoin', msg: 'DOGE up 420% — $1.00 target hit!', color: '#ffd700', time: '12m ago' },
              { icon: '🚗', title: 'Tesla', msg: 'Cybertruck update v9.3 available', color: '#ff0090', time: '1h ago' },
              { icon: '🛰️', title: 'Starlink', msg: 'New satellite batch deployed (v3.5)', color: '#00f5ff', time: '3h ago' },
            ].map((n, i) => (
              <div
                key={i}
                className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-xl">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="share-tech text-xs font-bold" style={{ color: n.color }}>{n.title}</div>
                  <div className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{n.msg}</div>
                </div>
                <div className="share-tech text-xs" style={{ color: 'rgba(0,245,255,0.3)' }}>{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
