import React, { useState } from "react";
import { ConsciousnessState, ProviderType } from "../types";
import { DNA_TYPES, PROVIDER_CONFIGS } from "../data/dna";
import { Dna, Activity, Zap, Cpu, Radio, ShieldCheck, HelpCircle, Maximize2, Minimize2, Camera, Flame, Orbit, Search, X, Target, Gamepad2, Building2 } from "lucide-react";
import { MarketTicker } from "./MarketTicker";

interface BrainHUDProps {
  nodeCount: number;
  connCount: number;
  latency: number | string;
  strength: number;
  provider: ProviderType;
  model: string;
  consciousness?: ConsciousnessState;
  isRecording?: boolean;
  fullMindMode?: boolean;
  onToggleFullMind?: () => void;
  zenOrbitMode?: boolean;
  tokenVelocity?: number;
  completionTokens?: number;
  onTakeSnapshot?: () => void;
  isHeatmapActive?: boolean;
  onToggleHeatmap?: () => void;
  isClusterByDnaActive?: boolean;
  onToggleClusterByDna?: () => void;
  isFocusModeActive?: boolean;
  onToggleFocusMode?: () => void;
  isGameModeActive?: boolean;
  onToggleGameMode?: () => void;
  isCortexCityActive?: boolean;
  onToggleCortexCity?: () => void;
  totalTokens?: number;
  activeTabName?: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export const BrainHUD: React.FC<BrainHUDProps> = ({
  nodeCount,
  connCount,
  latency,
  strength,
  provider,
  model,
  consciousness = "idle",
  isRecording = false,
  fullMindMode = false,
  onToggleFullMind,
  zenOrbitMode = false,
  tokenVelocity = 0,
  completionTokens = 0,
  onTakeSnapshot,
  isHeatmapActive = false,
  onToggleHeatmap,
  isClusterByDnaActive = false,
  onToggleClusterByDna,
  isFocusModeActive = false,
  onToggleFocusMode,
  isGameModeActive = false,
  onToggleGameMode,
  isCortexCityActive = false,
  onToggleCortexCity,
  totalTokens = 0,
  activeTabName,
  searchQuery = "",
  onSearchQueryChange,
}) => {
  const [legendOpen, setLegendOpen] = useState(false);
  const provConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.gemini;

  const vel = tokenVelocity > 0 ? tokenVelocity : (consciousness === "speaking" || consciousness === "agent-processing" ? 85 : consciousness === "thinking" ? 42 : 18);
  const pct = Math.min(100, Math.round((vel / 150) * 100));

  // Consciousness styles
  const getConsciousnessStyle = (state?: ConsciousnessState | string) => {
    switch (state) {
      case "thinking":
        return { label: "THINKING...", color: "text-purple-400", border: "border-purple-500", glow: "shadow-[0_0_15px_rgba(181,101,255,0.4)]", wave: "#b565ff" };
      case "speaking":
        return { label: "SPEAKING...", color: "text-amber-300", border: "border-amber-400", glow: "shadow-[0_0_15px_rgba(255,179,71,0.4)]", wave: "#ffb347" };
      case "agent-processing":
        return { label: "AGENT PROCESSING", color: "text-orange-400", border: "border-orange-500", glow: "shadow-[0_0_20px_rgba(255,140,66,0.6)]", wave: "#ff8c42" };
      case "idle":
      default:
        return { label: "READY · SYNAPSE IDLE", color: "text-cyan-400", border: "border-cyan-500", glow: "shadow-[0_0_15px_rgba(0,212,255,0.3)]", wave: "#00d4ff" };
    }
  };

  const conStyle = getConsciousnessStyle(consciousness);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden font-mono text-xs select-none 2xl:text-sm">
      {/* Corner Brackets (Desktop / TV only) */}
      <div className="hidden sm:block absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)] 2xl:w-8 2xl:h-8" />
      <div className="hidden sm:block absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)] 2xl:w-8 2xl:h-8" />
      <div className="hidden sm:block absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)] 2xl:w-8 2xl:h-8" />
      <div className="hidden sm:block absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)] 2xl:w-8 2xl:h-8" />

      {/* Top Scan Line effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

      {/* Top Center Navigation Bar: Market Ticker */}
      <div className="absolute top-[52px] sm:top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[94vw] sm:max-w-none overflow-x-auto scrollbar-none flex items-center justify-center">
        <MarketTicker />
      </div>

      {/* Immersive Focus Mode Banner */}
      {fullMindMode && (
        <div className="absolute top-[96px] sm:top-[64px] left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="bg-purple-950/90 border border-purple-500/50 text-purple-300 px-4 py-1 rounded-full font-mono text-[10px] sm:text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shadow-[0_0_8px_#c084fc]" />
            <span className="font-bold tracking-widest uppercase">IMMERSIVE FOCUS // FULL CORTEX ACTIVE</span>
          </div>
        </div>
      )}

      {/* Zen Orbit Mode Banner */}
      {zenOrbitMode && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in duration-500 ${fullMindMode ? "top-[132px] sm:top-[100px]" : "top-[96px] sm:top-[64px]"}`}>
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-4 py-1.5 rounded-full font-mono text-[10px] sm:text-xs shadow-[0_0_25px_rgba(16,185,129,0.5)] backdrop-blur-md flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
            <span className="font-bold tracking-widest uppercase">ZEN-ORBIT MODE // IDLE NEURAL SWEEP</span>
          </div>
        </div>
      )}

      {/* Neural Density Heatmap Banner */}
      {isHeatmapActive && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in duration-300 ${fullMindMode || zenOrbitMode ? "top-[168px] sm:top-[136px]" : "top-[96px] sm:top-[64px]"}`}>
          <div className="bg-gradient-to-r from-blue-950/90 via-purple-950/90 to-red-950/90 border border-red-500/60 text-red-300 px-4 py-1 sm:py-1.5 rounded-full font-mono text-[10px] sm:text-xs shadow-[0_0_25px_rgba(239,68,68,0.5)] backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
            <span className="font-bold tracking-widest uppercase">🔥 NEURAL DENSITY HEATMAP // KNOWLEDGE HUBS (BLUE: LOW → RED: HIGH)</span>
          </div>
        </div>
      )}

      {/* Cluster by DNA Banner */}
      {isClusterByDnaActive && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in duration-300 ${fullMindMode || zenOrbitMode || isHeatmapActive ? "top-[204px] sm:top-[172px]" : "top-[96px] sm:top-[64px]"}`}>
          <div className="bg-indigo-950/90 border border-indigo-500/60 text-indigo-300 px-4 py-1 sm:py-1.5 rounded-full font-mono text-[10px] sm:text-xs shadow-[0_0_25px_rgba(99,102,241,0.5)] backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping shadow-[0_0_8px_#818cf8]" />
            <span className="font-bold tracking-widest uppercase">🧬 CLUSTERED BY DNA ARCHETYPE // SPECIALIZED SUB-CLUSTERS</span>
          </div>
        </div>
      )}

      {/* Search Neural Map Floating Bar */}
      {onSearchQueryChange && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ${fullMindMode || zenOrbitMode || isHeatmapActive || isClusterByDnaActive ? "top-[240px] sm:top-[208px]" : "top-[96px] sm:top-[64px]"}`}>
          <div className="relative flex items-center w-[260px] sm:w-[320px] bg-slate-950/90 border border-cyan-500/40 rounded-full px-3 py-1 sm:py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-xl focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(34,211,238,0.4)]">
            <Search className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0 animate-pulse" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search Map (keyword, DNA)..."
              className="bg-transparent text-[10px] sm:text-xs font-mono text-white placeholder-slate-400 outline-none w-full pr-5 truncate"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                className="absolute right-2 text-slate-400 hover:text-white p-0.5"
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Left: Neural Link Status */}
      <div className="absolute top-3 sm:top-6 left-3 sm:left-7 flex flex-col gap-1 sm:gap-1.5 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono font-bold tracking-[0.1em] sm:tracking-[0.2em] text-cyan-400 text-[10px] sm:text-xs 2xl:text-sm uppercase shadow-sm">
          <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full inline-block ${isRecording ? "bg-rose-500 animate-ping shadow-[0_0_12px_rgba(244,63,94,0.8)]" : "bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"}`} />
          <span>Neural Link: Active</span>
          {isRecording && <span className="text-rose-400 font-extrabold ml-1 px-1.5 sm:px-2 py-0.5 bg-rose-950/80 border border-rose-500 rounded-full text-[8px] sm:text-[9px] tracking-widest uppercase">REC</span>}
        </div>
        <div className={`text-[9px] sm:text-[10px] 2xl:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-1.5 font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full w-max bg-white/5 border border-white/10 ${conStyle.color} shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-xl`}>
          <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
          <span>{conStyle.label}</span>
        </div>
      </div>

      {/* Mobile / Compact Tablet Top Right: Horizontal Pill Bar (Eliminates vertical collision!) */}
      <div className="flex md:hidden absolute top-3 right-3 items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-full border border-cyan-500/30 text-[10px] font-mono text-slate-300 backdrop-blur-xl shadow-lg z-20">
        <span className="text-cyan-400 font-bold">SYN: {connCount}</span>
        <span className="text-white/20">|</span>
        <span className="text-indigo-400">{typeof latency === "number" ? `${latency}ms` : latency}</span>
        <span className="text-white/20">|</span>
        <span className="text-emerald-400">{strength.toFixed(0)}%</span>
        <span className="text-white/20">|</span>
        <span className="text-purple-400 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 animate-pulse" />{vel} T/S</span>
      </div>

      {/* Desktop / Large Tablet / TV 4K Top Right: Full Data Readouts Box */}
      <div className="hidden md:flex absolute top-6 right-7 flex-col items-end gap-1.5 text-[10px] 2xl:text-xs uppercase tracking-wider text-slate-400 bg-white/5 p-3.5 2xl:p-5 rounded-2xl 2xl:rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.1)] z-20">
        <div className="flex items-center gap-2.5">
          <span>NODES:</span>
          <span className="text-cyan-400 font-bold font-mono text-xs 2xl:text-sm">{nodeCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span>SYNAPSES:</span>
          <span className="text-cyan-400 font-bold font-mono text-xs 2xl:text-sm">{connCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span>LATENCY:</span>
          <span className="text-indigo-400 font-bold font-mono text-xs 2xl:text-sm">{typeof latency === "number" ? `${latency} ms` : latency}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span>STRENGTH:</span>
          <span className="text-emerald-400 font-bold font-mono text-xs 2xl:text-sm">{strength.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span>INTENSITY:</span>
          <span className={`font-bold font-mono text-xs 2xl:text-sm ${pct > 75 ? "text-rose-400" : pct > 40 ? "text-purple-400" : "text-cyan-400"}`}>{vel} T/S ({pct}%)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span>CAMERA:</span>
          <span className={`font-bold font-mono text-xs 2xl:text-sm ${zenOrbitMode ? "text-emerald-400 animate-pulse" : "text-slate-300"}`}>
            {zenOrbitMode ? "ZEN-ORBIT (IDLE)" : "MANUAL POV"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 border-t border-white/10 pt-1.5 mt-0.5">
          <span>PROVIDER:</span>
          <span className="text-indigo-300 font-bold font-mono 2xl:text-sm">{provConfig.label.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-2.5 max-w-[190px] 2xl:max-w-[260px] truncate">
          <span>MODEL:</span>
          <span className="text-slate-300 font-mono truncate lowercase 2xl:text-sm">{model || "—"}</span>
        </div>
      </div>

      {/* Bottom Left: Consciousness Frequency Waveform & Live Neural Intensity Radial Bar */}
      <div className="hidden sm:flex absolute bottom-5 left-20 xl:left-24 items-center gap-3.5 bg-slate-950/85 px-3.5 py-2 xl:px-4 xl:py-2.5 2xl:px-6 2xl:py-3.5 rounded-2xl 2xl:rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_0_25px_rgba(34,211,238,0.15)] z-20">
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <Radio className="w-4 h-4 2xl:w-5 2xl:h-5 text-cyan-400 animate-pulse shrink-0" />
          <span className="text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-[0.15em] font-bold text-slate-400 whitespace-nowrap">BRAINWAVE:</span>
          <svg className="w-16 h-5 2xl:w-24 2xl:h-7 overflow-visible" viewBox="0 0 64 16">
            <path
              d={
                consciousness === "thinking"
                  ? "M0,8 Q8,0 16,8 T32,8 T48,8 T64,8"
                  : consciousness === "speaking"
                  ? "M0,8 Q4,2 8,8 T16,8 T24,8 T32,8 T40,8 T48,8 T56,8 T64,8"
                  : "M0,8 L16,8 Q20,2 24,8 L40,8 Q44,14 48,8 L64,8"
              }
              fill="none"
              stroke={conStyle.wave}
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Live Neural Intensity Radial Bar */}
        <div className="flex items-center gap-2.5" title="Real-time analog gauge of AI token processing velocity & computational effort">
          <div className="relative w-8 h-8 xl:w-9 xl:h-9 2xl:w-11 2xl:h-11 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3"
                strokeDasharray="94.2"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={pct > 75 ? "#f43f5e" : pct > 40 ? "#a855f7" : "#06b6d4"}
                strokeWidth="3"
                strokeDasharray="94.2"
                strokeDashoffset={94.2 - (94.2 * pct) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_0_6px_currentColor]"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${pct > 75 ? "text-rose-400" : pct > 40 ? "text-purple-400" : "text-cyan-400"} animate-pulse`} />
            </div>
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase tracking-widest font-bold">INTENSITY</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xs xl:text-sm font-black ${pct > 75 ? "text-rose-400" : pct > 40 ? "text-purple-400" : "text-cyan-400"}`}>
                {vel}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">TOK/S</span>
            </div>
          </div>
        </div>
      </div>

      {/* DNA Legend Toggle & Panel (Repositioned on mobile to top-14 left-3 so it NEVER collides with bottom-right camera controls!) */}
      <div className="absolute top-14 left-3 md:top-auto md:left-auto md:bottom-6 md:right-7 pointer-events-auto flex flex-col items-start md:items-end z-20">
        {legendOpen && (
          <div className="mb-2 md:mb-3 w-56 sm:w-64 bg-slate-950/95 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-[0_10px_40px_rgba(34,211,238,0.25)] backdrop-blur-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <Dna className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                NEURAL DNA · 10 TYPES
              </span>
              <button onClick={() => setLegendOpen(false)} className="text-slate-400 hover:text-white px-1">✕</button>
            </div>
            <div className="space-y-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {DNA_TYPES.map((dna) => (
                <div key={dna.id} className="flex items-center justify-between text-[10px] sm:text-[11px] p-1 sm:p-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-[0_0_8px_currentColor] flex-shrink-0"
                      style={{ backgroundColor: dna.colorHex }}
                    />
                    <span className="font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-none">{dna.name}</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-mono">{dna.shape}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {onToggleHeatmap && (
            <button
              onClick={onToggleHeatmap}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                isHeatmapActive
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white font-extrabold border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse"
                  : "bg-slate-950/80 border border-white/10 text-rose-400 hover:border-rose-400/50 hover:bg-white/10 backdrop-blur-xl"
              }`}
              title="Neural Density Heatmap: Highlight most referenced nodes (blue=low, red=high)"
            >
              <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isHeatmapActive ? "text-amber-300 animate-bounce" : "text-rose-400"}`} />
              <span>HEATMAP</span>
            </button>
          )}

          {onToggleClusterByDna && (
            <button
              onClick={onToggleClusterByDna}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                isClusterByDnaActive
                  ? "bg-indigo-600 text-white font-extrabold border border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-pulse"
                  : "bg-slate-950/80 border border-white/10 text-indigo-400 hover:border-indigo-400/50 hover:bg-white/10 backdrop-blur-xl"
              }`}
              title="Cluster by DNA: Group neurons into specialized 3D sub-clusters by archetype"
            >
              <Orbit className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isClusterByDnaActive ? "text-cyan-300 animate-spin" : "text-indigo-400"}`} />
              <span>CLUSTER DNA</span>
            </button>
          )}

          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                isFocusModeActive
                  ? "bg-cyan-500 text-slate-950 font-extrabold border border-white shadow-[0_0_25px_rgba(34,211,238,0.9)] animate-pulse"
                  : "bg-slate-950/80 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 backdrop-blur-xl"
              }`}
              title={`Focus Mode: Dim non-active neurons & cinematically isolate "${activeTabName || "Current Tab"}" cluster`}
            >
              <Target className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isFocusModeActive ? "text-slate-950 animate-spin" : "text-cyan-400"}`} />
              <span>{isFocusModeActive ? `FOCUS: ${activeTabName || "TAB"}` : "FOCUS TAB"}</span>
            </button>
          )}

          {onToggleGameMode && (
            <button
              onClick={onToggleGameMode}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                isGameModeActive
                  ? "bg-amber-500 text-slate-950 font-extrabold border border-white shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse"
                  : "bg-slate-950/80 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 backdrop-blur-xl"
              }`}
              title="Ghost POV Game Mode: Take direct manual control of camera (WASD / Q / R / Shift / Z to exit)"
            >
              <Gamepad2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isGameModeActive ? "text-slate-950 animate-spin" : "text-amber-400"}`} />
              <span>{isGameModeActive ? "🎮 GHOST POV [ACTIVE]" : "🎮 GHOST POV"}</span>
            </button>
          )}

          {onToggleCortexCity && (
            <button
              onClick={onToggleCortexCity}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                isCortexCityActive
                  ? "bg-purple-600 text-white font-extrabold border border-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.9)] animate-pulse"
                  : "bg-slate-950/80 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 backdrop-blur-xl"
              }`}
              title={`Cortex City & NPC Builders: Orbital Cyber-City powered by ${totalTokens || 0} user tokens!`}
            >
              <Building2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isCortexCityActive ? "text-purple-200 animate-bounce" : "text-purple-400"}`} />
              <span>{isCortexCityActive ? `🏗️ CITY (${totalTokens || 0} TOK)` : "🏗️ CORTEX CITY"}</span>
            </button>
          )}

          {onTakeSnapshot && (
            <button
              onClick={onTakeSnapshot}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md bg-slate-950/80 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20 backdrop-blur-xl"
              title="Take Snapshot: Capture current 3D coordinates & states of all neuron nodes as a saved preset in Admin portal"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>SNAPSHOT</span>
            </button>
          )}

          {onToggleFullMind && (
            <button
              onClick={onToggleFullMind}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
                fullMindMode
                  ? "bg-purple-500 text-slate-950 shadow-[0_0_20px_rgba(168,85,247,0.8)] font-extrabold border border-purple-400 animate-pulse"
                  : "bg-slate-950/80 border border-white/10 text-purple-400 hover:border-purple-400/50 hover:bg-white/10 backdrop-blur-xl"
              }`}
              title={fullMindMode ? "Exit Full Screen Mind Mode" : "Full Screen Mind Mode (Hide Chat & Sidebar)"}
            >
              {fullMindMode ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              <span>{fullMindMode ? "EXIT MIND" : "FULL MIND"}</span>
            </button>
          )}

          <button
            onClick={() => setLegendOpen(!legendOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-mono font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-200 shadow-md ${
              legendOpen
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.6)] font-extrabold"
                : "bg-slate-950/80 border border-white/10 text-cyan-400 hover:border-cyan-400/50 hover:bg-white/10 backdrop-blur-xl"
            }`}
            title="Show Neural DNA Archetypes Legend"
          >
            <Dna className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>DNA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
