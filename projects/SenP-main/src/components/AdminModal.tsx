import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import Markdown from "react-markdown";
import { X, ShieldCheck, Lock, Globe, Newspaper, Cpu, Plus, Trash2, Edit3, Check, RefreshCw, AlertTriangle, Sparkles, Save, Key, BookOpen, Activity, TrendingUp, Clock, Zap, CheckCircle2, ToggleLeft, ToggleRight, Eye, Code, Palette, Sliders, Share2, Link, Folder, Server, Terminal, Heart, MessageSquare, Send } from "lucide-react";
import { AdminConfig, NewsItem, AgentSkill, NeuralMetricPoint, CustomPage, MCPServerConfig, CustomCLICommand, MediaLinks, NeuronCustomization, ThemeCustomization } from "../types";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (config: AdminConfig) => void;
  initialConfig?: AdminConfig | null;
  onRestorePreset?: (preset: any) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  initialConfig,
  onRestorePreset,
}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("neuro_admin_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("neuro_remembered_user") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("neuro_remembered_user"));
  const [botTrap, setBotTrap] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"brand" | "media" | "visuals" | "pages" | "providers_cli" | "news" | "skills" | "neural" | "security">("brand");

  // Config Form State
  const [config, setConfig] = useState<AdminConfig>({
    siteTitle: "NEURO-CHAT // AI OS",
    siteSubtitle: "SYNAPTIC NEURAL INTERFACE // ANTIGRAVITY ENGINE v3.5",
    systemAnnouncement: {
      enabled: true,
      message: "🚀 SYSTEM v3.5 ONLINE // High-quota Gemini 2.5 Flash enabled with Neural Burst Particle Transmission.",
      type: "info",
      timestamp: Date.now(),
    },
    newsFeed: [],
    agentSkills: [],
    customSystemPrompt: "",
    defaultModel: "gemini-2.5-flash",
    defaultTheme: "dark",
    burstSensitivity: 300,
    mediaLinks: {
      youtubeUrl: "https://www.youtube.com/@Matin_SenPai",
      githubUrl: "https://github.com/MatinSenPai",
      twitterUrl: "https://x.com/MatinSenPai",
      donationUrl: "",
      donationText: "Support / Donate",
    },
    neuronCustomization: {
      sizeScale: 1.0,
      baseColor: "#00d4ff",
      geometryShape: "sphere",
      glowIntensity: 1.0,
    },
    themeCustomization: {
      fontFamily: "Inter",
      accentColor: "#00d4ff",
      bgStyle: "default",
    },
    customPages: [
      {
        id: "page-academy",
        slug: "/academy",
        title: "AI Academy // Neural Training",
        description: "Master prompt engineering, neural architectures, and autonomous agents.",
        content: "# 🎓 Welcome to SenPai AI Academy\n\nLearn how to construct neural agent architectures, configure Model Context Protocol (MCP) servers, and orchestrate swarm intelligence.\n\n### 🚀 Curriculum Overview\n1. **Synaptic Prompting**: Zero-shot and chain-of-thought frameworks.\n2. **MCP Orchestration**: Connecting external tools and REST APIs.\n3. **3D Cortex Telemetry**: Visualizing token latency and neural burst propagation.",
        published: true,
      }
    ],
    mcpServers: [
      {
        id: "mcp-local",
        name: "Local FS / Node Env MCP",
        endpointUrl: "http://localhost:3001/mcp",
        status: "connected",
        tools: ["file_read", "file_write", "git_status"],
      }
    ],
    customCLICommands: [
      {
        id: "cli-academy",
        command: "/academy",
        description: "Open AI Academy // Neural Training portal",
        actionType: "open_page",
        targetValue: "/academy",
      }
    ],
  });

  // Custom Pages, MCP, CLI Editing State
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [pagePreviewMode, setPagePreviewMode] = useState(false);
  const [editingMCP, setEditingMCP] = useState<Partial<MCPServerConfig> | null>(null);
  const [editingCLI, setEditingCLI] = useState<Partial<CustomCLICommand> | null>(null);

  // News Editing State
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [newsPreviewMode, setNewsPreviewMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Agent Skills (SKILL.md) Editing State
  const [editingSkill, setEditingSkill] = useState<Partial<AgentSkill> | null>(null);
  const [skillPreviewMode, setSkillPreviewMode] = useState(false);

  // Change Password State
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Neural Consumption Metrics (Recharts Dashboard)
  const neuralMetrics = useMemo(() => {
    const defaultData: NeuralMetricPoint[] = [
      { id: "1", timestamp: Date.now() - 3600000 * 5, timeLabel: "14:00", promptTokens: 180, completionTokens: 95, totalTokens: 275, latencyMs: 640, model: "gemini-2.5-flash", cost: 0.0001 },
      { id: "2", timestamp: Date.now() - 3600000 * 4, timeLabel: "15:00", promptTokens: 320, completionTokens: 140, totalTokens: 460, latencyMs: 780, model: "gemini-3.5-flash", cost: 0.00015 },
      { id: "3", timestamp: Date.now() - 3600000 * 3, timeLabel: "16:00", promptTokens: 450, completionTokens: 280, totalTokens: 730, latencyMs: 920, model: "gemini-2.5-pro", cost: 0.0004 },
      { id: "4", timestamp: Date.now() - 3600000 * 2, timeLabel: "17:00", promptTokens: 210, completionTokens: 110, totalTokens: 320, latencyMs: 510, model: "gemini-2.5-flash", cost: 0.00011 },
      { id: "5", timestamp: Date.now() - 3600000 * 1, timeLabel: "18:00", promptTokens: 680, completionTokens: 410, totalTokens: 1090, latencyMs: 1150, model: "gemini-2.5-flash", cost: 0.00035 },
      { id: "6", timestamp: Date.now(), timeLabel: "Now", promptTokens: 390, completionTokens: 220, totalTokens: 610, latencyMs: 720, model: "gemini-3.5-flash", cost: 0.00018 },
    ];
    try {
      const stored = localStorage.getItem("neuro_consumption_history");
      if (stored) {
        const parsed: NeuralMetricPoint[] = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return defaultData;
  }, []);

  const totalConsumption = useMemo(() => {
    let totTokens = 0;
    let totLatency = 0;
    let totCost = 0;
    neuralMetrics.forEach((p) => {
      totTokens += p.totalTokens;
      totLatency += p.latencyMs;
      totCost += p.cost;
    });
    return {
      totalTokens: totTokens,
      avgLatency: Math.round(totLatency / (neuralMetrics.length || 1)),
      totalCost: totCost.toFixed(4),
    };
  }, [neuralMetrics]);

  const mergeConfigDefaults = (cfg: AdminConfig): AdminConfig => ({
    ...cfg,
    mediaLinks: {
      youtubeUrl: "https://www.youtube.com/@Matin_SenPai",
      githubUrl: "https://github.com/MatinSenPai",
      twitterUrl: "https://x.com/MatinSenPai",
      donationUrl: "",
      donationText: "Support / Donate",
      ...cfg.mediaLinks,
    },
    neuronCustomization: {
      sizeScale: 1.0,
      baseColor: "#00d4ff",
      geometryShape: "sphere",
      glowIntensity: 1.0,
      ...cfg.neuronCustomization,
    },
    themeCustomization: {
      fontFamily: "Inter",
      accentColor: "#00d4ff",
      bgStyle: "default",
      ...cfg.themeCustomization,
    },
    customPages: cfg.customPages || [
      {
        id: "page-academy",
        slug: "/academy",
        title: "AI Academy // Neural Training",
        description: "Master prompt engineering, neural architectures, and autonomous agents.",
        content: "# 🎓 Welcome to SenPai AI Academy\n\nLearn how to construct neural agent architectures, configure Model Context Protocol (MCP) servers, and orchestrate swarm intelligence.\n\n### 🚀 Curriculum Overview\n1. **Synaptic Prompting**: Zero-shot and chain-of-thought frameworks.\n2. **MCP Orchestration**: Connecting external tools and REST APIs.\n3. **3D Cortex Telemetry**: Visualizing token latency and neural burst propagation.",
        published: true,
      }
    ],
    mcpServers: cfg.mcpServers || [
      {
        id: "mcp-local",
        name: "Local FS / Node Env MCP",
        endpointUrl: "http://localhost:3001/mcp",
        status: "connected",
        tools: ["file_read", "file_write", "git_status"],
      }
    ],
    customCLICommands: cfg.customCLICommands || [
      {
        id: "cli-academy",
        command: "/academy",
        description: "Open AI Academy // Neural Training portal",
        actionType: "open_page",
        targetValue: "/academy",
      }
    ],
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig(mergeConfigDefaults(initialConfig));
    } else {
      fetchAdminConfig();
    }
  }, [initialConfig, isOpen]);

  const fetchAdminConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (data.config) {
        const merged = mergeConfigDefaults(data.config);
        setConfig(merged);
        onConfigUpdated?.(merged);
      }
    } catch (err) {
      console.error("Failed to load admin config:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (botTrap) {
      setError("Security Honeypot triggered. Automated bot request blocked.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        localStorage.setItem("neuro_admin_token", data.token);
        if (rememberMe) {
          localStorage.setItem("neuro_remembered_user", username);
        } else {
          localStorage.removeItem("neuro_remembered_user");
        }
        if (data.config) {
          setConfig(data.config);
          onConfigUpdated?.(data.config);
        }
      } else {
        setError(data.error || "Invalid login credentials");
      }
    } catch (err: any) {
      setError(err.message || "Connection error to admin authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("neuro_admin_token");
  };

  const handleSaveConfig = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, config }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        onConfigUpdated?.(data.config);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setError(data.error || "Failed to save settings. Token may be expired.");
        if (res.status === 401) handleLogout();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save config.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsAction = async (action: "add" | "update" | "delete", newsItem?: any, newsId?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, newsItem, newsId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedConfig = { ...config, newsFeed: data.newsFeed };
        setConfig(updatedConfig);
        onConfigUpdated?.(updatedConfig);
        setEditingNews(null);
      } else {
        setError(data.error || "Failed to manage news feed.");
        if (res.status === 401) handleLogout();
      }
    } catch (err: any) {
      setError(err.message || "Error managing news.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAction = async (action: "add" | "update" | "delete" | "toggle", skill?: any, skillId?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, skill, skillId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedConfig = { ...config, agentSkills: data.agentSkills };
        setConfig(updatedConfig);
        onConfigUpdated?.(updatedConfig);
        if (action !== "toggle") setEditingSkill(null);
      } else {
        setError(data.error || "Failed to manage agent skills.");
      }
    } catch (err: any) {
      setError(err.message || "Error managing skills.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordMsg(null);
    if (!currentPasswordInput || !newPasswordInput) {
      setPasswordMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, currentPassword: currentPasswordInput, newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: "success", text: data.message || "Password updated successfully!" });
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Connection error." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                ADMIN UPDATE last vestion // MASTER CONTROL PORTAL
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">ROOT v3.5</span>
              </h2>
              <p className="text-[11px] text-cyan-400/70 tracking-wider uppercase">Website Customization & Synaptic Knowledge Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition-colors uppercase tracking-wider"
              >
                Lock Session
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        {!token ? (
          /* Login Screen */
          <div className="p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <Lock className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">Admin Security Gateway</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter secure root operator credentials to unlock the command matrix.
              </p>
            </div>

            {error && (
              <div className="w-full p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="text-left space-y-1">
                <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Operator ID / Command</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter operator username..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 focus:border-cyan-500 rounded-xl text-white text-sm outline-none transition-colors"
                />
              </div>
              <div className="text-left space-y-1">
                <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Security Passcode</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure passcode..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 focus:border-cyan-500 rounded-xl text-white text-sm outline-none transition-colors"
                />
              </div>

              {/* Honeypot Security Field */}
              <div
                style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
                aria-hidden="true"
              >
                <label htmlFor="bot_trap_admin">Do not fill this out if human:</label>
                <input
                  id="bot_trap_admin"
                  type="text"
                  name="honeypot_admin_check"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="Leave empty if human"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 cursor-pointer accent-cyan-500"
                  />
                  <span>Remember me on this device</span>
                </label>
                <span className="text-[10px] text-cyan-400/60 uppercase tracking-wider font-mono">Secure Auth v3.5</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Authorize & Unlock Portal</span>
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex items-center px-6 border-b border-white/10 bg-slate-900/40 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("brand")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "brand"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Brand</span>
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "media"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Media & Links</span>
              </button>
              <button
                onClick={() => setActiveTab("visuals")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "visuals"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme & Presets ({config.neuralPresets?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("pages")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "pages"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Page Builder ({config.customPages?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("providers_cli")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "providers_cli"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>MCP & CLI ({config.mcpServers?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "news"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>News (.md) ({config.newsFeed?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "skills"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>SKILL.md Agents ({config.agentSkills?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("neural")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "neural"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Neural Consumption</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  activeTab === "security"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Security / Password</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>✨ Website configuration synchronized across the Neural OS successfully!</span>
                </div>
              )}

              {/* BRAND TAB */}
              {activeTab === "brand" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                      Primary Identity & Header Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Website / OS Brand Title</label>
                        <input
                          type="text"
                          value={config.siteTitle}
                          onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Header Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={config.siteSubtitle}
                          onChange={(e) => setConfig({ ...config, siteSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                        System Announcement Broadcast Banner
                      </h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.systemAnnouncement?.enabled || false}
                          onChange={(e) => setConfig({
                            ...config,
                            systemAnnouncement: { ...config.systemAnnouncement, enabled: e.target.checked }
                          })}
                          className="rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-xs text-slate-300">Enable Live Broadcast</span>
                      </label>
                    </div>

                    {config.systemAnnouncement?.enabled && (
                      <div className="space-y-3 p-4 bg-slate-900/60 border border-white/10 rounded-2xl">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">Announcement Message</label>
                          <textarea
                            rows={2}
                            value={config.systemAnnouncement.message}
                            onChange={(e) => setConfig({
                              ...config,
                              systemAnnouncement: { ...config.systemAnnouncement, message: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(["info", "warning", "alert", "news"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setConfig({
                                ...config,
                                systemAnnouncement: { ...config.systemAnnouncement, type }
                              })}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                config.systemAnnouncement.type === type
                                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                  : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/20"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MEDIA & LINKS TAB */}
              {activeTab === "media" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                      Social Media & Community URLs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-red-400" /> YouTube Channel / Playlist URL
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.youtubeUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, youtubeUrl: e.target.value }
                          })}
                          placeholder="https://youtube.com/@yourchannel"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-purple-400" /> GitHub Profile / Repo URL
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.githubUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, githubUrl: e.target.value }
                          })}
                          placeholder="https://github.com/username"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-cyan-400" /> Twitter / X Profile URL
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.twitterUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, twitterUrl: e.target.value }
                          })}
                          placeholder="https://x.com/username"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-indigo-400" /> Discord Server Invite URL
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.discordUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, discordUrl: e.target.value }
                          })}
                          placeholder="https://discord.gg/invite"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-sky-400" /> Telegram Group URL
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.telegramUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, telegramUrl: e.target.value }
                          })}
                          placeholder="https://t.me/username"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Link className="w-3 h-3 text-emerald-400" /> Custom Media URL (Website/Portfolio)
                        </label>
                        <input
                          type="text"
                          value={config.mediaLinks?.customMediaUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, customMediaUrl: e.target.value }
                          })}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-l-2 border-amber-400 pl-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Donation & Support Link Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Donation Page URL (Ko-fi / Patreon / Crypto)</label>
                        <input
                          type="text"
                          value={config.mediaLinks?.donationUrl || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, donationUrl: e.target.value }
                          })}
                          placeholder="https://ko-fi.com/username"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Donation CTA Button Text</label>
                        <input
                          type="text"
                          value={config.mediaLinks?.donationText || "Support / Donate"}
                          onChange={(e) => setConfig({
                            ...config,
                            mediaLinks: { ...config.mediaLinks, donationText: e.target.value }
                          })}
                          placeholder="Support / Donate"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* THEME & NEURON TAB */}
              {activeTab === "visuals" && (
                <div className="space-y-6 max-w-3xl">
                  {/* NEURAL CONFIGURATION PRESETS & SNAPSHOTS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-2 flex items-center gap-2">
                        <span>📸 Neural Configuration Presets & Snapshots</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40">
                          {config.neuralPresets?.length || 0} SAVED
                        </span>
                      </h3>
                      <button
                        onClick={() => {
                          const posRaw = localStorage.getItem("senpai_custom_node_pos_v1");
                          if (posRaw) {
                            if (window.confirm("Reset default node coordinates in localStorage?")) {
                              localStorage.removeItem("senpai_custom_node_pos_v1");
                              window.location.reload();
                            }
                          }
                        }}
                        className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-rose-400 px-2 py-1 rounded border border-white/10 hover:border-rose-500/40 transition-colors"
                      >
                        Reset Default Coordinates
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-emerald-500/30 rounded-2xl space-y-3">
                      <p className="text-[11px] text-slate-300">
                        Restore any saved 3D neural node arrangement, coordinate state, and custom geometry preset. You can create new presets using the <span className="text-emerald-400 font-mono font-bold">SNAPSHOT</span> button directly on the live BrainHUD!
                      </p>
                      
                      {(!config.neuralPresets || config.neuralPresets.length === 0) ? (
                        <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-slate-950/40">
                          <p className="text-xs text-slate-500 font-mono">No neural configuration presets saved yet.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Click the "SNAPSHOT" button on the top BrainHUD while exploring to capture your first 3D configuration state!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                          {config.neuralPresets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between p-3 bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 rounded-xl transition-all">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white font-mono">{preset.name}</span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                                    {preset.nodeCount || preset.nodes?.length || 0} Nodes
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Captured: {new Date(preset.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {onRestorePreset && (
                                  <button
                                    onClick={() => {
                                      onRestorePreset(preset);
                                      onClose();
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1"
                                    title="Restore these 3D coordinates and states"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>RESTORE</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const nextPresets = config.neuralPresets?.filter((p) => p.id !== preset.id) || [];
                                    const nextConfig = { ...config, neuralPresets: nextPresets };
                                    setConfig(nextConfig);
                                    fetch("/api/admin/config", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(nextConfig),
                                    }).catch(() => {});
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete Preset"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                      3D Neural Cluster & Cortex Customization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-900/60 border border-white/10 rounded-2xl">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Neuron Size Scale</label>
                          <span className="text-xs text-cyan-400 font-mono font-bold">{(config.neuronCustomization?.sizeScale || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                          value={config.neuronCustomization?.sizeScale || 1.0}
                          onChange={(e) => setConfig({
                            ...config,
                            neuronCustomization: { ...config.neuronCustomization, sizeScale: parseFloat(e.target.value) }
                          })}
                          className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">Adjust the physical diameter and radius of the 3D neural nodes.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Glow Emissive Intensity</label>
                          <span className="text-xs text-cyan-400 font-mono font-bold">{(config.neuronCustomization?.glowIntensity || 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={config.neuronCustomization?.glowIntensity || 1.0}
                          onChange={(e) => setConfig({
                            ...config,
                            neuronCustomization: { ...config.neuronCustomization, glowIntensity: parseFloat(e.target.value) }
                          })}
                          className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">Controls the bloom and illumination strength of active synapses.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Neuron Geometry Shape</label>
                        <select
                          value={config.neuronCustomization?.geometryShape || "sphere"}
                          onChange={(e) => setConfig({
                            ...config,
                            neuronCustomization: { ...config.neuronCustomization, geometryShape: e.target.value as any }
                          })}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        >
                          <option value="sphere">Sphere // Classic Synapse</option>
                          <option value="adaptive">⚡ Adaptive Geometry // Dynamic Morphing by LLM Token Intensity</option>
                          <option value="starburst">Starburst // Radiant High-Energy Spike</option>
                          <option value="icosahedron">Icosahedron // Polyhedral Gem</option>
                          <option value="octahedron">Octahedron // Diamond Lattice</option>
                          <option value="dodecahedron">Dodecahedron // Cosmic Sphere</option>
                          <option value="torus">Torus // Orbital Ring</option>
                          <option value="torusKnot">Torus Knot // Neural Loop</option>
                          <option value="cone">Cone // Directional Spark</option>
                          <option value="cylinder">Cylinder // Synaptic Rod</option>
                          <option value="cube">Cube // Quantum Voxel</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-purple-500/30 rounded-xl">
                        <div>
                          <span className="text-xs font-bold text-purple-300 block">⚡ Adaptive Geometry Mode</span>
                          <span className="text-[10px] text-slate-400">Neurons dynamically morph shape and opacity based on the latest LLM response token intensity</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.neuronCustomization?.adaptiveGeometry || config.neuronCustomization?.geometryShape === "adaptive" || false}
                          onChange={(e) => setConfig({
                            ...config,
                            neuronCustomization: {
                              ...config.neuronCustomization,
                              adaptiveGeometry: e.target.checked,
                              geometryShape: e.target.checked ? "adaptive" : (config.neuronCustomization?.geometryShape === "adaptive" ? "sphere" : config.neuronCustomization?.geometryShape)
                            }
                          })}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Base Node Color (Hex / Accent)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={config.neuronCustomization?.baseColor || "#00d4ff"}
                            onChange={(e) => setConfig({
                              ...config,
                              neuronCustomization: { ...config.neuronCustomization, baseColor: e.target.value }
                            })}
                            className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 cursor-pointer p-0.5 shrink-0"
                          />
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            {(["#00d4ff", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"] as const).map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setConfig({
                                  ...config,
                                  neuronCustomization: { ...config.neuronCustomization, baseColor: color }
                                })}
                                style={{ backgroundColor: color }}
                                className="w-6 h-6 rounded-lg border border-white/20 hover:scale-110 transition-transform shadow-sm"
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                      Global UI Font & Visual Theme
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Primary Font Family</label>
                        <select
                          value={config.themeCustomization?.fontFamily || "Inter"}
                          onChange={(e) => setConfig({
                            ...config,
                            themeCustomization: { ...config.themeCustomization, fontFamily: e.target.value as any }
                          })}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        >
                          <option value="Inter">Inter // Clean Modern Sans</option>
                          <option value="Space Grotesk">Space Grotesk // Tech Cyberpunk</option>
                          <option value="JetBrains Mono">JetBrains Mono // Technical Code</option>
                          <option value="Outfit">Outfit // Geometric Display</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Background Atmosphere Style</label>
                        <select
                          value={config.themeCustomization?.bgStyle || "default"}
                          onChange={(e) => setConfig({
                            ...config,
                            themeCustomization: { ...config.themeCustomization, bgStyle: e.target.value as any }
                          })}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                        >
                          <option value="default">Default // Deep Cosmic Slate & Fog</option>
                          <option value="cyber">Cyber // Neon Grid Matrix</option>
                          <option value="minimal">Minimal // Ultra Dark Obsidian</option>
                          <option value="zen">Zen // Soft Ambient Glow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE BUILDER TAB */}
              {activeTab === "pages" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-2">
                        Dynamic Page Builder & Virtual Endpoints
                      </h3>
                      <p className="text-[11px] text-slate-400">Build custom markdown portals (e.g., /academy, /docs) with live navigation in the header.</p>
                    </div>
                    {!editingPage && (
                      <button
                        onClick={() => setEditingPage({
                          slug: "/new-page",
                          title: "New Custom Portal",
                          description: "Enter a brief overview...",
                          content: "# New Page Title\n\nStart writing your content here using markdown format...",
                          published: true,
                        })}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] uppercase tracking-wider"
                      >
                        <Plus className="w-4 h-4" />
                        <span>BUILD NEW PAGE</span>
                      </button>
                    )}
                  </div>

                  {editingPage ? (
                    <div className="p-5 bg-slate-900/80 border border-emerald-500/40 rounded-2xl space-y-4 shadow-lg animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <Folder className="w-4 h-4" /> {editingPage.id ? "Edit Page Portal" : "Create New Page Portal"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPagePreviewMode(!pagePreviewMode)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 border ${
                              pagePreviewMode ? "bg-emerald-500/20 text-emerald-300 border-emerald-400" : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{pagePreviewMode ? "Edit Markdown" : "Live Preview"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingPage(null); setPagePreviewMode(false); }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">URL Slug Endpoint</label>
                          <input
                            type="text"
                            value={editingPage.slug || ""}
                            onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                            placeholder="/academy"
                            className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-emerald-400 outline-none"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Page Title / Navigation Label</label>
                          <input
                            type="text"
                            value={editingPage.title || ""}
                            onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                            placeholder="AI Academy // Neural Training"
                            className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-emerald-400 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Brief Description / Subtitle</label>
                        <input
                          type="text"
                          value={editingPage.description || ""}
                          onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                          placeholder="Master prompt engineering and neural architectures..."
                          className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-emerald-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Page Content (.MD Markdown Supported)</label>
                        {pagePreviewMode ? (
                          <div className="p-4 bg-slate-950 border border-white/10 rounded-xl min-h-[220px] max-h-[350px] overflow-y-auto prose prose-invert prose-emerald max-w-none text-sm text-slate-300">
                            <Markdown>{editingPage.content || ""}</Markdown>
                          </div>
                        ) : (
                          <textarea
                            rows={8}
                            value={editingPage.content || ""}
                            onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                            placeholder="Write your page markdown content here..."
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-emerald-400 outline-none resize-y"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingPage.published !== false}
                            onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                            className="w-4 h-4 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-0 accent-emerald-500"
                          />
                          <span className="text-xs text-slate-300">Publish to Top Navigation Bar</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => { setEditingPage(null); setPagePreviewMode(false); }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const slug = editingPage.slug?.startsWith("/") ? editingPage.slug : `/${editingPage.slug || "page"}`;
                              const newPage: CustomPage = {
                                id: editingPage.id || `page-${Date.now()}`,
                                slug,
                                title: editingPage.title || "Untitled Page",
                                description: editingPage.description || "",
                                content: editingPage.content || "",
                                published: editingPage.published !== false,
                              };
                              const pages = [...(config.customPages || [])];
                              const idx = pages.findIndex(p => p.id === newPage.id);
                              if (idx >= 0) pages[idx] = newPage;
                              else pages.push(newPage);
                              setConfig({ ...config, customPages: pages });
                              setEditingPage(null);
                              setPagePreviewMode(false);
                            }}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md uppercase tracking-wider"
                          >
                            Save Page Portal
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.customPages && config.customPages.length > 0 ? (
                        config.customPages.map((page) => (
                          <div
                            key={page.id}
                            className="p-4 bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 rounded-2xl transition-all flex flex-col justify-between group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                                  {page.slug}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  page.published !== false ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                                }`}>
                                  {page.published !== false ? "Live in Nav" : "Draft"}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                                {page.title}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-2 italic">
                                {page.description || "No description provided."}
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-white/5">
                              <button
                                onClick={() => setEditingPage(page)}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Edit Page"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete custom page ${page.title}?`)) {
                                    setConfig({
                                      ...config,
                                      customPages: config.customPages?.filter(p => p.id !== page.id)
                                    });
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete Page"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-10 border border-dashed border-white/10 rounded-2xl text-slate-500">
                          <Folder className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <p className="text-xs font-mono">No custom page portals created yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PROVIDERS, MCP & CLI TAB */}
              {activeTab === "providers_cli" && (
                <div className="space-y-8">
                  {/* MCP Servers Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-l-2 border-purple-400 pl-2 flex items-center gap-1.5">
                          <Server className="w-4 h-4" /> Model Context Protocol (MCP) Server Integrations
                        </h3>
                        <p className="text-[11px] text-slate-400">Connect external tool servers and APIs to the autonomous agent workspace.</p>
                      </div>
                      {!editingMCP && (
                        <button
                          onClick={() => setEditingMCP({
                            name: "New MCP Provider",
                            endpointUrl: "http://localhost:3000/mcp",
                            status: "connected",
                            tools: ["custom_tool"],
                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD MCP SERVER</span>
                        </button>
                      )}
                    </div>

                    {editingMCP ? (
                      <div className="p-4 bg-slate-900/90 border border-purple-500/40 rounded-2xl space-y-3 shadow-md animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Provider / MCP Server Name</label>
                            <input
                              type="text"
                              value={editingMCP.name || ""}
                              onChange={(e) => setEditingMCP({ ...editingMCP, name: e.target.value })}
                              placeholder="Local Filesystem MCP"
                              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-purple-400 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Endpoint URL / WebSocket URL</label>
                            <input
                              type="text"
                              value={editingMCP.endpointUrl || ""}
                              onChange={(e) => setEditingMCP({ ...editingMCP, endpointUrl: e.target.value })}
                              placeholder="http://localhost:3001/mcp"
                              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-400 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Registered Tools (Comma separated)</label>
                          <input
                            type="text"
                            value={Array.isArray(editingMCP.tools) ? editingMCP.tools.join(", ") : editingMCP.tools || ""}
                            onChange={(e) => setEditingMCP({ ...editingMCP, tools: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                            placeholder="file_read, file_write, execute_sql"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-400 outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingMCP(null)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newMCP: MCPServerConfig = {
                                id: editingMCP.id || `mcp-${Date.now()}`,
                                name: editingMCP.name || "Untitled MCP",
                                endpointUrl: editingMCP.endpointUrl || "",
                                status: editingMCP.status || "connected",
                                tools: Array.isArray(editingMCP.tools) ? editingMCP.tools : [],
                              };
                              const list = [...(config.mcpServers || [])];
                              const idx = list.findIndex(m => m.id === newMCP.id);
                              if (idx >= 0) list[idx] = newMCP;
                              else list.push(newMCP);
                              setConfig({ ...config, mcpServers: list });
                              setEditingMCP(null);
                            }}
                            className="px-4 py-1 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg text-xs uppercase"
                          >
                            Save MCP Server
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {config.mcpServers && config.mcpServers.map((srv) => (
                          <div key={srv.id} className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                              </div>
                              <p className="text-[10px] text-purple-300 font-mono mt-0.5">{srv.endpointUrl}</p>
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {srv.tools?.map((tool) => (
                                  <span key={tool} className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingMCP(srv)} className="p-1.5 text-slate-400 hover:text-purple-300"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfig({ ...config, mcpServers: config.mcpServers?.filter(m => m.id !== srv.id) })} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom CLI Commands Section */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2 flex items-center gap-1.5">
                          <Terminal className="w-4 h-4" /> Custom CLI Slash Commands Hub
                        </h3>
                        <p className="text-[11px] text-slate-400">Define custom command palette shortcuts and slash triggers (e.g. /academy, /reset).</p>
                      </div>
                      {!editingCLI && (
                        <button
                          onClick={() => setEditingCLI({
                            command: "/custom",
                            description: "Custom trigger action",
                            actionType: "open_page",
                            targetValue: "/academy",
                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD CLI COMMAND</span>
                        </button>
                      )}
                    </div>

                    {editingCLI ? (
                      <div className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-2xl space-y-3 shadow-md animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Slash Command Trigger</label>
                            <input
                              type="text"
                              value={editingCLI.command || ""}
                              onChange={(e) => setEditingCLI({ ...editingCLI, command: e.target.value })}
                              placeholder="/academy"
                              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-cyan-400 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Action Type</label>
                            <select
                              value={editingCLI.actionType || "open_page"}
                              onChange={(e) => setEditingCLI({ ...editingCLI, actionType: e.target.value as any })}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                            >
                              <option value="open_page">Open Custom Page Portal</option>
                              <option value="system_message">Inject System Prompt / Message</option>
                              <option value="run_command">Execute Internal Tool / Action</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Target Value (URL or Prompt)</label>
                            <input
                              type="text"
                              value={editingCLI.targetValue || ""}
                              onChange={(e) => setEditingCLI({ ...editingCLI, targetValue: e.target.value })}
                              placeholder="/academy or Resetting OS..."
                              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-cyan-400 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Command Description (Shown in Command Palette)</label>
                          <input
                            type="text"
                            value={editingCLI.description || ""}
                            onChange={(e) => setEditingCLI({ ...editingCLI, description: e.target.value })}
                            placeholder="Open AI Academy // Neural Training portal"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setEditingCLI(null)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase">Cancel</button>
                          <button
                            type="button"
                            onClick={() => {
                              const newCLI: CustomCLICommand = {
                                id: editingCLI.id || `cli-${Date.now()}`,
                                command: editingCLI.command?.startsWith("/") ? editingCLI.command : `/${editingCLI.command || "cmd"}`,
                                description: editingCLI.description || "Custom CLI command",
                                actionType: editingCLI.actionType || "open_page",
                                targetValue: editingCLI.targetValue || "",
                              };
                              const list = [...(config.customCLICommands || [])];
                              const idx = list.findIndex(c => c.id === newCLI.id);
                              if (idx >= 0) list[idx] = newCLI;
                              else list.push(newCLI);
                              setConfig({ ...config, customCLICommands: list });
                              setEditingCLI(null);
                            }}
                            className="px-4 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase"
                          >
                            Save CLI Command
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {config.customCLICommands && config.customCLICommands.map((cmd) => (
                          <div key={cmd.id} className="p-3.5 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">{cmd.command}</span>
                              <p className="text-xs text-white font-bold mt-1.5">{cmd.description}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">[{cmd.actionType}] &rarr; {cmd.targetValue}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingCLI(cmd)} className="p-1.5 text-slate-400 hover:text-cyan-300"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfig({ ...config, customCLICommands: config.customCLICommands?.filter(c => c.id !== cmd.id) })} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NEWS TAB (Markdown Supported) */}
              {activeTab === "news" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                        Live Neural Knowledge & News Bulletin (.MD Format)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Broadcast real-time AI updates formatted in rich Markdown syntax</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingNews({
                          title: "",
                          category: "UPDATE",
                          date: new Date().toISOString().split("T")[0],
                          summary: "",
                          content: "### 🚀 New Release Announcement\n\nWrite your update here in **Markdown** format:\n- Feature 1: High quota enabled\n- Feature 2: Synaptic particle bursts\n\n> *All systems nominal.*",
                          important: false,
                        });
                        setNewsPreviewMode(false);
                      }}
                      className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create News (.md)</span>
                    </button>
                  </div>

                  {/* News Editor Modal / Card */}
                  {editingNews && (
                    <div className="p-5 bg-slate-900/90 border border-cyan-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          {editingNews.id ? "Edit News Bulletin (.md)" : "Create New Broadcast Bulletin (.md)"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewsPreviewMode(false)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              !newsPreviewMode ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Code className="w-3 h-3" />
                            <span>Edit Markdown</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewsPreviewMode(true)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              newsPreviewMode ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Live Preview</span>
                          </button>
                          <button onClick={() => setEditingNews(null)} className="text-slate-400 hover:text-white ml-2">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase">Title</label>
                          <input
                            type="text"
                            value={editingNews.title || ""}
                            onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                            placeholder="e.g. Gemini 2.0 Flash Deployed"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase">Category</label>
                          <select
                            value={editingNews.category || "UPDATE"}
                            onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as any })}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-cyan-400"
                          >
                            <option value="UPDATE">UPDATE</option>
                            <option value="RELEASE">RELEASE</option>
                            <option value="ALERT">ALERT</option>
                            <option value="AI INDUSTRY">AI INDUSTRY</option>
                            <option value="SYSTEM">SYSTEM</option>
                          </select>
                        </div>
                      </div>

                      {/* Summary field for card view */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Short Summary (For card list subtitle)</label>
                        <input
                          type="text"
                          value={editingNews.summary || ""}
                          onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                          placeholder="Brief 1-sentence description..."
                          className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-cyan-400"
                        />
                      </div>

                      {/* Markdown Content vs Preview */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-cyan-400 uppercase font-bold">Markdown Content (.md)</label>
                        {!newsPreviewMode ? (
                          <textarea
                            rows={6}
                            value={editingNews.content || editingNews.summary || ""}
                            onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value, summary: editingNews.summary || e.target.value.slice(0, 100) })}
                            placeholder="Write in rich Markdown (### headings, **bold**, lists, > quotes)..."
                            className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-xs outline-none focus:border-cyan-400 resize-none"
                          />
                        ) : (
                          <div className="w-full p-4 bg-slate-950 border border-cyan-500/30 rounded-xl text-slate-200 text-xs min-h-[140px] max-h-[250px] overflow-y-auto prose prose-invert prose-xs max-w-none">
                            <Markdown>{editingNews.content || editingNews.summary || "*No content entered yet.*"}</Markdown>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={editingNews.important || false}
                            onChange={(e) => setEditingNews({ ...editingNews, important: e.target.checked })}
                            className="rounded border-white/20 bg-slate-950 text-cyan-500 focus:ring-0"
                          />
                          <span>Highlight as Urgent / Important Bulletin</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNews(null)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNewsAction(editingNews.id ? "update" : "add", {
                              ...editingNews,
                              summary: editingNews.summary || (editingNews.content ? editingNews.content.slice(0, 100) + "..." : "No summary")
                            })}
                            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            <span>{editingNews.id ? "Update Bulletin" : "Publish .MD Bulletin"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News List */}
                  <div className="space-y-3">
                    {config.newsFeed?.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                        No active news broadcasts. Click Create News (.md) above.
                      </div>
                    ) : (
                      config.newsFeed?.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/10 rounded-2xl flex flex-col gap-2 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                item.category === "RELEASE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                                item.category === "ALERT" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                                "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              }`}>
                                {item.category}
                              </span>
                              <span className="text-xs font-bold text-white">{item.title}</span>
                              {item.important && (
                                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Important</span>
                              )}
                              <span className="text-[10px] text-slate-500 ml-auto">{item.date}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingNews(item);
                                  setNewsPreviewMode(false);
                                }}
                                className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
                                title="Edit News"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleNewsAction("delete", null, item.id)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                                title="Delete News"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {item.content ? (
                            <div className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5 mt-1 prose prose-invert prose-xs max-w-none">
                              <Markdown>{item.content}</Markdown>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SKILLS TAB (Work on SKILL.md for Agents) */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2 flex items-center gap-2">
                        <span>Agent Skills Manager (SKILL.MD Specifications)</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/40">ANTIGRAVITY AGENTS</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Configure reasoning templates and execution protocols formatted as standard <code className="text-cyan-300">SKILL.md</code> files</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSkill({
                          name: "new-custom-skill",
                          description: "Custom agent capability description",
                          enabled: true,
                          content: "---\nname: new-custom-skill\ndescription: Custom agent capability description\n---\n\n# Skill Execution Guidelines\n1. Analyze input state.\n2. Apply specialized skill logic.\n3. Return formatted result.",
                        });
                        setSkillPreviewMode(false);
                      }}
                      className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create SKILL.md</span>
                    </button>
                  </div>

                  {/* Skill Editor Modal / Card */}
                  {editingSkill && (
                    <div className="p-5 bg-slate-900/95 border border-purple-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {editingSkill.id ? `Edit Skill: ${editingSkill.name}.md` : "Create New Agent SKILL.md"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSkillPreviewMode(false)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              !skillPreviewMode ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Code className="w-3 h-3" />
                            <span>Edit SKILL.md</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkillPreviewMode(true)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              skillPreviewMode ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview Render</span>
                          </button>
                          <button onClick={() => setEditingSkill(null)} className="text-slate-400 hover:text-white ml-2">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase">Skill Name (Slug)</label>
                          <input
                            type="text"
                            value={editingSkill.name || ""}
                            onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                            placeholder="e.g. chain-of-thought"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-purple-400 font-mono"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase">Short Description (When to trigger)</label>
                          <input
                            type="text"
                            value={editingSkill.description || ""}
                            onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                            placeholder="Brief description of what this skill enables..."
                            className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      {/* SKILL.md Content vs Preview */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-purple-400 uppercase font-bold">SKILL.MD Markdown Specification (YAML Frontmatter + Instructions)</label>
                        {!skillPreviewMode ? (
                          <textarea
                            rows={8}
                            value={editingSkill.content || ""}
                            onChange={(e) => setEditingSkill({ ...editingSkill, content: e.target.value })}
                            placeholder="---\nname: my-skill\ndescription: ...\n---\n# Guidelines..."
                            className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-emerald-300 font-mono text-xs outline-none focus:border-purple-400 resize-none leading-relaxed"
                          />
                        ) : (
                          <div className="w-full p-4 bg-slate-950 border border-purple-500/30 rounded-xl text-slate-200 text-xs min-h-[160px] max-h-[280px] overflow-y-auto prose prose-invert prose-xs max-w-none">
                            <Markdown>{editingSkill.content || "*No skill instructions entered yet.*"}</Markdown>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={editingSkill.enabled ?? true}
                            onChange={(e) => setEditingSkill({ ...editingSkill, enabled: e.target.checked })}
                            className="rounded border-white/20 bg-slate-950 text-purple-500 focus:ring-0"
                          />
                          <span>Enable Skill for Active Agents</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingSkill(null)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSkillAction(editingSkill.id ? "update" : "add", editingSkill)}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            <span>{editingSkill.id ? "Update SKILL.md" : "Deploy SKILL.md"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.agentSkills?.map((skill) => (
                      <div
                        key={skill.id}
                        className={`p-4 bg-slate-900/60 border rounded-2xl flex flex-col justify-between transition-all ${
                          skill.enabled ? "border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "border-white/10 opacity-60"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-mono font-bold uppercase">
                                {skill.name}.md
                              </span>
                              {skill.updatedAt && (
                                <span className="text-[10px] text-slate-500">{skill.updatedAt}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleSkillAction("toggle", null, skill.id)}
                              className="text-slate-400 hover:text-white transition-colors"
                              title={skill.enabled ? "Disable Skill" : "Enable Skill"}
                            >
                              {skill.enabled ? (
                                <ToggleRight className="w-6 h-6 text-purple-400" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-600" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">{skill.description}</p>
                          <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 max-h-[85px] overflow-hidden relative">
                            <pre className="whitespace-pre-wrap">{skill.content}</pre>
                            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              setEditingSkill(skill);
                              setSkillPreviewMode(false);
                            }}
                            className="px-3 py-1 bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Specification</span>
                          </button>
                          <button
                            onClick={() => handleSkillAction("delete", null, skill.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEURAL TAB (Recharts Performance Dashboard) */}
              {activeTab === "neural" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2 flex items-center gap-2">
                        <span>⚡ Neural Consumption & Performance Dashboard</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-500/40">RECHARTS LIVE</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Real-time telemetry tracking token usage budgets and synaptic latency over time</p>
                    </div>
                  </div>

                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                        <span>Total Tokens Processed</span>
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-xl font-bold text-white mt-1">{totalConsumption.totalTokens.toLocaleString()}</div>
                      <span className="text-[10px] text-cyan-400 mt-1 font-mono">+12.4% vs baseline</span>
                    </div>
                    <div className="p-4 bg-slate-900/80 border border-blue-500/30 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                        <span>Synaptic Latency (Avg)</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-xl font-bold text-white mt-1">{totalConsumption.avgLatency} ms</div>
                      <span className="text-[10px] text-blue-400 mt-1 font-mono">Ultra-fast Flash response</span>
                    </div>
                    <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                        <span>Estimated Neural Cost</span>
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-xl font-bold text-white mt-1">${totalConsumption.totalCost}</div>
                      <span className="text-[10px] text-purple-400 mt-1 font-mono">Free Tier Quota Active</span>
                    </div>
                    <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                        <span>Active Quota Status</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">1,500 RPD</div>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">Gemini 2.0 Flash Tier</span>
                    </div>
                  </div>

                  {/* Recharts Area Chart: Token Usage Trends */}
                  <div className="p-5 bg-slate-900/60 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span>Token Consumption Trajectory (Prompt vs Completion)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Last 6 Synaptic Sessions</span>
                    </div>
                    <div className="w-full h-56 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={neuralMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrompt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                          <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "11px" }}
                            itemStyle={{ color: "#e2e8f0" }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                          <Area type="monotone" name="Prompt Tokens (Input)" dataKey="promptTokens" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPrompt)" />
                          <Area type="monotone" name="Completion Tokens (Output)" dataKey="completionTokens" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recharts Line Chart: Latency Trends */}
                  <div className="p-5 bg-slate-900/60 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Synaptic Response Latency (ms)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Real-time Transmission Speed</span>
                    </div>
                    <div className="w-full h-48 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={neuralMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                          <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} unit="ms" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "11px" }}
                            itemStyle={{ color: "#60a5fa" }}
                          />
                          <Line type="monotone" name="Response Latency" dataKey="latencyMs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6, fill: "#38bdf8" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Burst Sensitivity Controls */}
                  <div className="space-y-4 pt-4 border-t border-white/10 max-w-2xl">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2">
                      Neural Burst Particle Swarm & Token Thresholds
                    </h3>
                    <div className="space-y-2 p-4 bg-slate-900/60 border border-white/10 rounded-2xl">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Burst Trigger Sensitivity (Token Count Threshold):</span>
                        <span className="font-bold text-cyan-400">{config.burstSensitivity || 300} tokens</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={config.burstSensitivity || 300}
                        onChange={(e) => setConfig({ ...config, burstSensitivity: Number(e.target.value) })}
                        className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>50 (High Frequency Bursts)</span>
                        <span>500 (Balanced)</span>
                        <span>1000 (Major Signals Only)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB (Change Password) */}
              {activeTab === "security" && (
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-l-2 border-cyan-400 pl-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Admin Security Portal & Password Management</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Update the root command passcode required to unlock the Admin Portal and synchronize settings.
                    </p>
                  </div>

                  {passwordMsg && (
                    <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                    }`}>
                      {passwordMsg.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 p-6 bg-slate-900/80 border border-white/10 rounded-3xl shadow-xl">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Admin Passcode</label>
                      <input
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Enter current password (default: 1234)"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Admin Passcode</label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Enter new password (min 3 chars)"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirm New Passcode</label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                        <span>Update Root Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="px-6 py-4 bg-slate-900/80 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Changes save dynamically to <code className="text-cyan-300">data/admin-config.json</code> on server</span>
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-xs uppercase tracking-wider flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Customizations</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
