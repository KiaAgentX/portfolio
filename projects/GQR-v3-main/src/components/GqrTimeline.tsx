import React, { useState } from 'react';
import { 
  GitCommit, 
  Cpu, 
  TrendingUp, 
  Zap, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Activity,
  Award
} from 'lucide-react';

interface TimelineRelease {
  version: string;
  codename: string;
  date: string;
  status: 'legacy' | 'active' | 'future';
  tagline: string;
  description: string;
  features: string[];
  metrics: { label: string; value: string }[];
  icon: React.ComponentType<{ className?: string }>;
}

const gqrReleases: TimelineRelease[] = [
  {
    version: 'GQR v1.0',
    codename: 'Stochastic Resonance',
    date: 'OCT 2024',
    status: 'legacy',
    tagline: 'Simple statistical arbitrage with hardcoded envelope margins.',
    description: 'The genesis blueprint of the Geometric Quant Reinforcement engine. Established deterministic volatility band thresholds for raw gold spot contracts, running batch calculations in isolated node containers.',
    features: [
      'Basic moving average crossover triggers',
      'Local local-storage transaction log audits',
      'Crude static envelope risk bounds'
    ],
    metrics: [
      { label: 'Latency', value: '420ms' },
      { label: 'Win Rate', value: '54.2%' },
      { label: 'Max Drawdown', value: '18.4%' }
    ],
    icon: GitCommit
  },
  {
    version: 'GQR v2.3',
    codename: 'Deep Synaptic',
    date: 'MAR 2025',
    status: 'legacy',
    tagline: 'Introduction of shallow feed-forward layers & local Adam gradients.',
    description: 'Transitioned from hardcoded heuristics to model-driven probabilistic trading. Leveraged our first offline weight-backpropagation engine to update neural values across live market tickers.',
    features: [
      '3-Layer sequential feedforward topology',
      'Adaptive learning convergence rates (Eta)',
      'Local browser state ledger preservation'
    ],
    metrics: [
      { label: 'Latency', value: '120ms' },
      { label: 'Win Rate', value: '62.8%' },
      { label: 'Max Drawdown', value: '11.5%' }
    ],
    icon: Layers
  },
  {
    version: 'GQR v3.8',
    codename: 'Pythian Oracle',
    date: 'SEP 2025',
    status: 'legacy',
    tagline: 'Modern smart-money indicators with currency correlations.',
    description: 'A revolutionary jump bringing multi-indicator tracking to Pythian systems. Standardized dynamic EURUSD and dollar index (DXY) correlations to gauge the physical backing of spot prices.',
    features: [
      'Negative dollar index (DXY) correlation matrix',
      'Swing support & resistance finder grids',
      'Configurable attention gate coefficient ratios'
    ],
    metrics: [
      { label: 'Latency', value: '45ms' },
      { label: 'Win Rate', value: '71.5%' },
      { label: 'Max Drawdown', value: '6.2%' }
    ],
    icon: Cpu
  },
  {
    version: 'GQR v4.5',
    codename: 'Cybernetic Autopilot',
    date: 'MAR 2026',
    status: 'active',
    tagline: 'Autonomous Q-learning neural loops and TradingView synchronization.',
    description: 'Our state-of-the-art live release. Merges microsecond price feeds from TradingView with direct, model-authoritative reinforcement trade executions, reporting loss MSE in real time.',
    features: [
      'Fully autonomous Q-learning model coprocessor',
      'Live TradingView socket data streaming integration',
      'High-fidelity interactive Q-reward visualizer'
    ],
    metrics: [
      { label: 'Latency', value: '12ms' },
      { label: 'Win Rate', value: '78.4%' },
      { label: 'Max Drawdown', value: '3.1%' }
    ],
    icon: Zap
  },
  {
    version: 'GQR v5.0-Beta',
    codename: 'Axiom Grok',
    date: 'JUN 2026',
    status: 'future',
    tagline: 'Physics-first mass reduction and grok multi-agent consensus.',
    description: 'The frontier of quantitative machine intelligence. Overhauls neural structures into a streamlined, high-performance, first-principles vector that completely avoids over-parameterized weights.',
    features: [
      'xAI Grok multi-agent telemetry consensus',
      'First-principles "Mass Reduction" node topology',
      'Real-time automated sovereign hedging arrays'
    ],
    metrics: [
      { label: 'Latency', value: '<2ms' },
      { label: 'Win Rate', value: '86.5% (Proj.)' },
      { label: 'Max Drawdown', value: '1.2% (Proj.)' }
    ],
    icon: Award
  }
];

export default function GqrTimeline() {
  const [selectedIdx, setSelectedIdx] = useState<number>(3); // Default to live GQR v4.5
  const [modalRelease, setModalRelease] = useState<TimelineRelease | null>(null);
  const selectedRelease = gqrReleases[selectedIdx];

  const handleNodeClick = (index: number) => {
    setSelectedIdx(index);
    setModalRelease(gqrReleases[index]);
  };

  const handlePrevRelease = () => {
    if (!modalRelease) return;
    const currentIdx = gqrReleases.findIndex(r => r.version === modalRelease.version);
    const prevIdx = (currentIdx - 1 + gqrReleases.length) % gqrReleases.length;
    setModalRelease(gqrReleases[prevIdx]);
    setSelectedIdx(prevIdx);
  };

  const handleNextRelease = () => {
    if (!modalRelease) return;
    const currentIdx = gqrReleases.findIndex(r => r.version === modalRelease.version);
    const nextIdx = (currentIdx + 1) % gqrReleases.length;
    setModalRelease(gqrReleases[nextIdx]);
    setSelectedIdx(nextIdx);
  };

  return (
    <div className="mt-8 border-t border-zinc-850/60 pt-6" id="gqr-evolution-timeline-container">
      {/* Title & Metadata Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div className="space-y-0.5">
          <span className="text-[9.5px] font-mono text-cyan-400 font-bold tracking-widest uppercase block">
            HISTORICAL LOGS & ROADMAP
          </span>
          <h4 className="font-serif font-black text-sm text-zinc-100 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            GQR Engine Evolution Pathway
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] bg-black/40 px-2.5 py-1 rounded border border-zinc-850">
          <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-zinc-400">ACTIVE STANDARD: GQR v4.5 PYTHIAN</span>
        </div>
      </div>

      {/* Horizontal Trail Container */}
      <div className="relative mb-6 pb-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {/* Horizontal Connector Line */}
        <div className="absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-zinc-850 pointer-events-none" />
        
        {/* Progress Fill bar up to active release index (3) */}
        <div 
          className="absolute top-[28px] left-[40px] h-[2px] bg-gradient-to-r from-cyan-605 to-cyan-400 transition-all duration-500 pointer-events-none" 
          style={{ width: `${(Math.min(selectedIdx, 3) / (gqrReleases.length - 1)) * 92}%` }}
        />

        <div className="flex justify-between items-center min-w-[640px] px-4 gap-2">
          {gqrReleases.map((release, index) => {
            const Icon = release.icon;
            const isSelected = index === selectedIdx;
            const isLegacy = release.status === 'legacy';
            const isActive = release.status === 'active';
            const isFuture = release.status === 'future';

            let ringClass = "border-zinc-800 text-zinc-500 bg-[#090b0d]";
            let dotClass = "bg-zinc-750";

            if (isSelected) {
              ringClass = "border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-[0_0_12px_rgba(34,211,238,0.30)] scale-110";
              dotClass = "bg-cyan-400 animate-pulse";
            } else if (isLegacy) {
              ringClass = "border-zinc-700/80 text-zinc-350 hover:border-zinc-550 hover:text-zinc-100 bg-[#0d0e10]/80";
              dotClass = "bg-zinc-650";
            } else if (isActive) {
              ringClass = "border-emerald-500 text-emerald-400 bg-emerald-950/10 hover:border-emerald-405 hover:text-emerald-350";
              dotClass = "bg-emerald-500";
            } else if (isFuture) {
              ringClass = "border-purple-500/40 text-purple-400/70 bg-[#0e0c12] hover:border-purple-500/80 hover:text-purple-305";
              dotClass = "bg-purple-550";
            }

            return (
              <button
                key={release.version}
                id={`timeline-node-${release.version.replace('.', '-')}`}
                onClick={() => handleNodeClick(index)}
                className="flex flex-col items-center group relative cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-lg p-1.5 transition-all"
                style={{ flex: '1 1 0%' }}
              >
                {/* Node Date Upper Callout */}
                <span className={`text-[8.5px] font-mono font-bold tracking-widest mb-2 transition-colors ${
                  isSelected ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-350'
                }`}>
                  {release.date}
                </span>

                {/* Node Ring Icon */}
                <div className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${ringClass}`}>
                  <Icon className="h-4.5 w-4.5" />
                  
                  {/* Status Indicator Little Floating Dot */}
                  <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-black ${dotClass}`} />
                </div>

                {/* Node Version Label */}
                <span className={`text-[10px] font-mono font-black uppercase mt-2.5 transition-colors ${
                  isSelected ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  {release.version}
                </span>

                {/* Status custom badge subtext */}
                <span className={`text-[8px] font-mono tracking-wider font-semibold uppercase ${
                  isActive ? 'text-emerald-400' : isFuture ? 'text-purple-400' : 'text-zinc-500'
                }`}>
                  {release.status === 'active' ? 'LIVE' : release.status === 'future' ? 'STAGE_5' : 'DEPRECATED'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Release Showcase HUD Panel */}
      <div 
        id="timeline-showcase-panel" 
        className="bg-black/75 border border-zinc-850/90 rounded-xl p-4 sm:p-5 relative overflow-hidden transition-all duration-505"
      >
        {/* Glow corner reflecting release type */}
        <div className={`absolute top-0 right-0 h-28 w-28 rounded-full blur-[45px] opacity-10 pointer-events-none transition-all duration-500 ${
          selectedRelease.status === 'active' 
            ? 'bg-emerald-500' 
            : selectedRelease.status === 'future' 
              ? 'bg-purple-500' 
              : 'bg-cyan-500'
        }`} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Info Columns (7/12 span) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-950/40 text-cyan-400 text-[8.5px] font-mono font-black rounded border border-cyan-500/20 uppercase tracking-widest">
                Release Spec File
              </span>
              <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black rounded border uppercase tracking-widest ${
                selectedRelease.status === 'active'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                  : selectedRelease.status === 'future'
                    ? 'bg-purple-950/40 text-purple-400 border-purple-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {selectedRelease.status}
              </span>
              <button 
                onClick={() => setModalRelease(selectedRelease)}
                className="px-2.5 py-0.5 bg-cyan-400 text-black text-[8.5px] font-mono font-black rounded hover:bg-cyan-300 transition-colors uppercase tracking-widest cursor-pointer ml-auto"
              >
                Launch Spec Hub
              </button>
            </div>

            <div className="space-y-1">
              <h5 className="font-serif font-black text-base text-zinc-100 flex items-center gap-1.5 uppercase">
                {selectedRelease.version} <span className="text-zinc-500 font-sans font-light">|</span> <span className="text-cyan-400">{selectedRelease.codename}</span>
              </h5>
              <p className="text-[11px] text-zinc-350 italic font-medium leading-relaxed font-sans">
                "{selectedRelease.tagline}"
              </p>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {selectedRelease.description}
            </p>

            {/* Configured Release Features */}
            <div className="space-y-2 pt-2">
              <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-wider block">INTEGRATED FEATURES MATRIX</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRelease.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10.5px] text-zinc-300 font-sans">
                    <ChevronRight className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Metrics Benchmarks Column (5/12 span) */}
          <div className="lg:col-span-5 h-full flex flex-col justify-between bg-black/40 border border-zinc-900 p-4 rounded-lg space-y-3">
            <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest block border-b border-zinc-900 pb-1.5 flex items-center justify-between">
              <span>BENCHMARK METRICS</span>
              <span className="text-[9px] text-[#22d3ee] font-bold">REAL-TIME SANDBOX</span>
            </span>

            <div className="grid grid-cols-3 gap-3">
              {selectedRelease.metrics.map((metric, i) => (
                <div key={i} className="text-center p-2 rounded bg-zinc-950/80 border border-zinc-900/60 flex flex-col justify-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    {metric.label}
                  </span>
                  <span className="text-xs sm:text-xs font-mono font-bold text-zinc-200">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[8.5px] font-mono text-zinc-500 bg-zinc-950/40 p-2.5 rounded border border-zinc-900/80 space-y-1 mt-1">
              <div className="flex justify-between">
                <span>VERIFICATION STATUS:</span>
                <span className="text-[#22d3ee] font-bold">SUCCESSFUL</span>
              </div>
              <div className="flex justify-between">
                <span>TARGET SYMBOL:</span>
                <span className="text-zinc-450">XAUUSD / SPOT GOLD</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cybernetic Specification Hub Popup Modal */}
      {modalRelease && (
        <div 
          id="gqr-spec-modal-overlay"
          className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md select-none overflow-y-auto"
          onClick={() => setModalRelease(null)}
        >
          <div 
            id="gqr-spec-modal-container"
            className="w-full max-w-2xl bg-[#090b0d] border-2 border-[#c5a85c]/45 p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-2xl relative transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Decorative Gradients */}
            <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-[60px] opacity-15 pointer-events-none ${
              modalRelease.status === 'active' 
                ? 'bg-emerald-500' 
                : modalRelease.status === 'future' 
                  ? 'bg-purple-500' 
                  : 'bg-cyan-500'
            }`} />

            {/* Header section with closing trigger */}
            <div className="border-b border-zinc-850 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    modalRelease.status === 'active' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : modalRelease.status === 'future' 
                        ? 'bg-purple-400' 
                        : 'bg-cyan-400'
                  }`} />
                  <span className="text-[9.5px] font-mono font-black tracking-widest text-[#c5a85c] uppercase">
                    ENGINE SPECIFICATION SHEETS // {modalRelease.date}
                  </span>
                </div>
                <button 
                  onClick={() => setModalRelease(null)}
                  className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-450 hover:text-zinc-100 text-[10.5px] font-mono font-black border border-zinc-800 rounded transition-colors cursor-pointer"
                >
                  X CLOSE
                </button>
              </div>

              <h3 className="font-serif font-black text-xl text-zinc-100 uppercase tracking-wide mt-3 flex items-center gap-2">
                {modalRelease.version}: <span className="text-cyan-400">{modalRelease.codename}</span>
              </h3>
              <p className="text-xs text-zinc-350 italic mt-1 leading-relaxed">
                "{modalRelease.tagline}"
              </p>
            </div>

            {/* Core Description */}
            <div className="my-5.5 space-y-5">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Release Blueprint Overview</span>
                <p className="text-[12px] text-zinc-300 font-sans leading-relaxed">
                  {modalRelease.description}
                </p>
              </div>

              {/* Benchmark metrics with visual indicators */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Quant Performance Thresholds</span>
                <div className="grid grid-cols-3 gap-3.5">
                  {modalRelease.metrics.map((metric, i) => {
                    // Calculate visual status meter fills based on mock numbers
                    let progressPct = "60%";
                    let meterColor = "bg-cyan-400";
                    if (metric.label === "Latency") {
                      const val = parseInt(metric.value) || 2;
                      progressPct = val < 10 ? "95%" : val < 50 ? "85%" : val < 150 ? "60%" : "30%";
                      meterColor = "bg-amber-400";
                    } else if (metric.label === "Win Rate") {
                      const val = parseFloat(metric.value) || 50;
                      progressPct = `${val}%`;
                      meterColor = "bg-emerald-450";
                    } else if (metric.label === "Max Drawdown") {
                      const val = parseFloat(metric.value) || 20;
                      progressPct = `${100 - val * 4}%`;
                      meterColor = "bg-rose-455";
                    }

                    return (
                      <div key={i} className="bg-black/50 border border-zinc-900 rounded p-3 flex flex-col justify-between">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                          {metric.label}
                        </span>
                        <span className="text-sm font-mono font-extrabold text-zinc-150">
                          {metric.value}
                        </span>
                        <div className="w-full h-[3px] bg-zinc-900 mt-2.5 rounded-full overflow-hidden">
                          <div className={`h-full ${meterColor}`} style={{ width: progressPct }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Integrated features detailed block */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">System Features Manifest</span>
                <div className="space-y-2">
                  {modalRelease.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-200 font-sans p-2 rounded bg-black/30 border border-zinc-900/60">
                      <ChevronRight className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination Controls & Ledger Footer */}
            <div className="border-t border-zinc-850 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevRelease}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-50 border border-zinc-800 text-xs font-mono rounded cursor-pointer"
                >
                  &larr; PREV VERSION
                </button>
                <button 
                  onClick={handleNextRelease}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-50 border border-zinc-800 text-xs font-mono rounded cursor-pointer"
                >
                  NEXT VERSION &rarr;
                </button>
              </div>

              <div className="text-[9px] font-mono text-zinc-500 text-right space-y-0.5">
                <div>LEDGER BLOCK HASH SIGNATURE</div>
                <div className="text-[#c5a85c] text-[8.5px]">GQR-MDL-{modalRelease.codename.toUpperCase().replace(' ', '-')}-2026</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
