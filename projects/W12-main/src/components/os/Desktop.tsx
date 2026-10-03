"use client";

import { useState, useRef } from "react";
import { useOS } from "@/store/os";
import { APP_MAP } from "@/lib/apps";
import { cn } from "@/lib/utils";

export default function Desktop() {
  const { desktopIcons, moveDesktopIcon, removeDesktopIcon, openApp, settings } = useOS();
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const onIconPointerDown = (e: React.PointerEvent, id: string) => {
    const icon = desktopIcons.find((i) => i.id === id);
    if (!icon) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging({ id, offX: e.clientX - rect.left, offY: e.clientY - rect.top });
    setSelected(id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const parent = desktopRef.current?.getBoundingClientRect();
    if (!parent) return;
    const x = Math.max(0, e.clientX - parent.left - dragging.offX);
    const y = Math.max(0, e.clientY - parent.top - dragging.offY);
    moveDesktopIcon(dragging.id, x, y);
  };

  const onPointerUp = () => setDragging(null);

  const wallpaperClass =
    settings.wallpaper === "neon-grid"
      ? "neon-wallpaper"
      : settings.wallpaper === "aurora"
      ? "bg-gradient-to-br from-purple-900 via-fuchsia-800 to-cyan-700"
      : settings.wallpaper === "matrix"
      ? "bg-gradient-to-b from-green-950 via-emerald-900 to-black"
      : settings.wallpaper === "sunset"
      ? "bg-gradient-to-br from-orange-600 via-pink-700 to-purple-900"
      : settings.wallpaper === "ocean"
      ? "bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-600"
      : "neon-wallpaper";

  return (
    <div
      ref={desktopRef}
      className={cn("absolute inset-0 overflow-hidden", wallpaperClass)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelected(null);
          setCtxMenu(null);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {settings.wallpaper === "neon-grid" && <div className="absolute inset-0 neon-grid opacity-30 pointer-events-none" />}

      {/* Desktop icons */}
      {desktopIcons.map((icon) => {
        const def = APP_MAP[icon.appId];
        if (!def) return null;
        return (
          <div
            key={icon.id}
            className={cn(
              "absolute w-20 flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors",
              selected === icon.id ? "bg-cyan-500/25 neon-border-cyan" : "hover:bg-white/5"
            )}
            style={{ left: icon.x, top: icon.y }}
            onPointerDown={(e) => onIconPointerDown(e, icon.id)}
            onDoubleClick={() => openApp(icon.appId)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelected(icon.id);
              setCtxMenu({ x: e.clientX, y: e.clientY, iconId: icon.id });
            }}
          >
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl neon-glow", def.color)}>
              {def.icon}
            </div>
            <span className="text-xs text-cyan-100 text-center leading-tight drop-shadow-[0_0_4px_rgba(0,240,255,0.7)]">
              {icon.label}
            </span>
          </div>
        );
      })}

      {/* Context menu */}
      {ctxMenu && (
        <div
          className="absolute glass-strong rounded-lg neon-border-cyan py-1 min-w-[180px] z-50 animate-float-up"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {ctxMenu.iconId ? (
            <>
              <MenuItem label="Open" onClick={() => {
                const ic = desktopIcons.find(i => i.id === ctxMenu.iconId);
                if (ic) openApp(ic.appId);
                setCtxMenu(null);
              }} />
              <MenuItem label="Add shortcut to desktop" onClick={() => {
                const ic = desktopIcons.find(i => i.id === ctxMenu.iconId);
                if (ic) useOS.getState().addDesktopIcon(ic.appId);
                setCtxMenu(null);
              }} />
              <MenuItem label="Delete shortcut" danger onClick={() => {
                if (ctxMenu.iconId) removeDesktopIcon(ctxMenu.iconId);
                setCtxMenu(null);
              }} />
            </>
          ) : (
            <>
              <MenuItem label="🔄 Refresh desktop" onClick={() => setCtxMenu(null)} />
              <MenuItem label="🎨 Personalize" onClick={() => { openApp("settings"); setCtxMenu(null); }} />
              <MenuItem label="⬛ Open Terminal" onClick={() => { openApp("terminal"); setCtxMenu(null); }} />
              <MenuItem label="🛍️ Open Store" onClick={() => { openApp("store"); setCtxMenu(null); }} />
              <MenuItem label="📊 Display settings" onClick={() => { openApp("settings"); setCtxMenu(null); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-1.5 text-xs hover:bg-cyan-500/20 transition",
        danger ? "text-fuchsia-300 hover:bg-fuchsia-500/20" : "text-cyan-100"
      )}
    >
      {label}
    </button>
  );
}
