import type { ComponentType } from "react";

export type AppCategory = "system" | "productivity" | "media" | "tools" | "store" | "social";

export interface AppDef {
  id: string;
  name: string;
  icon: string; // emoji or short label
  color: string; // tailwind gradient classes
  category: AppCategory;
  builtIn?: boolean;
  description: string;
  component?: ComponentType<{ appId: string }>;
  defaultSize?: { w: number; h: number };
  minSize?: { w: number; h: number };
}

// Apps loaded lazily via dynamic import are registered here
// We keep registry lightweight; actual components live in /apps
export const APP_REGISTRY: AppDef[] = [
  {
    id: "terminal",
    name: "Terminal",
    icon: "⬛",
    color: "from-cyan-500/30 to-purple-600/30",
    category: "system",
    builtIn: true,
    description: "Neon command-line shell with virtual filesystem",
    defaultSize: { w: 720, h: 460 },
    minSize: { w: 420, h: 280 },
  },
  {
    id: "files",
    name: "File Explorer",
    icon: "📁",
    color: "from-amber-500/30 to-cyan-500/30",
    category: "system",
    builtIn: true,
    description: "Browse your virtual neon filesystem",
    defaultSize: { w: 760, h: 500 },
    minSize: { w: 480, h: 320 },
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    color: "from-slate-400/30 to-cyan-500/30",
    category: "system",
    builtIn: true,
    description: "100+ personalization & system options",
    defaultSize: { w: 880, h: 600 },
    minSize: { w: 560, h: 380 },
  },
  {
    id: "notepad",
    name: "Notepad",
    icon: "📝",
    color: "from-yellow-400/30 to-cyan-500/30",
    category: "productivity",
    builtIn: true,
    description: "Neon text editor with autosave",
    defaultSize: { w: 640, h: 480 },
    minSize: { w: 360, h: 260 },
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    color: "from-green-400/30 to-cyan-500/30",
    category: "tools",
    builtIn: true,
    description: "Neon calculator with history",
    defaultSize: { w: 360, h: 520 },
    minSize: { w: 300, h: 420 },
  },
  {
    id: "browser",
    name: "NeonEdge Browser",
    icon: "🌐",
    color: "from-blue-500/30 to-cyan-400/30",
    category: "system",
    builtIn: true,
    description: "Surf the web in neon style",
    defaultSize: { w: 900, h: 600 },
    minSize: { w: 480, h: 320 },
  },
  {
    id: "paint",
    name: "Paint",
    icon: "🎨",
    color: "from-pink-500/30 to-purple-500/30",
    category: "media",
    builtIn: true,
    description: "Neon canvas drawing app",
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 420, h: 360 },
  },
  {
    id: "store",
    name: "Neon Store",
    icon: "🛍️",
    color: "from-fuchsia-500/30 to-cyan-500/30",
    category: "store",
    builtIn: true,
    description: "Install more apps with one click — shortcuts added to desktop",
    defaultSize: { w: 860, h: 580 },
    minSize: { w: 520, h: 380 },
  },
  {
    id: "clock",
    name: "Clock",
    icon: "⏰",
    color: "from-indigo-500/30 to-cyan-500/30",
    category: "tools",
    builtIn: true,
    description: "World clock, timer & stopwatch",
    defaultSize: { w: 420, h: 460 },
    minSize: { w: 320, h: 360 },
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "📅",
    color: "from-rose-500/30 to-purple-500/30",
    category: "productivity",
    builtIn: true,
    description: "Neon calendar with events",
    defaultSize: { w: 680, h: 540 },
    minSize: { w: 420, h: 360 },
  },
  // Installable apps (not built-in)
  {
    id: "music",
    name: "Neon Beats",
    icon: "🎵",
    color: "from-purple-500/30 to-pink-500/30",
    category: "media",
    description: "Synthwave music player",
    defaultSize: { w: 480, h: 540 },
    minSize: { w: 360, h: 420 },
  },
  {
    id: "photos",
    name: "Photos",
    icon: "🖼️",
    color: "from-emerald-500/30 to-cyan-500/30",
    category: "media",
    description: "Neon photo gallery viewer",
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 420, h: 360 },
  },
  {
    id: "code",
    name: "NeonCode",
    icon: "💻",
    color: "from-blue-500/30 to-purple-500/30",
    category: "tools",
    description: "Lightweight code editor with syntax highlighting",
    defaultSize: { w: 820, h: 580 },
    minSize: { w: 480, h: 360 },
  },
  {
    id: "weather",
    name: "Weather",
    icon: "🌤️",
    color: "from-sky-400/30 to-cyan-500/30",
    category: "tools",
    description: "Neon weather dashboard",
    defaultSize: { w: 480, h: 540 },
    minSize: { w: 360, h: 420 },
  },
  {
    id: "mail",
    name: "NeonMail",
    icon: "✉️",
    color: "from-blue-400/30 to-indigo-500/30",
    category: "social",
    description: "Futuristic mail client",
    defaultSize: { w: 760, h: 540 },
    minSize: { w: 480, h: 360 },
  },
  {
    id: "chat",
    name: "NeonChat",
    icon: "💬",
    color: "from-teal-400/30 to-cyan-500/30",
    category: "social",
    description: "Holographic messenger",
    defaultSize: { w: 560, h: 540 },
    minSize: { w: 380, h: 360 },
  },
  {
    id: "games",
    name: "Arcade",
    icon: "🎮",
    color: "from-fuchsia-500/30 to-orange-500/30",
    category: "media",
    description: "Mini neon arcade games",
    defaultSize: { w: 640, h: 540 },
    minSize: { w: 420, h: 360 },
  },
  {
    id: "maps",
    name: "Maps",
    icon: "🗺️",
    color: "from-green-400/30 to-emerald-500/30",
    category: "tools",
    description: "Neon city navigator",
    defaultSize: { w: 760, h: 560 },
    minSize: { w: 480, h: 360 },
  },
  {
    id: "notes",
    name: "Sticky Notes",
    icon: "🗒️",
    color: "from-yellow-400/30 to-amber-500/30",
    category: "productivity",
    description: "Colorful neon sticky notes",
    defaultSize: { w: 360, h: 360 },
    minSize: { w: 280, h: 280 },
  },
  {
    id: "taskmgr",
    name: "Task Manager",
    icon: "📊",
    color: "from-red-500/30 to-orange-500/30",
    category: "system",
    description: "Monitor running apps & resources",
    defaultSize: { w: 640, h: 480 },
    minSize: { w: 420, h: 320 },
  },
  {
    id: "camera",
    name: "Camera",
    icon: "📷",
    color: "from-slate-400/30 to-cyan-500/30",
    category: "media",
    description: "Neon webcam with filters",
    defaultSize: { w: 560, h: 480 },
    minSize: { w: 360, h: 320 },
  },
  {
    id: "recycle",
    name: "Recycle Bin",
    icon: "🗑️",
    color: "from-slate-500/30 to-green-500/30",
    category: "system",
    description: "Restore or purge deleted files",
    defaultSize: { w: 640, h: 460 },
    minSize: { w: 380, h: 300 },
  },
];

export const APP_MAP: Record<string, AppDef> = Object.fromEntries(
  APP_REGISTRY.map((a) => [a.id, a])
);

export function getInstallableApps() {
  return APP_REGISTRY.filter((a) => !a.builtIn);
}
