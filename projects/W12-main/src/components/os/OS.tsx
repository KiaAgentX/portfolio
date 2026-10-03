"use client";

import { useEffect } from "react";
import { useOS } from "@/store/os";
import BootScreen from "@/components/os/BootScreen";
import LoginScreen from "@/components/os/LoginScreen";
import Desktop from "@/components/os/Desktop";
import Taskbar from "@/components/os/Taskbar";
import StartMenu from "@/components/os/StartMenu";
import WindowManager from "@/components/os/WindowManager";

export default function OS() {
  const { booted, loggedIn, startMenuOpen, setStartMenu, settings } = useOS();

  // Apply dynamic CSS variables based on settings
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--neon-cyan", settings.accentColor);
    root.style.setProperty("--bg-0", settings.darkMode ? "#05060d" : "#1a1a2e");
    document.body.style.filter = `brightness(${0.4 + settings.brightness / 100 * 0.6})`;
    if (settings.reducedMotion) {
      document.body.style.setProperty("--tw-animate-duration", "0s");
    }
  }, [settings.accentColor, settings.brightness, settings.darkMode, settings.reducedMotion]);

  if (!booted) return <BootScreen />;
  if (!loggedIn) return <LoginScreen />;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Desktop />
      <WindowManager />
      <Taskbar />
      {startMenuOpen && <StartMenu />}
      {/* Notification toasts */}
      <NotificationToasts />
    </div>
  );
}

function NotificationToasts() {
  const { notifications, dismissNotification } = useOS();
  return (
    <div className="absolute bottom-16 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
      {notifications.slice(-3).map((n) => (
        <div
          key={n.id}
          className="glass-strong rounded-lg neon-border-cyan p-3 w-72 animate-float-up pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold neon-text-cyan">{n.title}</p>
              <p className="text-[11px] text-cyan-200/80 mt-0.5">{n.body}</p>
            </div>
            <button onClick={() => dismissNotification(n.id)} className="text-cyan-300/60 hover:text-cyan-100 text-xs">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
