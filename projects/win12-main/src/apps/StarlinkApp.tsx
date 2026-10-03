import { useEffect, useState } from 'react';

interface Satellite { id: number; x: number; y: number; vx: number; vy: number; active: boolean; }

export default function StarlinkApp() {
  const [satellites, setSatellites] = useState<Satellite[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 520,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.2,
      active: Math.random() > 0.05,
    }))
  );
  const [ping] = useState(12);

  useEffect(() => {
    const t = setInterval(() => {
      setSatellites(prev => prev.map(s => ({
        ...s,
        x: (s.x + s.vx + 520) % 520,
        y: Math.max(10, Math.min(290, s.y + s.vy)),
        vy: s.vy + (Math.random() - 0.5) * 0.02,
      })));
    }, 50);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: 'Active Satellites', value: '12,847', color: '#00f5ff', icon: '🛰️' },
    { label: 'Coverage', value: '100%', color: '#00ff88', icon: '🌍' },
    { label: 'Latency', value: `${ping}ms`, color: '#ffd700', icon: '⚡' },
    { label: 'Download', value: '1.2 Gbps', color: '#bf00ff', icon: '↓' },
    { label: 'Upload', value: '480 Mbps', color: '#ff6600', icon: '↑' },
    { label: 'Uptime', value: '99.999%', color: '#00ff88', icon: '✓' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: '#020408' }}>
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(0,245,255,0.2)', background: 'rgba(0,0,0,0.7)' }}
      >
        <div>
          <div className="orbitron text-lg font-black neon-text-cyan" style={{ letterSpacing: '3px' }}>STARLINK NETWORK</div>
          <div className="share-tech text-xs" style={{ color: 'rgba(0,245,255,0.5)' }}>Gen-3 Constellation · LEO 550km · Global Coverage</div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl share-tech text-xs"
          style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}
        >
          ● ALL SYSTEMS NOMINAL
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Orbital map */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            height: '300px',
            background: 'radial-gradient(ellipse at center, #030a18 0%, #010205 100%)',
            border: '1px solid rgba(0,245,255,0.25)',
            boxShadow: '0 0 30px rgba(0,245,255,0.05)',
          }}
        >
          {/* Earth-like oval */}
          <div
            className="absolute"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px', height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 30% 30%, #1a4a8a, #0d2444, #050f22)',
              border: '2px solid rgba(0,100,255,0.4)',
              boxShadow: '0 0 30px rgba(0,100,200,0.3)',
              zIndex: 2,
            }}
          />
          <div
            className="absolute share-tech"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: '28px', zIndex: 3 }}
          >🌍</div>

          {/* Orbital rings */}
          {[100, 130, 155].map((r, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: '50%', top: '50%',
                width: r * 2.2 + 'px', height: r + 'px',
                marginLeft: -(r * 1.1) + 'px', marginTop: -(r / 2) + 'px',
                border: `1px solid rgba(0,245,255,${0.08 - i * 0.02})`,
                borderRadius: '50%',
              }}
            />
          ))}

          {/* Satellites */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 4 }}>
            {satellites.map(s => (
              <g key={s.id}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.active ? 2 : 1.5}
                  fill={s.active ? '#00f5ff' : 'rgba(0,245,255,0.3)'}
                  style={{ filter: s.active ? 'drop-shadow(0 0 3px #00f5ff)' : 'none' }}
                />
              </g>
            ))}
            {/* Connection lines (sample) */}
            {satellites.slice(0, 15).map((s, i) => {
              const next = satellites[i + 1];
              if (!next || !s.active || !next.active) return null;
              const dist = Math.sqrt((s.x - next.x) ** 2 + (s.y - next.y) ** 2);
              if (dist > 80) return null;
              return (
                <line
                  key={`l${i}`}
                  x1={s.x} y1={s.y} x2={next.x} y2={next.y}
                  stroke="rgba(0,245,255,0.12)"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>

          {/* Labels */}
          <div className="absolute top-3 left-3 share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.6)' }}>
            ● {satellites.filter(s => s.active).length} active satellites visible
          </div>
          <div className="absolute bottom-3 right-3 share-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.4)' }}>
            REAL-TIME LEO VISUALIZATION
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-xl text-center"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}22` }}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="orbitron text-lg font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Next launches */}
        <div>
          <div className="orbitron text-xs neon-text-cyan mb-3" style={{ letterSpacing: '3px' }}>UPCOMING LAUNCHES</div>
          <div className="space-y-2">
            {[
              { name: 'Starlink Gen-3 Batch 42', date: 'T-48h', sats: 22, site: 'Cape Canaveral' },
              { name: 'Starlink Gen-3 Batch 43', date: 'T-14d', sats: 22, site: 'Vandenberg' },
              { name: 'Starlink Gen-4 Prototype', date: 'T-30d', sats: 6, site: 'Boca Chica' },
            ].map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ border: '1px solid rgba(0,245,255,0.12)', background: 'rgba(0,245,255,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚀</span>
                  <div>
                    <div className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>{l.name}</div>
                    <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{l.site} · {l.sats} satellites</div>
                  </div>
                </div>
                <div className="orbitron text-xs neon-text-cyan">{l.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
