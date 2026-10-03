"use client";

import { useState } from "react";
import { useOS, getInstallableApps } from "@/store/os";
import { cn } from "@/lib/utils";

export default function Store() {
  const { installedApps, installApp, uninstallApp, openApp } = useOS();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const apps = getInstallableApps();
  const filtered = apps.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const categories = ["all", "media", "tools", "productivity", "social", "system"];

  return (
    <div className="flex flex-col h-full bg-black/30">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-fuchsia-950/30 to-cyan-950/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🛍️</span>
          <div>
            <h1 className="text-xl font-bold neon-text-magenta">Neon Store</h1>
            <p className="text-[11px] text-cyan-300/60">Install apps · shortcuts added to desktop automatically</p>
          </div>
        </div>
        <input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neon-input w-full mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider transition",
                filter === c ? "bg-cyan-500/30 neon-border-cyan text-cyan-100" : "bg-black/40 text-cyan-300/60 hover:bg-cyan-500/15"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
        {filtered.map((a) => {
          const installed = installedApps.includes(a.id);
          return (
            <div key={a.id} className={cn("p-4 rounded-xl bg-gradient-to-br border transition", a.color, installed ? "border-emerald-500/40" : "border-cyan-500/20 hover:border-cyan-500/50")}>
              <div className="flex items-start gap-3">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl", a.color)}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-cyan-100 truncate">{a.name}</h3>
                  <p className="text-[10px] text-cyan-300/60 line-clamp-2">{a.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {installed ? (
                  <>
                    <button onClick={() => openApp(a.id)} className="neon-btn flex-1 py-1.5 rounded-lg text-xs">Open</button>
                    <button onClick={() => uninstallApp(a.id)} className="px-2 py-1.5 rounded-lg text-[10px] text-fuchsia-300 hover:bg-fuchsia-500/20">Uninstall</button>
                  </>
                ) : (
                  <button onClick={() => installApp(a.id)} className="neon-btn w-full py-1.5 rounded-lg text-xs animate-pulse-glow">
                    ⬇ Install
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-cyan-500/20 bg-black/40 text-[10px] text-cyan-300/60 flex justify-between">
        <span>{installedApps.length} apps installed</span>
        <span>{apps.length} apps available</span>
      </div>
    </div>
  );
}
