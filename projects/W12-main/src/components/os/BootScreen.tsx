"use client";

import { useEffect, useState } from "react";
import { useOS } from "@/store/os";

const BOOT_LINES = [
  "NEON BIOS v12.0.4 — initializing...",
  "Detecting CPU cores: 16 @ 5.2GHz ............ OK",
  "Memory check: 32 GB DDR5 .................... OK",
  "Mounting /dev/neon0 ........................ OK",
  "Loading kernel modules ...................... OK",
  "Starting Neon Network Manager .............. OK",
  "Initializing GPU pipeline (RTX-Neon) ....... OK",
  "Loading user profile ....................... OK",
  "Starting Desktop Window Manager ............ OK",
  "Welcome to Windows 12 PRO",
];

export default function BootScreen() {
  const boot = useOS((s) => s.boot);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]; // capture now: updater runs async, after i++
        setLines((prev) => [...prev, line]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(tick);
        setTimeout(() => boot(), 700);
      }
    }, 220);
    return () => clearInterval(tick);
  }, [boot]);

  return (
    <div className="fixed inset-0 z-[100] neon-wallpaper flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 neon-grid opacity-30" />
      <div className="relative flex flex-col items-center gap-6 px-6">
        <div className="text-7xl animate-pulse-glow rounded-2xl p-6 glass-strong">
          <span className="neon-text-cyan">⬢</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-wider">
          <span className="neon-text-cyan">WINDOWS</span>{" "}
          <span className="neon-text-magenta">12</span>{" "}
          <span className="neon-text-purple">PRO</span>
        </h1>
        <p className="text-xs text-cyan-300/70 tracking-[0.4em] uppercase">
          Neon Edition · Dark Theme
        </p>

        <div className="w-[420px] max-w-[80vw] h-1.5 bg-black/60 rounded-full overflow-hidden neon-border-cyan mt-2">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-cyan-300/80 text-sm tabular-nums">{progress}%</p>

        <div className="mt-6 w-[460px] max-w-[86vw] h-40 overflow-hidden font-mono text-[11px] text-cyan-300/70 space-y-0.5">
          {lines.map((l, i) => (
            <div key={i} className="animate-float-up">
              <span className="text-fuchsia-400/80">▸</span> {l}
            </div>
          ))}
          <div>
            <span className="text-cyan-400">▸</span>
            <span className="cursor-blink">█</span>
          </div>
        </div>
      </div>
    </div>
  );
}
