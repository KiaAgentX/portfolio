import React, { useState } from "react";
import { Cpu, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";

interface CoTStep {
  id: string;
  icon: string;
  text: string;
  done: boolean;
}

interface ChainOfThoughtProps {
  steps: CoTStep[];
  visible: boolean;
}

export const ChainOfThought: React.FC<ChainOfThoughtProps> = ({ steps, visible }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!visible) return null;

  return (
    <div className="flex flex-col border-b border-white/10 bg-slate-950/60 backdrop-blur-xl max-h-48 transition-all duration-200 select-none font-mono text-xs">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 py-2 cursor-pointer border-b border-white/10 text-cyan-400 font-bold tracking-[0.2em] text-[10px] uppercase hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Chain of Thought</span>
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
        <span className="text-slate-400 text-[9px] font-mono uppercase tracking-wider">
          {steps.filter(s => s.done).length} / {steps.length} steps
        </span>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="overflow-y-auto px-4 py-2.5 space-y-2 text-slate-300 text-[11px] max-h-36 scrollbar-thin">
          {steps.length === 0 ? (
            <div className="text-slate-500 italic">Waiting for agent stimulus...</div>
          ) : (
            steps.map((step) => (
              <div key={step.id} className="flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="text-cyan-400 shrink-0 mt-0.5">{step.icon}</span>
                <span className="flex-1 leading-snug text-slate-200 font-mono">
                  {step.text}
                  {!step.done && (
                    <span className="inline-block ml-1.5 w-1.5 h-3 bg-cyan-400 animate-pulse align-middle" />
                  )}
                </span>
                {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
