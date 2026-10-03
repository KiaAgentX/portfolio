import { useState } from 'react';

export default function TeslaApp() {
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [climate, setClimate] = useState(72);
  const [locked, setLocked] = useState(true);
  const [sentry, setSentry] = useState(true);

  const vehicles = [
    { name: 'Cybertruck X', status: 'PARKED', battery: 100, range: 520, location: 'Giga Texas', color: '#00f5ff', icon: '🛻' },
    { name: 'Roadster Gen3', status: 'IN TRANSIT', battery: 62, range: 310, location: 'I-10 @ Austin', color: '#ff0090', icon: '🏎️' },
    { name: 'Model S Plaid+', status: 'SENTRY', battery: 88, range: 450, location: 'Hawthorne HQ', color: '#bf00ff', icon: '🚗' },
    { name: 'Semi Truck #42', status: 'AUTOPILOT', battery: 74, range: 380, location: 'I-10 W', color: '#00ff88', icon: '🚛' },
  ];

  const v = vehicles[selectedVehicle];

  return (
    <div className="h-full flex" style={{ background: '#030a08' }}>
      {/* Sidebar */}
      <div
        className="w-52 shrink-0 flex flex-col py-3 gap-1"
        style={{ borderRight: '1px solid rgba(255,0,144,0.2)', background: 'rgba(5,0,15,0.8)' }}
      >
        <div className="px-4 pb-3" style={{ borderBottom: '1px solid rgba(255,0,144,0.15)' }}>
          <div className="orbitron text-xs font-bold" style={{ color: '#ff0090', letterSpacing: '2px' }}>TESLA HUB</div>
          <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,0,144,0.5)' }}>FSD v13.2.8 Active</div>
        </div>
        {vehicles.map((vehicle, i) => (
          <button
            key={i}
            className="text-left px-4 py-3 transition-all"
            style={{
              background: selectedVehicle === i ? `${vehicle.color}11` : 'transparent',
              borderLeft: selectedVehicle === i ? `2px solid ${vehicle.color}` : '2px solid transparent',
            }}
            onClick={() => setSelectedVehicle(i)}
          >
            <div className="flex items-center gap-2">
              <span>{vehicle.icon}</span>
              <div>
                <div className="share-tech text-xs" style={{ color: selectedVehicle === i ? vehicle.color : 'rgba(255,255,255,0.6)' }}>{vehicle.name}</div>
                <div className="share-tech" style={{ fontSize: '10px', color: vehicle.color + '88' }}>{vehicle.status}</div>
              </div>
            </div>
          </button>
        ))}

        <div className="mt-auto px-4 py-3" style={{ borderTop: '1px solid rgba(255,0,144,0.15)' }}>
          <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Optimus Bot</div>
          <div className="share-tech text-xs" style={{ color: '#00ff88' }}>● ONLINE</div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto p-5">
        {/* Vehicle header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="orbitron text-xl font-black" style={{ color: v.color }}>{v.name}</div>
            <div className="share-tech text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>📍 {v.location}</div>
          </div>
          <div
            className="px-4 py-2 rounded-xl share-tech text-xs font-bold"
            style={{
              background: `${v.color}22`,
              border: `1px solid ${v.color}55`,
              color: v.color,
              boxShadow: `0 0 15px ${v.color}22`,
            }}
          >
            ● {v.status}
          </div>
        </div>

        {/* Vehicle visual */}
        <div
          className="rounded-2xl p-6 mb-5 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at center, ${v.color}08 0%, rgba(5,10,20,0.9) 70%)`,
            border: `1px solid ${v.color}33`,
            height: '180px',
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${v.color}08 1px, transparent 1px), linear-gradient(90deg, ${v.color}08 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          <div className="text-8xl" style={{ filter: `drop-shadow(0 0 20px ${v.color})` }}>{v.icon}</div>
          {/* Scanning line */}
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${v.color}, transparent)`,
              animation: 'scanline 2s linear infinite',
              boxShadow: `0 0 8px ${v.color}`,
            }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Battery', value: `${v.battery}%`, icon: '🔋', color: v.battery > 80 ? '#00ff88' : v.battery > 40 ? '#ffd700' : '#ff4444' },
            { label: 'Range', value: `${v.range} mi`, icon: '📍', color: v.color },
            { label: 'FSD', value: 'v13.2.8', icon: '🤖', color: '#bf00ff' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(0,245,255,0.04)', border: `1px solid ${s.color}22` }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="orbitron text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Battery bar */}
        <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)' }}>
          <div className="flex justify-between mb-2">
            <span className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Battery Level</span>
            <span className="share-tech text-xs" style={{ color: v.battery > 80 ? '#00ff88' : '#ffd700' }}>{v.battery}% — {v.range} mi</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${v.battery}%`,
                background: v.battery > 80 ? 'linear-gradient(90deg, #00ff88, #00cc66)' : 'linear-gradient(90deg, #ffd700, #ff8800)',
                boxShadow: `0 0 10px ${v.battery > 80 ? '#00ff88' : '#ffd700'}`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="p-3 rounded-xl flex items-center gap-3 transition-all"
            style={{
              background: locked ? 'rgba(255,200,0,0.08)' : 'rgba(0,255,136,0.08)',
              border: `1px solid ${locked ? 'rgba(255,200,0,0.3)' : 'rgba(0,255,136,0.3)'}`,
            }}
            onClick={() => setLocked(!locked)}
          >
            <span className="text-xl">{locked ? '🔒' : '🔓'}</span>
            <div>
              <div className="share-tech text-xs" style={{ color: locked ? '#ffc000' : '#00ff88' }}>{locked ? 'LOCKED' : 'UNLOCKED'}</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Tap to toggle</div>
            </div>
          </button>

          <button
            className="p-3 rounded-xl flex items-center gap-3 transition-all"
            style={{
              background: sentry ? 'rgba(191,0,255,0.08)' : 'rgba(0,0,0,0.3)',
              border: `1px solid ${sentry ? 'rgba(191,0,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            }}
            onClick={() => setSentry(!sentry)}
          >
            <span className="text-xl">👁️</span>
            <div>
              <div className="share-tech text-xs" style={{ color: sentry ? '#bf00ff' : 'rgba(255,255,255,0.4)' }}>SENTRY {sentry ? 'ON' : 'OFF'}</div>
              <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>360° cameras</div>
            </div>
          </button>

          <div
            className="p-3 rounded-xl col-span-2"
            style={{ background: 'rgba(255,0,144,0.05)', border: '1px solid rgba(255,0,144,0.2)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌡️</span>
                <span className="share-tech text-xs" style={{ color: '#ff0090' }}>CLIMATE CONTROL</span>
              </div>
              <span className="orbitron text-sm font-bold" style={{ color: '#ff0090' }}>{climate}°F</span>
            </div>
            <input
              type="range" min={60} max={90} value={climate}
              onChange={e => setClimate(+e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
