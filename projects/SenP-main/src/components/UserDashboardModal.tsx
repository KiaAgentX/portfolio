import React, { useState, useEffect } from "react";
import { UserAccount, UsageStats } from "../types";
import {
  Globe,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  Database,
  Mail,
  Calendar,
  Key,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  ExternalLink,
  Terminal,
  RefreshCw,
  Cpu,
  Award,
  Lock,
  ArrowRight
} from "lucide-react";

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  usage: UsageStats;
  onUpdateSyncSettings?: (newSettings: any) => void;
  showToast: (message: string, type?: "success" | "error" | "info" | "warn") => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onLogout,
  usage,
  onUpdateSyncSettings,
  showToast,
}) => {
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "sync" | "economy" | "oauth_setup">("profile");
  
  // Local state for sync toggles
  const [syncSettings, setSyncSettings] = useState({
    googleDriveBackup: user?.syncSettings?.googleDriveBackup ?? true,
    gmailRelay: user?.syncSettings?.gmailRelay ?? false,
    calendarMissions: user?.syncSettings?.calendarMissions ?? true,
  });

  useEffect(() => {
    if (user?.syncSettings) {
      setSyncSettings(user.syncSettings);
    }
  }, [user]);

  // Mandatory OAuth callback URL for Google Cloud setup
  const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "https://your-app.run.app/auth/callback";

  // Handle OAuth Popup Flow as mandated by oauth-integration skill
  const handleGoogleOAuthLogin = async () => {
    try {
      setIsLoggingIn(true);
      showToast("Initiating Google Synaptic OAuth 2.0 sequence...", "info");
      
      const response = await fetch("/api/auth/url");
      if (!response.ok) {
        throw new Error("Failed to get Google OAuth URL from Neural Server.");
      }
      const { url, mode } = await response.json();
      
      if (mode === "sandbox") {
        showToast("Sandbox Demo Mode: Opening local simulated Google authentication popup...", "info");
      }

      // Open OAuth provider URL directly in popup
      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700,menubar=no,toolbar=no,location=no,status=no"
      );

      if (!authWindow) {
        setIsLoggingIn(false);
        showToast("Popup was blocked by browser! Please allow popups to connect Google account.", "error");
        return;
      }

      // We also listen for OAUTH_AUTH_SUCCESS from postMessage in App.tsx / modal
    } catch (err: any) {
      setIsLoggingIn(false);
      showToast(err.message || "OAuth login error occurred.", "error");
    }
  };

  // Instant sandbox demo login for immediate satisfaction without opening popup
  const handleInstantSandboxLogin = () => {
    const demoUser: UserAccount = {
      id: "google-voyager-" + Math.floor(1000 + Math.random() * 9000),
      name: "Alex Senpai (Google Voyager)",
      email: "alex.senpai@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      authProvider: "google",
      role: "Google Synaptic Voyager - Tier 1",
      tokensEarned: usage.totalTokens || 1500,
      connectedAt: new Date().toISOString(),
      scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.appdata"],
      syncSettings: {
        googleDriveBackup: true,
        gmailRelay: false,
        calendarMissions: true,
      }
    };
    onLoginSuccess(demoUser);
    showToast("✅ Successfully connected Google Account: " + demoUser.email, "success");
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    showToast("Exact OAuth Callback URL copied to clipboard!", "success");
    setTimeout(() => setCopiedCallback(false), 3000);
  };

  const handleToggleSync = (key: keyof typeof syncSettings) => {
    const updated = { ...syncSettings, [key]: !syncSettings[key] };
    setSyncSettings(updated);
    if (onUpdateSyncSettings) {
      onUpdateSyncSettings(updated);
    }
    showToast(`Updated Google ${key} setting to ${updated[key] ? "ENABLED" : "DISABLED"}.`, "info");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              {user ? <UserCheck className="w-5 h-5" /> : <Globe className="w-5 h-5 animate-spin-slow" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {user ? "🌌 NEURAL VOYAGER DASHBOARD" : "🌐 SYNAPTIC LOGIN PORTAL"}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  {user ? "AUTH: GOOGLE OAUTH 2.0" : "/dashboard & /login"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {user ? `Connected as ${user.email} // Neural Synapse Verified` : "Connect your Google Account for cloud sync, token rewards & Cortex City persistence."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-mono text-xs"
          >
            ESC [X]
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!user ? (
            /* =========================================
               LOGGED OUT: LOGIN WITH GOOGLE PORTAL
            ========================================= */
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden shadow-lg">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-inner">
                  <span className="text-4xl">🌐</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Connect Your Google Account
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
                  Sign in with Google OAuth 2.0 to sync your 3D neural topologies across devices, claim your daily synaptic token rewards, and construct permanent towers in Cortex City.
                </p>

                {/* Primary Google Login Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleGoogleOAuthLogin}
                    disabled={isLoggingIn}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>LOGIN WITH GOOGLE</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={handleInstantSandboxLogin}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-cyan-400 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>⚡ Instant Sandbox Demo</span>
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cross-Origin Iframe Safe</span>
                  <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-cyan-400" /> OAuth 2.0 PKCE Verified</span>
                </div>
              </div>

              {/* AI Studio OAuth Setup Checklist (Mandated by oauth-integration skill) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                      📋 OAuth Provider Configuration Checklist (AI Studio Developers)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">SKILL: oauth-integration</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  When running inside the AI Studio preview iframe, OAuth popups must open the provider URL directly. To configure Google Cloud Console, add the exact callback URL below to your OAuth 2.0 Client credentials:
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">REDIRECT URI</span>
                    <code className="text-xs font-mono text-slate-200 truncate select-all">{callbackUrl}</code>
                  </div>
                  <button
                    onClick={handleCopyCallback}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCallback ? "COPIED!" : "COPY URI"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">1.</span>
                    <span>Set <code className="text-slate-200 bg-slate-800 px-1 rounded">GOOGLE_CLIENT_ID</code> in your AI Studio Environment Variables.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">2.</span>
                    <span>Add both Development & Shared Container URLs to Google API console.</span>
                  </div>
                </div>
              </div>

              {/* Scopes Overview */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-slate-400">Requested Neural Scopes:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">openid</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">email</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">profile</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-cyan-800">drive.appdata (Topology Sync)</span>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================
               LOGGED IN: NEURAL VOYAGER DASHBOARD (/dashboard)
            ========================================= */
            <div className="space-y-6">
              {/* Navigation Tabs inside Dashboard */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${activeTab === "profile" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>SYNAPTIC PROFILE</span>
                </button>
                <button
                  onClick={() => setActiveTab("economy")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${activeTab === "economy" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>NEURAL ECONOMY & CORTEX</span>
                </button>
                <button
                  onClick={() => setActiveTab("sync")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${activeTab === "sync" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>WORKSPACE SYNC</span>
                </button>
                <button
                  onClick={() => setActiveTab("oauth_setup")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${activeTab === "oauth_setup" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>OAUTH CONFIG</span>
                </button>
              </div>

              {/* Tab 1: Profile Overview */}
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt={user.name}
                        className="w-16 h-16 rounded-2xl border-2 border-cyan-500/50 shadow-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{user.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ONLINE
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
                        <p className="text-[11px] text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> {user.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5 w-fit">
                        <Globe className="w-3.5 h-3.5 text-blue-400" /> Google OAuth 2.0 PKCE
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Connected: {new Date(user.connectedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">SYNAPTIC RANK</span>
                      <p className="text-base font-bold text-cyan-400 font-mono mt-1">VOYAGER-I</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">NEURAL LEVEL</span>
                      <p className="text-base font-bold text-amber-400 font-mono mt-1">LEVEL 42</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">AUTH PROVIDER</span>
                      <p className="text-base font-bold text-emerald-400 font-mono mt-1 uppercase">{user.authProvider}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">SYNAPSE STREAK</span>
                      <p className="text-base font-bold text-purple-400 font-mono mt-1">7 DAYS 🔥</p>
                    </div>
                  </div>

                  {/* Connected Scopes */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" /> Granted Google Cloud Scopes & Permissions
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(user.scopes || ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.appdata"]).map((sc, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" /> {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Economy & Cortex */}
              {activeTab === "economy" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-950 border border-amber-500/30">
                      <span className="text-xs font-mono text-amber-300/80 uppercase">TOTAL NEURAL TOKENS</span>
                      <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
                        {(usage.totalTokens || 1500).toLocaleString()} <span className="text-xs text-amber-300 font-normal">TOK</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans mt-2">
                        Earned via active Gemini 2.5 Flash conversations & neural burst telemetry.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-950 border border-cyan-500/30">
                      <span className="text-xs font-mono text-cyan-300/80 uppercase">CORTEX CITY TOWERS</span>
                      <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                        {Math.min(40, Math.max(8, Math.floor((usage.totalTokens || 1500) / 80)))} <span className="text-xs text-cyan-300 font-normal">TOWERS</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans mt-2">
                        Type <code className="text-cyan-300 bg-slate-800 px-1 rounded">/city</code> to view your orbital cyberpunk space city built by NPCs!
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-950 border border-emerald-500/30">
                      <span className="text-xs font-mono text-emerald-300/80 uppercase">ESTIMATED API VALUE</span>
                      <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                        ${((usage.totalTokens || 1500) * 0.000015).toFixed(4)} <span className="text-xs text-emerald-300 font-normal">USD</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans mt-2">
                        100% Free Tier sponsored by AI Studio High-Quota Flash engine.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" /> Synaptic Token Rewards & Milestones
                    </h4>
                    <div className="space-y-3 text-xs font-mono">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">🎉 Milestone: First 1,000 Tokens Synthesized</span>
                        <span className="text-emerald-400 font-bold">+12 Cortex Towers Unlocked</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">🌐 Milestone: Google OAuth Identity Linked</span>
                        <span className="text-cyan-400 font-bold">Cloud Backup Activated</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">🎮 Milestone: Ghost POV Flight Mode Pilot</span>
                        <span className="text-purple-400 font-bold">WASD Thrusters Unlocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Workspace Sync */}
              {activeTab === "sync" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-400" /> Google Cloud & Workspace Data Synchronization
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure how your Neural OS session data synchronizes with your connected Google Workspace account.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">Google Drive Neural Backup</p>
                            <p className="text-[11px] text-slate-400">Auto-save your 3D neural topologies and conversation logs to Drive AppData.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSync("googleDriveBackup")}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${syncSettings.googleDriveBackup ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                        >
                          {syncSettings.googleDriveBackup ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">Gmail Synaptic Summary Relay</p>
                            <p className="text-[11px] text-slate-400">Receive daily neural digest reports and token receipts directly in your Gmail inbox.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSync("gmailRelay")}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${syncSettings.gmailRelay ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                        >
                          {syncSettings.gmailRelay ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">Google Calendar Mission Scheduling</p>
                            <p className="text-[11px] text-slate-400">Sync AI study streaks and autonomous training missions to your calendar.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSync("calendarMissions")}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${syncSettings.calendarMissions ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                        >
                          {syncSettings.calendarMissions ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: OAuth Setup Checklist */}
              {activeTab === "oauth_setup" && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                        📋 OAuth Provider Configuration Checklist (AI Studio Developers)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">SKILL: oauth-integration</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    When running inside the AI Studio preview iframe, OAuth popups must open the provider URL directly. To configure Google Cloud Console, add the exact callback URL below to your OAuth 2.0 Client credentials:
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">REDIRECT URI</span>
                      <code className="text-xs font-mono text-slate-200 truncate select-all">{callbackUrl}</code>
                    </div>
                    <button
                      onClick={handleCopyCallback}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 shrink-0 transition-all"
                    >
                      {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCallback ? "COPIED!" : "COPY URI"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <span>Set <code className="text-slate-200 bg-slate-800 px-1 rounded">GOOGLE_CLIENT_ID</code> in your AI Studio Environment Variables.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <span>Add both Development & Shared Container URLs to Google API console.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions for Logged In User */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGoogleOAuthLogin}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Switch Google Account</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    showToast("Logged out of Google Synaptic session.", "info");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>COMMANDS: <code className="text-cyan-400 bg-slate-900 px-1 rounded">/login</code> <code className="text-amber-400 bg-slate-900 px-1 rounded">/dashboard</code></span>
          <span>ANTIGRAVITY SYNAPTIC ENGINE v3.5</span>
        </div>
      </div>
    </div>
  );
};
