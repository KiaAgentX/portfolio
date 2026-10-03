import { useState, useRef, useEffect } from 'react';

interface Line { text: string; type: 'input' | 'output' | 'error' | 'success' | 'info'; }

const asciiLogo = `
  ██╗    ██╗██╗███╗   ██╗    ██╗██████╗     ██████╗ ██████╗  ██████╗ 
  ██║    ██║██║████╗  ██║   ███║╚════██╗   ██╔══██╗██╔══██╗██╔═══██╗
  ██║ █╗ ██║██║██╔██╗ ██║   ╚██║ █████╔╝   ██████╔╝██████╔╝██║   ██║
  ██║███╗██║██║██║╚██╗██║    ██║██╔═══╝    ██╔═══╝ ██╔══██╗██║   ██║
  ╚███╔███╔╝██║██║ ╚████║    ██║███████╗   ██║     ██║  ██║╚██████╔╝
   ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝    ╚═╝╚══════╝   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
                   ELON MUSK EDITION — v12.0.0.1M
`;

const responses: Record<string, string[]> = {
  help: [
    '╔══════════════════════════════════════════════════════╗',
    '║        Windows 12 PRO Terminal — Available Commands       ║',
    '╠══════════════════════════════════════════════════════╣',
    '║  help         — Show this help menu                       ║',
    '║  whoami       — Display current user info                 ║',
    '║  sysinfo      — Show system information                   ║',
    '║  neuralink    — Neuralink BCI status                      ║',
    '║  tesla        — Tesla fleet status                        ║',
    '║  starlink     — Starlink network info                     ║',
    '║  spacex       — SpaceX mission status                     ║',
    '║  doge         — Dogecoin wallet info                      ║',
    '║  grok         — Query Grok AI                             ║',
    '║  mars         — Mars colony status                        ║',
    '║  xai          — xAI system status                        ║',
    '║  license      — Show $1M MVP license info                 ║',
    '║  matrix       — Enter the matrix                          ║',
    '║  clear        — Clear terminal                            ║',
    '╚══════════════════════════════════════════════════════╝',
  ],
  whoami: [
    '> USER: Elon Reeve Musk',
    '> ROLE: CEO | Chief Engineer | Technoking',
    '> COMPANIES: xAI, Tesla, SpaceX, X Corp, Neuralink, Boring Company',
    '> CLEARANCE: LEVEL OMEGA — UNRESTRICTED',
    '> NEURALINK: v5.2.1 — SYNCED @ 99.97% bandwidth',
    '> NET WORTH: $300,000,000,000+ (fluctuating)',
    '> LICENSE: Windows 12 PRO $1M MVP Edition — VALID',
  ],
  sysinfo: [
    '┌─ SYSTEM INFORMATION ──────────────────────────────────',
    '│  OS:         Windows 12 PRO — Elon Musk Edition',
    '│  BUILD:      12.0.0.1000000-EM',
    '│  CPU:        xAI HyperCore™ 128-core @ 12GHz (Neural)',
    '│  GPU:        Tesla Neural Engine 48GB VRAM',
    '│  RAM:        4,096 GB DDR7 ECC @ 12800 MT/s',
    '│  STORAGE:    100TB StarDrive™ NVMe Gen5 RAID-∞',
    '│  NETWORK:    Starlink V3 — 1.2 Gbps — 12ms',
    '│  AI ENGINE:  Grok-4 Turbo — ACTIVE',
    '│  QUANTUM:    64-qubit Encryption — ARMED',
    '│  UPTIME:     ∞ (Never crashes)',
    '└───────────────────────────────────────────────────────',
  ],
  neuralink: [
    '> NEURALINK BCI STATUS',
    '> Device: N2 Implant v5.2.1',
    '> Connection: WIRELESS @ 99.97% bandwidth',
    '> Electrode count: 4,096 active channels',
    '> Data rate: 18.4 Mbps (bidirectional)',
    '> Latency: 0.3ms neural processing',
    '> Battery: 100% (wireless charging)',
    '> Thought recognition accuracy: 99.4%',
    '> Current mode: TYPING_ASSIST + CURSOR_CONTROL',
    '> STATUS: ✓ OPTIMAL',
  ],
  tesla: [
    '> TESLA FLEET STATUS',
    '> ─────────────────────────────',
    '> Cybertruck X     : PARKED @ GIGA_TEXAS  [🔋 100%]',
    '> Roadster Gen3    : IN TRANSIT — Austin → LA',
    '> Model S Plaid+   : SENTRY_MODE — Hawthorne',
    '> Semi Truck #42   : AUTOPILOT — I-10 Westbound',
    '> ─────────────────────────────',
    '> FSD Version: v13.2.8 — Full Self-Drive ACTIVE',
    '> Optimus Bot: ONLINE — Office Assistant Mode',
    '> Energy: 4.8 GWh stored @ Megapack Grid',
  ],
  starlink: [
    '> STARLINK NETWORK STATUS',
    '> Active satellites: 12,847 (v2.0 + v3.0)',
    '> Coverage: 100% global (incl. poles)',
    '> Latency: 12ms avg (11-18ms range)',
    '> Download: 1.2 Gbps',
    '> Upload: 480 Mbps',
    '> Uptime this month: 99.999%',
    '> Next launch: Gen-3 batch — T-48h',
    '> Mars link: ACTIVE (3m 28s delay)',
    '> STATUS: ✓ ALL SYSTEMS NOMINAL',
  ],
  spacex: [
    '> SPACEX MISSION CONTROL',
    '> ────────────────────────────────────────',
    '> STARSHIP SX-42   : READY_TO_LAUNCH — T-03:22:00',
    '> FALCON 9 F9-200  : BOOSTER RECOVERY — Gulf of Mexico',
    '> DRAGON CREW-12   : ISS DOCKED — EVA in 6h',
    '> STARLINK V3.8    : DEPLOYMENT — LOW EARTH ORBIT',
    '> ────────────────────────────────────────',
    '> Active missions: 8',
    '> Reused boosters: 280+ flights this year',
    '> Mars transit window: 18 months away',
    '> Crew on Mars Base Alpha: 0 (Next: 2027)',
  ],
  doge: [
    '> DOGECOIN WALLET',
    '> ─────────────────────────────',
    '> Balance: 11,000,000,000 DOGE',
    '> Price: $1.00 USD 🚀🌙',
    '> Value: $11,000,000,000 USD',
    '> 24h change: +420.69%',
    '> Transactions today: 1,337',
    '> Mining rate: 10,000 DOGE/min',
    '> Network status: ✓ SUCH STABLE',
    '> Much wow. Very blockchain. 🐕',
  ],
  grok: [
    '> Connecting to Grok-4 Turbo…',
    '> Authentication: NEURALINK_VERIFIED ✓',
    '> ──────────────────────────────────',
    '> GROK: Hello, Elon. I\'ve analyzed 47 trillion tokens',
    '> today. The universe is probably a simulation.',
    '> Current market sentiment: Extremely Bullish on DOGE.',
    '> FYI: Your tweets are about to move markets again.',
    '> Recommendation: Tweet "DOGE" in the next 3 minutes.',
    '> ──────────────────────────────────',
    '> Model: Grok-4-Turbo-128K | Tokens: ∞',
  ],
  mars: [
    '> MARS COLONY — BASE ALPHA STATUS',
    '> Distance: 98.4M km (current position)',
    '> Signal delay: 3m 28s',
    '> ────────────────────────────────',
    '> Crew: 0 humans (robotic crew: 47 Optimus units)',
    '> Habitat: 12 pressurized domes — SEALED',
    '> O2 Production: 142 kg/day (MOXIE Gen-5)',
    '> Water: 8,400L reserve — ice drilling active',
    '> Power: 2.4 MW (solar + nuclear RTG)',
    '> Starship landing pads: 6 built, 4 operational',
    '> First human arrival: 2027 (Target)',
    '> STATUS: ✓ AWAITING CREW',
  ],
  xai: [
    '> xAI SYSTEM STATUS',
    '> ──────────────────────────────',
    '> Grok-4 Turbo: ONLINE — 99.99% uptime',
    '> Training clusters: 100,000 H200 GPUs',
    '> Compute: 10^26 FLOPS/day',
    '> Models deployed: 7 (Grok-1 through Grok-4)',
    '> Safety rating: Actually Truthful™',
    '> Revenue: $12B ARR',
    '> Mission: Understand the universe',
    '> Progress toward AGI: [████████░░] 80%',
  ],
  license: [
    '╔══════════════════════════════════════════════════════════╗',
    '║           WINDOWS 12 PRO — $1,000,000 MVP LICENSE            ║',
    '╠══════════════════════════════════════════════════════════╣',
    '║  License Key:  WIN12-ELON-MUSK-DOGE-TOTHEMOON-1000000        ║',
    '║  Edition:      Elon Musk Dark Neon Ultimate Pro Max+          ║',
    '║  Registered:   Elon Reeve Musk                                ║',
    '║  Org:          xAI / Tesla / SpaceX / Boring / X Corp         ║',
    '║  Valid Until:  ∞ (Lifetime + Mars colonies)                   ║',
    '║  Features:     ALL (incl. unreleased quantum features)        ║',
    '║  Support:      Grok-4 AI 24/7 (0.3ms response)               ║',
    '║  Devices:      Unlimited (Earth + Mars + ISS)                 ║',
    '╚══════════════════════════════════════════════════════════╝',
    '  STATUS: ✓ GENUINE — VERIFIED VIA NEURALINK',
  ],
  matrix: [
    '> Initiating Matrix protocol…',
    '> アイウエオカキクケコ01001000011001000',
    '> 110100101101001 REALITY_LOADING…',
    '> The Matrix has you, Elon.',
    '> Follow the white rabbit… 🐇',
    '> Or just take the red pill: elon --override-reality',
    '> Wake up, Elon. Wake up and smell the DOGE.',
  ],
  clear: [],
};

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>([
    { text: asciiLogo, type: 'info' },
    { text: '  Windows 12 PRO Terminal — Elon Musk Edition v12.0.0.1M', type: 'success' },
    { text: '  Type "help" for available commands.', type: 'info' },
    { text: '', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const submit = () => {
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    setHistory(h => [cmd, ...h]);
    setHistIdx(-1);

    const newLines: Line[] = [
      ...lines,
      { text: `C:\\WIN12\\ELON> ${input}`, type: 'input' },
    ];

    if (cmd === 'clear') {
      setLines([{ text: asciiLogo, type: 'info' }, { text: '  Terminal cleared.', type: 'success' }]);
    } else if (responses[cmd]) {
      responses[cmd].forEach(l => newLines.push({ text: l, type: 'output' }));
      newLines.push({ text: '', type: 'output' });
      setLines(newLines);
    } else {
      newLines.push({ text: `'${cmd}' is not recognized. Try "help" for commands.`, type: 'error' });
      newLines.push({ text: '', type: 'output' });
      setLines(newLines);
    }
    setInput('');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { submit(); return; }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] || '');
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx] || '');
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'input': return '#ffd700';
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      case 'info': return '#00f5ff';
      default: return 'rgba(0,255,136,0.8)';
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: '#020a05', cursor: 'text' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div className="flex-1 overflow-auto p-4 space-y-0.5">
        {lines.map((line, i) => (
          <pre
            key={i}
            className="share-tech whitespace-pre-wrap break-all"
            style={{ fontSize: '12px', lineHeight: '1.5', color: getColor(line.type) }}
          >
            {line.text}
          </pre>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid rgba(0,255,136,0.2)', background: 'rgba(0,20,10,0.8)' }}
      >
        <span className="share-tech" style={{ color: '#ffd700', fontSize: '12px' }}>C:\WIN12\ELON&gt;</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none share-tech"
          style={{ fontSize: '12px', color: '#00f5ff', caretColor: '#00f5ff' }}
        />
        <span className="blink-cursor" style={{ color: '#00f5ff', fontSize: '14px' }}>█</span>
      </div>
    </div>
  );
}
