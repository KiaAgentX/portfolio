"use client";

import { useState } from "react";
import { useOS } from "@/store/os";

export default function LoginScreen() {
  const login = useOS((s) => s.login);
  const settings = useOS((s) => s.settings);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // tick clock
  if (typeof window !== "undefined" && !(window as any).__clockTick) {
    (window as any).__clockTick = true;
    setInterval(() => setNow(new Date()), 1000);
  }

  const submit = () => {
    if (settings.password && pwd !== settings.password) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    login();
  };

  return (
    <div className="fixed inset-0 z-[90] neon-wallpaper flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 neon-grid opacity-20" />
      <div className="absolute top-8 text-center">
        <div className="text-6xl font-black tabular-nums neon-text-cyan">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="text-cyan-300/70 tracking-widest uppercase text-sm">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 glass-strong rounded-2xl p-8 neon-glow">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/40 to-fuchsia-500/40 flex items-center justify-center text-5xl neon-border-cyan animate-pulse-glow">
          {settings.profilePicture}
        </div>
        <h2 className="text-2xl font-bold neon-text-cyan">{settings.userName}</h2>
        <p className="text-xs text-cyan-300/60 -mt-2">{settings.computerName}</p>

        {settings.password ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col items-center gap-3 w-64"
          >
            <input
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="PIN or password"
              className={`neon-input w-full text-center ${error ? "animate-pulse" : ""}`}
            />
            {error && <p className="text-xs text-fuchsia-400">Incorrect. Try again.</p>}
            <button type="submit" className="neon-btn px-6 py-2 rounded-lg w-full">
              Sign in →
            </button>
          </form>
        ) : (
          <button
            onClick={submit}
            className="neon-btn px-8 py-2.5 rounded-lg animate-pulse-glow"
          >
            Sign in →
          </button>
        )}
        <p className="text-[10px] text-cyan-300/40 tracking-wider mt-2">
          Press Enter or click to continue
        </p>
      </div>

      <div className="absolute bottom-8 flex gap-6 text-cyan-300/60">
        <button className="hover:text-cyan-300 transition" title="Accessibility">♿</button>
        <button className="hover:text-cyan-300 transition" title="Network">📶</button>
        <button className="hover:text-cyan-300 transition" title="Power">⏻</button>
      </div>
    </div>
  );
}
