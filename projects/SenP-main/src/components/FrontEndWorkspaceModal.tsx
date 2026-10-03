import React, { useState, useEffect, useMemo } from "react";
import { Code, Play, Eye, Copy, Check, Download, RefreshCw, Zap, X, Terminal, Sparkles, Send, Layout, Maximize2, Minimize2 } from "lucide-react";

interface FrontEndWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLang?: string;
  onSendToChat?: (modifiedCode: string, prompt: string) => void;
}

const DEFAULT_SAMPLE_CODE = `// ⚡ SENPAI NEURAL CYBER DASHBOARD // LIVE REACT COMPONENT
import React, { useState, useEffect } from 'react';

export default function NeuralDashboardWidget() {
  const [synapses, setSynapses] = useState(1420);
  const [activeTab, setActiveTab] = useState('metrics');
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapses(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 p-6 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#111723]/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl relative overflow-hidden">
        {/* Glowing Top Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={"w-3 h-3 rounded-full transition-all " + (pulse ? "bg-cyan-400 shadow-[0_0_12px_#22d3ee]" : "bg-cyan-700")} />
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide font-mono uppercase">SenPai Cortex // UI Live Sandbox</h1>
              <p className="text-xs text-slate-400">Front-End Realtime React 18 + Tailwind Engine</p>
            </div>
          </div>
          <button 
            onClick={() => setPulse(!pulse)}
            className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
          >
            {pulse ? '● SYNC ACTIVE' : '○ SYNC PAUSED'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 font-mono text-xs">
          {['metrics', 'neural-nodes', 'security-grid'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"px-4 py-2 rounded-xl capitalize transition-all " + (
                activeTab === tab 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold shadow-lg" 
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
              )}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Active Synapses</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">{synapses.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 mt-1">↑ +4.2% real-time flux</div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">CoT Latency</div>
              <div className="text-2xl font-black text-indigo-400 font-mono">18.4 ms</div>
              <div className="text-[10px] text-indigo-300 mt-1">Ultra-low fiber link</div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Sandbox Status</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">SECURE</div>
              <div className="text-[10px] text-slate-400 mt-1">Babel + Tailwind CDN</div>
            </div>
          </div>
        )}

        {activeTab === 'neural-nodes' && (
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/10 text-center space-y-3 font-mono text-xs">
            <div className="text-cyan-400 font-bold">10 ARCHETYPAL DNA NODES ONLINE</div>
            <p className="text-slate-400">All synaptic clusters are responding to real-time prompt stimuli with zero frame loss.</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['Logic Core', 'Creative Hub', 'Empathy Web', 'Cyber Security', 'Quantum Math'].map((node, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px]">
                  ✓ {node}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security-grid' && (
          <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-500/30 text-center space-y-2 font-mono text-xs text-rose-300">
            <div className="font-bold tracking-widest uppercase">⚠️ Zero Vulnerabilities Detected</div>
            <p className="text-slate-400 text-[11px]">CORS boundaries, iframe sandboxing, and script isolation verified.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-white/10 pt-4">
          <span>RUNNING IN SENPAI FRONT-END WORKSPACE</span>
          <span className="text-cyan-400 animate-pulse">● LIVE REACT COMPONENT</span>
        </div>
      </div>
    </div>
  );
}
`;

export const FrontEndWorkspaceModal: React.FC<FrontEndWorkspaceModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLang = "jsx",
  onSendToChat,
}) => {
  const [code, setCode] = useState<string>(initialCode || DEFAULT_SAMPLE_CODE);
  const [lang, setLang] = useState<string>(initialLang);
  const [viewMode, setViewMode] = useState<"split" | "preview" | "code">("split");
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLang) setLang(initialLang);
    }
  }, [initialCode, initialLang]);

  // Helper to compile React/JSX/Tailwind code into a secure standalone HTML document
  const liveHtml = useMemo(() => {
    const isHtml = lang.toLowerCase() === "html" || code.trim().toLowerCase().startsWith("<!doctype html") || code.trim().toLowerCase().startsWith("<html");

    if (isHtml) {
      // Inject Tailwind CDN if missing
      if (!code.includes("tailwindcss")) {
        return code.replace(/<head>/i, `<head>\n<script src="https://cdn.tailwindcss.com"></script>`);
      }
      return code;
    }

    // React / JSX / TSX / JS Standalone Engine
    const cleanedCode = code
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, "") // Strip imports
      .replace(/export\s+default\s+/g, "") // Strip export default
      .replace(/export\s+/g, ""); // Strip export

    // Attempt to guess component name
    const match = code.match(/export\s+default\s+(?:function|class)?\s*([A-Za-z0-9_]+)/) ||
                  code.match(/(?:function|class|const)\s+([A-Za-z0-9_]+)\s*(?:=|\()/);
    const componentName = match ? match[1] : "App";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #0b0f17; color: #f1f5f9; margin: 0; padding: 0; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #090d14; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #38bdf8; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      ${cleanedCode}
      
      const ComponentToRender = typeof ${componentName} !== 'undefined' ? ${componentName} : (typeof App !== 'undefined' ? App : (typeof Main !== 'undefined' ? Main : () => (
        <div className="p-8 text-center font-mono">
          <div className="inline-block px-4 py-2 bg-cyan-950/80 border border-cyan-500 rounded-xl text-cyan-300">
            ✓ React Component Ready (${componentName})
          </div>
        </div>
      )));
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<ComponentToRender />);
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="background: #450a0a; color: #fecaca; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; border: 1px solid #ef4444; font-family: monospace;"><b>⚡ Standalone Runtime Exception:</b><br/>' + err.message + '</div>';
      console.error(err);
    }
  </script>
</body>
</html>`;
  }, [code, lang, refreshKey]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([liveHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senpai-frontend-preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSource = () => {
    const ext = lang.toLowerCase() === "html" ? "html" : lang.toLowerCase() === "css" ? "css" : "tsx";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senpai-component-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[1500px] h-[92vh] bg-[#0b0f17] border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>FRONT-END WORKSPACE // LIVE UI SANDBOX</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Real-Time React 18 (JSX/TSX) + Tailwind CSS CDN Execution Engine
              </span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 font-mono text-[11px]">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === "split" ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.6)]" : "text-slate-300 hover:text-white"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === "preview" ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.6)]" : "text-slate-300 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview Only</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === "code" ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.6)]" : "text-slate-300 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Code Only</span>
            </button>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
              title="Force re-render iframe sandbox"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Reload</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{copied ? "Copied" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="p-2 sm:px-3 sm:py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300 transition-all flex items-center gap-1.5 font-bold"
              title="Download standalone HTML file ready to deploy"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Export .HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 transition-all ml-1"
              title="Close Workspace"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body (Split / Preview / Code) */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          
          {/* LEFT/TOP: Code Editor */}
          {(viewMode === "split" || viewMode === "code") && (
            <div className={`flex flex-col border-r border-white/10 bg-[#0d1118] transition-all min-h-0 ${viewMode === "code" ? "w-full" : "w-full lg:w-[48%] shrink-0"}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-white/10 text-[11px] font-mono text-slate-400 select-none">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 font-bold uppercase tracking-wider">{lang.toUpperCase()} SOURCE EDITOR</span>
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCode(DEFAULT_SAMPLE_CODE)} className="hover:text-cyan-400 text-[10px]">Reset Sample</button>
                  <span>|</span>
                  <button onClick={handleDownloadSource} className="hover:text-cyan-400 text-[10px]">Save .{lang}</button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-transparent p-4 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/30 selection:bg-cyan-500/30"
                placeholder="Paste or edit React (JSX/TSX), Tailwind CSS, or HTML code here..."
                spellCheck={false}
              />
            </div>
          )}

          {/* RIGHT/BOTTOM: Live Preview Iframe */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`flex flex-col bg-[#080b11] transition-all min-h-0 ${viewMode === "preview" ? "w-full" : "flex-1"}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-white/10 text-[11px] font-mono text-slate-400 select-none">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold uppercase tracking-wider">LIVE SANDBOX PREVIEW</span>
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Isolated WebGL/DOM Container</span>
              </div>
              
              <div className="flex-1 w-full relative overflow-hidden bg-[#090d14]">
                <iframe
                  key={refreshKey}
                  title="SenPai Live Front-End Sandbox Preview"
                  srcDoc={liveHtml}
                  className="w-full h-full border-0 block"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer / Send to Chat Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span>Want SenPai AI to modify or upgrade this UI?</span>
          </div>

          {onSendToChat && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add dark/light theme toggle, add animations, make responsive..."
                className="bg-slate-900/90 border border-white/15 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 flex-1 sm:w-80"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customPrompt.trim()) {
                    onSendToChat(code, customPrompt.trim());
                    onClose();
                  }
                }}
              />
              <button
                onClick={() => {
                  if (!customPrompt.trim()) return;
                  onSendToChat(code, customPrompt.trim());
                  onClose();
                }}
                disabled={!customPrompt.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 uppercase tracking-wider text-[11px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to SenPai</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
