import React, { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, Download, Cpu, Palette, Coins, Target, ShieldCheck, Zap, Code, Sparkles, Globe, UserCheck } from "lucide-react";
import { CustomCLICommand } from "../types";

interface CommandItem {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  action: (arg?: string) => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  onExportMd: () => void;
  onOpenConfig: () => void;
  onResetTokens: () => void;
  onOpenMission: () => void;
  onOpenSkills?: () => void;
  onOpenFrontEnd?: () => void;
  onOpenUserDashboard?: () => void;
  onSwitchTheme: (theme: string) => void;
  onSwitchModel: (model: string) => void;
  onOpenAdmin?: () => void;
  onTriggerCameraShot?: (shot: any) => void;
  customCommands?: CustomCLICommand[];
  onExecuteCustomCommand?: (cmd: CustomCLICommand) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onClearChat,
  onExportMd,
  onOpenConfig,
  onResetTokens,
  onOpenMission,
  onOpenSkills,
  onOpenFrontEnd,
  onOpenUserDashboard,
  onSwitchTheme,
  onSwitchModel,
  onOpenAdmin,
  onTriggerCameraShot,
  customCommands,
  onExecuteCustomCommand,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseCommands: CommandItem[] = [
    { id: "login", name: "/login", desc: "Login with Google OAuth 2.0 & Cloud Sync", icon: <Globe className="w-4 h-4 text-blue-400 animate-pulse" />, action: () => { onClose(); onOpenUserDashboard?.(); } },
    { id: "dashboard", name: "/dashboard", desc: "Open Synaptic User Profile & Token Settings", icon: <UserCheck className="w-4 h-4 text-cyan-400 animate-pulse" />, action: () => { onClose(); onOpenUserDashboard?.(); } },
    { id: "admin", name: "/admin", desc: "Open Admin Customization Portal (admin/1234)", icon: <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />, action: () => { onClose(); onOpenAdmin?.(); } },
    { id: "zen-orbit", name: "/zen-orbit", desc: "Trigger Zen-Orbit 3D Idle Mode (Auto triggers after 30s idle)", icon: <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />, action: () => { onClose(); onTriggerCameraShot?.("zenOrbit"); } },
    { id: "skills", name: "/skills", desc: "Open 3D Skills (.MD) Dashboard & Logic Tree", icon: <Zap className="w-4 h-4 text-purple-400 animate-pulse" />, action: () => { onClose(); onOpenSkills?.(); } },
    { id: "frontend", name: "/frontend", desc: "Open Front-End Code Workspace & Live Sandbox", icon: <Code className="w-4 h-4 text-cyan-400 animate-pulse" />, action: () => { onClose(); onOpenFrontEnd?.(); } },
    { id: "clear", name: "/clear", desc: "Clear chat history", icon: <Trash2 className="w-4 h-4 text-red-400" />, action: () => onClearChat() },
    { id: "mission", name: "/mission", desc: "Open Autonomous Mission Mode", icon: <Target className="w-4 h-4 text-amber-400" />, action: () => onOpenMission() },
    { id: "export", name: "/export", desc: "Export conversation as Markdown", icon: <Download className="w-4 h-4 text-cyan-400" />, action: () => onExportMd() },
    { id: "config", name: "/config", desc: "Open system settings", icon: <Terminal className="w-4 h-4 text-purple-400" />, action: () => onOpenConfig() },
    { id: "reset", name: "/reset", desc: "Reset token counter gauge", icon: <Coins className="w-4 h-4 text-emerald-400" />, action: () => onResetTokens() },
    { id: "theme-elon", name: "/theme elon-edition", desc: "Switch to SenPai Elon Edition theme", icon: <Palette className="w-4 h-4 text-red-500" />, action: () => onSwitchTheme("elon-edition") },
    { id: "theme-dracula", name: "/theme dracula", desc: "Switch to Dracula neon theme", icon: <Palette className="w-4 h-4 text-purple-500" />, action: () => onSwitchTheme("dracula") },
    { id: "theme-cyberpunk", name: "/theme high-contrast", desc: "Switch to High Contrast Cyberpunk theme", icon: <Palette className="w-4 h-4 text-white" />, action: () => onSwitchTheme("high-contrast") },
    { id: "model-flash", name: "/model gemini-2.5-flash", desc: "Switch to Gemini 2.5 Flash model (Default)", icon: <Cpu className="w-4 h-4 text-cyan-300" />, action: () => onSwitchModel("gemini-2.5-flash") },
    { id: "model-35-flash", name: "/model gemini-3.5-flash", desc: "Switch to Gemini 3.5 Flash (Next-gen speed & reasoning)", icon: <Cpu className="w-4 h-4 text-emerald-300" />, action: () => onSwitchModel("gemini-3.5-flash") },
    { id: "model-lite", name: "/model gemini-3.1-flash-lite", desc: "Switch to Gemini 3.1 Flash Lite (Ultra fast & lightweight)", icon: <Cpu className="w-4 h-4 text-amber-300" />, action: () => onSwitchModel("gemini-3.1-flash-lite") },
    { id: "model-pro", name: "/model gemini-2.5-pro", desc: "Switch to Gemini 2.5 Pro model", icon: <Cpu className="w-4 h-4 text-purple-300" />, action: () => onSwitchModel("gemini-2.5-pro") },
  ];

  const customItems: CommandItem[] = (customCommands || []).map((cmd) => ({
    id: cmd.id,
    name: cmd.command,
    desc: cmd.description || `Execute custom action [${cmd.actionType}]`,
    icon: <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />,
    action: () => {
      onClose();
      onExecuteCustomCommand?.(cmd);
    },
  }));

  const commands = [...baseCommands, ...customItems];

  const filtered = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4 select-none font-mono text-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0d1117] border border-cyan-500/60 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#141820] border-b border-gray-800 text-white">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (/clear, /export, /mission, /theme...)"
            className="flex-1 bg-transparent border-none text-sm font-mono text-white outline-none placeholder:text-gray-600"
          />
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 italic">No matching commands.</div>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                  i === selectedIndex ? "bg-cyan-500/20 text-white border-l-2 border-cyan-400" : "text-gray-400 hover:bg-gray-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {cmd.icon}
                  <span className="font-bold text-cyan-300">{cmd.name}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-sans">{cmd.desc}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
