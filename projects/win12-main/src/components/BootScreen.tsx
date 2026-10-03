import { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const bootMessages = [
  '[INIT] Windows 12 PRO — Elon Musk Edition v12.0.0.1M',
  '[BOOT] Loading HyperCore™ Neural Processor… OK',
  '[INIT] Initializing Grok-4 AI Assistant… CONNECTED',
  '[BOOT] Mounting StarDrive™ 100TB NVMe Array… OK',
  '[NET]  Establishing Starlink Mesh Network… 12ms ping',
  '[SEC]  Quantum Encryption Layer… ACTIVE',
  '[INIT] xAI Cortex Integration… ONLINE',
  '[BOOT] Tesla Neural Interface™… PAIRED',
  '[INIT] SpaceX Orbital Uplink… CONNECTED',
  '[AI]   Loading Elon Brain™ Decision Engine… OK',
  '[SEC]  Neuralink Authentication… VERIFIED',
  '[INIT] Mars Colony Sync… 3 min 28s delay — OK',
  '[BOOT] Dogecoin Wallet Node… SYNCING',
  '[SYS]  $1,000,000 MVP License Verified… VALID ✓',
  '[INIT] Starting Windows 12 PRO Shell… READY',
];

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'boot' | 'logo' | 'loading'>('logo');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loading'), 1200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    let idx = 0;
    const addLine = () => {
      if (idx < bootMessages.length) {
        const line = bootMessages[idx]; // capture now: the updater runs async, after idx++
        setLines(prev => [...prev, line]);
        setProgress(Math.round(((idx + 1) / bootMessages.length) * 100));
        idx++;
        setTimeout(addLine, 140 + Math.random() * 120);
      } else {
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    };
    addLine();
  }, [phase]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #020818 0%, #010408 60%, #000000 100%)',
        zIndex: 9999,
        opacity: done ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Scan line */}
      <div className="scan-line" style={{ zIndex: 1 }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Logo Phase */}
      {phase === 'logo' && (
        <div className="flex flex-col items-center gap-6" style={{ animation: 'bootSequence 0.8s ease' }}>
          {/* Windows logo */}
          <div className="relative">
            <div className="float-anim">
              <svg width="80" height="80" viewBox="0 0 88 88" fill="none">
                <rect x="2" y="2" width="38" height="38" rx="4" fill="url(#g1)" style={{filter:'drop-shadow(0 0 12px #00f5ff)'}} />
                <rect x="48" y="2" width="38" height="38" rx="4" fill="url(#g2)" style={{filter:'drop-shadow(0 0 12px #bf00ff)'}} />
                <rect x="2" y="48" width="38" height="38" rx="4" fill="url(#g3)" style={{filter:'drop-shadow(0 0 12px #00ff88)'}} />
                <rect x="48" y="48" width="38" height="38" rx="4" fill="url(#g4)" style={{filter:'drop-shadow(0 0 12px #ff0090)'}} />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#00f5ff"/><stop offset="1" stopColor="#0088ff"/></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#bf00ff"/><stop offset="1" stopColor="#7700ff"/></linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#00ff88"/><stop offset="1" stopColor="#00ccaa"/></linearGradient>
                  <linearGradient id="g4" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#ff0090"/><stop offset="1" stopColor="#ff6600"/></linearGradient>
                </defs>
              </svg>
            </div>
            {/* Orbital ring */}
            <div
              className="absolute"
              style={{
                inset: '-20px',
                border: '1px solid rgba(0,245,255,0.3)',
                borderRadius: '50%',
                animation: 'rotate360 4s linear infinite',
              }}
            />
          </div>
          <div className="text-center">
            <div className="orbitron text-3xl font-black neon-text-cyan" style={{letterSpacing:'6px'}}>WINDOWS 12 PRO</div>
            <div className="orbitron text-sm font-bold neon-text-gold mt-1" style={{letterSpacing:'8px'}}>ELON MUSK EDITION</div>
          </div>
          <div className="share-tech text-xs neon-text-cyan opacity-60" style={{letterSpacing:'3px'}}>$1,000,000 MVP LICENSE</div>
        </div>
      )}

      {/* Loading Phase */}
      {phase === 'loading' && (
        <div className="w-full max-w-2xl px-8 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center mb-2">
            <div className="orbitron text-xl font-black neon-text-cyan" style={{letterSpacing:'4px'}}>WINDOWS 12 PRO</div>
            <div className="orbitron text-xs neon-text-gold" style={{letterSpacing:'6px'}}>ELON MUSK EDITION — SYSTEM BOOT</div>
          </div>

          {/* Terminal */}
          <div
            className="rounded-lg p-4 overflow-hidden"
            style={{
              background: 'rgba(0,5,10,0.9)',
              border: '1px solid rgba(0,245,255,0.3)',
              height: '280px',
              boxShadow: '0 0 30px rgba(0,245,255,0.1)',
            }}
          >
            <div className="terminal-text space-y-1 overflow-auto h-full">
              {lines.map((line, i) => (
                <div key={i} style={{ animation: 'fadeIn 0.2s ease' }}>
                  <span style={{ color: line.startsWith('[INIT]') ? '#00f5ff' : line.startsWith('[SEC]') ? '#ff0090' : line.startsWith('[AI]') ? '#bf00ff' : line.startsWith('[NET]') ? '#00ff88' : '#ffd700' }}>
                    {line}
                  </span>
                </div>
              ))}
              {!done && <span className="blink-cursor" style={{ color: '#00f5ff' }}>█</span>}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between share-tech text-xs" style={{ color: 'rgba(0,245,255,0.7)' }}>
              <span>INITIALIZING SYSTEM…</span>
              <span className="neon-text-cyan">{progress}%</span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '6px', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #00f5ff, #bf00ff)',
                  boxShadow: '0 0 12px #00f5ff',
                }}
              />
            </div>
          </div>

          {/* Bottom info */}
          <div className="flex justify-between share-tech text-xs" style={{ color: 'rgba(0,245,255,0.4)' }}>
            <span>BUILD: 12.0.0.1000000-EM</span>
            <span>xAI SECURE BOOT™</span>
            <span>NEURALINK VERIFIED</span>
          </div>
        </div>
      )}
    </div>
  );
}
