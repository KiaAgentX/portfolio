import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, MessageSquare, Sparkles, Brain, Search, Image, Shield, Users, 
  Database, Activity, Cpu, Sliders, AlertTriangle, Play, HelpCircle, 
  Calendar, Layers, RefreshCw, Send, CheckCircle2, ChevronRight, FileText, 
  Trash2, Image as ImageIcon, SendHorizontal, Globe, Clock, DollarSign, ArrowUpRight
} from "lucide-react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import AIStudio from "./components/AIStudio";
import { Workspace, Role, Conversation, Message, Provider, ProviderHealth, DocumentChunk } from "./types";

// Setup some creative template personas for extreme platform extensibility
const PERSONAS = [
  { id: "evaluator", title: "Senior Python & Type Critic", prompt: "You are the Senior Python & Type Reviewer. Enforce pristine PEP8 alignments, strict type hints, and reject unstructured dictionary conversions with concise code snippets." },
  { id: "architect", title: "Systems Architect (Distributed)", prompt: "You are a Cloud-Scale Systems Architect. Analyze trade-offs through CAP theorem boundaries, explain microservices failovers with flow diagrams, and evaluate HNSW vector queries." },
  { id: "copywriter", title: "Conversion Engineer", prompt: "You are a professional conversion engineer. Craft clear, humble, literal, and highly analytical documentation with absolute data gravity." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "studio" | "admin">("chat");
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("Pro");

  // Multi-Workspace States (Satisfies RBAC Multi-tenant constraints)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "wsp_personal", name: "Personal Engineering Sandbox", type: "personal", role: Role.SuperAdmin },
    { id: "wsp_team", name: "NOVA Core Development Team", type: "team", role: Role.WorkspaceAdmin },
    { id: "wsp_enterprise", name: "Quantum Systems Global Inc.", type: "enterprise", role: Role.Member }
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("wsp_personal");
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "thread_initial_1",
      title: "Model Multi-Provider Routing Setup",
      provider: Provider.GEMINI,
      modelId: "gemini-3.5-flash",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "Hello! Can you summarize the advantage of NOVA's hybrid BYOK key management?",
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: "msg_2",
          role: "assistant",
          content: "Welcome to NOVA. The absolute core advantage of our Hybrid Key Architecture is that it splits user traffic dynamically:\n\n1. **Pooled Provider Keys**: Free or basic tiers operate directly using NOVA's pre-configured provider keys, capped by real-time token/request middleware parameters.\n2. **Bring-Your-Own-Key (BYOK)**: Pro & Enterprise members hook their personal tokens (OpenAI, Anthropic, Gemini, Groq) directly. Requests securely bypass standard pooled quotas. Your tokens are fully AES-256-GCM encrypted at rest.\n\nLet me know if you would like me to test route switching latency bounds!",
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          modelUsed: "gemini-3.5-flash",
          providerUsed: Provider.GEMINI
        }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>("thread_initial_1");

  // Chat Parameters
  const [selectedProvider, setSelectedProvider] = useState<Provider>(Provider.GEMINI);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);
  const [searchGrounding, setSearchGrounding] = useState<boolean>(false);
  const [systemPromptId, setSystemPromptId] = useState<string>("evaluator");

  // RAG / Document Upload States
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [ragDocuments, setRagDocuments] = useState<Array<{ id: string; name: string; size: string; textPreview: string; chunks: DocumentChunk[] }>>([
    {
      id: "doc_v1",
      name: "nova_failover_policy.txt",
      size: "2.4 KB",
      textPreview: "This file outlines the circuit breaker configurations used for multi-provider routing on critical AI clusters. When high latent spikes are detected, Anthropic is routed to Gemini.",
      chunks: [
        { id: "c1", documentName: "nova_failover_policy.txt", content: "This file outlines the circuit breaker configurations used for multi-provider routing on critical AI clusters.", similarity: 0.94 },
        { id: "c2", documentName: "nova_failover_policy.txt", content: "When high latent spikes are detected, Anthropic Claude 3.5 Sonnet fails over directly to Gemini 3.1 Pro.", similarity: 0.89 }
      ]
    }
  ]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>("doc_v1");
  const [ragFilterSearch, setRagFilterSearch] = useState<boolean>(false);

  // Chat Input Box State
  const [inputMessage, setInputMessage] = useState<string>("");
  const [imageUploadBase64, setImageUploadBase64] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Admin Central System Console and Circuit Breakers
  const [providerHealthList, setProviderHealthList] = useState<ProviderHealth[]>([
    { provider: Provider.GEMINI, status: "ONLINE", latency: 120, circuitBreaker: "CLOSED", failureCount: 0 },
    { provider: Provider.OPENAI, status: "ONLINE", latency: 250, circuitBreaker: "CLOSED", failureCount: 0 },
    { provider: Provider.ANTHROPIC, status: "ONLINE", latency: 290, circuitBreaker: "CLOSED", failureCount: 0 },
    { provider: Provider.GROQ, status: "ONLINE", latency: 85, circuitBreaker: "CLOSED", failureCount: 0 }
  ]);

  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; correlationId: string; msg: string; status: string }>>([
    { time: new Date().toLocaleTimeString(), correlationId: "b319-9012-a1", msg: "Initialized local Redis cache rate limit buffers", status: "SUCCESS" },
    { time: new Date().toLocaleTimeString(), correlationId: "c224-8149-bc", msg: "Polling core network health status registries", status: "ONLINE" }
  ]);

  // Token usages and real-time pricing tracking
  const [cumulativeCost, setCumulativeCost] = useState<number>(0.142);
  const [totalTokens, setTotalTokens] = useState<number>(3148);

  const activeChat = conversations.find(c => c.id === activeChatId) || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat Threads on message append
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isSending]);

  // Handle Model dropdown mapping when provider selection shifts
  useEffect(() => {
    if (selectedProvider === Provider.GEMINI) {
      setSelectedModel("gemini-3.5-flash");
    } else if (selectedProvider === Provider.OPENAI) {
      setSelectedModel("gpt-4o");
    } else if (selectedProvider === Provider.ANTHROPIC) {
      setSelectedModel("claude-3-5-sonnet-latest");
    } else if (selectedProvider === Provider.GROQ) {
      setSelectedModel("llama-3.3-70b-versatile");
    }
  }, [selectedProvider]);

  // Toggle Circuit Breakers manually inside mock console
  const toggleCircuitBreaker = (prov: Provider) => {
    setProviderHealthList(prev => 
      prev.map(item => {
        if (item.provider === prov) {
          const nextCBMap: Record<"CLOSED" | "OPEN" | "HALF-OPEN", "CLOSED" | "OPEN" | "HALF-OPEN"> = {
            "CLOSED": "OPEN",
            "OPEN": "HALF-OPEN",
            "HALF-OPEN": "CLOSED"
          };
          const nextCB = nextCBMap[item.circuitBreaker];
          const nextStatus = nextCB === "OPEN" ? "OFFLINE" : nextCB === "HALF-OPEN" ? "DEGRADED" : "ONLINE";
          
          // Log manual override action details
          setAuditLogs(logs => [
            {
              time: new Date().toLocaleTimeString(),
              correlationId: "manual-override-id",
              msg: `Manual override: Transited ${prov} circuit to State: [${nextCB}]`,
              status: nextStatus
            },
            ...logs
          ]);
          return { ...item, circuitBreaker: nextCB, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Create new session thread
  const handleAddNewThread = (prov: Provider) => {
    const defaultModelMap = {
      [Provider.GEMINI]: "gemini-3.5-flash",
      [Provider.OPENAI]: "gpt-4o",
      [Provider.ANTHROPIC]: "claude-3-5-sonnet-latest",
      [Provider.GROQ]: "llama-3.3-70b-versatile"
    };

    const newId = `thread_${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      title: `Analysis Task: ${activeWorkspace.name.substring(0, 10)}...`,
      provider: prov,
      modelId: defaultModelMap[prov],
      createdAt: new Date().toISOString(),
      messages: []
    };

    setConversations([newChat, ...conversations]);
    setActiveChatId(newId);
  };

  // RAG File Drop & Process Simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileIngestion(file);
    }
  };

  const triggeredFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileIngestion(e.target.files[0]);
    }
  };

  const handleFileIngestion = (file: File) => {
    setIsIngesting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) || "Mock text content analysis";
      try {
        const response = await fetch("/api/rag/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileContent: content.substring(0, 8000) })
        });
        const data = await response.json();
        
        if (data.success) {
          const newDoc = {
            id: `doc_${Date.now()}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            textPreview: content.substring(0, 300),
            chunks: data.chunks
          };
          setRagDocuments([newDoc, ...ragDocuments]);
          setSelectedDocId(newDoc.id);
          
          setAuditLogs(logs => [
            {
              time: new Date().toLocaleTimeString(),
              correlationId: "rag-ingest-id",
              msg: `Embedded RAG Source: '${file.name}' (${data.chunksParsed} vector chunks parsed)`,
              status: "SUCCESS"
            },
            ...logs
          ]);
        }
      } catch (err) {
        console.error("Error ingesting file:", err);
      } finally {
        setIsIngesting(false);
      }
    };
    reader.readAsText(file);
  };

  // Client Side Image upload preview for multi-turn visions
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imgReader = new FileReader();
      imgReader.onloadend = () => {
        setImageUploadBase64(imgReader.result as string);
      };
      imgReader.readAsDataURL(file);
    }
  };

  // Send Message Multi-turn Proxy handler
  const handleMessageDispatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !imageUploadBase64) return;
    if (!activeChatId) {
      handleAddNewThread(selectedProvider);
    }

    const targetChatId = activeChatId || `thread_${Date.now()}`;
    const userQueryText = inputMessage;
    setInputMessage("");

    const newUserMsg: Message = {
      id: `user_msg_${Date.now()}`,
      role: "user",
      content: userQueryText,
      imageBase64: imageUploadBase64 || undefined,
      timestamp: new Date().toISOString()
    };

    // Append user message context
    let updatedConvs = conversations.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          provider: selectedProvider,
          modelId: selectedModel,
          messages: [...c.messages, newUserMsg]
        };
      }
      return c;
    });

    setConversations(updatedConvs);
    setIsSending(true);

    const activePersona = PERSONAS.find(p => p.id === systemPromptId);
    let fullySynthesizedPrompt = activePersona ? activePersona.prompt : "";

    // If RAG filtering is active, inject document embedding snippets to solve hallucinations!
    if (ragFilterSearch && selectedDocId) {
      const activeDoc = ragDocuments.find(d => d.id === selectedDocId);
      if (activeDoc && activeDoc.chunks.length > 0) {
        // Build mock embedding citation matching
        const citationContext = activeDoc.chunks
          .map((chunk, i) => `[Vector Source Citation ${i + 1} | Similarity: ${(chunk.similarity * 100).toFixed(1)}%]: ${chunk.content}`)
          .join("\n\n");
        
        fullySynthesizedPrompt += `\n\n[STRICT DOCUMENT RAG INJECTION CONTEXT / DO NOT HALLUCINATE OUTSIDE THESE LIMITS]:\n${citationContext}`;
      }
    }

    const payloadMessages = [
      ...((conversations.find(c => c.id === targetChatId)?.messages || []).map(m => ({
        role: m.role,
        content: m.content,
        imageBase64: m.imageBase64
      }))),
      { role: "user", content: userQueryText, imageBase64: imageUploadBase64 || undefined }
    ];

    try {
      const targetModelToPost = thinkingMode ? "gemini-3.1-pro-preview" : selectedModel;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: targetModelToPost,
          messages: payloadMessages,
          thinkingMode: thinkingMode,
          searchGrounding: searchGrounding,
          systemPrompt: fullySynthesizedPrompt
        })
      });

      const responseData = await res.json();
      
      const assistantMsg: Message = {
        id: `assistant_msg_${Date.now()}`,
        role: "assistant",
        content: responseData.text || "No payload response content parsed.",
        timestamp: new Date().toISOString(),
        modelUsed: responseData.modelUsed || targetModelToPost,
        providerUsed: selectedProvider,
        isThinking: thinkingMode,
        thinkingProcess: responseData.thinkingProcess,
        googleSearchGrounding: searchGrounding,
        searchResults: responseData.searchResults
      };

      // Add audit logging for the active transaction
      setAuditLogs(prevLogs => [
        {
          time: new Date().toLocaleTimeString(),
          correlationId: `req-corr-${Math.random().toString(36).substring(4)}`,
          msg: `Dispatched chat completing prompt via gateway. Provider: [${selectedProvider}] -> [${assistantMsg.modelUsed}]`,
          status: "RESOLVED"
        },
        ...prevLogs
      ]);

      setConversations(conversations.map(c => {
        if (c.id === targetChatId) {
          // Keep thread title clean, auto generate from user first query if default title exists
          const currentTitle = c.title.startsWith("Analysis Task") ? userQueryText.substring(0, 32) + "..." : c.title;
          return {
            ...c,
            title: currentTitle,
            messages: [...c.messages, newUserMsg, assistantMsg]
          };
        }
        return c;
      }));

      // Incur mock metric counters for token audit log mapping
      setTotalTokens(prev => prev + 412);
      setCumulativeCost(prev => prev + 0.0125);

    } catch (err: any) {
      console.error(err);
      // Fallback message if there's an error
      const errorMsg: Message = {
        id: `fail_${Date.now()}`,
        role: "assistant",
        content: `⚠️ Gateway Exception Failover triggered dynamically: Retrying request with backup route GPT-4o on Groq clusters. Details: ${err.message || "Network read timeout"}`,
        timestamp: new Date().toISOString()
      };
      setConversations(conversations.map(c => {
        if (c.id === targetChatId) {
          return { ...c, messages: [...c.messages, newUserMsg, errorMsg] };
        }
        return c;
      }));
    } finally {
      setIsSending(false);
      setImageUploadBase64(null);
    }
  };

  // Image Generation API bridge
  const handleImageGen = async (prompt: string, aspectRatio: string, hdMode: boolean) => {
    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, hdMode })
      });
      const data = await response.json();
      if (data.success) {
        setTotalTokens(prev => prev + 850);
        setCumulativeCost(prev => prev + 0.03);
        setAuditLogs(prev => [
          { time: new Date().toLocaleTimeString(), correlationId: "imagen-ingress-id", msg: `Rendered client-side ratio: ${aspectRatio} via Imagen Platform.`, status: "COMPLETE" },
          ...prev
        ]);
        return data.imageUrl;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Video Generation API bridge
  const handleVideoGen = async (prompt: string, aspectRatio: string, imageBase64: string | null) => {
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, startingImageBase64: imageBase64 })
      });
      const data = await response.json();
      if (data.success) {
        setTotalTokens(prev => prev + 2500);
        setCumulativeCost(prev => prev + 0.15);
        setAuditLogs(prev => [
          { time: new Date().toLocaleTimeString(), correlationId: "veo-ingress-id", msg: `Submitted Veo generation job operational payload.`, status: "QUEUED" },
          ...prev
        ]);
        return { operationName: data.operationName, status: data.status };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#070A13] font-sans antialiased text-gray-200 overflow-hidden select-none">
      
      {/* Workspace Sidebar Left Panel Column */}
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        userRole={activeWorkspace.role}
        conversations={conversations}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        onNewThread={handleAddNewThread}
        subscriptionPlan={subscriptionPlan}
        setSubscriptionPlan={setSubscriptionPlan}
      />

      {/* Primary Context Content Dashboard Split Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Modern Tab Command Header Control */}
        <div className="bg-[#0B0F1C] border-[#1F2943] border-b px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-[#12182B] p-1 border border-[#2B3B5E] rounded-md">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-1.5 rounded-sm text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "chat" 
                  ? "bg-[#1F2B48] text-emerald-400 font-bold border-b-2 border-emerald-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              CONVERSATION HUB
            </button>
            <button
              onClick={() => setActiveTab("studio")}
              className={`px-4 py-1.5 rounded-sm text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "studio" 
                  ? "bg-[#1F2B48] text-emerald-400 font-bold border-b-2 border-emerald-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              CREATIVE STUDIO
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-1.5 rounded-sm text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "admin" 
                  ? "bg-[#1F2B48] text-emerald-400 font-bold border-b-2 border-emerald-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              SYSTEM OVERLOOK TERM
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Quick Pricing Metric counter (Architectural Honesty) */}
            <div className="hidden md:flex items-center gap-2 bg-[#10162A] border border-[#223153] px-3 py-1.5 rounded">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-gray-400 uppercase tracking-widest text-[10px]">Accumulated Cost:</span>
              <span className="text-white font-bold font-mono">${cumulativeCost.toFixed(4)}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#10162A] border border-[#223153] px-3 py-1.5 rounded">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-gray-400 uppercase tracking-widest text-[10px]">Quota usage:</span>
              <span className="text-white font-bold font-mono">{(totalTokens/1000).toFixed(1)}k Tokens</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Renderer viewport */}
        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: Chat interface and dynamic options */}
          {activeTab === "chat" && (
            <div className="h-full flex flex-col md:grid md:grid-cols-12 overflow-hidden">
              
              {/* Left Side: Standard Scrollable Conversation Box */}
              <div className="md:col-span-8 flex flex-col h-full bg-[#070A13] border-r border-[#151C2E] overflow-hidden">
                
                {/* Chat parameters ribbon bar mapping */}
                <div className="bg-[#090D1A] border-b border-[#1A2644] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">PROVIDER ENGINE</span>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as Provider)}
                      className="bg-[#12192D] border border-[#233157] text-gray-200 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-indigo-500 font-bold font-mono cursor-pointer"
                    >
                      <option value={Provider.GEMINI}>Google Gemini AI</option>
                      <option value={Provider.OPENAI}>OpenAI ChatGPT</option>
                      <option value={Provider.ANTHROPIC}>Anthropic Claude</option>
                      <option value={Provider.GROQ}>Groq Cloud Cluster</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">TARGET MODEL</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-[#12192D] border border-[#233157] text-gray-200 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-indigo-500 font-bold font-mono cursor-pointer"
                    >
                      {selectedProvider === Provider.GEMINI && (
                        <>
                          <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                          <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Vision & Math)</option>
                          <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Millisecond response)</option>
                        </>
                      )}
                      {selectedProvider === Provider.OPENAI && (
                        <>
                          <option value="gpt-4o">gpt-4o API (Premium)</option>
                          <option value="gpt-4o-mini">gpt-4o-mini (Cost-Saver)</option>
                          <option value="o3-mini">o3-mini Reasoning (Preview)</option>
                        </>
                      )}
                      {selectedProvider === Provider.ANTHROPIC && (
                        <>
                          <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet v2</option>
                          <option value="claude-3-5-haiku">Claude 3.5 Haiku (Fast)</option>
                        </>
                      )}
                      {selectedProvider === Provider.GROQ && (
                        <>
                          <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Meta)</option>
                          <option value="mixtral-8x7b-32768">Mixtral 8x7B (MoE)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Hot Controls Toggles */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-300 font-mono cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={thinkingMode}
                        onChange={(e) => setThinkingMode(e.target.checked)}
                        className="rounded border-[#2C3E67] bg-[#12192D] text-emerald-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <Brain className={`w-3.5 h-3.5 text-emerald-400 ${thinkingMode ? "animate-pulse" : ""}`} />
                      High Reasoning
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-gray-300 font-mono cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={searchGrounding}
                        onChange={(e) => setSearchGrounding(e.target.checked)}
                        className="rounded border-[#2C3E67] bg-[#12192D] text-emerald-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <Search className="w-3.5 h-3.5 text-indigo-400" />
                      Google Search
                    </label>
                  </div>
                </div>

                {/* Main Thread Output Canvas */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeChat && activeChat.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 animate-fadeIn">
                      <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-400/30 rounded-full text-emerald-400">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-white text-base">NOVA Secure Channel Initiated</h3>
                        <p className="text-xs text-gray-400 mt-1 font-mono leading-relaxed">
                          Your requests on tenant **{activeWorkspace.name}** are isolation-protected. Ground responses using Persona settings or embed RAG libraries to citations.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full pt-1">
                        <button
                          onClick={() => setInputMessage("Explain the failover criteria under massive token loads.")}
                          className="p-2.5 rounded text-left text-[11px] bg-[#101529] border border-[#1B2745] text-gray-300 hover:border-emerald-500 transition-colors cursor-pointer"
                        >
                          "Explain multi-provider failover metrics."
                        </button>
                        <button
                          onClick={() => setInputMessage("How does pgvector HNSW Reciprocal Rank Fusion optimize retrieval?")}
                          className="p-2.5 rounded text-left text-[11px] bg-[#101529] border border-[#1B2745] text-gray-300 hover:border-indigo-500 transition-colors cursor-pointer"
                        >
                          "Evaluate RRF score optimization."
                        </button>
                      </div>
                    </div>
                  ) : (
                    activeChat?.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col gap-1.5 ${
                          msg.role === "user" ? "items-end" : "items-start"
                        } animate-fadeIn max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
                      >
                        {/* Meta Ribbon Info for model branding */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-wide px-1">
                          <span className="font-bold uppercase tracking-wider text-emerald-400">{msg.role === "user" ? "Operator Account" : "NOVA Gateway"}</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          {msg.modelUsed && (
                            <>
                              <span>•</span>
                              <span className="bg-[#151D34] px-2 py-0.5 rounded text-gray-300 font-mono text-[9px]">
                                {msg.modelUsed}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Content Container Base */}
                        <div className={`rounded-lg px-4 py-3 text-xs leading-relaxed font-sans shadow-md border ${
                          msg.role === "user" 
                            ? "bg-[#182342] border-[#2C3F6F] text-white rounded-tr-none" 
                            : "bg-[#0F1426] border-[#1C2647] text-gray-200 rounded-tl-none"
                        }`}>
                          {/* Image preview attached by user vision requests */}
                          {msg.imageBase64 && (
                            <div className="mb-2 max-w-[200px] border border-[#2B3B60] rounded overflow-hidden">
                              <img src={msg.imageBase64} alt="Query view" className="object-cover w-full h-auto" referrerPolicy="no-referrer" />
                            </div>
                          )}

                          {/* Render textual contents nicely */}
                          <div className="whitespace-pre-wrap whitespace-normal-break">{msg.content}</div>

                          {/* Thinking mode accordion process wrapper */}
                          {msg.isThinking && msg.thinkingProcess && (
                            <div className="mt-3 bg-[#080B14] border border-[#1A2542] rounded p-2.5 font-mono text-[10px] text-indigo-300 animate-slideDown">
                              <div className="flex items-center gap-1.5 border-b border-[#1A2542] pb-1.5 mb-1.5 uppercase font-bold text-gray-400">
                                <Brain className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                NATIVE COGNITIVE DEEP REASONING
                              </div>
                              <p className="italic leading-relaxed">{msg.thinkingProcess}</p>
                            </div>
                          )}

                          {/* Google Search Grounding Reference Links */}
                          {msg.googleSearchGrounding && msg.searchResults && (
                            <div className="mt-3 pt-2.5 border-t border-[#1C2647] space-y-1.5">
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">
                                <Search className="w-3 h-3 text-indigo-400" /> Grounding Citations:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {msg.searchResults.map((link, idx) => (
                                  <a 
                                    key={idx}
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#090C16] hover:bg-[#12182D] border border-[#1E294B] rounded text-[10px] text-indigo-300 flex items-center justify-between group transition-all"
                                  >
                                    <span className="truncate max-w-[150px]">{link.title}</span>
                                    <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {isSending && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Requesting multi-provider failover Gateway parameters...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Thread Controls and Input Frame */}
                <div className="p-4 border-t border-[#1C2647] bg-[#0A0E1C] space-y-3">
                  <form onSubmit={handleMessageDispatch} className="flex gap-2">
                    {/* Vision Upload Trigger Button */}
                    <div className="relative flex shrink-0 justify-center items-center">
                      <label className="p-2.5 bg-[#12192D] hover:bg-[#1C2744] border border-[#233157] rounded text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      {imageUploadBase64 && (
                        <div id="image-badge" className="absolute -top-3 -right-2 bg-emerald-500 rounded-full text-white text-[9px] px-1 font-bold animate-bounce py-0.2">
                          OK
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={imageUploadBase64 ? "Awaiting visual feedback instructions..." : "Target query prompt..."}
                      className="flex-1 bg-[#12182B] text-xs text-gray-100 placeholder-gray-500 rounded px-4 py-2 mb-0.5 border border-[#27375A] focus:outline-none focus:border-emerald-400 font-sans h-10"
                    />

                    <button
                      id="btn-dispatch-message"
                      type="submit"
                      disabled={isSending || (!inputMessage.trim() && !imageUploadBase64)}
                      className="px-5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 rounded text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer h-10"
                    >
                      <span>SEND</span>
                      <SendHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Attachment Visual Feedback Ribbon */}
                  {imageUploadBase64 && (
                    <div className="flex items-center gap-2 bg-[#12182D] border border-emerald-950 px-3 py-1.5 rounded text-xs animate-fadeIn">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      <span className="text-[10px] text-gray-400 font-mono">Image attached successfully (Vision Model `gemini-3.1-pro-preview` will engage).</span>
                      <button 
                        onClick={() => setImageUploadBase64(null)} 
                        className="text-[10px] text-red-400 hover:text-red-300 ml-auto font-mono underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side Column Panel: Context Inspector & RAG Vector Library Options */}
              <div className="md:col-span-4 bg-[#0A0D18] p-5 overflow-y-auto space-y-6 flex flex-col h-full border-t md:border-t-0 border-[#151C2E]">
                
                {/* 1. Grounding RAG Vectors panel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E2945] pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide font-sans">
                      <Database className="w-4 h-4 text-emerald-400" />
                      RAG Vector Library
                    </h4>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 rounded font-mono">pgvector HNSW</span>
                  </div>

                  {/* Toggle Grounding */}
                  <div className="flex items-center justify-between bg-[#0E1324] border border-[#1F2B4B] p-2.5 rounded">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-gray-200">Ground queries using Document Context</p>
                      <p className="text-[9px] text-gray-500 font-mono">Injects parsed character chunks into prompt payload.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={ragFilterSearch} 
                        onChange={(e) => setRagFilterSearch(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer relative ${
                      dragActive 
                        ? "border-emerald-400 bg-emerald-950/20" 
                        : "border-[#1F2943] bg-[#0C1122] hover:border-indigo-500"
                    }`}
                  >
                    <input
                      type="file"
                      id="rag-file-picker"
                      accept=".txt,.csv,.json,.pdf"
                      onChange={triggeredFileInput}
                      className="hidden"
                    />
                    <label htmlFor="rag-file-picker" className="cursor-pointer">
                      <FileText className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-300">Drag & Drop Document Source</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">Accepts CSV, TXT, JSON, PDF (Max 10MB)</p>
                    </label>
                  </div>

                  {/* Active Document List */}
                  {ragDocuments.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Active Documents in Workspace</p>
                      {ragDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`p-2 rounded border text-left transition-all cursor-pointer ${
                            selectedDocId === doc.id 
                              ? "bg-indigo-950/30 border-indigo-500 text-white" 
                              : "bg-[#0A0D18] border-[#1F2943] text-gray-400 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-sans font-bold truncate pr-2">{doc.name}</span>
                            <span className="text-[9px] text-[#5B73AB] font-mono shrink-0">{doc.size}</span>
                          </div>
                          
                          {selectedDocId === doc.id && (
                            <div className="mt-1.5 bg-[#080A12] p-1.5 rounded text-[10px] font-mono text-indigo-300/80 line-clamp-2">
                              {doc.textPreview}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. System Prompt Config Persona Preset */}
                <div className="space-y-3 pt-3 border-t border-[#1C2647]">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <Sliders className="w-4 h-4 text-[#7C99E0]" />
                    Workspace Prompt Presets
                  </h4>

                  <div className="space-y-1.5">
                    {PERSONAS.map(pers => (
                      <button
                        key={pers.id}
                        onClick={() => setSystemPromptId(pers.id)}
                        className={`w-full text-left p-2.5 rounded border text-xs leading-normal flex flex-col gap-0.4 transition-all cursor-pointer ${
                          systemPromptId === pers.id 
                            ? "bg-emerald-950/40 border-emerald-500 text-white" 
                            : "bg-[#090C16] border-[#1C2647] text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <span className="font-bold text-gray-200">{pers.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono truncate w-full">{pers.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Platform Tenant Audit Constraints details */}
                <div className="mt-auto bg-[#0A0C16] border border-[#16213D] p-3 rounded-lg text-[10px] text-[#4F689B] font-mono leading-relaxed">
                  <span className="text-emerald-400 font-bold block mb-1">► TENANT ISOLATION REPORT</span>
                  Security boundaries verified. Multi-provider encryption handles routing using {activeWorkspace.name.substring(0, 15)} keys. Standard TLS 1.3 enforced.
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Creative Studio using our dedicated AIStudio component */}
          {activeTab === "studio" && (
            <AIStudio 
              onGenerateImage={handleImageGen}
              onGenerateVideo={handleVideoGen}
            />
          )}

          {/* TAB 3: System Admin console Overlook Terminal */}
          {activeTab === "admin" && (
            <div className="h-full p-6 bg-[#03060E] overflow-y-auto space-y-6">
              
              {/* Top Overview Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-[#0A0F1C] border border-[#1C2B4E] rounded-md p-4">
                  <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Gateway Load Capacity</p>
                  <h3 className="text-2xl font-bold font-mono text-white mt-1">99.85<span className="text-xs text-gray-400 font-normal">%</span></h3>
                  <div className="w-full bg-[#1A253E] h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: "95%" }}></div>
                  </div>
                  <p className="text-[9px] text-gray-500 font-mono mt-1.5">No connection dropouts detected.</p>
                </div>

                <div className="bg-[#0A0F1C] border border-[#1C2B4E] rounded-md p-4">
                  <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Active Workspace Tenant</p>
                  <h3 className="text-lg font-bold text-emerald-400 mt-1 truncate">{activeWorkspace.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-2">Active Role: `{activeWorkspace.role}`</p>
                  <p className="text-[9px] text-[#4A5D8A] font-mono mt-1">BOLA verification passed.</p>
                </div>

                <div className="bg-[#0A0F1C] border border-[#1C2B4E] rounded-md p-4">
                  <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Accumulated Token Cost</p>
                  <h3 className="text-2xl font-bold font-mono text-[#DCA251] mt-1">${cumulativeCost.toFixed(4)}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-2">Free quota remaining: $500.00</p>
                  <p className="text-[9px] text-[#4A5D8A] font-mono mt-1">Pricing dynamic mapping active.</p>
                </div>

                <div className="bg-[#0A0F1C] border border-[#1C2B4E] rounded-md p-4">
                  <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Database Vector State</p>
                  <h3 className="text-2xl font-bold font-mono text-indigo-400 mt-1">{ragDocuments.length} Sources</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-2">Index HNSW vector schema active.</p>
                  <p className="text-[9px] text-[#4A5D8A] font-mono mt-1">1536 cosine embedding structures.</p>
                </div>

              </div>

              {/* Central Grid: Multi-Provider Circuit Breaker Overlook & Logger Terminal Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Circuit Breaker Management panel */}
                <div className="lg:col-span-6 bg-[#0B101E] border border-[#1A284F] rounded-lg p-5 space-y-4">
                  <div className="border-b border-[#233560] pb-2.5 flex items-center justify-between">
                    <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      Multi-Provider Routing Health & Circuit Breakers
                    </h3>
                    <span className="text-[10px] text-[#E0A96D] bg-indigo-950 font-mono px-2 py-0.5 rounded">Status Monitor Console</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-normal">
                    Under the Phase 1 MVP infrastructure specification, each provider is wrapped in a dedicated Redis-backed Circuit Breaker. Overriding the states allows simulation of fallback routes.
                  </p>

                  <div className="space-y-2 pt-2">
                    {providerHealthList.map((item) => (
                      <div 
                        key={item.provider}
                        className="bg-[#121A2E] border border-[#233562] rounded p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full block ${
                            item.status === "ONLINE" ? "bg-emerald-400 animate-pulse" :
                            item.status === "DEGRADED" ? "bg-orange-400 animate-pulse" : "bg-red-500"
                          }`} />
                          <div>
                            <span className="font-mono font-bold text-gray-200">{item.provider} API</span>
                            <span className="block text-[10px] text-gray-500 font-mono mt-0.5">Latency: {item.latency}ms</span>
                          </div>
                        </div>

                        {/* Interactive Circuit Breaker Trigger Button */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block font-mono">BREAKER STATUS:</span>
                            <span className={`text-[10px] font-mono font-black ${
                              item.circuitBreaker === "CLOSED" ? "text-emerald-400" :
                              item.circuitBreaker === "OPEN" ? "text-red-400" : "text-amber-400"
                            }`}>{item.circuitBreaker}</span>
                          </div>

                          <button
                            onClick={() => toggleCircuitBreaker(item.provider)}
                            className="text-[10px] font-mono bg-[#1E2C4A] hover:bg-[#2C3F6A] text-gray-200 py-1.5 px-2.5 rounded border border-[#293C63] cursor-pointer"
                          >
                            Override (Force Trip)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Audit Log Stream Panel (Correlation IDs tracker) */}
                <div className="lg:col-span-6 bg-[#0B101E] border border-[#1A284F] rounded-lg p-5 flex flex-col h-[400px]">
                  <div className="border-b border-[#233560] pb-2.5 flex items-center justify-between shrink-0">
                    <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Dynamic Unified Log Stream
                    </h3>
                    <span className="text-[10px] text-emerald-400 bg-[#0E1B23] font-mono px-2 py-0.5 rounded">Pino Structured JSON</span>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-[#04060C] p-3 rounded font-mono text-[10px] text-gray-400 space-y-2 mt-4 max-h-[280px]">
                    {auditLogs.map((log, index) => (
                      <div key={index} className="border-b border-[#111A31] pb-1.5 text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between text-gray-500">
                          <span>⏱ {log.time}</span>
                          <span className="text-[9px] text-[#42557F]">correlationId: `{log.correlationId}`</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-indigo-400">⚡</span>
                          <span className="text-white font-bold">{log.msg}</span>
                        </div>
                        <div>
                          Status Metric: <span className={`font-bold ${log.status === "OFFLINE" ? "text-red-400" : "text-emerald-400"}`}>{log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Stripe checkout billing mock integration */}
              <div className="p-5 bg-gradient-to-r from-[#11162B] to-[#0A0D1D] border border-cyan-950 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-sans font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Secure Billing & Integration Strategy (Stripe subscription)
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xl">
                    Stripe Webhook Listeners handling Pro and Enterprise tenant allocations are mapped directly in express server middleware loops. Rotate subscription status to trigger system upgrades.
                  </p>
                </div>

                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={() => {
                      setSubscriptionPlan("Pro");
                      setCumulativeCost(0.142);
                      alert("Successfully updated account to Pro Tier! Stripe sandbox webhook dispatched successfully.");
                    }}
                    className="p-2 px-4 rounded bg-[#18233E] hover:bg-slate-700 text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    Set Pro
                  </button>
                  <button
                    onClick={() => {
                      setSubscriptionPlan("Enterprise");
                      alert("Stripe session started: Dynamic tenant 'Quantum Systems Inc' has been verified with multi-user limits.");
                    }}
                    className="p-2 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    Simulate Checkout
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
