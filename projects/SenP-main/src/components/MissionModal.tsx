import React, { useState } from "react";
import { MissionTask } from "../types";
import { Target, X, Play, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMission: (goal: string) => void;
  active: boolean;
  tasks: MissionTask[];
  currentTaskIndex: number;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  isOpen,
  onClose,
  onStartMission,
  active,
  tasks,
  currentTaskIndex,
}) => {
  const [goal, setGoal] = useState("");

  if (!isOpen) return null;

  const handleStart = () => {
    if (goal.trim() && !active) {
      onStartMission(goal.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono text-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0d1117] border border-amber-500/60 rounded-xl shadow-[0_0_40px_rgba(255,179,71,0.25)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-gray-800 text-amber-400 font-bold tracking-wider uppercase text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Autonomous Mission Mode</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!active && tasks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-gray-300 font-sans text-xs leading-relaxed">
                Describe a multi-step objective or complex engineering task. SenPai will autonomously decompose it into actionable sub-tasks, execute neural reasoning sweeps across the 3D cortex, and synthesize a comprehensive deliverable.
              </p>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                placeholder="e.g. Architect a scalable real-time WebSocket trading platform with fault-tolerant order routing and sub-millisecond latency..."
                className="w-full bg-[#050608] border border-gray-700 rounded-lg p-3 text-white font-sans text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none placeholder:text-gray-600"
                autoFocus
              />
              <button
                onClick={handleStart}
                disabled={!goal.trim()}
                className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  !goal.trim()
                    ? "bg-gray-800/50 border border-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 shadow-[0_0_20px_rgba(255,140,66,0.3)] hover:scale-[1.01]"
                }`}
              >
                <Play className="w-4 h-4 text-black fill-current" />
                <span>Decompose Goal & Execute Mission</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#050608] border border-amber-500/30 rounded-lg p-3">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Active Objective:</div>
                <div className="text-amber-300 font-sans font-semibold text-xs">{goal || "Executing autonomous mission sequence..."}</div>
              </div>

              <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px] pt-1">Decomposed Sub-tasks ({tasks.length}):</div>
              <div className="space-y-2">
                {tasks.map((task, i) => {
                  const isCurrent = i === currentTaskIndex;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                        task.status === "done"
                          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                          : task.status === "active" || isCurrent
                          ? "bg-amber-950/30 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,179,71,0.15)] scale-[1.01]"
                          : task.status === "error"
                          ? "bg-red-950/30 border-red-500/40 text-red-300"
                          : "bg-[#141820] border-gray-800 text-gray-400"
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {task.status === "done" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : task.status === "active" || isCurrent ? (
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        ) : task.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                      </span>
                      <div className="flex-1 font-sans text-xs leading-snug">
                        <div className="font-semibold">{task.text}</div>
                        {task.status === "active" && (
                          <div className="text-[10px] text-amber-400/80 font-mono mt-1 animate-pulse">
                            ▸ Running 3D cortex sweep and synthesizing logic...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!active && (
                <button
                  onClick={() => {
                    setGoal("");
                    onClose();
                  }}
                  className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors mt-2"
                >
                  Close & View Deliverable in Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
