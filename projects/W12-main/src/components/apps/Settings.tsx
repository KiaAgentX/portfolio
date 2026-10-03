"use client";

import { useState } from "react";
import { useOS, type SettingsData } from "@/store/os";
import { cn } from "@/lib/utils";

type Key = keyof SettingsData;

interface FieldDef {
  key: Key;
  label: string;
  type: "toggle" | "slider" | "select" | "text" | "number";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  desc?: string;
}

interface Category {
  id: string;
  icon: string;
  name: string;
  fields: FieldDef[];
}

const CATEGORIES: Category[] = [
  {
    id: "personalization",
    icon: "🎨",
    name: "Personalization",
    fields: [
      { key: "accentColor", label: "Accent color", type: "select", options: ["#00f0ff", "#ff2bd6", "#a855f7", "#4f7cff", "#22c55e", "#f59e0b"] },
      { key: "wallpaper", label: "Wallpaper", type: "select", options: ["neon-grid", "aurora", "matrix", "sunset", "ocean"] },
      { key: "neonIntensity", label: "Neon intensity", type: "slider", min: 0, max: 100, desc: "Glow strength" },
      { key: "transparency", label: "Window transparency", type: "slider", min: 0, max: 100 },
      { key: "glassBlur", label: "Glass blur radius", type: "slider", min: 0, max: 40 },
      { key: "darkMode", label: "Dark mode", type: "toggle" },
      { key: "highContrast", label: "High contrast", type: "toggle" },
      { key: "animationsEnabled", label: "Animations", type: "toggle" },
      { key: "taskbarPosition", label: "Taskbar position", type: "select", options: ["bottom", "top", "left", "right"] },
      { key: "taskbarTransparency", label: "Transparent taskbar", type: "toggle" },
      { key: "fontSize", label: "Font size", type: "slider", min: 10, max: 24 },
      { key: "fontFamily", label: "Font family", type: "select", options: ["Segoe UI", "Inter", "Roboto Mono", "JetBrains Mono"] },
      { key: "cursorSize", label: "Cursor size", type: "slider", min: 12, max: 32 },
      { key: "showSecondsInClock", label: "Show seconds in clock", type: "toggle" },
      { key: "clock24h", label: "24-hour clock", type: "toggle" },
      { key: "lockScreenWallpaper", label: "Lock screen wallpaper", type: "select", options: ["neon-grid", "aurora", "matrix", "sunset", "ocean"] },
      { key: "startMenuLayout", label: "Start menu layout", type: "select", options: ["grid", "list"] },
      { key: "iconSize", label: "Desktop icon size", type: "slider", min: 10, max: 32 },
    ],
  },
  {
    id: "system",
    icon: "💻",
    name: "System",
    fields: [
      { key: "computerName", label: "Computer name", type: "text" },
      { key: "userName", label: "User name", type: "text" },
      { key: "password", label: "Login password", type: "text", desc: "Leave empty for no password" },
      { key: "startupSound", label: "Startup sound", type: "toggle" },
      { key: "fastStartup", label: "Fast startup", type: "toggle" },
      { key: "autoUpdates", label: "Automatic updates", type: "toggle" },
      { key: "developerMode", label: "Developer mode", type: "toggle" },
      { key: "virtualMemory", label: "Virtual memory (MB)", type: "number", min: 1024, max: 65536 },
      { key: "powerPlan", label: "Power plan", type: "select", options: ["balanced", "performance", "saver"] },
      { key: "sleepTimeout", label: "Sleep after (min)", type: "slider", min: 1, max: 120 },
      { key: "screenTimeout", label: "Screen off after (min)", type: "slider", min: 1, max: 120 },
      { key: "autoRestart", label: "Auto restart on crash", type: "toggle" },
      { key: "crashDump", label: "Crash dump logging", type: "toggle" },
      { key: "hibernate", label: "Hibernate enabled", type: "toggle" },
    ],
  },
  {
    id: "display",
    icon: "🖥️",
    name: "Display",
    fields: [
      { key: "brightness", label: "Brightness", type: "slider", min: 10, max: 100 },
      { key: "nightLight", label: "Night light", type: "toggle" },
      { key: "hdr", label: "HDR", type: "toggle" },
      { key: "resolution", label: "Resolution", type: "select", options: ["1920 x 1080", "2560 x 1440", "3840 x 2160", "5120 x 2880"] },
      { key: "refreshRate", label: "Refresh rate", type: "select", options: ["60 Hz", "120 Hz", "144 Hz", "240 Hz"] },
      { key: "scale", label: "Scale %", type: "slider", min: 100, max: 200, step: 5 },
      { key: "orientation", label: "Orientation", type: "select", options: ["landscape", "portrait"] },
      { key: "colorProfile", label: "Color profile", type: "select", options: ["srgb", "adobe", "p3"] },
      { key: "autoBrightness", label: "Adaptive brightness", type: "toggle" },
    ],
  },
  {
    id: "sound",
    icon: "🔊",
    name: "Sound",
    fields: [
      { key: "masterVolume", label: "Master volume", type: "slider", min: 0, max: 100 },
      { key: "systemVolume", label: "System sounds", type: "slider", min: 0, max: 100 },
      { key: "musicVolume", label: "Music volume", type: "slider", min: 0, max: 100 },
      { key: "notificationsVolume", label: "Notifications", type: "slider", min: 0, max: 100 },
      { key: "muteAll", label: "Mute all", type: "toggle" },
      { key: "monoAudio", label: "Mono audio", type: "toggle" },
      { key: "captionSize", label: "Caption size", type: "slider", min: 10, max: 32 },
      { key: "spatialAudio", label: "Spatial audio", type: "toggle" },
      { key: "audioEnhancements", label: "Audio enhancements", type: "toggle" },
    ],
  },
  {
    id: "network",
    icon: "📶",
    name: "Network & Internet",
    fields: [
      { key: "wifiEnabled", label: "Wi-Fi", type: "toggle" },
      { key: "bluetoothEnabled", label: "Bluetooth", type: "toggle" },
      { key: "airplaneMode", label: "Airplane mode", type: "toggle" },
      { key: "hotspotName", label: "Hotspot name", type: "text" },
      { key: "hotspotPassword", label: "Hotspot password", type: "text" },
      { key: "proxyEnabled", label: "Proxy", type: "toggle" },
      { key: "vpnName", label: "VPN name", type: "text" },
      { key: "meteredConnection", label: "Metered connection", type: "toggle" },
      { key: "dataSaver", label: "Data saver", type: "toggle" },
    ],
  },
  {
    id: "privacy",
    icon: "🛡️",
    name: "Privacy & Security",
    fields: [
      { key: "locationEnabled", label: "Location services", type: "toggle" },
      { key: "cameraAccess", label: "Camera access", type: "toggle" },
      { key: "microphoneAccess", label: "Microphone access", type: "toggle" },
      { key: "telemetry", label: "Telemetry", type: "toggle" },
      { key: "adTracking", label: "Ad tracking", type: "toggle" },
      { key: "biometricUnlock", label: "Biometric unlock", type: "toggle" },
      { key: "firewall", label: "Firewall", type: "toggle" },
      { key: "antivirus", label: "Antivirus", type: "toggle" },
      { key: "autoLock", label: "Auto lock", type: "toggle" },
      { key: "lockTimeout", label: "Lock timeout (min)", type: "slider", min: 1, max: 60 },
      { key: "twoFactor", label: "Two-factor auth", type: "toggle" },
      { key: "telemetry2", label: "Diagnostic data", type: "toggle" },
      { key: "feedbackFrequency", label: "Feedback frequency", type: "select", options: ["never", "sometimes", "always"] },
      { key: "appDiagnostics", label: "App diagnostics", type: "toggle" },
    ],
  },
  {
    id: "notifications",
    icon: "🔔",
    name: "Notifications",
    fields: [
      { key: "notificationsEnabled", label: "Notifications", type: "toggle" },
      { key: "quietHours", label: "Quiet hours", type: "toggle" },
      { key: "quietStart", label: "Quiet start", type: "text" },
      { key: "quietEnd", label: "Quiet end", type: "text" },
      { key: "lockScreenNotifications", label: "Lock screen notifications", type: "toggle" },
      { key: "showPreviews", label: "Show previews", type: "toggle" },
      { key: "badgeIcons", label: "Badge app icons", type: "toggle" },
      { key: "reminderNotifications", label: "Reminder notifications", type: "toggle" },
    ],
  },
  {
    id: "apps",
    icon: "📦",
    name: "Apps",
    fields: [
      { key: "defaultBrowser", label: "Default browser", type: "select", options: ["neonedge", "neoncode", "other"] },
      { key: "defaultMail", label: "Default mail", type: "select", options: ["neonmail", "other"] },
      { key: "defaultTerminal", label: "Default terminal", type: "select", options: ["terminal", "neoncode"] },
      { key: "storageSense", label: "Storage sense", type: "toggle" },
      { key: "autoDeleteTrash", label: "Auto delete trash", type: "toggle" },
    ],
  },
  {
    id: "account",
    icon: "👤",
    name: "Account",
    fields: [
      { key: "profilePicture", label: "Profile picture", type: "select", options: ["🧑‍💻", "👩‍💻", "🧙", "🦊", "🤖", "👾", "🐱", "🐉"] },
      { key: "email", label: "Email", type: "text" },
      { key: "bio", label: "Bio", type: "text" },
    ],
  },
  {
    id: "gaming",
    icon: "🎮",
    name: "Gaming",
    fields: [
      { key: "gameMode", label: "Game mode", type: "toggle" },
      { key: "gameBar", label: "Game bar", type: "toggle" },
      { key: "variableRefresh", label: "Variable refresh rate", type: "toggle" },
      { key: "autoHdr", label: "Auto HDR", type: "toggle" },
    ],
  },
  {
    id: "accessibility",
    icon: "♿",
    name: "Accessibility",
    fields: [
      { key: "narrator", label: "Narrator", type: "toggle" },
      { key: "magnifier", label: "Magnifier", type: "toggle" },
      { key: "highContrastText", label: "High contrast text", type: "toggle" },
      { key: "stickyKeys", label: "Sticky keys", type: "toggle" },
      { key: "filterKeys", label: "Filter keys", type: "toggle" },
      { key: "toggleKeys", label: "Toggle keys", type: "toggle" },
      { key: "reducedMotion", label: "Reduced motion", type: "toggle" },
    ],
  },
  {
    id: "advanced",
    icon: "⚡",
    name: "Advanced",
    fields: [
      { key: "experimentalFeatures", label: "Experimental features", type: "toggle" },
      { key: "betaChannel", label: "Beta channel", type: "toggle" },
      { key: "tipsEnabled", label: "Tips & suggestions", type: "toggle" },
      { key: "autoSaveEnabled", label: "Auto-save", type: "toggle" },
    ],
  },
];

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useOS();
  const [active, setActive] = useState("personalization");
  const [search, setSearch] = useState("");
  const cat = CATEGORIES.find((c) => c.id === active)!;

  const filteredFields = search
    ? cat.fields.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()))
    : cat.fields;

  // Count total options across all categories
  const totalOptions = CATEGORIES.reduce((s, c) => s + c.fields.length, 0);

  const set = (key: Key, value: unknown) => updateSettings({ [key]: value } as Partial<SettingsData>);

  return (
    <div className="flex h-full bg-black/40">
      {/* Sidebar */}
      <div className="w-56 bg-gradient-to-b from-purple-950/40 to-cyan-950/30 border-r border-cyan-500/20 overflow-y-auto p-3 space-y-1">
        <div className="mb-3 px-2">
          <h2 className="text-sm font-bold neon-text-cyan">Settings</h2>
          <p className="text-[10px] text-cyan-300/60">{totalOptions} options available</p>
        </div>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition",
              active === c.id ? "bg-cyan-500/25 neon-border-cyan text-cyan-100" : "hover:bg-cyan-500/10 text-cyan-200/80"
            )}
          >
            <span className="text-base">{c.icon}</span>
            {c.name}
          </button>
        ))}
        <button
          onClick={resetSettings}
          className="w-full mt-3 text-[10px] text-fuchsia-300 hover:text-fuchsia-200 px-3 py-2"
        >
          ↺ Reset to defaults
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{cat.icon}</span>
          <div>
            <h1 className="text-xl font-bold neon-text-cyan">{cat.name}</h1>
            <p className="text-[11px] text-cyan-300/60">{cat.fields.length} options</p>
          </div>
        </div>

        <input
          placeholder={`Filter ${cat.name}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neon-input w-full mb-4"
        />

        <div className="space-y-2">
          {filteredFields.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30 transition">
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-cyan-100 block">{f.label}</label>
                {f.desc && <p className="text-[10px] text-cyan-300/50">{f.desc}</p>}
              </div>
              <div className="flex-shrink-0">
                <FieldEditor field={f} value={settings[f.key]} onChange={(v) => set(f.key, v)} />
              </div>
            </div>
          ))}
          {filteredFields.length === 0 && (
            <p className="text-center text-cyan-300/50 text-xs mt-8">No matching options.</p>
          )}
        </div>

        <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/20">
          <p className="text-[10px] text-cyan-300/70">
            💡 Windows 12 PRO Neon Edition · {totalOptions} configurable options · Settings are saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "toggle":
      return (
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "w-11 h-6 rounded-full transition relative",
            value ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 neon-glow" : "bg-black/60 border border-cyan-500/30"
          )}
        >
          <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", value ? "left-[22px]" : "left-0.5")} />
        </button>
      );
    case "slider":
      return (
        <div className="flex items-center gap-2 w-48">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={value as number}
            onChange={(e) => onChange(+e.target.value)}
            className="neon-range flex-1"
          />
          <span className="text-[10px] text-cyan-300 tabular-nums w-10 text-right">{value as number}{field.step && field.step < 10 ? "" : "%"}</span>
        </div>
      );
    case "select":
      return (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="neon-input text-xs"
        >
          {field.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    case "text":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="neon-input text-xs w-48"
        />
      );
    case "number":
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value as number}
          onChange={(e) => onChange(+e.target.value)}
          className="neon-input text-xs w-32"
        />
      );
  }
}
