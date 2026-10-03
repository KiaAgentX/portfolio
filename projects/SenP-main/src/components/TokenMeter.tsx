import React, { useState } from "react";
import { UsageStats } from "../types";
import { ChevronDown, ChevronRight, Coins, AlertTriangle } from "lucide-react";

interface TokenMeterProps {
  usage: UsageStats;
  budget: number;
  onReset: () => void;
}

export const TokenMeter: React.FC<TokenMeterProps> = ({ usage, budget, onReset }) => {
  const [collapsed, setCollapsed] = useState(false);

  const safeBudget = Math.max(1, budget || 128000);
  const ratio = Math.min(1, usage.totalTokens / safeBudget);
  const percent = Math.round(ratio * 100);
  const left = Math.max(0, safeBudget - usage.totalTokens);

  const isWarn = ratio > 0.8 && ratio <= 0.95;
  const isCrit = ratio > 0.95;

  // Render tick gauge (40 ticks)
  const totalTicks = 40;
  const filledTicks = Math.round(ratio * totalTicks);

  return (
    <div className="flex flex-col px-6 py-2 border-b border-white/10 bg-slate-950/40 backdrop-blur-md select-none font-mono text-xs">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 font-bold text-[10px] tracking-[0.2em] uppercase text-slate-300 hover:text-cyan-400 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          <Coins className="w-3.5 h-3.5 text-cyan-400" />
          <span>Token Budget</span>
          {isCrit && (
            <span className="flex items-center gap-1 bg-rose-950/80 border border-rose-500 text-rose-300 px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-widest animate-pulse ml-1">
              <AlertTriangle className="w-2.5 h-2.5" /> 95%+ CRITICAL
            </span>
          )}
          {isWarn && (
            <span className="flex items-center gap-1 bg-amber-950/80 border border-amber-500 text-amber-300 px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-widest ml-1">
              <AlertTriangle className="w-2.5 h-2.5" /> 80%+ WARN
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 text-[10px] text-slate-400 ml-auto flex-wrap uppercase tracking-wider">
          <span>
            used: <b className="text-cyan-400 font-mono font-bold">{usage.totalTokens.toLocaleString()}</b>
          </span>
          <span>
            left: <b className="text-slate-200 font-mono font-bold">{left.toLocaleString()}</b>
          </span>
          <span>
            cost: <b className="text-indigo-400 font-mono font-bold">${usage.cost.toFixed(4)}</b>
          </span>
          <span className="hidden sm:inline">
            last: <b className="text-cyan-400 font-mono">{usage.lastReqTokens.toLocaleString()} tok / {usage.lastReqMs}ms</b>
          </span>
        </div>
      </div>

      {/* Gauge bar */}
      {!collapsed && (
        <div className="mt-2 flex items-center gap-2.5 animate-in fade-in duration-150">
          <div className="flex-1 h-3 bg-slate-950/80 border border-white/10 rounded-full p-0.5 flex gap-[1.5px] overflow-hidden">
            {Array.from({ length: totalTicks }).map((_, i) => {
              const isFilled = i < filledTicks;
              let bgColor = "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]";
              if (ratio > 0.95) bgColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]";
              else if (ratio > 0.8) bgColor = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
              else if (i > totalTicks * 0.5) bgColor = "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]";

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-[1px] transition-all duration-200 ${
                    isFilled ? bgColor : "bg-white/5"
                  }`}
                />
              );
            })}
          </div>
          <span className={`text-[10px] font-mono font-bold min-w-[32px] text-right ${isCrit ? "text-rose-400 font-black animate-pulse" : isWarn ? "text-amber-400" : "text-cyan-400"}`}>
            {percent}%
          </span>
          <button
            onClick={onReset}
            className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 px-2.5 py-0.5 rounded-full transition-all ml-1 font-mono"
            title="Reset session token counters to 0"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
