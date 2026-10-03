"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { useOS, type WindowState } from "@/store/os";
import { APP_MAP } from "@/lib/apps";
import { cn } from "@/lib/utils";

interface Props {
  win: WindowState;
  children: ReactNode;
}

type DragState =
  | { mode: "move"; startX: number; startY: number; origX: number; origY: number }
  | { mode: "resize"; dir: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number }
  | null;

export default function WindowFrame({ win, children }: Props) {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = useOS();
  const dragRef = useRef<DragState>(null);
  const [, force] = useState(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize", dir?: string) => {
      if (win.maximized && mode === "move") return;
      focusWindow(win.id);
      dragRef.current =
        mode === "move"
          ? { mode, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y }
          : {
              mode,
              dir: dir!,
              startX: e.clientX,
              startY: e.clientY,
              origW: win.w,
              origH: win.h,
              origX: win.x,
              origY: win.y,
            };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [win.id, win.x, win.y, win.w, win.h, win.maximized, focusWindow]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (d.mode === "move") {
        const nx = d.origX + (e.clientX - d.startX);
        const ny = Math.max(0, d.origY + (e.clientY - d.startY));
        moveWindow(win.id, nx, ny);
      } else {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        let w = d.origW;
        let h = d.origH;
        let x = d.origX;
        let y = d.origY;
        const minW = APP_MAP[win.appId]?.minSize?.w ?? 280;
        const minH = APP_MAP[win.appId]?.minSize?.h ?? 200;
        if (d.dir.includes("e")) w = Math.max(minW, d.origW + dx);
        if (d.dir.includes("s")) h = Math.max(minH, d.origH + dy);
        if (d.dir.includes("w")) {
          w = Math.max(minW, d.origW - dx);
          x = d.origX + (d.origW - w);
        }
        if (d.dir.includes("n")) {
          h = Math.max(minH, d.origH - dy);
          y = Math.max(0, d.origY + (d.origH - h));
        }
        resizeWindow(win.id, w, h, x, y);
      }
      force((n) => n + 1);
    },
    [win.id, win.appId, moveWindow, resizeWindow]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (win.minimized) return null;

  const def = APP_MAP[win.appId];
  const style: React.CSSProperties = win.maximized
    ? { left: 0, top: 0, width: "100%", height: "calc(100% - 56px)", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      className={cn(
        "absolute flex flex-col glass-strong rounded-lg overflow-hidden shadow-2xl",
        win.maximized ? "rounded-none" : "neon-border-cyan"
      )}
      style={style}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 h-9 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-fuchsia-950/40 border-b border-cyan-500/20 select-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => onPointerDown(e, "move")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <span className="text-base">{def?.icon ?? "▣"}</span>
        <span className="text-xs font-semibold text-cyan-100/90 flex-1 truncate">
          {win.title}
        </span>
        <button
          className="w-7 h-7 rounded hover:bg-cyan-500/30 flex items-center justify-center text-cyan-200 transition"
          onClick={(e) => {
            e.stopPropagation();
            minimizeWindow(win.id);
          }}
          title="Minimize"
        >
          —
        </button>
        <button
          className="w-7 h-7 rounded hover:bg-purple-500/30 flex items-center justify-center text-purple-200 transition"
          onClick={(e) => {
            e.stopPropagation();
            toggleMaximize(win.id);
          }}
          title="Maximize"
        >
          ▢
        </button>
        <button
          className="w-7 h-7 rounded hover:bg-fuchsia-600/50 flex items-center justify-center text-fuchsia-100 transition"
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(win.id);
          }}
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-black/40">{children}</div>

      {/* Resize handles */}
      {!win.maximized && (
        <>
          <ResizeHandle dir="n" onPointerDown={(e) => onPointerDown(e, "resize", "n")} />
          <ResizeHandle dir="s" onPointerDown={(e) => onPointerDown(e, "resize", "s")} />
          <ResizeHandle dir="e" onPointerDown={(e) => onPointerDown(e, "resize", "e")} />
          <ResizeHandle dir="w" onPointerDown={(e) => onPointerDown(e, "resize", "w")} />
          <ResizeHandle dir="ne" onPointerDown={(e) => onPointerDown(e, "resize", "ne")} />
          <ResizeHandle dir="nw" onPointerDown={(e) => onPointerDown(e, "resize", "nw")} />
          <ResizeHandle dir="se" onPointerDown={(e) => onPointerDown(e, "resize", "se")} />
          <ResizeHandle dir="sw" onPointerDown={(e) => onPointerDown(e, "resize", "sw")} />
        </>
      )}
    </div>
  );
}

function ResizeHandle({
  dir,
  onPointerDown,
}: {
  dir: string;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const cursors: Record<string, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
  };
  const positions: Record<string, string> = {
    n: "top-0 left-1 right-1 h-1",
    s: "bottom-0 left-1 right-1 h-1",
    e: "right-0 top-1 bottom-1 w-1",
    w: "left-0 top-1 bottom-1 w-1",
    ne: "top-0 right-0 w-2 h-2",
    nw: "top-0 left-0 w-2 h-2",
    se: "bottom-0 right-0 w-2 h-2",
    sw: "bottom-0 left-0 w-2 h-2",
  };
  return (
    <div
      className={`absolute ${positions[dir]} cursor-${cursors[dir]} z-10`}
      onPointerDown={onPointerDown}
    />
  );
}
