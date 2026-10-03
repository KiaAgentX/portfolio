import { useState, useEffect } from 'react';

export default function SpaceXApp() {
  const [countdown, setCountdown] = useState(3 * 3600 + 22 * 60 + 15);
  const [telemetry, setTelemetry] = useState({ alt: 0, vel: 0, stage: 'PRE-LAUNCH' });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
      setTelemetry(prev => ({
        alt: prev.alt < 200 ? prev.alt + Math.random() * 0.5 : prev.alt,
        vel: prev.vel < 28000 ? prev.vel + Math.random() * 10 : prev.vel,
        stage: prev.alt > 150 ? 'MECO / STAGE SEP' : prev.alt > 80 ? 'MAX-Q PASSED' : prev.alt > 50 ? 'ASCENDING' : 'PRE-LAUNCH',
      }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `T-${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const missions = [
    { name: 'STARSHIP SX-42', status: 'READY_TO_LAUNCH', type: 'Starship', payload: 'Mars Cargo Pack A', site: 'Starbase, TX', color: '#ff6600' },
    { name: 'FALCON 9 F9-200', status: 'BOOSTER RECOVERY', type: 'Falcon 9', payload: 'Starlink V3.8 (22 sats)', site: 'Gulf of Mexico', color: '#00f5ff' },
    { name: 'CREW DRAGON 12', status: 'ISS DOCKED', type: 'Dragon', payload: '4 crew members', site: 'ISS Orbit 420km', color: '#00ff88' },
    { name: 'STARLINK V3.8', status: 'DEPLOYED', type: 'Falcon 9', payload: '22 satellites', site: 'LEO 550km', color: '#bf00ff' },
  ];

  return (
    <div className="h-full flex flex-col overflow-auto" style={{ background: '#020408' }}>
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,102,0,0.3)', background: 'rgba(0,0,0,0.6)' }}
      >
        <div>
          <div className="orbitron text-lg font-black" style={{ color: '#ff6600', letterSpacing: '3px' }}>SPACEX MISSION CONTROL</div>
          <div className="share-tech text-xs" style={{ color: 'rgba(255,102,0,0.5)' }}>Starbase, TX · Cape Canaveral · Boca Chica</div>
        </div>
        <div className="text-right">
          <div className="orbitron text-2xl font-black" style={{ color: '#ff6600', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(countdown)}
          </div>
          <div className="share-tech text-xs" style={{ color: 'rgba(255,102,0,0.6)' }}>STARSHIP SX-42 LAUNCH</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Featured mission */}
        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,102,0,0.12) 0%, rgba(0,0,0,0.9) 70%)',
            border: '1px solid rgba(255,102,0,0.35)',
          }}
        >
          {/* Stars bg */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,102,0,0.05) 0%, transparent 50%)' }} />
          
          <div className="relative flex items-start justify-between">
            <div>
              <div className="share-tech text-xs mb-1" style={{ color: 'rgba(255,102,0,0.6)', letterSpacing: '3px' }}>NEXT LAUNCH</div>
              <div className="orbitron text-2xl font-black" style={{ color: '#ff6600' }}>STARSHIP SX-42</div>
              <div className="share-tech text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Payload: Mars Cargo Pack A — 120 metric tons</div>
              <div className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Site: Starbase, TX · Mechazilla Catch Attempt</div>
            </div>
            <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #ff6600)' }}>🚀</div>
          </div>

          {/* Telemetry row */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: 'ALTITUDE', value: `${telemetry.alt.toFixed(1)} km`, color: '#ff6600' },
              { label: 'VELOCITY', value: `${telemetry.vel.toFixed(0)} m/s`, color: '#00f5ff' },
              { label: 'STAGE', value: telemetry.stage, color: '#00ff88' },
              { label: 'STATUS', value: countdown > 0 ? 'HOLD' : 'LAUNCH!', color: '#ffd700' },
            ].map((t, i) => (
              <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${t.color}33` }}>
                <div className="share-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{t.label}</div>
                <div className="share-tech text-xs font-bold mt-0.5" style={{ color: t.color }}>{t.value}</div>
              </div>
            ))}
          </div>

          {/* Launch button */}
          <div className="mt-4 flex gap-3">
            <button
              className="flex-1 py-3 rounded-xl orbitron text-sm font-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff6600, #ff4400)',
                boxShadow: '0 0 30px rgba(255,102,0,0.4)',
                color: '#fff',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            >
              🚀 INITIATE LAUNCH SEQUENCE
            </button>
            <button
              className="px-5 py-3 rounded-xl share-tech text-xs"
              style={{ background: 'rgba(255,102,0,0.1)', border: '1px solid rgba(255,102,0,0.3)', color: '#ff6600' }}
            >
              SCRUB
            </button>
          </div>
        </div>

        {/* Mission list */}
        <div>
          <div className="orbitron text-xs mb-3" style={{ color: '#ff6600', letterSpacing: '3px' }}>ACTIVE MISSIONS</div>
          <div className="space-y-2">
            {missions.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5 cursor-pointer"
                style={{ border: `1px solid ${m.color}22`, background: `${m.color}05` }}
              >
                <div className="text-2xl">🚀</div>
                <div className="flex-1">
                  <div className="orbitron text-sm font-bold" style={{ color: m.color }}>{m.name}</div>
                  <div className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{m.type} · {m.payload}</div>
                  <div className="share-tech" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{m.site}</div>
                </div>
                <div
                  className="share-tech text-xs px-3 py-1 rounded-lg"
                  style={{ background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44` }}
                >
                  {m.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Launches', value: '387', icon: '🚀', color: '#ff6600' },
            { label: 'Booster Landings', value: '340', icon: '🛬', color: '#00f5ff' },
            { label: 'Crew in Space', value: '12', icon: '👨‍🚀', color: '#00ff88' },
            { label: 'Starlinks Active', value: '12,847', icon: '🛰️', color: '#bf00ff' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(0,245,255,0.04)', border: `1px solid ${s.color}22` }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="orbitron text-lg font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
