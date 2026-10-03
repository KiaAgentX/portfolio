import React, { useState } from "react";
import { Settings, ProviderType, SavedPrompt } from "../types";
import { PROVIDER_CONFIGS, FALLBACK_MODEL_LISTS } from "../data/dna";
import { Settings as SettingsIcon, X, Key, Cpu, Coins, Sliders, Volume2, Palette, BookOpen, ShieldAlert, FileText, Download, Upload } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (newSettings: Settings) => void;
  onResetFactory: () => void;
  modelList?: string[];
  onFetchModels?: () => void;
  isFetchingModels?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetFactory,
  modelList,
  onFetchModels,
  isFetchingModels = false,
}) => {
  const [activeTab, setActiveTab] = useState<"provider" | "model" | "budget" | "behavior" | "voice" | "theme" | "prompts" | "advanced" | "import">("provider");
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");
  const [promptName, setPromptName] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const provConfig = PROVIDER_CONFIGS[localSettings.provider] || PROVIDER_CONFIGS.gemini;
  const availableModels = modelList && modelList.length > 0 ? modelList : FALLBACK_MODEL_LISTS[localSettings.provider] || FALLBACK_MODEL_LISTS.gemini;

  const handleAddCustomModel = () => {
    if (customModelInput.trim()) {
      setLocalSettings({ ...localSettings, model: customModelInput.trim() });
      setCustomModelInput("");
    }
  };

  const handleSavePromptToLibrary = () => {
    if (promptName.trim() && localSettings.systemPrompt.trim()) {
      const newLib = [...localSettings.promptLibrary];
      const existingIdx = newLib.findIndex(p => p.name.toLowerCase() === promptName.trim().toLowerCase());
      if (existingIdx !== -1) {
        newLib[existingIdx].text = localSettings.systemPrompt.trim();
      } else {
        newLib.push({ name: promptName.trim(), text: localSettings.systemPrompt.trim() });
      }
      setLocalSettings({ ...localSettings, promptLibrary: newLib });
      setPromptName("");
    }
  };

  const handleDeletePromptFromLibrary = (index: number) => {
    const newLib = localSettings.promptLibrary.filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, promptLibrary: newLib });
  };

  const handleExportProfile = () => {
    const data = {
      version: "9.0",
      timestamp: new Date().toISOString(),
      settings: localSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senpai-neural-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          if (imported && imported.settings) {
            setLocalSettings({ ...localSettings, ...imported.settings });
            alert("Profile settings imported successfully!");
          } else {
            alert("Invalid profile file format.");
          }
        } catch (err) {
          alert("Failed to parse profile JSON.");
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const themes = [
    { id: "elon-edition", name: "SenPai Elon Edition", desc: "True-black Tesla canvas + high contrast ink-white + crimson hanko accent" },
    { id: "github-dark", name: "GitHub Dark", desc: "Classic dark gray panel styling with blue/violet accents" },
    { id: "github-light", name: "GitHub Light", desc: "Clean crisp light theme with high contrast readability" },
    { id: "dracula", name: "Dracula", desc: "Vibrant purple, pink and cyan neon styling over deep slate" },
    { id: "solarized-dark", name: "Solarized Dark", desc: "Teal and yellow muted tones over deep oceanic navy" },
    { id: "high-contrast", name: "High Contrast Cyberpunk", desc: "Pure black and bright white neon wireframe styling" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono text-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#0d1117] border border-cyan-500/60 rounded-xl shadow-[0_0_50px_rgba(0,212,255,0.2)] overflow-hidden flex flex-col h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-gray-800 text-cyan-400 font-bold tracking-wider uppercase text-sm shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM CONFIGURATION v9.0 · SENPAI NEURAL OS</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transparency Meter & Supporter Gold Aura Hub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-900 to-yellow-950/40 border-b border-white/10 shrink-0">
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SERVER COST COVERAGE (TRANSPARENCY METER)
              </span>
              <span>84% ($420 / $500 MO)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/30">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]" style={{ width: "84%" }} />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-yellow-400 font-bold text-xs uppercase bg-yellow-950/60 px-3 py-1 rounded-full border border-yellow-500/50 hover:bg-yellow-900/60 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <input
                type="checkbox"
                checked={!!localSettings.isSupporter}
                onChange={(e) => setLocalSettings({ ...localSettings, isSupporter: e.target.checked })}
                className="rounded border-yellow-500 bg-slate-900 text-yellow-500 focus:ring-yellow-400 w-3.5 h-3.5 cursor-pointer"
              />
              <span>ENABLE SUPPORTER GOLD AURA</span>
            </label>
            <a
              href="https://nowpayments.io/donation/Imxforever"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500 text-slate-950 font-extrabold text-[10px] hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_10px_#facc15]"
            >
              <span>SUPPORT PROJECT</span>
            </a>
          </div>
        </div>

        {/* Body Split layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-36 sm:w-44 bg-[#0a0c10] border-r border-gray-800 p-2 space-y-1 overflow-y-auto shrink-0 font-semibold text-[11px]">
            <button
              onClick={() => setActiveTab("provider")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "provider" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Provider</span>
            </button>
            <button
              onClick={() => setActiveTab("model")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "model" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Model</span>
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "budget" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Budget</span>
            </button>
            <button
              onClick={() => setActiveTab("behavior")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "behavior" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Behavior</span>
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "voice" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice & FX</span>
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "theme" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "prompts" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Prompts</span>
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "advanced" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Advanced</span>
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === "import" ? "bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 font-bold" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Import/Export</span>
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-gray-200 font-sans text-xs scrollbar-thin">
            {/* TAB: PROVIDER */}
            {activeTab === "provider" && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider">AI Provider</label>
                    {provConfig.setupUrl && (
                      <a
                        href={provConfig.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:text-white text-[10px] font-mono transition-all no-underline shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        title={`Get API Key from ${provConfig.label}`}
                      >
                        <span>🔑 API Key Setup Guide</span>
                        <span className="text-[9px]">↗</span>
                      </a>
                    )}
                  </div>
                  <select
                    value={localSettings.provider}
                    onChange={(e) => {
                      const newProv = e.target.value as ProviderType;
                      setLocalSettings({
                        ...localSettings,
                        provider: newProv,
                        baseUrl: PROVIDER_CONFIGS[newProv].baseUrl,
                        model: FALLBACK_MODEL_LISTS[newProv][0] || "",
                      });
                    }}
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                  >
                    <option value="gemini">Google Gemini (Server-side proxy — Out of box)</option>
                    <option value="openrouter">OpenRouter (Cloud, any model)</option>
                    <option value="groq">Groq (Ultra-fast LPU inference)</option>
                    <option value="cloudflare">Cloudflare Workers AI (Llude flare API)</option>
                    <option value="ollama">Ollama (Local LLM)</option>
                    <option value="9router">9Router (Local endpoint)</option>
                    <option value="nvidia">NVIDIA NIM (Build AI NIMs)</option>
                    <option value="antigravity">Google Antigravity (Agent API)</option>
                    <option value="deepseek">DeepSeek (DeepSeek V3 / R1 reasoning)</option>
                    <option value="zhipu">Zhipu AI / GLM-4 (BigModel)</option>
                    <option value="claude">Claude Web AI (claude.ai)</option>
                    <option value="codex">ChatGPT Codex / Copilot</option>
                    <option value="hermes">Hermes Agent (Nous Research)</option>
                    <option value="cursor">Cursor AI (Shadow Workspace API)</option>
                    <option value="xai">xAI Grok (Grok 3 / Grok Beta)</option>
                    <option value="gemini-cli">Gemini CLI (Local Terminal Bridge)</option>
                    <option value="anthropic">Anthropic API (Claude 3.5 / 3.7 Sonnet)</option>
                    <option value="moonshot">Moonshot AI / Kimi (Long-Context)</option>
                    <option value="mistral">Mistral AI (Mistral Large / Codestral)</option>
                    <option value="openai">OpenAI API (GPT-4o / o1 / o3-mini)</option>
                    <option value="lmstudio">LM Studio (Local, OpenAI-compatible)</option>
                    <option value="custom">Custom OpenAI-compatible endpoint</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1 font-mono leading-relaxed">{provConfig.hint}</p>
                </div>

                {provConfig.needsKey && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        API Key {localSettings.provider === "gemini" && <span className="text-gray-400 font-normal lowercase">(optional override for Google Gemini)</span>}
                      </label>
                      {provConfig.setupUrl && (
                        <a
                          href={provConfig.setupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 underline decoration-dotted font-mono"
                        >
                          Get Key ({provConfig.setupUrl.replace(/^https?:\/\//, '').split('/')[0]}) ↗
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={localSettings.apiKey}
                        onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                        placeholder={localSettings.provider === "gemini" ? "Optional override (uses server secret by default)..." : "Paste your API key here..."}
                        className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 pr-16 text-white font-mono text-xs outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-gray-300 hover:text-white rounded text-[10px] font-mono font-bold"
                      >
                        {showKey ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">
                      Stored in local IndexedDB / LocalStorage using AES-GCM encryption via Web Crypto API. Never sent except directly to your provider!
                    </p>
                  </div>
                )}

                {localSettings.provider !== "gemini" && (
                  <div>
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Server Endpoint URL</label>
                    <input
                      type="text"
                      value={localSettings.baseUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                      placeholder="e.g. http://localhost:11434"
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                    {localSettings.provider === "cloudflare" && (
                      <p className="text-[10px] text-amber-400 mt-1 font-mono">
                        Important: Replace YOUR_ACCOUNT_ID in the URL above with your actual Cloudflare Account ID (from your Cloudflare dashboard).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MODEL */}
            {activeTab === "model" && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Active Neural Model</label>
                  <div className="flex gap-2">
                    <select
                      value={localSettings.model}
                      onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                      className="flex-1 bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400 truncate"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      {!availableModels.includes(localSettings.model) && localSettings.model && (
                        <option value={localSettings.model}>{localSettings.model} (custom)</option>
                      )}
                    </select>
                    {onFetchModels && (
                      <button
                        type="button"
                        onClick={onFetchModels}
                        disabled={isFetchingModels}
                        className="px-3 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-300 rounded-lg font-mono font-bold hover:bg-cyan-500/30 transition-colors shrink-0"
                      >
                        {isFetchingModels ? "↺ Fetching..." : "↻ Fetch"}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Or enter any model ID manually</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      placeholder="e.g. llama3.3:70b, qwen2.5-coder:32b, gpt-4o..."
                      className="flex-1 bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomModel}
                      disabled={!customModelInput.trim()}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg font-mono font-bold hover:bg-gray-700 disabled:opacity-50"
                    >
                      Use This
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Works with any model string your provider accepts.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">Input $ / 1M Tokens</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localSettings.priceIn}
                      onChange={(e) => setLocalSettings({ ...localSettings, priceIn: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">Output $ / 1M Tokens</label>
                    <input
                      type="number"
                      step="0.01"
                      value={localSettings.priceOut}
                      onChange={(e) => setLocalSettings({ ...localSettings, priceOut: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BUDGET */}
            {activeTab === "budget" && (
              <div className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Session Token Budget</label>
                    <input
                      type="number"
                      step="1000"
                      value={localSettings.tokenBudget}
                      onChange={(e) => setLocalSettings({ ...localSettings, tokenBudget: parseInt(e.target.value) || 128000 })}
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Context Window (Max)</label>
                    <input
                      type="number"
                      step="1000"
                      value={localSettings.contextWindow}
                      onChange={(e) => setLocalSettings({ ...localSettings, contextWindow: parseInt(e.target.value) || 128000 })}
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Sliding Window (Max messages in context)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={localSettings.slidingWindow}
                    onChange={(e) => setLocalSettings({ ...localSettings, slidingWindow: parseInt(e.target.value) || 20 })}
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Limits the number of past messages sent to the model to conserve tokens.</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="estTokens"
                    checked={localSettings.estimateTokens}
                    onChange={(e) => setLocalSettings({ ...localSettings, estimateTokens: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="estTokens" className="text-gray-300 font-mono text-xs cursor-pointer">
                    Estimate tokens client-side when provider doesn&apos;t return exact token usage
                  </label>
                </div>
              </div>
            )}

            {/* TAB: BEHAVIOR */}
            {activeTab === "behavior" && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">System Prompt</label>
                  <textarea
                    rows={5}
                    value={localSettings.systemPrompt}
                    onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-cyan-400 leading-relaxed resize-y"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono font-bold text-cyan-400 uppercase tracking-wider">Temperature</label>
                    <span className="font-mono text-cyan-300 font-bold">{localSettings.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={localSettings.temperature}
                    onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-0.5">
                    <span>0.0 (Precise / Deterministic)</span>
                    <span>1.0 (Balanced)</span>
                    <span>2.0 (Creative / Wild)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Max Output Tokens</label>
                  <input
                    type="number"
                    step="256"
                    value={localSettings.maxTokens}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) || 4096 })}
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* TAB: VOICE & FX */}
            {activeTab === "voice" && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Voice & Speech Language</label>
                  <select
                    value={localSettings.voiceLang}
                    onChange={(e) => setLocalSettings({ ...localSettings, voiceLang: e.target.value })}
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="fa-IR">فارسی (Persian)</option>
                    <option value="ar-SA">العربية (Arabic)</option>
                    <option value="fr-FR">Français (French)</option>
                    <option value="de-DE">Deutsch (German)</option>
                    <option value="es-ES">Español (Spanish)</option>
                    <option value="ja-JP">日本語 (Japanese)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ttsToggle"
                      checked={localSettings.ttsEnabled}
                      onChange={(e) => setLocalSettings({ ...localSettings, ttsEnabled: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="ttsToggle" className="text-gray-300 font-mono text-xs cursor-pointer font-bold">
                      Enable Text-to-Speech (TTS) by default for AI replies
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fxToggle"
                      checked={localSettings.soundFxEnabled}
                      onChange={(e) => setLocalSettings({ ...localSettings, soundFxEnabled: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="fxToggle" className="text-gray-300 font-mono text-xs cursor-pointer font-bold">
                      Enable Sci-Fi Sound FX (Node spawn, pulse wave, UI clicks)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: THEME */}
            {activeTab === "theme" && (
              <div className="space-y-4 max-w-2xl">
                <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Visual UI Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themes.map((th) => (
                    <div
                      key={th.id}
                      onClick={() => setLocalSettings({ ...localSettings, theme: th.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        localSettings.theme === th.id
                          ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.2)] font-semibold"
                          : "bg-[#141820] border-gray-800 hover:border-gray-600 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-xs mb-1">
                        <span className={localSettings.theme === th.id ? "text-cyan-400" : "text-white"}>{th.name}</span>
                        {localSettings.theme === th.id && <span className="text-[10px] bg-cyan-500 text-black px-1.5 py-0.2 rounded">ACTIVE</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{th.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROMPTS */}
            {activeTab === "prompts" && (
              <div className="space-y-5 max-w-xl">
                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">Saved Prompts Library</label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {localSettings.promptLibrary.map((p, i) => (
                      <div key={i} className="p-3 bg-[#141820] border border-gray-800 rounded-lg flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-bold text-amber-300 text-xs truncate mb-1">{p.name}</div>
                          <div className="text-gray-400 text-[11px] font-sans line-clamp-2">{p.text}</div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLocalSettings({ ...localSettings, systemPrompt: p.text })}
                            className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/80 text-cyan-300 hover:bg-cyan-500/30 rounded text-[10px] font-mono font-bold"
                          >
                            Load
                          </button>
                          {localSettings.promptLibrary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeletePromptFromLibrary(i)}
                              className="px-2 py-1 bg-red-950/60 border border-red-800 text-red-400 hover:bg-red-900/60 rounded text-[10px] font-mono"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Save Current System Prompt to Library</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promptName}
                      onChange={(e) => setPromptName(e.target.value)}
                      placeholder="Give this prompt style a name..."
                      className="flex-1 bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleSavePromptToLibrary}
                      disabled={!promptName.trim() || !localSettings.systemPrompt.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-mono font-bold rounded-lg hover:brightness-110 disabled:opacity-50"
                    >
                      Save Prompt
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADVANCED */}
            {activeTab === "advanced" && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Stop Sequences (Comma separated)</label>
                  <input
                    type="text"
                    value={localSettings.stopSequences.join(", ")}
                    onChange={(e) => setLocalSettings({ ...localSettings, stopSequences: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g. 'end', 'stop', 'FINAL_ANSWER'"
                    className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Model generation halts immediately when any of these exact sequences are emitted.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Seed (Deterministic output)</label>
                    <input
                      type="number"
                      value={localSettings.seed === null ? "" : localSettings.seed}
                      onChange={(e) => setLocalSettings({ ...localSettings, seed: e.target.value !== "" ? parseInt(e.target.value) : null })}
                      placeholder="e.g. 42"
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">Response Format</label>
                    <select
                      value={localSettings.responseFormat}
                      onChange={(e) => setLocalSettings({ ...localSettings, responseFormat: e.target.value })}
                      className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs outline-none focus:border-cyan-400"
                    >
                      <option value="">Default (Markdown / Prose)</option>
                      <option value="json_object">JSON Object (Strict JSON)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <label className="block font-mono font-bold text-amber-400 uppercase tracking-wider text-xs">CONSOLIDATED ENGINE & UI CONTROLS</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">3D Cortex Quality</label>
                      <select
                        value={localSettings.renderQuality || "ultra"}
                        onChange={(e) => setLocalSettings({ ...localSettings, renderQuality: e.target.value as any })}
                        className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2 text-white font-mono text-xs outline-none focus:border-cyan-400"
                      >
                        <option value="low">Low (60 FPS Mobile/TV)</option>
                        <option value="medium">Medium (Standard)</option>
                        <option value="high">High (High-Res Rings)</option>
                        <option value="ultra">Ultra (Full Particles + Bloom)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">UI Density & Grid Reflow</label>
                      <select
                        value={localSettings.uiDensity || "normal"}
                        onChange={(e) => setLocalSettings({ ...localSettings, uiDensity: e.target.value as any })}
                        className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2 text-white font-mono text-xs outline-none focus:border-cyan-400"
                      >
                        <option value="compact">Compact (High Information Density)</option>
                        <option value="normal">Normal (Balanced Responsive)</option>
                        <option value="spacious">Spacious (TV / Touchscreen UI)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">Network Timeout (ms)</label>
                      <input
                        type="number"
                        step="1000"
                        value={localSettings.networkTimeout || 30000}
                        onChange={(e) => setLocalSettings({ ...localSettings, networkTimeout: parseInt(e.target.value) || 30000 })}
                        className="w-full bg-[#050608] border border-gray-700 rounded-lg p-2 text-white font-mono text-xs outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={onResetFactory}
                    className="w-full py-3 bg-red-950/80 border border-red-600 text-red-300 font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-red-900 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    ⚠ Factory Reset All Settings & Memory
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center font-mono">
                    Resets API keys, prompts, token counters, and 3D cortex nodes to original factory state.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: IMPORT/EXPORT */}
            {activeTab === "import" && (
              <div className="space-y-6 max-w-xl">
                <div className="p-4 bg-[#141820] border border-gray-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold uppercase tracking-wider text-sm">
                    <Download className="w-4 h-4" />
                    <span>Export Neural Profile</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans">
                    Export your entire SenPai configuration, provider endpoints, saved prompts library, custom models, and token budget into a clean JSON profile.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportProfile}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-mono font-bold uppercase tracking-wider rounded-lg hover:brightness-110 shadow-[0_0_15px_rgba(255,179,71,0.3)] mt-2"
                  >
                    Export Profile as JSON
                  </button>
                </div>

                <div className="p-4 bg-[#141820] border border-gray-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold uppercase tracking-wider text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Import Neural Profile</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed font-sans">
                    Import a previously saved `.json` configuration file to immediately restore your endpoints and system prompts.
                  </p>
                  <label className="w-full py-2.5 bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer mt-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Select Profile File (.json)</span>
                    <input type="file" accept=".json" onChange={handleImportProfile} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-[#161b22] border-t border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-mono font-bold transition-colors"
          >
            [ CANCEL ]
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-mono font-extrabold tracking-wider rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
          >
            [ SAVE CONFIG ]
          </button>
        </div>
      </div>
    </div>
  );
};
