import React from "react";
import { Globe, Play, Folder, Terminal, FileText, CheckCircle, AlertCircle, Code } from "lucide-react";

interface AgentToolsBarProps {
  visible: boolean;
  webSearchActive: boolean;
  onToggleWebSearch: () => void;
  codeRunnerActive: boolean;
  onToggleCodeRunner: () => void;
  onRunLastCode: () => void;
  onOpenFrontEnd?: () => void;
  fileExplorerActive: boolean;
  onToggleFileExplorer: () => void;
  attachedFileNames: string[];
  consoleLogs: { id: string; type: "log" | "error"; text: string }[];
}

export const AgentToolsBar: React.FC<AgentToolsBarProps> = ({
  visible,
  webSearchActive,
  onToggleWebSearch,
  codeRunnerActive,
  onToggleCodeRunner,
  onRunLastCode,
  onOpenFrontEnd,
  fileExplorerActive,
  onToggleFileExplorer,
  attachedFileNames,
  consoleLogs,
}) => {
  if (!visible) return null;

  return (
    <div className="flex flex-col border-b border-white/10 bg-slate-950/40 backdrop-blur-md select-none font-mono text-xs">
      {/* Tool Bar Buttons */}
      <div className="flex items-center gap-2 px-6 py-2 overflow-x-auto scrollbar-none border-b border-white/5">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mr-1">Tools:</span>
        
        {/* Web Search Tool */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border transition-all duration-150 ${
            webSearchActive
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)] font-bold"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
          }`}
          title="Enable real-time Web Search grounding tool"
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>Web Search</span>
          {webSearchActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />}
        </button>

        {/* Code Runner Tool */}
        <button
          onClick={onToggleCodeRunner}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border transition-all duration-150 ${
            codeRunnerActive
              ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.4)] font-bold"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
          }`}
          title="Enable Code Runner sandbox tool"
        >
          <Play className="w-3 h-3 text-indigo-400" />
          <span>Code Runner</span>
          {codeRunnerActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />}
        </button>

        {codeRunnerActive && (
          <button
            onClick={onRunLastCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-emerald-500/20 border border-emerald-500 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-bold"
            title="Execute the last JavaScript block in chat"
          >
            <Terminal className="w-3 h-3" />
            <span>▶ Run Last JS Block</span>
          </button>
        )}

        {onOpenFrontEnd && (
          <button
            onClick={onOpenFrontEnd}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 transition-all font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse"
            title="Open Front-End Code Workspace & Live Sandbox"
          >
            <Code className="w-3 h-3 text-cyan-400" />
            <span>⚡ Front-End Workspace</span>
          </button>
        )}

        {/* File Explorer Tool */}
        <button
          onClick={onToggleFileExplorer}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border transition-all duration-150 ml-auto ${
            fileExplorerActive
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)] font-bold"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
          }`}
          title="Toggle Session File Explorer"
        >
          <Folder className="w-3 h-3 text-cyan-400" />
          <span>File Explorer</span>
          <span className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold">{attachedFileNames.length}</span>
        </button>
      </div>

      {/* File Explorer Tree */}
      {fileExplorerActive && (
        <div className="px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10 text-[11px] animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono tracking-widest uppercase font-semibold mb-2">
            <Folder className="w-3.5 h-3.5" />
            <span>session-context/</span>
          </div>
          {attachedFileNames.length === 0 ? (
            <div className="text-slate-500 italic pl-5">No files or images attached in this session.</div>
          ) : (
            <div className="pl-5 space-y-1.5 max-h-28 overflow-y-auto">
              {attachedFileNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate font-mono">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code Runner Console Logs */}
      {codeRunnerActive && consoleLogs.length > 0 && (
        <div className="px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-[11px] max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between text-slate-400 font-bold mb-1.5 border-b border-white/10 pb-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono tracking-widest uppercase text-[10px]">
              <Terminal className="w-3.5 h-3.5" />
              <span>SANDBOX CONSOLE</span>
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Live JS Execution</span>
          </div>
          <div className="space-y-1 font-mono">
            {consoleLogs.map((log) => (
              <div key={log.id} className={`flex items-start gap-1.5 ${log.type === "error" ? "text-rose-400" : "text-emerald-300"}`}>
                {log.type === "error" ? <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />}
                <pre className="whitespace-pre-wrap break-all flex-1 font-inherit text-[10.5px]">{log.text}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
