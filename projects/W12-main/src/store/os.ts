import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_REGISTRY, APP_MAP, getInstallableApps } from "@/lib/apps";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: { x: number; y: number; w: number; h: number };
  payload?: Record<string, unknown>;
}

export interface DesktopIcon {
  id: string;
  appId: string;
  label: string;
  x: number;
  y: number;
}

export interface SettingsData {
  // Personalization
  accentColor: string;
  wallpaper: string;
  taskbarPosition: "bottom" | "top" | "left" | "right";
  taskbarTransparency: boolean;
  neonIntensity: number;
  animationsEnabled: boolean;
  darkMode: boolean;
  highContrast: boolean;
  transparency: number;
  glassBlur: number;
  fontSize: number;
  fontFamily: string;
  cursorSize: number;
  showSecondsInClock: boolean;
  clock24h: boolean;
  // System
  computerName: string;
  userName: string;
  password: string;
  startupSound: boolean;
  fastStartup: boolean;
  autoUpdates: boolean;
  developerMode: boolean;
  virtualMemory: number;
  powerPlan: "balanced" | "performance" | "saver";
  sleepTimeout: number;
  screenTimeout: number;
  // Network
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  airplaneMode: boolean;
  hotspotName: string;
  hotspotPassword: string;
  proxyEnabled: boolean;
  vpnName: string;
  // Privacy
  locationEnabled: boolean;
  cameraAccess: boolean;
  microphoneAccess: boolean;
  telemetry: boolean;
  adTracking: boolean;
  biometricUnlock: boolean;
  // Notifications
  notificationsEnabled: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  lockScreenNotifications: boolean;
  showPreviews: boolean;
  // Storage
  storageSense: boolean;
  autoDeleteTrash: boolean;
  // Apps
  defaultBrowser: string;
  defaultMail: string;
  defaultTerminal: string;
  // Gaming
  gameMode: boolean;
  gameBar: boolean;
  // Accessibility
  narrator: boolean;
  magnifier: boolean;
  highContrastText: boolean;
  stickyKeys: boolean;
  filterKeys: boolean;
  toggleKeys: boolean;
  reducedMotion: boolean;
  monoAudio: boolean;
  captionSize: number;
  // Sound
  masterVolume: number;
  systemVolume: number;
  musicVolume: number;
  notificationsVolume: number;
  muteAll: boolean;
  // Display
  brightness: number;
  nightLight: boolean;
  hdr: boolean;
  resolution: string;
  refreshRate: string;
  scale: number;
  orientation: "landscape" | "portrait";
  // Account
  profilePicture: string;
  email: string;
  bio: string;
  // Security
  firewall: boolean;
  antivirus: boolean;
  autoLock: boolean;
  lockTimeout: number;
  twoFactor: boolean;
  // Misc
  telemetry2: boolean;
  experimentalFeatures: boolean;
  betaChannel: boolean;
  tipsEnabled: boolean;
  autoSaveEnabled: boolean;
  // Extras (100+ options)
  lockScreenWallpaper: string;
  startMenuLayout: string;
  iconSize: number;
  autoRestart: boolean;
  crashDump: boolean;
  hibernate: boolean;
  colorProfile: string;
  autoBrightness: boolean;
  spatialAudio: boolean;
  audioEnhancements: boolean;
  meteredConnection: boolean;
  dataSaver: boolean;
  feedbackFrequency: string;
  appDiagnostics: boolean;
  badgeIcons: boolean;
  reminderNotifications: boolean;
  variableRefresh: boolean;
  autoHdr: boolean;
}

export const DEFAULT_SETTINGS: SettingsData = {
  accentColor: "#00f0ff",
  wallpaper: "neon-grid",
  taskbarPosition: "bottom",
  taskbarTransparency: true,
  neonIntensity: 80,
  animationsEnabled: true,
  darkMode: true,
  highContrast: false,
  transparency: 70,
  glassBlur: 18,
  fontSize: 14,
  fontFamily: "Segoe UI",
  cursorSize: 16,
  showSecondsInClock: false,
  clock24h: false,
  computerName: "NEON-PC",
  userName: "Neo",
  password: "",
  startupSound: true,
  fastStartup: true,
  autoUpdates: true,
  developerMode: false,
  virtualMemory: 8192,
  powerPlan: "balanced",
  sleepTimeout: 15,
  screenTimeout: 10,
  wifiEnabled: true,
  bluetoothEnabled: false,
  airplaneMode: false,
  hotspotName: "Neon-PC",
  hotspotPassword: "neon12345",
  proxyEnabled: false,
  vpnName: "",
  locationEnabled: false,
  cameraAccess: true,
  microphoneAccess: true,
  telemetry: false,
  adTracking: false,
  biometricUnlock: false,
  notificationsEnabled: true,
  quietHours: false,
  quietStart: "22:00",
  quietEnd: "07:00",
  lockScreenNotifications: true,
  showPreviews: true,
  storageSense: true,
  autoDeleteTrash: false,
  defaultBrowser: "neonedge",
  defaultMail: "neonmail",
  defaultTerminal: "terminal",
  gameMode: true,
  gameBar: false,
  narrator: false,
  magnifier: false,
  highContrastText: false,
  stickyKeys: false,
  filterKeys: false,
  toggleKeys: false,
  reducedMotion: false,
  monoAudio: false,
  captionSize: 14,
  masterVolume: 75,
  systemVolume: 60,
  musicVolume: 80,
  notificationsVolume: 50,
  muteAll: false,
  brightness: 90,
  nightLight: false,
  hdr: true,
  resolution: "2560 x 1440",
  refreshRate: "144 Hz",
  scale: 125,
  orientation: "landscape",
  profilePicture: "🧑‍💻",
  email: "neo@neon.pc",
  bio: "Living in the neon grid.",
  firewall: true,
  antivirus: true,
  autoLock: false,
  lockTimeout: 5,
  twoFactor: false,
  telemetry2: false,
  experimentalFeatures: false,
  betaChannel: false,
  tipsEnabled: true,
  autoSaveEnabled: true,
  lockScreenWallpaper: "neon-grid",
  startMenuLayout: "grid",
  iconSize: 14,
  autoRestart: false,
  crashDump: false,
  hibernate: false,
  colorProfile: "srgb",
  autoBrightness: false,
  spatialAudio: false,
  audioEnhancements: false,
  meteredConnection: false,
  dataSaver: false,
  feedbackFrequency: "sometimes",
  appDiagnostics: false,
  badgeIcons: true,
  reminderNotifications: true,
  variableRefresh: true,
  autoHdr: true,
};

interface OSStore {
  booted: boolean;
  loggedIn: boolean;
  windows: WindowState[];
  zCounter: number;
  startMenuOpen: boolean;
  installedApps: string[]; // app ids installed from store
  desktopIcons: DesktopIcon[];
  settings: SettingsData;
  notifications: { id: string; title: string; body: string; ts: number }[];

  boot: () => void;
  login: (password?: string) => void;
  logout: () => void;
  shutdown: () => void;
  openApp: (appId: string, payload?: Record<string, unknown>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void;
  setStartMenu: (open: boolean) => void;
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  addDesktopIcon: (appId: string) => void;
  removeDesktopIcon: (id: string) => void;
  moveDesktopIcon: (id: string, x: number, y: number) => void;
  updateSettings: (patch: Partial<SettingsData>) => void;
  resetSettings: () => void;
  pushNotification: (n: { title: string; body: string }) => void;
  dismissNotification: (id: string) => void;
}

const DEFAULT_ICONS: DesktopIcon[] = [
  { id: "ic-recycle", appId: "recycle", label: "Recycle Bin", x: 24, y: 24 },
  { id: "ic-files", appId: "files", label: "Files", x: 24, y: 120 },
  { id: "ic-terminal", appId: "terminal", label: "Terminal", x: 24, y: 216 },
  { id: "ic-settings", appId: "settings", label: "Settings", x: 24, y: 312 },
  { id: "ic-store", appId: "store", label: "Neon Store", x: 24, y: 408 },
];

export const useOS = create<OSStore>()(
  persist(
    (set, get) => ({
      booted: false,
      loggedIn: false,
      windows: [],
      zCounter: 10,
      startMenuOpen: false,
      installedApps: [],
      desktopIcons: DEFAULT_ICONS,
      settings: DEFAULT_SETTINGS,
      notifications: [],

      boot: () => set({ booted: true, loggedIn: false }),
      login: () => set({ loggedIn: true }),
      logout: () => set({ loggedIn: false, windows: [], startMenuOpen: false }),
      shutdown: () => set({ booted: false, loggedIn: false, windows: [], startMenuOpen: false }),

      openApp: (appId, payload) => {
        const def = APP_MAP[appId];
        if (!def) return;
        const state = get();
        // If app is already open, focus it
        const existing = state.windows.find((w) => w.appId === appId);
        if (existing) {
          get().focusWindow(existing.id);
          if (existing.minimized) {
            set((s) => ({
              windows: s.windows.map((w) =>
                w.id === existing.id ? { ...w, minimized: false } : w
              ),
            }));
          }
          return;
        }
        const size = def.defaultSize ?? { w: 640, h: 480 };
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const id = `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const z = state.zCounter + 1;
        const offset = state.windows.length * 28;
        const win: WindowState = {
          id,
          appId,
          title: def.name,
          x: Math.max(20, Math.min(vw - size.w - 20, (vw - size.w) / 2 + offset - 80)),
          y: Math.max(20, Math.min(vh - size.h - 80, (vh - size.h) / 2 + offset - 60)),
          w: size.w,
          h: size.h,
          z,
          minimized: false,
          maximized: false,
          payload,
        };
        set((s) => ({ windows: [...s.windows, win], zCounter: z, startMenuOpen: false }));
      },

      closeWindow: (id) =>
        set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
      focusWindow: (id) => {
        const z = get().zCounter + 1;
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)),
          zCounter: z,
        }));
      },
      minimizeWindow: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
        })),
      toggleMaximize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => {
            if (w.id !== id) return w;
            if (w.maximized) {
              const p = w.prev ?? { x: 80, y: 60, w: 640, h: 480 };
              return { ...w, maximized: false, ...p, prev: undefined };
            }
            return {
              ...w,
              maximized: true,
              prev: { x: w.x, y: w.y, w: w.w, h: w.h },
            };
          }),
        })),
      moveWindow: (id, x, y) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
        })),
      resizeWindow: (id, w, h, x, y) =>
        set((s) => ({
          windows: s.windows.map((win) =>
            win.id === id
              ? { ...win, w, h, x: x ?? win.x, y: y ?? win.y }
              : win
          ),
        })),
      setStartMenu: (open) => set({ startMenuOpen: open }),

      installApp: (appId) => {
        const def = APP_MAP[appId];
        if (!def) return;
        const state = get();
        if (state.installedApps.includes(appId)) return;
        const icon: DesktopIcon = {
          id: `ic-${appId}-${Date.now()}`,
          appId,
          label: def.name,
          x: 24,
          y: 24 + (state.desktopIcons.length % 8) * 96,
        };
        set({
          installedApps: [...state.installedApps, appId],
          desktopIcons: [...state.desktopIcons, icon],
        });
        get().pushNotification({
          title: "App installed",
          body: `${def.name} has been installed and a shortcut was added to your desktop.`,
        });
      },
      uninstallApp: (appId) => {
        const state = get();
        set({
          installedApps: state.installedApps.filter((a) => a !== appId),
          desktopIcons: state.desktopIcons.filter((i) => i.appId !== appId || i.id.startsWith("ic-") === false),
          windows: state.windows.filter((w) => w.appId !== appId),
        });
      },
      addDesktopIcon: (appId) => {
        const def = APP_MAP[appId];
        if (!def) return;
        const state = get();
        const icon: DesktopIcon = {
          id: `ic-${appId}-${Date.now()}`,
          appId,
          label: def.name,
          x: 24,
          y: 24 + (state.desktopIcons.length % 8) * 96,
        };
        set({ desktopIcons: [...state.desktopIcons, icon] });
      },
      removeDesktopIcon: (id) =>
        set((s) => ({ desktopIcons: s.desktopIcons.filter((i) => i.id !== id) })),
      moveDesktopIcon: (id, x, y) =>
        set((s) => ({
          desktopIcons: s.desktopIcons.map((i) => (i.id === id ? { ...i, x, y } : i)),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            { id: `n-${Date.now()}`, ...n, ts: Date.now() },
          ].slice(-10),
        })),
      dismissNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: "win12-pro-state",
      partialize: (s) => ({
        settings: s.settings,
        installedApps: s.installedApps,
        desktopIcons: s.desktopIcons,
      }),
    }
  )
);

export function getAvailableApps(installed: string[]): typeof APP_REGISTRY {
  return APP_REGISTRY.filter((a) => a.builtIn || installed.includes(a.id));
}

// re-export registry for convenience
export { APP_REGISTRY, APP_MAP, getInstallableApps };
