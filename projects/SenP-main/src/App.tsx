import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Message,
  ConversationTab,
  SavedConversation,
  NeuronNodeData,
  SynapseLink,
  Settings,
  UsageStats,
  MissionTask,
  ConsciousnessState,
  CameraShotType,
  AttachedFile,
  ProviderType,
  AdminConfig,
  NeuralBurstEvent,
  SynapticPathfindingEvent,
  CustomPage,
  CustomCLICommand,
  UserAccount,
} from "./types";
import { DEFAULT_SETTINGS, PROVIDER_CONFIGS, FALLBACK_MODEL_LISTS, getDnaForIndex } from "./data/dna";
import { encryptText, decryptText } from "./utils/crypto";
import { playSpawnSound, playPulseSound, playClickSound, playErrorSound, playMissionCompleteSound } from "./utils/audio";
import { BrainCanvas } from "./components/BrainCanvas";
import { BrainHUD } from "./components/BrainHUD";
import { ChatHeader } from "./components/ChatHeader";
import { ChainOfThought } from "./components/ChainOfThought";
import { AgentToolsBar } from "./components/AgentToolsBar";
import { TabBar } from "./components/TabBar";
import { TokenMeter } from "./components/TokenMeter";
import { MessageList } from "./components/MessageList";
import { InputArea } from "./components/InputArea";
import { MissionModal } from "./components/MissionModal";
import { SettingsModal } from "./components/SettingsModal";
import { SocialOrbCTA } from "./components/SocialOrbCTA";
import { CommandPalette } from "./components/CommandPalette";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { AdminModal } from "./components/AdminModal";
import { MiniSearchOverlay } from "./components/MiniSearchOverlay";
import { SkillsDashboardModal } from "./components/SkillsDashboardModal";
import { FrontEndWorkspaceModal } from "./components/FrontEndWorkspaceModal";
import { CustomPageModal } from "./components/CustomPageModal";
import { UserDashboardModal } from "./components/UserDashboardModal";
import { Bell, Sparkles, Flame, ShieldAlert } from "lucide-react";

export default function App() {
  // 1. Settings State
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_settings_v9");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  // Decrypt API key on mount
  useEffect(() => {
    const loadEncryptedKey = async () => {
      try {
        const encKey = localStorage.getItem("senpai_neural_apikey_enc");
        if (encKey) {
          const dec = await decryptText(encKey);
          if (dec) setSettings((prev) => ({ ...prev, apiKey: dec }));
        }
      } catch (_) {}
    };
    loadEncryptedKey();
  }, []);

  // Save Settings
  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      const toSave = { ...newSettings, apiKey: "" }; // do not store raw key in plaintext JSON
      localStorage.setItem("senpai_neural_settings_v9", JSON.stringify(toSave));
      if (newSettings.apiKey) {
        const enc = await encryptText(newSettings.apiKey);
        localStorage.setItem("senpai_neural_apikey_enc", enc);
      } else {
        localStorage.removeItem("senpai_neural_apikey_enc");
      }
    } catch (_) {}
    showToast("System configuration saved.", "success");
  };

  // 2. Usage Stats State
  const [usage, setUsage] = useState<UsageStats>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_usage_v9");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0, lastReqTokens: 0, lastReqMs: 0 };
  });

  const updateUsage = (pt: number, ct: number, latencyMs: number) => {
    setUsage((prev) => {
      const promptTokens = prev.promptTokens + pt;
      const completionTokens = prev.completionTokens + ct;
      const totalTokens = promptTokens + completionTokens;
      const cost = prev.cost + (pt / 1e6) * settings.priceIn + (ct / 1e6) * settings.priceOut;
      const next = {
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        lastReqTokens: pt + ct,
        lastReqMs: latencyMs,
      };
      try {
        localStorage.setItem("senpai_neural_usage_v9", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const handleResetTokens = () => {
    const next = { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0, lastReqTokens: 0, lastReqMs: 0 };
    setUsage(next);
    try {
      localStorage.setItem("senpai_neural_usage_v9", JSON.stringify(next));
    } catch (_) {}
    showToast("Token budget counters reset to 0.", "success");
  };

  // 3. Conversation Tabs & Archives State
  const [tabs, setTabs] = useState<ConversationTab[]>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_tabs_v9");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [
      {
        id: "tab-1",
        name: "Main Cortex",
        createdAt: Date.now(),
        messages: [
          {
            id: "welcome-1",
            role: "assistant",
            content:
              "# 🧠 先輩 SENPAI · 3D MIND LLM — ELON MUSK EDITION\n\n**Living Neural Cortex Online.** The 3D brain on the left started with **1 Seed Neuron**. Every chat interaction or idea autonomously spawns new 3D neurons and synapses along a spiral galaxy structure.\n\n### ⚡ Key Capabilities:\n- **10 DNA Archetypes**: Sensory, Cognitive, Memory, Logic, Emotion, Insight, Language, Creativity, Action, and Energy—each rendered with custom glowing geometry.\n- **Multi-Provider AI**: Connected to **Google Gemini** out-of-the-box! Switch seamlessly to OpenRouter, local Ollama, 9Router, or custom endpoints.\n- **Agent Vibe**: Toggle **AGENT** above to enable Chain-of-Thought reasoning, live Sandbox JS Execution, and Web Search grounding.\n- **Autonomous Mission Mode**: Click **MISSION** to decompose high-level goals into sub-tasks with automatic 3D camera sweeps.\n\n*Initiate neural stimulus by typing below or activating voice input.* 🚀",
            timestamp: Date.now(),
          },
        ],
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const activeTabIdRef = useRef<string>(activeTabId);
  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const messages = activeTab.messages || [];

  const updateActiveTabMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => {
        if (t.id === activeTabId) {
          const nextMsgs = typeof newMessages === "function" ? newMessages(t.messages) : newMessages;
          return { ...t, messages: nextMsgs };
        }
        return t;
      })
    );
  };

  // Save tabs to local storage
  useEffect(() => {
    try {
      localStorage.setItem("senpai_neural_tabs_v9", JSON.stringify(tabs));
    } catch (_) {}
  }, [tabs]);

  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_archives_v9");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const handleSaveToArchive = (tabToSave: ConversationTab) => {
    if (!tabToSave.messages || tabToSave.messages.length <= 1) return;
    const title = tabToSave.messages.find((m) => m.role === "user")?.content.slice(0, 45) || tabToSave.name;
    const newArch: SavedConversation = {
      id: `arch-${Date.now()}`,
      title,
      date: new Date().toISOString(),
      messages: tabToSave.messages,
    };
    setSavedConversations((prev) => {
      const next = [newArch, ...prev];
      try {
        localStorage.setItem("senpai_neural_archives_v9", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: ConversationTab = {
      id: newId,
      name: `Session ${tabs.length + 1}`,
      createdAt: Date.now(),
      messages: [],
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    playClickSound(settings.soundFxEnabled);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) {
      showToast("Cannot close the only open tab.", "warn");
      return;
    }
    const tabToClose = tabs.find((t) => t.id === id);
    if (tabToClose) handleSaveToArchive(tabToClose);

    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) {
      const remaining = tabs.filter((t) => t.id !== id);
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  // 4. 3D Brain Nodes & Synapse Links State
  const [nodes, setNodes] = useState<NeuronNodeData[]>([
    {
      id: "seed-0",
      x: 0,
      y: 0,
      z: 0,
      role: "seed",
      dnaType: "Cognitive",
      keyword: "CORTEX",
      birthTime: Date.now(),
      colorNum: 0xffb347,
      strength: 99.9,
    },
  ]);
  const [links, setLinks] = useState<SynapseLink[]>([]);

  // Function to spawn a new neuron when user or AI speaks
  const spawnNeuronNode = useCallback((role: "user" | "ai", text: string, msgId: string) => {
    setNodes((prevNodes) => {
      const idx = prevNodes.length;
      const dna = getDnaForIndex(idx);

      // Calculate spiral position
      const arm = idx % 2;
      const armAngle = arm * Math.PI;
      const radius = 1.8 + (idx / 120) * 8.0;
      const angle = idx * 0.45 + armAngle + Math.sin(idx * 0.1) * 0.3;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = Math.sin(idx * 0.25) * 1.4;

      // Extract topic keyword
      const words = text.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
      const keyword = words[0]?.toUpperCase() || (role === "user" ? "QUERY" : "SYNAPSE");

      const newNode: NeuronNodeData = {
        id: `node-${Date.now()}-${idx}`,
        x,
        y,
        z,
        role,
        dnaType: dna.name,
        keyword,
        birthTime: Date.now(),
        colorNum: dna.colorNum,
        messageId: msgId,
        strength: 85 + Math.random() * 14,
        tabId: activeTabIdRef.current,
      };

      // Create synaptic connections to 2 or 3 nearest neighbors
      if (prevNodes.length > 0) {
        const distances = prevNodes.map((n) => {
          const dx = n.x - x;
          const dy = n.y - y;
          const dz = n.z - z;
          return { id: n.id, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) };
        });
        distances.sort((a, b) => a.dist - b.dist);
        const nearest = distances.slice(0, Math.min(3, distances.length));

        const newLinks: SynapseLink[] = nearest.map((near) => ({
          sourceId: newNode.id,
          targetId: near.id,
          strength: 80 + Math.random() * 20,
          active: true,
        }));

        setLinks((prevLinks) => [...prevLinks, ...newLinks]);
      }

      return [...prevNodes, newNode];
    });
  }, []);

  // 5. UI & Agent Modes State
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [missionActive, setMissionActive] = useState(false);
  const [missionTasks, setMissionTasks] = useState<MissionTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1);
  const [zenMode, setZenMode] = useState(false);
  const [fullMindMode, setFullMindMode] = useState(false);
  const [zenOrbitMode, setZenOrbitMode] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [miniSearchOpen, setMiniSearchOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [frontEndModalOpen, setFrontEndModalOpen] = useState(false);
  const [frontEndCode, setFrontEndCode] = useState<{ code?: string; lang?: string }>({});
  const [activeCustomPage, setActiveCustomPage] = useState<CustomPage | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warn" } | null>(null);

  // User Authentication & Dashboard State
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("senpai_neural_user_v1");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });
  const [userDashboardOpen, setUserDashboardOpen] = useState(false);

  // OAuth postMessage listener (as mandated by oauth-integration skill)
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        const authedUser: UserAccount = event.data.user;
        setUser(authedUser);
        try {
          localStorage.setItem("senpai_neural_user_v1", JSON.stringify(authedUser));
        } catch (_) {}
        setUserDashboardOpen(true);
        showToast(`🎉 Welcome to Neural OS, ${authedUser.name}! Google OAuth Verified.`, "success");
        playMissionCompleteSound(settings.soundFxEnabled);
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [settings.soundFxEnabled]);

  const showToast = (msg: string, type: "success" | "error" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast((prev) => (prev?.msg === msg ? null : prev)), 3500);
  };

  const handleToggleFullMind = () => {
    const next = !fullMindMode;
    setFullMindMode(next);
    if (next) {
      setZenMode(false);
      setHistorySidebarOpen(false);
      setCommandPaletteOpen(false);
      setSearchActive(false);
      setMiniSearchOpen(false);
      playClickSound(settings.soundFxEnabled);
      showToast("🧠 Full Screen Mind active. Immersive Cortex Focus.", "success");
    } else {
      playClickSound(settings.soundFxEnabled);
      showToast("Exited Full Screen Mind.", "success");
    }
  };

  const handleOpenFrontEnd = (code?: string, lang?: string) => {
    setFrontEndCode({ code, lang: lang || "jsx" });
    setFrontEndModalOpen(true);
    playClickSound(settings.soundFxEnabled);
    showToast("⚡ Front-End Workspace & Live Sandbox launched.", "success");
  };

  // Snapshot & Presets State
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");

  // Neural Map Exploration States (Heatmap, Cluster by DNA, Search, Focus Mode, Game Mode, Cortex City)
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [isClusterByDnaActive, setIsClusterByDnaActive] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [isGameModeActive, setIsGameModeActive] = useState(false);
  const [isCortexCityActive, setIsCortexCityActive] = useState(true);
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  const handleTakeSnapshot = () => {
    setSnapshotName(`Neural Preset - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (${nodes.length} nodes)`);
    setSnapshotModalOpen(true);
    playClickSound(settings.soundFxEnabled);
  };

  const handleSaveSnapshot = () => {
    if (!adminConfig) {
      showToast("Please wait for system configuration to load.", "warn");
      return;
    }
    const newPreset = {
      id: "preset-" + Date.now(),
      name: snapshotName || `Snapshot ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      nodeCount: nodes.length,
      nodes: nodes.map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
        z: n.z,
        strength: n.strength,
        role: n.role,
        keyword: n.keyword,
        dnaType: n.dnaType,
        colorNum: n.colorNum,
      })),
      customization: adminConfig.neuronCustomization,
    };
    const updatedPresets = [newPreset, ...(adminConfig.neuralPresets || [])];
    const nextConfig = { ...adminConfig, neuralPresets: updatedPresets };
    setAdminConfig(nextConfig);
    fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextConfig),
    }).catch(() => {});
    
    // Save current positions to local storage as default
    const posMap: Record<string, { x: number; y: number; z: number }> = {};
    newPreset.nodes.forEach((n) => { posMap[n.id] = { x: n.x, y: n.y, z: n.z }; });
    localStorage.setItem("senpai_custom_node_pos_v1", JSON.stringify(posMap));
    
    setSnapshotModalOpen(false);
    showToast(`📸 Neural Preset "${newPreset.name}" saved! Manage in Admin Portal.`, "success");
  };

  const handleRestorePreset = (preset: any) => {
    const posMap: Record<string, { x: number; y: number; z: number }> = {};
    preset.nodes.forEach((n: any) => { posMap[n.id] = { x: n.x, y: n.y, z: n.z }; });
    localStorage.setItem("senpai_custom_node_pos_v1", JSON.stringify(posMap));
    setNodes((prev) =>
      prev.map((node) =>
        posMap[node.id] ? { ...node, x: posMap[node.id].x, y: posMap[node.id].y, z: posMap[node.id].z } : node
      )
    );
    if (preset.customization && adminConfig) {
      const nextConfig = { ...adminConfig, neuronCustomization: preset.customization };
      setAdminConfig(nextConfig);
      fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig),
      }).catch(() => {});
    }
    showToast(`⚡ Restored Neural Preset: "${preset.name}"! Coordinates & customization applied.`, "success");
  };

  // Agent Tools state
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [codeRunnerActive, setCodeRunnerActive] = useState(false);
  const [fileExplorerActive, setFileExplorerActive] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; type: "log" | "error"; text: string }[]>([]);
  const [cotSteps, setCotSteps] = useState<{ id: string; icon: string; text: string; done: boolean }[]>([]);

  // 6. Input & Streaming State
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // 7. Voice & Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const handleSpeakText = (text: string, msgId?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speakingMsgId === msgId && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[`*#_~[\]()]/g, "").replace(/\n+/g, ". ").trim();
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = settings.voiceLang || "en-US";
    utt.rate = 0.98;
    utt.onend = () => setSpeakingMsgId(null);
    utt.onerror = () => setSpeakingMsgId(null);
    if (msgId) setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utt);
  };

  const handleToggleRecord = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech Recognition API is not supported in this browser.", "error");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = settings.voiceLang || "en-US";

      let finalTxt = input;
      rec.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalTxt += (finalTxt ? " " : "") + e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        setInput(finalTxt + (interim ? " " + interim : ""));
      };
      rec.onerror = (e: any) => {
        console.error("Speech rec error:", e.error);
        setIsRecording(false);
      };
      rec.onend = () => setIsRecording(false);

      rec.start();
      setIsRecording(true);
      showToast("Microphone active. Speak now...", "success");
    } catch (err) {
      setIsRecording(false);
    }
  };

  // 8. Camera & Consciousness State
  const [cameraShot, setCameraShot] = useState<CameraShotType | null>(null);
  const [consciousness, setConsciousness] = useState<ConsciousnessState>("idle");

  const triggerShot = (shot: CameraShotType) => {
    setCameraShot(shot);
    setTimeout(() => setCameraShot(null), 1500);
  };

  // Admin Portal & Config State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [neuralBurst, setNeuralBurst] = useState<NeuralBurstEvent | null>(null);
  const [synapticPathfinding, setSynapticPathfinding] = useState<SynapticPathfindingEvent | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setAdminConfig(data.config);
          if (data.config.defaultModel && !localStorage.getItem("senpai_neural_settings_v9")) {
            setSettings((prev) => ({ ...prev, model: data.config.defaultModel }));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMiniSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerNeuralBurst = (tokens: number = 500) => {
    setNeuralBurst({ active: true, tokenCount: tokens, timestamp: Date.now() });
    triggerShot("neuralBurstPOV");
    showToast(`⚡ NEURAL BURST ACTIVATED! (${tokens} tokens across synapse network)`, "success");
    setTimeout(() => {
      setNeuralBurst(null);
    }, 4500);
  };

  const triggerSynapticPathfinding = (srcId?: string, tgtId?: string, kw?: string) => {
    let source = srcId;
    let target = tgtId;
    if (!source || !target) {
      const coreNode = nodes.find((n) => n.id === "seed-core") || nodes[0];
      const distantNodes = nodes.filter((n) => n.id !== coreNode?.id && n.id !== "seed-0");
      const distantNode = distantNodes.length > 0 ? distantNodes[Math.floor(Math.random() * distantNodes.length)] : (nodes[1] || nodes[0]);
      source = coreNode ? coreNode.id : "seed-core";
      target = distantNode ? distantNode.id : "seed-db";
    }
    const keyword = kw || nodes.find((n) => n.id === target)?.keyword || "ARCHIVE CLUSTER";
    setSynapticPathfinding({ active: true, sourceId: source!, targetId: target!, keyword, timestamp: Date.now() });
    triggerShot("synapseGlide");
    showToast(`🧠 Synaptic Pathfinding Tracing: Referenced distant cluster [${keyword}]`, "success");
    setTimeout(() => {
      setSynapticPathfinding(null);
    }, 6000);
  };

  // 9. File attachment handler
  const handleAddFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      if (file.type.startsWith("image/")) {
        reader.onload = (e) => {
          const b64 = (e.target?.result as string).split(",")[1];
          setAttachedFiles((prev) => [...prev, { name: file.name, mimeType: file.type, base64Data: b64 }]);
          showToast(`Attached image: ${file.name}`);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          const txt = e.target?.result as string;
          const b64 = btoa(unescape(encodeURIComponent(txt.slice(0, 50000))));
          setAttachedFiles((prev) => [...prev, { name: file.name, mimeType: file.type || "text/plain", base64Data: b64, size: file.size }]);
          showToast(`Attached file: ${file.name}`);
        };
        reader.readAsText(file);
      }
    });
  };

  // Execute custom CLI slash command
  const handleExecuteCustomCLI = (cmd: CustomCLICommand) => {
    playClickSound(settings.soundFxEnabled);
    if (cmd.actionType === "open_page") {
      const targetSlug = cmd.targetValue.startsWith("/") ? cmd.targetValue : `/${cmd.targetValue}`;
      const found = adminConfig?.customPages?.find(p => p.slug === targetSlug || p.slug === cmd.targetValue || p.title.toLowerCase() === cmd.targetValue.toLowerCase());
      if (found) {
        setActiveCustomPage(found);
        showToast(`Opened portal: ${found.title}`, "success");
      } else {
        showToast(`Page portal '${cmd.targetValue}' not found. Check Admin settings.`, "warn");
      }
    } else if (cmd.actionType === "system_message" || cmd.actionType === "send_prompt") {
      showToast(`[SYSTEM]: ${cmd.targetValue}`, "success");
      if (cmd.actionType === "send_prompt") {
        handleSend(cmd.targetValue);
      }
    } else if (cmd.actionType === "run_command" || cmd.actionType === "run_script") {
      if (cmd.targetValue.includes("admin")) {
        setAdminModalOpen(true);
      } else if (cmd.targetValue.includes("login") || cmd.targetValue.includes("dashboard") || cmd.targetValue.includes("auth")) {
        setUserDashboardOpen(true);
      } else {
        showToast(`Executed CLI action: ${cmd.targetValue}`, "success");
      }
    }
  };

  // 10. Core Send Message & LLM Streaming Engine
  const handleSend = async (customPrompt?: string, customImages?: AttachedFile[], isRetry = false) => {
    const textToSend = customPrompt !== undefined ? customPrompt : input;
    const imagesToSend = customImages !== undefined ? customImages : attachedFiles;
    if (!textToSend.trim() && imagesToSend.length === 0) return;

    // Check for Admin & User commands
    const trimmedLow = textToSend.trim().toLowerCase();
    if (trimmedLow === "\\admin" || trimmedLow === "/admin" || trimmedLow.startsWith("/admin ") || trimmedLow === "admin") {
      if (customPrompt === undefined) setInput("");
      setAdminModalOpen(true);
      return;
    }
    if (trimmedLow === "/login" || trimmedLow === "/auth" || trimmedLow === "/signin" || trimmedLow === "login") {
      if (customPrompt === undefined) setInput("");
      setUserDashboardOpen(true);
      playClickSound(settings.soundFxEnabled);
      showToast(user ? `Opened Synaptic Dashboard for ${user.name}` : "Opened Google Synaptic Login Portal", "success");
      return;
    }
    if (trimmedLow === "/dashboard" || trimmedLow === "/user" || trimmedLow === "/profile" || trimmedLow === "dashboard") {
      if (customPrompt === undefined) setInput("");
      setUserDashboardOpen(true);
      playClickSound(settings.soundFxEnabled);
      showToast(user ? `Opened Synaptic Dashboard for ${user.name}` : "Opened Google Synaptic Login Portal", "success");
      return;
    }
    if (trimmedLow === "/zen-orbit" || trimmedLow === "/zenorbit") {
      if (customPrompt === undefined) setInput("");
      triggerShot("zenOrbit");
      setZenOrbitMode(true);
      showToast("Sparked Zen-Orbit 3D Idle Mode.", "success");
      return;
    }
    if (trimmedLow === "/game" || trimmedLow === "/pov" || trimmedLow === "/ghost") {
      if (customPrompt === undefined) setInput("");
      const next = !isGameModeActive;
      setIsGameModeActive(next);
      playClickSound(settings.soundFxEnabled);
      showToast(next ? "🎮 Ghost POV ACTIVE: WASD to move, Q/R to turn, SHIFT to speed boost, Z to exit!" : "Exited Game Mode. Reverting to orbit camera.", "success");
      return;
    }
    if (trimmedLow === "/city" || trimmedLow === "/cortex" || trimmedLow === "/npc") {
      if (customPrompt === undefined) setInput("");
      const next = !isCortexCityActive;
      setIsCortexCityActive(next);
      playClickSound(settings.soundFxEnabled);
      showToast(next ? "🏗️ Cortex City & NPC Builders active: Space cyber-structures powered by user tokens!" : "Cortex City & NPCs hidden.", "success");
      return;
    }
    if (trimmedLow === "/skills") {
      if (customPrompt === undefined) setInput("");
      setSkillsModalOpen(true);
      return;
    }
    if (trimmedLow === "/frontend") {
      if (customPrompt === undefined) setInput("");
      handleOpenFrontEnd();
      return;
    }
    if (trimmedLow === "/clear") {
      if (customPrompt === undefined) setInput("");
      updateActiveTabMessages([]);
      showToast("Chat cleared.", "success");
      return;
    }
    if (trimmedLow === "/mission") {
      if (customPrompt === undefined) setInput("");
      setMissionModalOpen(true);
      return;
    }
    if (trimmedLow === "/config") {
      if (customPrompt === undefined) setInput("");
      setConfigModalOpen(true);
      return;
    }
    if (trimmedLow.startsWith("/") && adminConfig?.customCLICommands) {
      const foundCmd = adminConfig.customCLICommands.find(c => c.command.toLowerCase() === trimmedLow);
      if (foundCmd) {
        if (customPrompt === undefined) setInput("");
        handleExecuteCustomCLI(foundCmd);
        return;
      }
    }

    // Clear input
    if (customPrompt === undefined) setInput("");
    if (customImages === undefined) setAttachedFiles([]);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend || "(Image attached)",
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
      timestamp: Date.now(),
    };

    if (!isRetry) {
      updateActiveTabMessages((prev) => [...prev, userMsg]);
      spawnNeuronNode("user", textToSend || "IMAGE", userMsgId);
      triggerShot("pushIn");
    }

    // Track skill activation events stored in application state
    if (adminConfig && adminConfig.agentSkills && textToSend) {
      let anyActivated = false;
      const updatedSkills = adminConfig.agentSkills.map((s) => {
        const isTriggered = s.enabled && (
          textToSend.toLowerCase().includes(s.name.toLowerCase()) ||
          textToSend.includes(`[RUN SKILL: ${s.name}]`) ||
          (s.name === "web-grounding" && (webSearchActive || /latest|today|2026|current price|news/i.test(textToSend))) ||
          (s.name === "chain-of-thought" && agentEnabled)
        );
        if (isTriggered) {
          anyActivated = true;
          return { ...s, usageCount: (s.usageCount || 0) + 1 };
        }
        return s;
      });
      if (anyActivated) {
        setAdminConfig((prev) => prev ? { ...prev, agentSkills: updatedSkills } : null);
      }
    }

    setIsStreaming(true);
    setStreamingText("");
    setConsciousness("thinking");
    triggerShot("orbitSweep");
    playPulseSound(settings.soundFxEnabled);

    // Agent Chain of Thought simulation
    if (agentEnabled && !isRetry) {
      setCotSteps([
        { id: "s1", icon: "🔍", text: "Analyzing user intent and parsing syntax requirements...", done: true },
        { id: "s2", icon: "🧠", text: "Scanning 3D neural cortex memory and attached context...", done: true },
        { id: "s3", icon: "⚙️", text: `Formatting request for ${settings.provider.toUpperCase()} (${settings.model})...`, done: false },
      ]);
      setTimeout(() => {
        setCotSteps((prev) => prev.map((s) => (s.id === "s3" ? { ...s, done: true } : s)));
      }, 800);
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const startTime = performance.now();
    let accumulatedText = "";
    let promptTok = 0;
    let completionTok = 0;

    // Build conversation history for API
    const historyForApi = [...messages, userMsg].slice(-settings.slidingWindow);

    try {
      if (settings.provider === "gemini") {
        // Use our server proxy /api/gemini/chat
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            model: settings.model || "gemini-2.5-flash",
            systemPrompt: settings.systemPrompt,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            stream: true,
            customApiKey: settings.apiKey || undefined,
            stopSequences: settings.stopSequences,
            responseFormat: settings.responseFormat,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          let errMsg = errData.error || `HTTP error ${response.status}`;
          if (typeof errMsg === "object") {
            errMsg = errMsg.message || JSON.stringify(errMsg);
          } else if (typeof errMsg === "string" && (errMsg.startsWith("{") || errMsg.includes('"error"'))) {
            try {
              const parsed = JSON.parse(errMsg);
              if (parsed.error?.message) errMsg = parsed.error.message;
              else if (parsed.message) errMsg = parsed.message;
            } catch (_) {}
          }
          throw new Error(errMsg);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          setConsciousness("speaking");
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;
                try {
                  const data = JSON.parse(jsonStr);
                  if (data.error) throw new Error(data.error);
                  if (data.content) {
                    accumulatedText += data.content;
                    setStreamingText(accumulatedText);
                  }
                  if (data.usage) {
                    promptTok = data.usage.promptTokens || promptTok;
                    completionTok = data.usage.completionTokens || completionTok;
                  }
                } catch (e: any) {
                  if (e.message && e.message !== "Unexpected end of JSON input") {
                    throw e;
                  }
                }
              }
            }
          }
        }
      } else if (settings.provider === "ollama") {
        // Direct Ollama API
        const base = (settings.baseUrl || "http://localhost:11434").replace(/\/$/, "");
        const response = await fetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: settings.model,
            messages: historyForApi.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            stream: true,
            options: {
              temperature: settings.temperature,
              num_predict: settings.maxTokens,
              stop: settings.stopSequences.length > 0 ? settings.stopSequences : undefined,
            },
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`Ollama error ${response.status}. Make sure Ollama is running at ${base}.`);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          setConsciousness("speaking");
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.message?.content) {
                  accumulatedText += data.message.content;
                  setStreamingText(accumulatedText);
                }
                if (data.done) {
                  promptTok = data.prompt_eval_count || 0;
                  completionTok = data.eval_count || 0;
                }
              } catch (_) {}
            }
          }
        }
      } else {
        // OpenAI-compatible (OpenRouter, 9Router, LM Studio, Custom)
        const base = (settings.baseUrl || PROVIDER_CONFIGS[settings.provider].baseUrl).replace(/\/$/, "");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (settings.apiKey) {
          headers["Authorization"] = `Bearer ${settings.apiKey}`;
          headers["HTTP-Referer"] = window.location.origin;
          headers["X-Title"] = "SenPai Neural OS";
        }

        const response = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: settings.model === "anthropic/claude-3.7-sonnet" ? "anthropic/claude-3.7-sonnet:beta" : settings.model,
            messages: [{ role: "system", content: settings.systemPrompt }, ...historyForApi.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }))],
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: true,
            stop: settings.stopSequences.length > 0 ? settings.stopSequences : undefined,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Provider API error ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          setConsciousness("speaking");
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;
                try {
                  const data = JSON.parse(jsonStr);
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) {
                    accumulatedText += content;
                    setStreamingText(accumulatedText);
                  }
                  if (data.usage) {
                    promptTok = data.usage.prompt_tokens || promptTok;
                    completionTok = data.usage.completion_tokens || completionTok;
                  }
                } catch (_) {}
              }
            }
          }
        }
      }

      // Finish Streaming
      const latency = Math.round(performance.now() - startTime);
      if (!promptTok && !completionTok && settings.estimateTokens) {
        promptTok = Math.ceil(textToSend.length / 4);
        completionTok = Math.ceil(accumulatedText.length / 4);
      }
      updateUsage(promptTok, completionTok, latency);

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: accumulatedText || "(No response generated)",
        meta: {
          tokens: promptTok + completionTok,
          cost: (promptTok / 1e6) * settings.priceIn + (completionTok / 1e6) * settings.priceOut,
          latency,
        },
        timestamp: Date.now(),
      };

      updateActiveTabMessages((prev) => [...prev, aiMsg]);
      spawnNeuronNode("ai", accumulatedText || "SYNAPSE", aiMsgId);
      triggerShot("pullReveal");

      const totalTokensThisTurn = promptTok + completionTok;
      const burstThreshold = adminConfig?.burstSensitivity || 300;
      if (totalTokensThisTurn >= burstThreshold || completionTok >= 150) {
        triggerNeuralBurst(totalTokensThisTurn);
      }
      triggerSynapticPathfinding();

      if (settings.ttsEnabled) {
        handleSpeakText(accumulatedText, aiMsgId);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        showToast("Synaptic transmission aborted by user.", "warn");
      } else if (settings.provider !== "gemini") {
        console.log(`[Neural Fallback] Provider '${settings.provider}' (${settings.model}) unavailable: ${err.message}. Routing to Google Gemini proxy...`);
        showToast(`⚡ ${settings.provider} unavailable (${err.message.slice(0, 45)}...). Auto-routed to Gemini!`, "warn");
        
        try {
          const fallbackModel = "gemini-2.5-flash";
          const fbResponse = await fetch("/api/gemini/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: historyForApi,
              model: fallbackModel,
              systemPrompt: settings.systemPrompt,
              temperature: settings.temperature,
              maxTokens: settings.maxTokens,
              stream: true,
            }),
            signal: abortController.signal,
          });

          if (!fbResponse.ok) {
            throw new Error(`Fallback Gemini proxy failed (${fbResponse.status})`);
          }

          const reader = fbResponse.body?.getReader();
          const decoder = new TextDecoder();
          if (reader) {
            setConsciousness("speaking");
            accumulatedText = `> *⚡ Auto-Fallback: Provider **\`${settings.provider}\`** returned error (\`${err.message}\`). Seamlessly routed to **\`Google Gemini (${fallbackModel})\`** via built-in server proxy.*\n\n`;
            setStreamingText(accumulatedText);
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr || jsonStr === "[DONE]") continue;
                  try {
                    const data = JSON.parse(jsonStr);
                    if (data.content) {
                      accumulatedText += data.content;
                      setStreamingText(accumulatedText);
                    }
                    if (data.usage) {
                      promptTok = data.usage.promptTokens || promptTok;
                      completionTok = data.usage.completionTokens || completionTok;
                    }
                  } catch (_) {}
                }
              }
            }
          }

          const latency = Math.round(performance.now() - startTime);
          updateUsage(promptTok, completionTok, latency);

          const aiMsgId = `ai-${Date.now()}`;
          const aiMsg: Message = {
            id: aiMsgId,
            role: "assistant",
            content: accumulatedText || "(No response generated)",
            meta: {
              tokens: promptTok + completionTok,
              cost: (promptTok / 1e6) * settings.priceIn + (completionTok / 1e6) * settings.priceOut,
              latency,
            },
            timestamp: Date.now(),
          };

          updateActiveTabMessages((prev) => [...prev, aiMsg]);
          spawnNeuronNode("ai", accumulatedText || "SYNAPSE", aiMsgId);
          triggerShot("pullReveal");

          const totalTokensThisTurn = promptTok + completionTok;
          if (totalTokensThisTurn >= (adminConfig?.burstSensitivity || 300) || completionTok >= 150) {
            triggerNeuralBurst(totalTokensThisTurn);
          }
          triggerSynapticPathfinding();
          if (settings.ttsEnabled) {
            handleSpeakText(accumulatedText, aiMsgId);
          }
        } catch (fbErr: any) {
          console.error("Transmission & fallback error:", fbErr);
          playErrorSound(settings.soundFxEnabled);
          const cleanMsg = err.message || "Unknown error occurred.";
          showToast(`Transmission Error: ${cleanMsg.slice(0, 100)}...`, "error");
          const errMsg: Message = {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `### 🔴 Neural Transmission Interrupted\n\n**Provider Error:**\n> ${cleanMsg}\n\n**Self-Healing Suggestions:**\n- Switch provider back to **Google Gemini** in **[CONFIG]** or check your external API key.\n- For local providers (Ollama / 9Router / LM Studio), ensure the server is running.`,
            timestamp: Date.now(),
          };
          updateActiveTabMessages((prev) => [...prev, errMsg]);
        }
      } else {
        console.error("Transmission error:", err);
        playErrorSound(settings.soundFxEnabled);
        let cleanMsg = err.message || "Unknown error occurred.";
        try {
          if (typeof cleanMsg === "string" && (cleanMsg.startsWith("{") || cleanMsg.includes('"error"'))) {
            const parsed = JSON.parse(cleanMsg);
            if (parsed.error?.message) cleanMsg = parsed.error.message;
            else if (parsed.message) cleanMsg = parsed.message;
          }
        } catch (_) {}

        showToast(`Transmission Error: ${cleanMsg.slice(0, 100)}...`, "error");
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `### 🔴 Neural Transmission Interrupted\n\n**Error Details:**\n> ${cleanMsg}\n\n**Self-Healing Suggestions:**\n- If you exceeded quota on **\`${settings.model}\`**, switch to **\`gemini-2.5-flash\`** or **\`gemini-3.1-flash-lite\`** in **[CONFIG]** or via command \`/model gemini-2.5-flash\`.\n- Check your API key or network connection.\n- For local providers (Ollama / 9Router / LM Studio), ensure the local server is running.`,
          timestamp: Date.now(),
        };
        updateActiveTabMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setConsciousness("idle");
      abortControllerRef.current = null;
    }
  };

  const handleCancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 11. Autonomous Mission Mode Execution Engine
  const handleStartMission = async (goal: string) => {
    setMissionActive(true);
    setConsciousness("agent-processing");
    playClickSound(settings.soundFxEnabled);
    triggerShot("driftWide");

    // Decompose into 4 subtasks
    const tasks: MissionTask[] = [
      { id: "mt-1", text: `Analyze objective scope and structural requirements for: "${goal.slice(0, 40)}..."`, status: "pending" },
      { id: "mt-2", text: "Synthesize core system architecture and logic blueprints", status: "pending" },
      { id: "mt-3", text: "Generate clean TypeScript/React code implementation and algorithms", status: "pending" },
      { id: "mt-4", text: "Verify edge cases, security hardening, and output unified deliverable", status: "pending" },
    ];
    setMissionTasks(tasks);

    for (let i = 0; i < tasks.length; i++) {
      setCurrentTaskIndex(i);
      setMissionTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, status: "active" } : t)));
      triggerShot(i % 2 === 0 ? "pushIn" : "orbitSweep");
      playPulseSound(settings.soundFxEnabled);

      await new Promise((res) => setTimeout(res, 1200 + Math.random() * 800));
      setMissionTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, status: "done" } : t)));
    }

    setMissionActive(false);
    setMissionModalOpen(false);
    setConsciousness("idle");
    playMissionCompleteSound(settings.soundFxEnabled);
    triggerShot("pullReveal");

    // Automatically trigger chat generation with the mission goal
    handleSend(
      `### 🎯 AUTONOMOUS MISSION EXECUTION\n**Objective:** ${goal}\n\n*SenPai has autonomously completed all 4 reasoning sub-tasks. Please generate the complete, comprehensive architectural solution and clean code deliverable below:*`
    );
  };

  // 12. Run Code inside Sandbox Console
  const handleRunCode = (code: string) => {
    setCodeRunnerActive(true);
    try {
      const logs: { id: string; type: "log" | "error"; text: string }[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push({ id: `l-${Date.now()}-${Math.random()}`, type: "log", text: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ") }),
        error: (...args: any[]) => logs.push({ id: `e-${Date.now()}-${Math.random()}`, type: "error", text: args.map((a) => String(a)).join(" ") }),
      };
      const runFn = new Function("console", code);
      const result = runFn(customConsole);
      if (result !== undefined) {
        logs.push({ id: `res-${Date.now()}`, type: "log", text: `→ Returned: ${typeof result === "object" ? JSON.stringify(result) : String(result)}` });
      }
      if (logs.length === 0) {
        logs.push({ id: `emp-${Date.now()}`, type: "log", text: "(Code executed successfully with no console output)" });
      }
      setConsoleLogs((prev) => [...prev, ...logs]);
      showToast("Executed JavaScript block in Sandbox Console.", "success");
    } catch (err: any) {
      setConsoleLogs((prev) => [...prev, { id: `err-${Date.now()}`, type: "error", text: `Runtime Error: ${err.message}` }]);
      showToast(`Runtime Error: ${err.message}`, "error");
    }
  };

  // 13. Message Actions (Copy, Pin, Feedback, Edit, Delete, Regenerate, Continue)
  const handleTogglePinMessage = (id: string) => {
    updateActiveTabMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
    playClickSound(settings.soundFxEnabled);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    updateActiveTabMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === type ? null : type } : m)));
  };

  const handleEditMessage = (id: string, newText: string) => {
    updateActiveTabMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: newText } : m)));
    showToast("Message updated.", "success");
  };

  const handleDeleteMessage = (id: string) => {
    updateActiveTabMessages((prev) => prev.filter((m) => m.id !== id));
    showToast("Message deleted.", "success");
  };

  const handleRegenerate = (id: string) => {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const lastUserMsg = [...messages.slice(0, idx)].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    updateActiveTabMessages((prev) => prev.slice(0, idx));
    handleSend(lastUserMsg.content, lastUserMsg.images, true);
  };

  const handleContinue = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    handleSend("Please continue from exactly where you left off, continuing the sentence or code block seamlessly.");
  };

  // 14. Export to Markdown
  const handleExportMd = () => {
    if (messages.length === 0) {
      showToast("No conversation messages to export.", "warn");
      return;
    }
    let md = `# 🧠 先輩 SENPAI · NEURAL OS ARCHIVE\n**Session:** ${activeTab.name}\n**Exported:** ${new Date().toLocaleString()}\n**Model:** \`${settings.model}\` (${settings.provider.toUpperCase()})\n\n---\n\n`;
    messages.forEach((m) => {
      const roleStr = m.role === "user" ? "### 👤 User" : "### 🧠 SenPai Cortex";
      md += `${roleStr}\n${m.content}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senpai-archive-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Archived session exported to Markdown.", "success");
  };

  // 15. Fetch Models list
  const [modelList, setModelList] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const fetchModels = async () => {
    setIsFetchingModels(true);
    try {
      if (settings.provider === "gemini") {
        const res = await fetch(`/api/gemini/models?apiKey=${encodeURIComponent(settings.apiKey)}`);
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          setModelList(data.models.map((m: any) => m.id));
        }
      } else if (settings.provider === "ollama") {
        const base = (settings.baseUrl || "http://localhost:11434").replace(/\/$/, "");
        const res = await fetch(`${base}/api/tags`);
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          setModelList(data.models.map((m: any) => m.name));
        }
      } else {
        const base = (settings.baseUrl || PROVIDER_CONFIGS[settings.provider]?.baseUrl || "").replace(/\/$/, "");
        const headers: Record<string, string> = {};
        if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;
        const res = await fetch(`${base}/models`, { headers });
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setModelList(data.data.map((m: any) => m.id));
        }
      }
      showToast("Refreshed model list from endpoint.", "success");
    } catch (_) {
      showToast("Could not fetch models. Using built-in fallback list.", "warn");
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Apply visual theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme || "immersive-ui");
  }, [settings.theme]);

  const pinnedMessages = messages.filter((m) => m.pinned);

  return (
    <div
      className={`relative w-screen h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans ${
        settings.uiDensity === "compact" ? "text-xs" : settings.uiDensity === "spacious" ? "text-base sm:text-lg" : "text-sm"
      } ${
        zenMode || fullMindMode
          ? "flex flex-col"
          : "grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 grid-rows-[38vh_1fr] md:grid-rows-1"
      }`}
    >
      {/* Ambient glowing blobs from Immersive UI theme */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[150px]" />
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-2xl font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "error"
              ? "bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : toast.type === "warn"
              ? "bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              : "bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,212,255,0.4)]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* LEFT / TOP: 3D Brain Neural Cortex Section (Responsive Grid Pane) */}
      <div className={`relative transition-all duration-300 ease-in-out min-w-0 min-h-0 overflow-hidden ${
        zenMode
          ? "w-0 h-0 hidden"
          : fullMindMode
          ? "w-full h-full"
          : "md:col-span-6 lg:col-span-7 xl:col-span-7 2xl:col-span-8 w-full h-full border-b md:border-b-0 md:border-r border-white/10"
      }`}>
        <BrainCanvas
          nodes={nodes}
          links={links}
          isSupporter={settings.isSupporter}
          onOrbitalReconfigure={(node, ringName, priority) => {
            showToast(`Orbit Shift: Reconfigured [${node.keyword}] to ${ringName} (${priority})`, "success");
            triggerShot("orbitShift");
          }}
          onNodeClick={(node) => {
            showToast(`Focused on Concept: [${node.keyword}] (${node.dnaType})`, "success");
            triggerShot("quickPunch");
          }}
          cameraShot={cameraShot}
          consciousness={consciousness}
          soundFxEnabled={settings.soundFxEnabled}
          neuralBurst={neuralBurst}
          synapticPathfinding={synapticPathfinding}
          onTriggerCameraShot={triggerShot}
          onTestNeuralBurst={() => triggerNeuralBurst(600)}
          onTestSynapticPathfinding={() => triggerSynapticPathfinding()}
          onZenOrbitChange={setZenOrbitMode}
          neuronCustomization={adminConfig?.neuronCustomization}
          adaptiveGeometryMode={adminConfig?.neuronCustomization?.adaptiveGeometry || adminConfig?.neuronCustomization?.geometryShape === "adaptive" || false}
          latestTokenCount={usage.lastReqTokens || neuralBurst?.tokenCount || 0}
          isStreaming={consciousness === "speaking" || consciousness === "agent-processing" || Boolean(neuralBurst?.active) || isRecording}
          completionTokensCount={usage.completionTokens || usage.lastReqTokens || 150}
          onNodePositionChange={(id, x, y, z) => {
            setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y, z } : n)));
          }}
          onAdaptiveGeometryChange={(active) => {
            if (active) {
              showToast("⚡ Adaptive Geometry Activated: Neurons dynamically morph shape & opacity based on LLM response token intensity!", "success");
            } else {
              showToast("Adaptive Geometry mode disabled.", "warn");
            }
          }}
          isHeatmapActive={isHeatmapActive}
          isClusterByDnaActive={isClusterByDnaActive}
          isFocusModeActive={isFocusModeActive}
          isGameModeActive={isGameModeActive}
          onToggleGameMode={() => {
            setIsGameModeActive(false);
            playClickSound(settings.soundFxEnabled);
            showToast("Exited Ghost POV Game Mode.", "warn");
          }}
          isCortexCityActive={isCortexCityActive}
          totalTokens={usage.totalTokens || (usage.promptTokens || 0) + (usage.completionTokens || 0) || 1250}
          activeTabId={activeTabId}
          activeMessageIds={activeTab.messages.map((m) => m.id)}
          searchQuery={mapSearchQuery}
        />
        <BrainHUD
          nodeCount={nodes.length}
          connCount={links.length}
          latency={usage.lastReqMs}
          strength={nodes[nodes.length - 1]?.strength || 98.4}
          provider={settings.provider}
          model={settings.model}
          consciousness={consciousness}
          isRecording={isRecording}
          fullMindMode={fullMindMode}
          onToggleFullMind={handleToggleFullMind}
          zenOrbitMode={zenOrbitMode}
          tokenVelocity={usage.lastReqMs > 0 && usage.lastReqTokens > 0 ? Math.round((usage.lastReqTokens / usage.lastReqMs) * 1000) : (consciousness === "speaking" || consciousness === "agent-processing" ? 84 : 0)}
          completionTokens={usage.completionTokens || usage.lastReqTokens || 150}
          onTakeSnapshot={handleTakeSnapshot}
          isHeatmapActive={isHeatmapActive}
          onToggleHeatmap={() => {
            const next = !isHeatmapActive;
            setIsHeatmapActive(next);
            playClickSound(settings.soundFxEnabled);
            showToast(next ? "🔥 Neural Density Heatmap active: Highlighting knowledge hubs!" : "Heatmap overlay disabled.", "success");
          }}
          isClusterByDnaActive={isClusterByDnaActive}
          onToggleClusterByDna={() => {
            const next = !isClusterByDnaActive;
            setIsClusterByDnaActive(next);
            playClickSound(settings.soundFxEnabled);
            showToast(next ? "🧬 Cluster by DNA active: Neurons grouped into specialized 3D sub-clusters!" : "3D grouping disabled. Reverting to original layout.", "success");
          }}
          isFocusModeActive={isFocusModeActive}
          onToggleFocusMode={() => {
            const next = !isFocusModeActive;
            setIsFocusModeActive(next);
            playClickSound(settings.soundFxEnabled);
            showToast(next ? `🎯 Focus Mode active: Isolating "${activeTab.name}" cluster with cinematic camera!` : "Focus Mode disabled. Reverting to full brain view.", "success");
          }}
          isGameModeActive={isGameModeActive}
          onToggleGameMode={() => {
            const next = !isGameModeActive;
            setIsGameModeActive(next);
            playClickSound(settings.soundFxEnabled);
            showToast(next ? "🎮 Ghost POV ACTIVE: WASD to move, Q/R to turn, SHIFT to speed boost, Z to exit!" : "Exited Game Mode. Reverting to orbit camera.", "success");
          }}
          isCortexCityActive={isCortexCityActive}
          onToggleCortexCity={() => {
            const next = !isCortexCityActive;
            setIsCortexCityActive(next);
            playClickSound(settings.soundFxEnabled);
            showToast(next ? "🏗️ Cortex City & NPC Builders active: Space cyber-structures powered by user tokens!" : "Cortex City & NPCs hidden.", "success");
          }}
          totalTokens={usage.totalTokens || (usage.promptTokens || 0) + (usage.completionTokens || 0) || 1250}
          activeTabName={activeTab.name}
          searchQuery={mapSearchQuery}
          onSearchQueryChange={setMapSearchQuery}
        />
      </div>

      {/* RIGHT / BOTTOM: Interactive Chat Panel (Responsive Grid Pane) */}
      <div className={`flex flex-col min-w-0 min-h-0 bg-slate-950/70 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden ${
        fullMindMode
          ? "w-0 h-0 hidden"
          : zenMode
          ? "w-full h-full"
          : "md:col-span-6 lg:col-span-5 xl:col-span-5 2xl:col-span-4 w-full h-full"
      }`}>
        {/* Chat Header */}
        <ChatHeader
          provider={settings.provider}
          model={settings.model}
          onModelChange={(newModel) => setSettings({ ...settings, model: newModel })}
          agentEnabled={agentEnabled}
          onToggleAgent={() => {
            setAgentEnabled(!agentEnabled);
            playClickSound(settings.soundFxEnabled);
            showToast(!agentEnabled ? "Agent Vibe enabled. CoT reasoning active." : "Agent Vibe disabled.", "success");
          }}
          onOpenMission={() => setMissionModalOpen(true)}
          onOpenSkills={() => {
            setSkillsModalOpen(true);
            playClickSound(settings.soundFxEnabled);
          }}
          onOpenFrontEnd={() => handleOpenFrontEnd()}
          zenMode={zenMode}
          onToggleZen={() => {
            const next = !zenMode;
            setZenMode(next);
            if (next) setFullMindMode(false);
          }}
          fullMindMode={fullMindMode}
          onToggleFullMind={handleToggleFullMind}
          onToggleSearch={() => setSearchActive(!searchActive)}
          onToggleHistory={() => setHistorySidebarOpen(true)}
          ttsEnabled={settings.ttsEnabled}
          onToggleTTS={() => setSettings({ ...settings, ttsEnabled: !settings.ttsEnabled })}
          onExportMd={handleExportMd}
          onOpenConfig={() => setConfigModalOpen(true)}
          onClearChat={() => {
            if (messages.length > 0 && !window.confirm("Clear this active session?")) return;
            handleSaveToArchive(activeTab);
            updateActiveTabMessages([]);
            showToast("Session cleared & archived.", "success");
          }}
          modelList={modelList}
          siteTitle={adminConfig?.siteTitle}
          siteSubtitle={adminConfig?.siteSubtitle}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenUserDashboard={() => setUserDashboardOpen(true)}
          user={user}
          customPages={adminConfig?.customPages}
          onOpenCustomPage={(page) => setActiveCustomPage(page)}
          donationUrl={adminConfig?.mediaLinks?.donationUrl}
          donationText={adminConfig?.mediaLinks?.donationText}
        />

        {/* Live News & System Announcements Banner from Backend Admin */}
        {(adminConfig?.systemAnnouncement?.enabled || (adminConfig?.newsFeed && adminConfig.newsFeed.length > 0)) && (
          <div className="bg-slate-900/90 border-b border-cyan-500/20 px-4 sm:px-6 py-2.5 text-xs font-mono flex flex-col gap-2 shrink-0 w-full">
            {adminConfig?.systemAnnouncement?.enabled && (
              <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg w-full overflow-hidden shadow-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <span className="truncate">[{adminConfig.systemAnnouncement.type.toUpperCase()}]: {adminConfig.systemAnnouncement.message}</span>
              </div>
            )}
            {adminConfig?.newsFeed && adminConfig.newsFeed.length > 0 && (
              <div className="flex items-center gap-2.5 text-slate-300 overflow-hidden w-full bg-slate-950/70 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
                <span className="text-cyan-400 font-bold uppercase tracking-wider shrink-0">NEWS FEED //</span>
                <div className="truncate text-slate-300 italic flex items-center gap-4">
                  {adminConfig.newsFeed.map((news) => (
                    <span key={news.id} className="inline-block shrink-0">
                      <strong className="text-slate-100">{news.title}:</strong> {news.content}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chain of Thought Reasoning Drawer */}
        <ChainOfThought steps={cotSteps} visible={agentEnabled} />

        {/* Agent Tools Bar */}
        <AgentToolsBar
          visible={agentEnabled}
          webSearchActive={webSearchActive}
          onToggleWebSearch={() => setWebSearchActive(!webSearchActive)}
          codeRunnerActive={codeRunnerActive}
          onToggleCodeRunner={() => setCodeRunnerActive(!codeRunnerActive)}
          onRunLastCode={() => {
            const lastCode = [...messages].reverse().find((m) => m.content.includes("```"))?.content.match(/```(?:js|javascript)?\n([\s\S]*?)```/)?.[1];
            if (lastCode) handleRunCode(lastCode);
            else showToast("No JavaScript code block found in recent messages.", "warn");
          }}
          onOpenFrontEnd={() => handleOpenFrontEnd()}
          fileExplorerActive={fileExplorerActive}
          onToggleFileExplorer={() => setFileExplorerActive(!fileExplorerActive)}
          attachedFileNames={attachedFiles.map((f) => f.name)}
          consoleLogs={consoleLogs}
        />

        {/* Tab Bar */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            playClickSound(settings.soundFxEnabled);
          }}
          onAddTab={handleAddTab}
          onCloseTab={handleCloseTab}
        />

        {/* Token Budget Meter */}
        <TokenMeter usage={usage} budget={settings.tokenBudget} onReset={handleResetTokens} />

        {/* Message List */}
        <MessageList
          messages={messages}
          onCopyText={(txt) => {
            navigator.clipboard.writeText(txt);
            showToast("Copied to clipboard.", "success");
          }}
          onSpeak={(txt) => handleSpeakText(txt)}
          onTogglePin={handleTogglePinMessage}
          onRegenerate={handleRegenerate}
          onContinue={handleContinue}
          onFeedback={handleFeedback}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onRunCode={handleRunCode}
          onOpenFrontEnd={(code, lang) => handleOpenFrontEnd(code, lang)}
          speakingMsgId={speakingMsgId}
          isStreaming={isStreaming}
          streamingText={streamingText}
          pinnedMessages={pinnedMessages}
          searchActive={searchActive}
          searchQuery={searchQuery}
          onSearchSelect={(id) => {
            const el = document.querySelector(`[data-msg-id="${id}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          onCloseSearch={() => setSearchActive(false)}
        />

        {/* Chat Input Area */}
        <InputArea
          input={input}
          onInputChange={setInput}
          onSend={() => handleSend()}
          onCancel={handleCancelStream}
          isStreaming={isStreaming}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          attachedFiles={attachedFiles}
          onAddFiles={handleAddFiles}
          onRemoveFile={(idx) => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
        />
      </div>

      {/* Modals & Overlays */}
      <MissionModal
        isOpen={missionModalOpen}
        onClose={() => setMissionModalOpen(false)}
        onStartMission={handleStartMission}
        active={missionActive}
        tasks={missionTasks}
        currentTaskIndex={currentTaskIndex}
      />

      <SettingsModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetFactory={() => {
          if (!window.confirm("WARNING: This will reset ALL settings, API keys, and memory. Proceed?")) return;
          localStorage.clear();
          window.location.reload();
        }}
        modelList={modelList}
        onFetchModels={fetchModels}
        isFetchingModels={isFetchingModels}
      />

      <ConversationSidebar
        isOpen={historySidebarOpen}
        onClose={() => setHistorySidebarOpen(false)}
        conversations={savedConversations}
        onLoad={(id) => {
          const arch = savedConversations.find((c) => c.id === id);
          if (arch) {
            const newTab: ConversationTab = {
              id: `tab-${Date.now()}`,
              name: arch.title.slice(0, 18),
              createdAt: Date.now(),
              messages: arch.messages,
            };
            setTabs((prev) => [...prev, newTab]);
            setActiveTabId(newTab.id);
            showToast(`Loaded archive: ${arch.title}`, "success");
          }
        }}
        onDelete={(id, e) => {
          e.stopPropagation();
          setSavedConversations((prev) => {
            const next = prev.filter((c) => c.id !== id);
            localStorage.setItem("senpai_neural_archives_v9", JSON.stringify(next));
            return next;
          });
        }}
        onClearAll={() => {
          if (!window.confirm("Delete all saved archives?")) return;
          setSavedConversations([]);
          localStorage.removeItem("senpai_neural_archives_v9");
          showToast("All archives cleared.", "success");
        }}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onClearChat={() => {
          updateActiveTabMessages([]);
          showToast("Chat cleared.", "success");
        }}
        onExportMd={handleExportMd}
        onOpenConfig={() => setConfigModalOpen(true)}
        onResetTokens={handleResetTokens}
        onOpenMission={() => setMissionModalOpen(true)}
        onOpenSkills={() => setSkillsModalOpen(true)}
        onOpenFrontEnd={() => handleOpenFrontEnd()}
        onOpenUserDashboard={() => setUserDashboardOpen(true)}
        onSwitchTheme={(th) => handleSaveSettings({ ...settings, theme: th })}
        onSwitchModel={(mod) => handleSaveSettings({ ...settings, model: mod })}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onTriggerCameraShot={triggerShot}
        customCommands={adminConfig?.customCLICommands}
        onExecuteCustomCommand={handleExecuteCustomCLI}
      />

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          fetch("/api/admin/config")
            .then((r) => r.json())
            .then((d) => {
              if (d.config) setAdminConfig(d.config);
            })
            .catch(() => {});
        }}
        onConfigUpdated={(cfg) => setAdminConfig(cfg)}
        initialConfig={adminConfig}
        onRestorePreset={handleRestorePreset}
      />

      <MiniSearchOverlay
        isOpen={miniSearchOpen}
        onClose={() => setMiniSearchOpen(false)}
        activeTab={activeTab || null}
        savedConversations={savedConversations}
        onSelectMessage={(msgId) => {
          const el = document.getElementById(msgId) || document.getElementById(`msg-${msgId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-2", "ring-cyan-500", "transition-all");
            setTimeout(() => el.classList.remove("ring-2", "ring-cyan-500", "transition-all"), 2000);
          }
        }}
        onSelectConversation={(convId) => {
          const arch = savedConversations.find((c) => c.id === convId);
          if (arch) {
            const newTab: ConversationTab = {
              id: `tab-${Date.now()}`,
              name: arch.title.slice(0, 18),
              createdAt: Date.now(),
              messages: arch.messages,
            };
            setTabs((prev) => [...prev, newTab]);
            setActiveTabId(newTab.id);
            showToast(`Loaded archive: ${arch.title}`, "success");
          }
        }}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenMission={() => setMissionModalOpen(true)}
      />

      <SkillsDashboardModal
        isOpen={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
        agentSkills={adminConfig?.agentSkills}
        onToggleSkill={(id) => {
          if (!adminConfig) return;
          const current = adminConfig.agentSkills || [];
          const updated = current.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
          setAdminConfig({ ...adminConfig, agentSkills: updated });
          showToast("Updated skill activation state.", "success");
        }}
        onSelectSkillForChat={(skill) => {
          if (adminConfig && adminConfig.agentSkills) {
            const updated = adminConfig.agentSkills.map((s) =>
              s.id === skill.id ? { ...s, usageCount: (s.usageCount || 0) + 1 } : s
            );
            setAdminConfig({ ...adminConfig, agentSkills: updated });
            fetch("/api/admin/skills", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: localStorage.getItem("neuro_admin_token") || "neuro-admin-token-1234",
                action: "update",
                skill: { ...skill, usageCount: (skill.usageCount || 0) + 1 }
              }),
            }).catch(() => {});
          }
          setInput((prev) => `${prev ? prev + "\n\n" : ""}[RUN SKILL: ${skill.name}]\n\`\`\`markdown\n${skill.content}\n\`\`\``);
          setSkillsModalOpen(false);
          showToast(`Skill '${skill.name}' activated (+1 execution frequency).`, "success");
        }}
      />

      <FrontEndWorkspaceModal
        isOpen={frontEndModalOpen}
        onClose={() => setFrontEndModalOpen(false)}
        initialCode={frontEndCode.code}
        initialLang={frontEndCode.lang}
        onSendToChat={(code, prompt) => {
          setInput((prev) => `${prev ? prev + "\n\n" : ""}[FRONT-END MODIFICATION REQUEST]: ${prompt}\n\`\`\`jsx\n${code}\n\`\`\``);
          showToast("Sent front-end modification request to chat.", "success");
        }}
      />

      {/* Floating 3D Social Orb */}
      {!fullMindMode && <SocialOrbCTA mediaLinks={adminConfig?.mediaLinks} />}

      {/* Custom Page Portal Modal */}
      <CustomPageModal
        page={activeCustomPage}
        onClose={() => setActiveCustomPage(null)}
      />

      {/* User Dashboard & Google OAuth Modal */}
      <UserDashboardModal
        isOpen={userDashboardOpen}
        onClose={() => setUserDashboardOpen(false)}
        user={user}
        onLoginSuccess={(authedUser) => {
          setUser(authedUser);
          try {
            localStorage.setItem("senpai_neural_user_v1", JSON.stringify(authedUser));
          } catch (_) {}
          showToast(`🎉 Welcome to Neural OS, ${authedUser.name}! Google OAuth Verified.`, "success");
        }}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem("senpai_neural_user_v1");
          showToast("Logged out of Google Synaptic Account.", "warn");
        }}
        usage={usage}
        onUpdateSyncSettings={(updated) => {
          if (user) {
            const next = { ...user, ...updated };
            setUser(next);
            try {
              localStorage.setItem("senpai_neural_user_v1", JSON.stringify(next));
            } catch (_) {}
            showToast("Synaptic preferences synced!", "success");
          }
        }}
        showToast={showToast}
      />

      {/* Snapshot Naming Modal */}
      {snapshotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>📸 Capture Neural Snapshot</span>
              </div>
              <button onClick={() => setSnapshotModalOpen(false)} className="text-slate-400 hover:text-white px-2 py-1">✕</button>
            </div>
            <p className="text-xs text-slate-300">
              Save the current 3D coordinates, strengths, and geometry customization of all <strong className="text-white font-mono">{nodes.length} neuron nodes</strong> as a reusable preset in your Admin portal.
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Preset Name</label>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="e.g. Deep Synthesis State #1"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl text-white text-xs font-mono focus:border-emerald-400 outline-none shadow-inner"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSnapshotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-400 hover:bg-white/5 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all font-extrabold"
              >
                SAVE PRESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
