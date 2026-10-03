"use client";

import { useState } from "react";
import { useOS, getAvailableApps } from "@/store/os";
import { cn } from "@/lib/utils";

export default function StartMenu() {
  const { openApp, setStartMenu, installedApps, settings, logout, shutdown } = useOS();
  const [query, setQuery] = useState("");

  const all = getAvailableApps(installedApps);
  const filtered = query
    ? all.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.id.includes(query.toLowerCase()))
    : all;

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    system: "System",
    productivity: "Productivity",
    media: "Media",
    tools: "Tools",
    store: "Store",
    social: "Social",
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[680px] max-w-[92vw] h-[560px] max-h-[80vh] glass-strong rounded-2xl neon-border-cyan flex flex-col overflow-hidden z-[85] animate-float-up neon-glow">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 px-3 h-10 rounded-full bg-black/40 border border-cyan-500/30">
          <span className="text-cyan-400/70">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, settings, files..."
            className="bg-transparent flex-1 text-sm text-cyan-100 outline-none placeholder:text-cyan-300/40"
          />
          <span className="text-[10px] text-cyan-300/40">Win12 PRO</span>
        </div>
      </div>

      {/* App grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(grouped).map(([cat, apps]) => (
          <div key={cat} className="mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/60 mb-2 neon-text-cyan">
              {categoryLabels[cat] ?? cat}
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    openApp(a.id);
                    setStartMenu(false);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-cyan-500/20 transition group"
                  title={a.description}
                >
                  <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl group-hover:neon-glow", a.color)}>
                    {a.icon}
                  </div>
                  <span className="text-[10px] text-cyan-100 text-center leading-tight">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-cyan-300/50 text-sm mt-8">No results found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-cyan-500/20 bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/40 to-fuchsia-500/40 flex items-center justify-center text-lg neon-border-cyan">
            {settings.profilePicture}
          </div>
          <div>
            <p className="text-xs font-semibold text-cyan-100">{settings.userName}</p>
            <p className="text-[10px] text-cyan-300/60">{settings.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { openApp("settings"); setStartMenu(false); }} className="w-9 h-9 rounded-lg hover:bg-cyan-500/20 flex items-center justify-center text-cyan-200" title="Settings">
            ⚙️
          </button>
          <button onClick={() => { logout(); setStartMenu(false); }} className="w-9 h-9 rounded-lg hover:bg-purple-500/20 flex items-center justify-center text-purple-200" title="Lock">
            🔒
          </button>
          <button onClick={() => { shutdown(); setStartMenu(false); }} className="w-9 h-9 rounded-lg hover:bg-fuchsia-600/30 flex items-center justify-center text-fuchsia-100" title="Power">
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}
