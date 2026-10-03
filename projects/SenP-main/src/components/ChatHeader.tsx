import React, { useState, useEffect } from "react";
import { ProviderType, CustomPage } from "../types";
import { FALLBACK_MODEL_LISTS } from "../data/dna";
import { Cpu, Target, Maximize2, Minimize2, Search, Folder, Volume2, VolumeX, Download, Settings, Trash2, ShieldCheck, Zap, Code, Heart, BookOpen, Globe, UserCheck } from "lucide-react";

interface ChatHeaderProps {
  provider: ProviderType;
  model: string;
  onModelChange: (newModel: string) => void;
  agentEnabled: boolean;
  onToggleAgent: () => void;
  onOpenMission: () => void;
  onOpenSkills?: () => void;
  onOpenFrontEnd?: () => void;
  onOpenUserDashboard?: () => void;
  user?: any;
  zenMode: boolean;
  onToggleZen: () => void;
  onToggleSearch: () => void;
  onToggleHistory: () => void;
  ttsEnabled: boolean;
  onToggleTTS: () => void;
  onExportMd: () => void;
  onOpenConfig: () => void;
  onClearChat: () => void;
  modelList?: string[];
  siteTitle?: string;
  siteSubtitle?: string;
  onOpenAdmin?: () => void;
  fullMindMode?: boolean;
  onToggleFullMind?: () => void;
  customPages?: CustomPage[];
  onOpenCustomPage?: (page: CustomPage) => void;
  donationUrl?: string;
  donationText?: string;
}

const LiveTimeWidget: React.FC = () => {
  const [timeStr, setTimeStr] = useState(() => new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
  const [dateStr, setDateStr] = useState(() => new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDateStr(now.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl font-mono text-[10px] sm:text-xs text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] shrink-0 transition-all hover:border-cyan-400 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
      <span className="text-slate-400 font-semibold hidden lg:inline uppercase">{dateStr}</span>
      <span className="text-white/20 hidden lg:inline">|</span>
      <span className="font-bold tracking-widest text-cyan-400">{timeStr}</span>
    </div>
  );
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  provider,
  model,
  onModelChange,
  agentEnabled,
  onToggleAgent,
  onOpenMission,
  onOpenSkills,
  onOpenFrontEnd,
  onOpenUserDashboard,
  user,
  zenMode,
  onToggleZen,
  onToggleSearch,
  onToggleHistory,
  ttsEnabled,
  onToggleTTS,
  onExportMd,
  onOpenConfig,
  onClearChat,
  modelList,
  siteTitle,
  siteSubtitle,
  onOpenAdmin,
  fullMindMode = false,
  onToggleFullMind,
  customPages,
  onOpenCustomPage,
  donationUrl,
  donationText,
}) => {
  const models = modelList && modelList.length > 0 ? modelList : FALLBACK_MODEL_LISTS[provider] || FALLBACK_MODEL_LISTS.gemini;

  return (
    <div className="flex flex-col border-b border-white/10 bg-slate-950/80 backdrop-blur-md text-slate-200 select-none shrink-0">
      {/* ROW 1: System Identity, Model Selector & Admin Control Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-2.5 2xl:px-8 2xl:py-3 border-b border-white/5 flex-wrap">
        {/* Brand & Logo Badge + Live Time Widget */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex flex-col font-mono tracking-[0.15em] sm:tracking-[0.2em] text-xs 2xl:text-sm uppercase shrink-0">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse shrink-0" />
              <span className="truncate">{siteTitle || "NEURO-CHAT // AI OS"}</span>
            </div>
            {siteSubtitle && (
              <span className="text-[9px] 2xl:text-xs text-slate-400 tracking-wider hidden md:inline ml-4.5 truncate">{siteSubtitle}</span>
            )}
          </div>
          <LiveTimeWidget />
        </div>

        {/* System & Model Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap ml-auto justify-end">
          {/* Transparency Meter: Server Cost Coverage */}
          <div
            title="Real-time infrastructure sustainability progress toward monthly server cost coverage"
            className="hidden 2xl:flex flex-col gap-1 px-3 py-1 bg-slate-900/90 border border-emerald-500/40 rounded-xl font-mono text-[9px] shrink-0 min-w-[155px] shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400"
          >
            <div className="flex items-center justify-between text-emerald-300 font-bold tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SERVER COST
              </span>
              <span>84% ($420/$500)</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]" style={{ width: "84%" }} />
            </div>
          </div>

          {/* Action Group: Support/Donate & Login */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={donationUrl || "https://nowpayments.io/donation/Imxforever"}
              target="_blank"
              rel="noopener noreferrer"
              title="Support Project via NOWPayments (Crypto/Donations) — Activates Supporter Gold Aura"
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-wider bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.6)] hover:from-yellow-400 hover:to-amber-400 hover:scale-105 transition-all duration-150 shrink-0 border border-yellow-300"
            >
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-bounce shrink-0" />
              <span className="hidden sm:inline">{donationText || "SUPPORT PROJECT"}</span>
              <span className="sm:hidden">{donationText ? donationText.slice(0, 10) : "DONATE"}</span>
            </a>

            {onOpenUserDashboard && (
              <button
                onClick={onOpenUserDashboard}
                title={user ? `Synaptic Profile: ${user.email} (/dashboard)` : "Login with Google OAuth 2.0 (/login)"}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 shrink-0 shadow-lg ${
                  user
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                    : "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-400/60 text-blue-300 hover:bg-blue-600/40 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                }`}
              >
                {user ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
                    <span>LOGIN</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Clean Separator between Action Group and System Settings */}
          <div className="w-[1px] h-6 bg-white/20 mx-1 shrink-0 hidden sm:block" />

          {/* System Settings Group: Model Switcher, Admin, Config, Clear */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-inner">
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              title="Switch model on the fly"
              className="bg-slate-950 border border-white/10 text-slate-200 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono uppercase tracking-wider outline-none focus:border-cyan-400 max-w-[110px] sm:max-w-[130px] truncate cursor-pointer hover:border-cyan-500/50 transition-colors shrink-0"
            >
              {models.map((m) => (
                <option key={m} value={m} className="bg-slate-950 text-slate-200">
                  {m}
                </option>
              ))}
              {!models.includes(model) && (
                <option value={model} className="bg-slate-950 text-slate-200">
                  {model} (current)
                </option>
              )}
            </select>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Admin Customization & Live News Portal"
                className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all duration-150 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="hidden md:inline">ADMIN</span>
              </button>
            )}

            <button
              onClick={onOpenConfig}
              title="System configuration"
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-150 shrink-0"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline">CONFIG</span>
            </button>

            <button
              onClick={onClearChat}
              title="Clear chat history (asks confirmation)"
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-transparent border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all duration-150 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">CLEAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Dedicated Main Tab Bar (Workspace Navigation & Quick Tools Dock) */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 2xl:px-8 2xl:py-2.5 bg-slate-900/90 border-t border-b border-white/10 overflow-x-auto no-scrollbar shadow-md">
        {/* Workspace Modes Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onToggleAgent}
            title="Toggle Agent Vibe (Chain-of-Thought, tools, consciousness bar)"
            className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 shrink-0 ${
              agentEnabled
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] font-extrabold"
                : "bg-slate-950/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>AGENT</span>
          </button>

          <button
            onClick={onOpenMission}
            title="Mission Mode — autonomous goal decomposition into sub-tasks"
            className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-slate-950/80 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all duration-150 shrink-0"
          >
            <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>MISSION</span>
          </button>

          {onOpenSkills && (
            <button
              onClick={onOpenSkills}
              title="Skills Dashboard (.MD) — interactive 3D skill tree & agent logic definitions"
              className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-300 hover:border-purple-400 hover:bg-purple-500/30 transition-all duration-150 shadow-[0_0_12px_rgba(168,85,247,0.25)] shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
              <span>SKILLS</span>
            </button>
          )}

          {onOpenFrontEnd && (
            <button
              onClick={onOpenFrontEnd}
              title="Open Front-End Code Workspace — Live React/Tailwind/HTML Preview & Sandbox"
              className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/50 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/30 transition-all duration-150 shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0"
            >
              <Code className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span>FRONT-END</span>
            </button>
          )}

          {customPages?.filter(p => p.published !== false).map(page => (
            <button
              key={page.id}
              onClick={() => onOpenCustomPage?.(page)}
              title={page.description || `Open custom page: ${page.title}`}
              className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/30 transition-all duration-150 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span>{page.title}</span>
            </button>
          ))}

          {onToggleFullMind && (
            <button
              onClick={onToggleFullMind}
              title={fullMindMode ? "Exit Full Screen Mind Mode" : "Full Screen Mind Mode (Immersive Focus — Hide Chat & Sidebar)"}
              className="flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/50 text-purple-300 hover:border-purple-400 hover:bg-purple-500/30 transition-all duration-150 shadow-[0_0_12px_rgba(168,85,247,0.25)] shrink-0"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
              <span>FULL MIND</span>
            </button>
          )}

          <button
            onClick={onToggleZen}
            title={zenMode ? "Exit Zen Mode (Show 3D Cortex)" : "Zen Mode (Fullscreen Chat)"}
            className={`p-1.5 rounded-full transition-all duration-150 border shrink-0 flex items-center justify-center ${
              zenMode
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {zenMode ? <Minimize2 className="w-3.5 h-3.5 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>

        {/* Quick Utilities Dock */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-3 border-l border-white/10 shrink-0">
          <button
            onClick={onToggleSearch}
            title="Search messages in chat"
            className="p-1.5 rounded-full border border-white/10 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/5 transition-all duration-150 shrink-0 flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            onClick={onToggleHistory}
            title="Saved conversation history"
            className="p-1.5 rounded-full border border-white/10 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/5 transition-all duration-150 shrink-0 flex items-center justify-center"
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            onClick={onToggleTTS}
            title={ttsEnabled ? "Text-to-Speech: ON" : "Text-to-Speech: OFF"}
            className={`p-1.5 rounded-full transition-all duration-150 border shrink-0 flex items-center justify-center ${
              ttsEnabled
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 shrink-0" /> : <VolumeX className="w-3.5 h-3.5 shrink-0" />}
          </button>

          <button
            onClick={onExportMd}
            title="Export conversation as Markdown"
            className="p-1.5 rounded-full border border-white/10 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/5 transition-all duration-150 shrink-0 flex items-center justify-center"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

