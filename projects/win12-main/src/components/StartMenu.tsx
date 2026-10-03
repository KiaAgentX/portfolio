interface StartMenuProps {
  onClose: () => void;
  onAppLaunch: (app: string) => void;
}



const pinnedInStart = [
  { id: 'grok', icon: '🤖', label: 'Grok AI' },
  { id: 'browser', icon: '🌐', label: 'NeoChrome' },
  { id: 'terminal', icon: '⬛', label: 'Terminal' },
  { id: 'tesla', icon: '🚗', label: 'Tesla Hub' },
  { id: 'spacex', icon: '🚀', label: 'SpaceX' },
  { id: 'starlink', icon: '🛰️', label: 'Starlink' },
  { id: 'doge', icon: '🐕', label: 'Dogecoin' },
  { id: 'xtwitter', icon: '✖️', label: 'X Platform' },
  { id: 'neuralink', icon: '🧠', label: 'Neuralink' },
  { id: 'files', icon: '📁', label: 'Files' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'code', icon: '💻', label: 'NeoCode' },
];

export default function StartMenu({ onClose, onAppLaunch }: StartMenuProps) {
  const launch = (id: string) => {
    onAppLaunch(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0" style={{ zIndex: 899 }} onClick={onClose} />

      {/* Menu */}
      <div
        className="start-menu fixed rounded-2xl overflow-hidden"
        style={{
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '680px',
          height: '580px',
          background: 'rgba(3, 8, 20, 0.97)',
          border: '1px solid rgba(0,245,255,0.3)',
          boxShadow: '0 -20px 80px rgba(0,0,0,0.9), 0 0 40px rgba(0,245,255,0.1)',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0,245,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(191,0,255,0.05) 0%, transparent 50%)',
          }}
        />

        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,245,255,0.15)' }}
        >
          <div
            className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(0,245,255,0.05)',
              border: '1px solid rgba(0,245,255,0.2)',
            }}
          >
            <span style={{ fontSize: '14px' }}>🔍</span>
            <span className="share-tech text-sm" style={{ color: 'rgba(0,245,255,0.4)' }}>Search apps, files, xAI services…</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
          {/* Pinned */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="orbitron text-xs neon-text-cyan" style={{ letterSpacing: '3px' }}>PINNED APPS</div>
              <button className="share-tech text-xs glow-btn px-3 py-1 rounded-lg" style={{ fontSize: '10px' }}>All apps →</button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {pinnedInStart.map(app => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:bg-cyan-500/10 group"
                  style={{ border: '1px solid rgba(0,245,255,0.1)' }}
                  onClick={() => launch(app.id)}
                >
                  <div className="text-2xl group-hover:scale-110 transition-transform">{app.icon}</div>
                  <div className="share-tech text-center leading-tight" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{app.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div>
            <div className="orbitron text-xs neon-text-cyan mb-3" style={{ letterSpacing: '3px' }}>RECOMMENDED</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '📄', name: 'Mars_Colony_Plans.pdf', time: '2h ago', color: '#ff0090' },
                { icon: '🎥', name: 'Starship_Launch_SX42.mp4', time: '5h ago', color: '#ff6600' },
                { icon: '📊', name: 'Dogecoin_Portfolio_2025.xlsx', time: 'Yesterday', color: '#ffd700' },
                { icon: '🗺️', name: 'Neuralink_BCI_v5_Spec.doc', time: '2 days ago', color: '#bf00ff' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-xl">{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="share-tech text-xs truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{f.name}</div>
                    <div className="share-tech" style={{ fontSize: '10px', color: f.color }}>{f.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: '1px solid rgba(0,245,255,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{
                background: 'linear-gradient(135deg, #00f5ff, #bf00ff)',
                boxShadow: '0 0 12px rgba(0,245,255,0.4)',
              }}
            >
              E
            </div>
            <div>
              <div className="share-tech text-xs" style={{ color: '#00f5ff' }}>Elon Musk</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.4)' }}>CEO · xAI · $1M MVP License</div>
            </div>
          </div>
          <button
            className="glow-btn px-4 py-2 rounded-xl share-tech text-xs"
            onClick={() => {}}
          >
            ⏻ Power
          </button>
        </div>
      </div>
    </>
  );
}
