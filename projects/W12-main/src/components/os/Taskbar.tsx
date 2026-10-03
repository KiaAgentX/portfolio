"use client";

import { useEffect, useState } from "react";
import { useOS } from "@/store/os";
import { APP_MAP } from "@/lib/apps";
import { cn } from "@/lib/utils";

export default function Taskbar() {
  const { windows, openApp, setStartMenu, startMenuOpen, installedApps, settings } = useOS();
  const [now, setNow] = useState(() => new Date());
  const [tray, setTray] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pinned = ["files", "terminal", "settings", "store", "browser", "notepad"];
  const allPinned = Array.from(new Set([...pinned, ...installedApps.slice(0, 6)]));
  const timeFmt = settings.clock24h ? "HH:mm" : "h:mm A";
  const dateFmt = settings.showSecondsInClock ? "with seconds" : "without seconds";

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 h-14 flex items-center px-2 gap-1 z-[80]",
        settings.taskbarTransparency ? "glass" : "glass-strong border-t border-cyan-500/30"
      )}
    >
      {/* Start button */}
      <button
        onClick={() => setStartMenu(!startMenuOpen)}
        className={cn(
          "w-11 h-11 rounded-lg flex items-center justify-center text-2xl transition neon-glow-hover",
          startMenuOpen ? "bg-cyan-500/30 neon-border-cyan" : "hover:bg-cyan-500/20"
        )}
        title="Start"
      >
        <span className="neon-text-cyan">⬢</span>
      </button>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full bg-black/40 border border-cyan-500/20 w-48 mx-1">
        <span className="text-cyan-400/70">🔍</span>
        <input
          placeholder="Search apps..."
          className="bg-transparent text-xs text-cyan-100 outline-none flex-1 placeholder:text-cyan-300/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value.toLowerCase();
              const app = Object.values(APP_MAP).find((a) => a.name.toLowerCase().includes(q));
              if (app) {
                if (app.builtIn || installedApps.includes(app.id)) openApp(app.id);
              }
            }
          }}
        />
      </div>

      {/* Pinned / open apps */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {allPinned.map((appId) => {
          const def = APP_MAP[appId];
          if (!def) return null;
          const isOpen = windows.some((w) => w.appId === appId);
          const isFocused = windows.find((w) => w.appId === appId && !w.minimized);
          return (
            <button
              key={appId}
              onClick={() => {
                if (!def.builtIn && !installedApps.includes(appId)) return;
                const win = windows.find((w) => w.appId === appId);
                if (win) {
                  if (win.minimized) {
                    useOS.setState((s) => ({
                      windows: s.windows.map((w) => (w.id === win.id ? { ...w, minimized: false } : w)),
                    }));
                    useOS.getState().focusWindow(win.id);
                  } else if (isFocused) {
                    useOS.getState().minimizeWindow(win.id);
                  } else {
                    useOS.getState().focusWindow(win.id);
                  }
                } else {
                  openApp(appId);
                }
              }}
              title={def.name}
              className={cn(
                "relative w-10 h-10 rounded-lg flex items-center justify-center text-xl transition",
                "bg-gradient-to-br hover:neon-glow-hover",
                def.color,
                isFocused ? "neon-border-cyan" : "border border-transparent",
                !def.builtIn && !installedApps.includes(appId) && "opacity-40 grayscale"
              )}
            >
              {def.icon}
              {isOpen && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-cyan-400 neon-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTray(!tray)}
          className="flex items-center gap-2 px-2 h-9 rounded-lg hover:bg-cyan-500/20 transition text-cyan-200"
        >
          <span className="text-sm" title="Network">{settings.wifiEnabled ? "📶" : "📵"}</span>
          <span className="text-sm" title="Volume">{settings.muteAll ? "🔇" : "🔊"}</span>
          <span className="text-sm" title="Battery">🔋</span>
        </button>
        <div className="flex flex-col items-end px-2 text-cyan-100">
          <span className="text-xs font-semibold tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", ...(settings.showSecondsInClock ? { second: "2-digit" } : {}) })}
          </span>
          <span className="text-[10px] text-cyan-300/70 tabular-nums">
            {now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Quick tray panel */}
      {tray && (
        <div
          className="absolute bottom-16 right-2 glass-strong rounded-xl neon-border-cyan p-4 w-72 animate-float-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            <TrayToggle icon="📶" label="Wi-Fi" active={settings.wifiEnabled} onClick={() => useOS.getState().updateSettings({ wifiEnabled: !settings.wifiEnabled })} />
            <TrayToggle icon="🔷" label="Bluetooth" active={settings.bluetoothEnabled} onClick={() => useOS.getState().updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled })} />
            <TrayToggle icon="✈️" label="Airplane" active={settings.airplaneMode} onClick={() => useOS.getState().updateSettings({ airplaneMode: !settings.airplaneMode })} />
            <TrayToggle icon="🌙" label="Night light" active={settings.nightLight} onClick={() => useOS.getState().updateSettings({ nightLight: !settings.nightLight })} />
            <TrayToggle icon="🔒" label="Lock" onClick={() => useOS.getState().logout()} />
            <TrayToggle icon="⚙️" label="Settings" onClick={() => { openApp("settings"); setTray(false); }} />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-cyan-300/70 mb-1">
                <span>🔊 Volume</span><span>{settings.masterVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.masterVolume}
                onChange={(e) => useOS.getState().updateSettings({ masterVolume: +e.target.value, muteAll: false })}
                className="neon-range w-full"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-cyan-300/70 mb-1">
                <span>☀️ Brightness</span><span>{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={settings.brightness}
                onChange={(e) => useOS.getState().updateSettings({ brightness: +e.target.value })}
                className="neon-range w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrayToggle({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg transition text-[10px]",
        active ? "bg-cyan-500/30 neon-border-cyan text-cyan-100" : "bg-black/40 text-cyan-300/60 hover:bg-cyan-500/15"
      )}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}
