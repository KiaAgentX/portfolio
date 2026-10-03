import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Terminal,
  FileText,
  Database,
  Copy,
  Check,
  RotateCcw,
  Wand2,
  Plus,
  Trash2,
  Clock,
  ChevronRight,
  RefreshCw,
  Layers,
  Table,
  FileJson,
  User,
  Coffee,
  FileDown,
  Sliders
} from 'lucide-react';

interface SchemaField {
  name: string;
  type: string;
  description: string;
}

interface SavedGeneration {
  id: string;
  timestamp: string;
  type: 'prompt' | 'story' | 'json';
  title: string;
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'story' | 'json'>('prompt');
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  // ----------------------------------------------------
  // Tab 1: SECURE PROMPT LAB PLAYGROUND STATE
  // ----------------------------------------------------
  const [systemInstruction, setSystemInstruction] = useState(
    "You are a helpful Socratic AI assistant. Encourage users to think deeply while providing structured, logical, and highly accurate answers with clean formatting."
  );
  const [promptInput, setPromptInput] = useState("Explain the quantum observer effect using a simple physical metaphor.");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [promptLabResult, setPromptLabResult] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptStats, setPromptStats] = useState<{ durationMs: number; wordCount: number } | null>(null);

  const promptPresets = [
    {
      label: "Quantum Metaphor",
      prompt: "Explain the quantum observer effect using a simple physical metaphor.",
      sys: "You are an expert science communicator who uses clean everyday analogies to explain complex physics."
    },
    {
      label: "SQL Optimizer",
      prompt: "Given an e-commerce database with products, users, and orders tables, optimize a slow subquery that fetches the total spent per category for accounts created inside the last 30 days.",
      sys: "You are a senior database administrator specializing in clean PostgreSQL performance optimization."
    },
    {
      label: "Socratic Logic",
      prompt: "Can a machine ever achieve true consciousness, or is it merely simulating comprehension?",
      sys: "You are a philosophy tutor. Answer using the Socratic method, prompting the user with thought-provoking questions."
    }
  ];

  // ----------------------------------------------------
  // Tab 2: COLLABORATIVE STORY WORKBENCH STATE
  // ----------------------------------------------------
  const [storyContent, setStoryContent] = useState(
    `# The Chronology Keepers\n\nThe pocket watch didn't tick in seconds; it ticked in decades. Mark found it buried beneath the attic floorboards of his late grandfather's watchmaker shop.\n\nWhen he wound it for the first time, the dust on the floorboards didn't just drift—it drifted *backward*, settling perfectly into the corners of the room. The air smelled of old wood, sulfur, and an impossible fresh morning from 1950...\n\n`
  );
  const [customCoWriterPrompt, setCustomCoWriterPrompt] = useState("");
  const [selectedWordCount, setSelectedWordCount] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [coWriterResponse, setCoWriterResponse] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [tonePreset, setTonePreset] = useState("Astral Cosmic Fantasy");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // ----------------------------------------------------
  // Tab 3: JSON STRUCTURED FACTORY STATE
  // ----------------------------------------------------
  const [jsonInstruction, setJsonInstruction] = useState("Generate 5 fantasy RPG characters with diverse skills.");
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([
    { name: "character_name", type: "STRING", description: "Unique name of the adventurer" },
    { name: "class_archetype", type: "STRING", description: "RPG role (e.g. Mage, Rogue, Paladin)" },
    { name: "level_rating", type: "INTEGER", description: "integer power rating from 1 to 50" },
    { name: "active_skill", type: "STRING", description: "Signature combat or utility skill" },
    { name: "is_legendary", type: "BOOLEAN", description: "Set to true if character profile has status" }
  ]);
  const [generatedJson, setGeneratedJson] = useState<any[]>([]);
  const [rawJsonResponse, setRawJsonResponse] = useState("");
  const [isGeneratingJson, setIsGeneratingJson] = useState(false);
  const [jsonViewMode, setJsonViewMode] = useState<'table' | 'raw'>('table');

  const jsonPresets = [
    {
      label: "Fantasy Quest Characters",
      instruction: "Generate 5 fantasy RPG characters with diverse classes.",
      fields: [
        { name: "character_name", type: "STRING", description: "Unique name of the adventurer" },
        { name: "class_archetype", type: "STRING", description: "RPG role (e.g. Mage, Rogue, Paladin)" },
        { name: "level_rating", type: "INTEGER", description: "integer power rating from 1 to 50" },
        { name: "active_skill", type: "STRING", description: "Signature combat or utility skill" },
        { name: "is_legendary", type: "BOOLEAN", description: "True if legendary" }
      ]
    },
    {
      label: "Mock SaaS Accounts",
      instruction: "Generate 4 enterprise customer account profiles with varying usage levels.",
      fields: [
        { name: "account_uuid", type: "STRING", description: "Random UUID identifier for the client" },
        { name: "company_name", type: "STRING", description: "Polished generic tech company name" },
        { name: "monthly_api_calls", type: "INTEGER", description: "Volume of metric queries (e.g., 50000)" },
        { name: "is_over_quota", type: "BOOLEAN", description: "True if account has active restriction warning" },
        { name: "tier_status", type: "STRING", description: "Account tier: Starter, Professional, or Elite" }
      ]
    },
    {
      label: "Cyber Café Inventory Items",
      instruction: "Generate 6 futuristic cyber café cafe food or hardware items.",
      fields: [
        { name: "item_id", type: "STRING", description: "Futuristic catalog identification code" },
        { name: "display_title", type: "STRING", description: "Name of the gadget or beverage" },
        { name: "nano_credits_price", type: "NUMBER", description: "Cost decimal item value" },
        { name: "out_of_stock", type: "BOOLEAN", description: "Set to true if currently unavailable" }
      ]
    }
  ];

  // History & Log Tracking
  const [generationHistory, setGenerationHistory] = useState<SavedGeneration[]>([]);

  // ----------------------------------------------------
  // UTILITY ACTIONS & TRIGGERS
  // ----------------------------------------------------
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStatus((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSelection = () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      if (start !== end) {
        const text = storyContent.substring(start, end);
        setSelectedText(text);
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setSelectedWordCount(words);
      } else {
        setSelectedText("");
        setSelectedWordCount(0);
      }
    }
  };

  const addSchemaField = () => {
    setSchemaFields([...schemaFields, { name: "new_field", type: "STRING", description: "" }]);
  };

  const removeSchemaField = (index: number) => {
    const updated = [...schemaFields];
    updated.splice(index, 1);
    setSchemaFields(updated);
  };

  const updateSchemaField = (index: number, key: keyof SchemaField, value: string) => {
    const updated = [...schemaFields];
    updated[index] = { ...updated[index], [key]: value };
    setSchemaFields(updated);
  };

  // ----------------------------------------------------
  // SERVER API CALLS
  // ----------------------------------------------------
  const executePromptLab = async () => {
    if (!promptInput.trim()) return;
    setIsGeneratingPrompt(true);
    setPromptLabResult("");
    setPromptStats(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          systemInstruction,
          temperature,
          topP
        })
      });
      const data = await response.json();
      if (data.error) {
        setPromptLabResult(`⚠️ Server Error: ${data.error}`);
      } else {
        setPromptLabResult(data.text);
        const duration = (Date.now() - startTime) / 1000;
        const words = data.text ? data.text.trim().split(/\s+/).filter(Boolean).length : 0;
        setPromptStats({ durationMs: duration, wordCount: words });

        // Add to history
        const newHistItem: SavedGeneration = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'prompt',
          title: promptInput.substring(0, 40) + "...",
          content: data.text
        };
        setGenerationHistory(prev => [newHistItem, ...prev]);
      }
    } catch (err: any) {
      setPromptLabResult(`⚠️ Failed to connect to workspace API server: ${err.message}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const executeCoWriter = async (actionType: 'continue' | 'polish' | 'tone' | 'custom') => {
    setIsGeneratingStory(true);
    setCoWriterResponse("");
    let promptText = "";

    const fullStoryContext = `Here is the current text inside the writer workspace:\n\"\"\"\n${storyContent}\n\"\"\"`;

    if (actionType === 'continue') {
      promptText = `${fullStoryContext}\n\nTask: Read carefully and write the next logical and atmospheric paragraph or two. Match the prose, pace, and stylistic cues precisely. Do not output anything other than the new paragraph text.`;
    } else if (actionType === 'polish') {
      const textToWorkOn = selectedText || storyContent;
      promptText = `Original prose:\n\"\"\"\n${textToWorkOn}\n\"\"\"\n\nTask: Polish the original prose above. Maximize atmosphere, rich vocabulary, sensory detail, and sentence pacing while respecting original meaning. Provide only the polished prose.`;
    } else if (actionType === 'tone') {
      const textToWorkOn = selectedText || storyContent;
      promptText = `Original text:\n\"\"\"\n${textToWorkOn}\n\"\"\"\n\nTask: Rewrite the text above to adopt a distinctive style with a tone resembling: "${tonePreset}". Deliver only the modified rewrite.`;
    } else if (actionType === 'custom') {
      if (!customCoWriterPrompt.trim()) return;
      const textContext = selectedText || "the entire story canvas";
      promptText = `Context story document:\n\"\"\"\n${storyContent}\n\"\"\"\n\nTask details focusing on ${textContext}: ${customCoWriterPrompt}\n\nGenerate the resulting text output following these guidelines. Deliver only the text output.`;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: `You are an elite literary editor, fantasy/sci-fi author, and writing companion. Deliver high-integrity prose with no preambles, notes, or chat tags.`
        })
      });
      const data = await response.json();
      if (data.error) {
        setCoWriterResponse(`⚠️ Error: ${data.error}`);
      } else {
        setCoWriterResponse(data.text);
      }
    } catch (err: any) {
      setCoWriterResponse(`⚠️ API Communication Error: ${err.message}`);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const executeJsonFactory = async () => {
    if (!jsonInstruction.trim()) return;
    setIsGeneratingJson(true);
    setGeneratedJson([]);
    setRawJsonResponse("");

    try {
      const response = await fetch('/api/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: jsonInstruction,
          schemaFields
        })
      });
      const data = await response.json();
      if (data.error) {
        setRawJsonResponse(JSON.stringify(data, null, 2));
        setGeneratedJson([]);
        setJsonViewMode('raw');
      } else {
        const parsed = Array.isArray(data) ? data : [data];
        setGeneratedJson(parsed);
        setRawJsonResponse(JSON.stringify(parsed, null, 2));

        // Add to history
        const newHistItem: SavedGeneration = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'json',
          title: `JSON Schema Dataset (${parsed.length} rows)`,
          content: JSON.stringify(parsed, null, 2)
        };
        setGenerationHistory(prev => [newHistItem, ...prev]);
      }
    } catch (err: any) {
      setRawJsonResponse(`⚠️ Network Error: ${err.message}`);
      setJsonViewMode('raw');
    } finally {
      setIsGeneratingJson(false);
    }
  };

  const appendToStory = (text: string) => {
    setStoryContent((prev) => prev.trim() + "\n\n" + text.trim() + "\n");
    setCoWriterResponse("");
  };

  const replaceSelectedProse = () => {
    if (!textAreaRef.current || !selectedText) return;
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const updated = storyContent.substring(0, start) + coWriterResponse.trim() + storyContent.substring(end);
    setStoryContent(updated);
    setCoWriterResponse("");
    setSelectedText("");
    setSelectedWordCount(0);
  };

  const downloadCSV = () => {
    if (generatedJson.length === 0) return;
    const headers = Object.keys(generatedJson[0]);
    const csvRows = [
      headers.join(','),
      ...generatedJson.map(row =>
        headers.map(headerName => {
          const value = row[headerName];
          const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
          const escaped = stringified.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `gemini-crafted-dataset-${Date.now()}.csv`);
    a.click();
  };

  const selectJsonPreset = (preset: typeof jsonPresets[0]) => {
    setJsonInstruction(preset.instruction);
    setSchemaFields(preset.fields);
  };

  const selectPromptPreset = (preset: typeof promptPresets[0]) => {
    setPromptInput(preset.prompt);
    setSystemInstruction(preset.sys);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased relative overflow-hidden">
      {/* FROSTED GLASS ATMOSPHERIC GLOWS */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* HEADER BAR (FROSTED GLASS) */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50 px-6 py-3.5 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-extrabold tracking-tight text-white text-base leading-none">
                CRAFT <span className="text-white/40 font-normal">STUDIO</span>
              </h1>
              <span className="bg-blue-500/10 border border-blue-400/20 text-blue-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                PROD-BLUEPRINT
              </span>
            </div>
            <p className="text-[10px] text-white/40 font-medium tracking-wide mt-0.5">Secure full-stack environment managed via Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono z-10">
          <div className="h-8 px-3 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] text-green-500 tracking-wider font-mono">SYSTEMS: NOMINAL</span>
          </div>
          <div className="text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>UTC 2026-06-12</span>
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* LEFT NAV PANEL: Glass aside */}
        <aside className="w-64 border-r border-white/10 bg-white/2 backdrop-blur-md p-4 shrink-0 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">Workspace Modes</label>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 outline-none text-left border ${
                    activeTab === 'prompt'
                      ? 'bg-white/5 border-white/10 text-white font-medium shadow-inner'
                      : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/2'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Terminal className={`w-4 h-4 ${activeTab === 'prompt' ? 'text-blue-400' : 'text-white/40'}`} />
                    <span className="text-xs">Prompt Playground</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60 text-white/50" />
                </button>

                <button
                  onClick={() => setActiveTab('story')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 outline-none text-left border ${
                    activeTab === 'story'
                      ? 'bg-white/5 border-white/10 text-white font-medium shadow-inner'
                      : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/2'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className={`w-4 h-4 ${activeTab === 'story' ? 'text-purple-400' : 'text-white/40'}`} />
                    <span className="text-xs">Story Workbench</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60 text-white/50" />
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 outline-none text-left border ${
                    activeTab === 'json'
                      ? 'bg-white/5 border-white/10 text-white font-medium shadow-inner'
                      : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/2'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Database className={`w-4 h-4 ${activeTab === 'json' ? 'text-amber-400' : 'text-white/40'}`} />
                    <span className="text-xs">JSON Schema Factory</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60 text-white/50" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">Session Specifications</label>
              <div className="bg-white/2 rounded-xl p-3 border border-white/5 space-y-2 text-[11px] font-mono text-white/50">
                <div className="flex justify-between">
                  <span>Target Model</span>
                  <span className="text-white">gemini-3.5-flash</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing</span>
                  <span className="text-blue-400">Server API Proxy</span>
                </div>
                <div className="flex justify-between">
                  <span>BYOK Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER ASIDE STATS (Enterprise Box matching template style) */}
          <div className="p-4 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-2xl">
            <div className="flex items-center space-x-2 text-indigo-300">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspace Profile</span>
            </div>
            <div className="space-y-1 text-white/40 text-[10px] truncate leading-normal">
              <p className="text-white/80 font-medium">kiamadmax2027@gmail.com</p>
              <p>Studio Tier: Basic Unlimited</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
              <div className="w-[82%] h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
          </div>
        </aside>

        {/* CONTAINER WORKPLACE: Main Workspace with target tabs */}
        <main className="flex-1 overflow-y-auto bg-black/20 p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
          
          {/* MOBILE NAVIGATION FOR WORKSPACE MODES (Glass capsules) */}
          <div className="md:hidden flex space-x-1 bg-black/45 p-1 rounded-full border border-white/5">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full text-xs outline-none font-medium transition-all ${
                activeTab === 'prompt' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Prompt</span>
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full text-xs outline-none font-medium transition-all ${
                activeTab === 'story' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Story</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full text-xs outline-none font-medium transition-all ${
                activeTab === 'json' ? 'bg-white/10 text-white shadow-inner' : 'text-white/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Structured</span>
            </button>
          </div>

          {/* ----------------------------------------------------
              WORKPLACE TAB 1: PROMPT PLAYGROUND
              ---------------------------------------------------- */}
          {activeTab === 'prompt' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full">
              {/* INTRO BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2.5 tracking-tight">
                    <Terminal className="text-blue-400 w-5 h-5" />
                    <span>Prompt Engineer Lab</span>
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">Test system rules, tweak parameters, and stream text directly from the server.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-white/30 uppercase tracking-widest text-[9px]">Select Presets:</span>
                  <div className="flex gap-1">
                    {promptPresets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => selectPromptPreset(preset)}
                        className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] px-3 py-1.5 rounded-full border border-white/5 transition-all font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONTROLS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CONFIGURATION COLUMN */}
                <div className="lg:col-span-1 space-y-5 bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Model Parameters</span>
                  </div>

                  {/* Temperature slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/50">Temperature</span>
                      <span className="text-blue-400 font-bold">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 italic px-0.5">
                      <span>Strict & Logical</span>
                      <span>Balanced</span>
                      <span>Creative / Random</span>
                    </div>
                  </div>

                  {/* Top P slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/50">Top P</span>
                      <span className="text-blue-400 font-bold">{topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-full cursor-pointer"
                    />
                    <div className="text-[10px] text-white/30 font-mono">
                      Reduces tail probability of sample words.
                    </div>
                  </div>

                  {/* System instruction textarea */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white/80 block">System Instruction (Behavior Override)</span>
                    <textarea
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      rows={5}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-sans leading-relaxed resize-none transition-all placeholder:text-white/20"
                      placeholder="Instruct the AI model on how it should act and respond..."
                    />
                  </div>
                </div>

                {/* WRITING LAB CANVAS */}
                <div className="lg:col-span-2 space-y-4 flex flex-col">
                  {/* PROMPT BOX */}
                  <div className="bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Prompt Payload</span>
                      <button
                        onClick={() => setPromptInput("")}
                        className="text-white/40 hover:text-white/80 text-[11px] flex items-center space-x-1 transition-colors outline-none font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Workspace</span>
                      </button>
                    </div>

                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder:text-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed resize-none transition-all"
                      placeholder="Prompt goes here..."
                      id="promptInputText"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={executePromptLab}
                        disabled={isGeneratingPrompt || !promptInput.trim()}
                        className="bg-gradient-to-br from-blue-500 to-indigo-700 hover:brightness-110 active:scale-95 disabled:bg-white/5 disabled:hover:brightness-100 disabled:text-white/25 text-white font-medium text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer select-none shadow-lg shadow-blue-500/20"
                        id="generatePromptBtn"
                      >
                        {isGeneratingPrompt ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Crafting Responses...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Materialize Thoughts</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* GENERATIVE RESULT CANVASES */}
                  <div className="flex-1 bg-white/2 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 rounded-t-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Laid Canvas Response</span>
                      </div>
                      {promptLabResult && (
                        <button
                          onClick={() => handleCopy(promptLabResult, 'promptResult')}
                          className="text-white/60 hover:text-white hover:bg-white/10 border border-white/10 p-1.5 rounded-lg transition-all outline-none"
                          title="Copy To Clipboard"
                        >
                          {copyStatus['promptResult'] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto text-sm leading-relaxed max-h-[400px] font-sans">
                      {isGeneratingPrompt ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                          <p className="text-xs text-white/40 italic">Consulting Gemini's neural matrix networks...</p>
                        </div>
                      ) : promptLabResult ? (
                        <div className="whitespace-pre-wrap text-slate-200 select-text bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed font-sans">
                          {promptLabResult}
                        </div>
                      ) : (
                        <div className="text-white/30 flex flex-col items-center justify-center h-full py-16 space-y-2 italic text-xs">
                          <Terminal className="w-8 h-8 text-white/20 stroke-1" />
                          <span>Input a prompt payload above and click Materialize.</span>
                        </div>
                      )}
                    </div>

                    {promptStats && !isGeneratingPrompt && (
                      <div className="border-t border-white/10 bg-black/40 px-5 py-2 flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Latency: <strong className="text-blue-400">{promptStats.durationMs.toFixed(2)}s</strong></span>
                        <span>Generated Tokens (est): <strong className="text-blue-500">~{Math.round(promptStats.wordCount * 1.3)}</strong></span>
                        <span>Length: <strong className="text-blue-400">{promptStats.wordCount} words</strong></span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              WORKPLACE TAB 2: STORY WORKBENCH
              ---------------------------------------------------- */}
          {activeTab === 'story' && (
            <div className="space-y-6 max-w-6xl mx-auto w-full">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2.5 tracking-tight">
                  <FileText className="text-purple-400 w-5 h-5" />
                  <span>Story Editing Workshop</span>
                </h2>
                <p className="text-white/40 text-xs mt-0.5">Collaboratively extend prose. Highlight segments, apply atmosphere tuners, or add tailored editor notes.</p>
              </div>

              {/* CO-WRITING GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* INTERACTIVE WORKSPACE NOTEBOOK */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex flex-col space-y-3 min-h-[500px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Active Prose Canvas</span>
                    </div>
                    <div className="text-[10px] text-white/50 font-mono bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                      Words: {storyContent.split(/\s+/).filter(Boolean).length}
                    </div>
                  </div>

                  <textarea
                    ref={textAreaRef}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    onSelect={handleSelection}
                    className="flex-1 w-full bg-transparent text-slate-200 text-sm font-sans focus:outline-none leading-relaxed p-2.5 resize-none min-h-[380px] placeholder:text-white/20"
                    placeholder="Create your literary piece here..."
                    id="storyTextArea"
                  />

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                    <div>
                      {selectedWordCount > 0 ? (
                        <span className="text-purple-400 bg-purple-500/10 border border-purple-400/20 px-2.5 py-1 rounded-lg">
                          Highlighted: <strong>{selectedWordCount} words</strong>
                        </span>
                      ) : (
                        <span className="italic">Highlight words inside the notebook to perform precision editor updates</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(storyContent, 'storyCopy')}
                      className="text-white/60 hover:text-white hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all outline-none text-xs flex items-center space-x-1 font-semibold"
                    >
                      {copyStatus['storyCopy'] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Document</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Document</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI CO-WRITER CONTROLS PANEL */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col space-y-4">
                  {/* CENTRAL DIRECT ACTIONS */}
                  <div className="bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Editing Toolkit</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => executeCoWriter('continue')}
                        disabled={isGeneratingStory}
                        className="py-2.5 bg-black/40 border border-white/10 hover:border-purple-500 text-xs font-medium text-slate-300 rounded-xl hover:text-white transition-all cursor-pointer text-left px-3.5 flex flex-col space-y-1 group"
                      >
                        <span className="text-purple-400 font-bold group-hover:text-purple-300">Prose Continuation</span>
                        <span className="text-[10px] text-white/45">Write the next paragraphs</span>
                      </button>

                      <button
                        onClick={() => executeCoWriter('polish')}
                        disabled={isGeneratingStory}
                        className="py-2.5 bg-black/40 border border-white/10 hover:border-purple-500 text-xs font-medium text-slate-300 rounded-xl hover:text-white transition-all cursor-pointer text-left px-3.5 flex flex-col space-y-1 group"
                      >
                        <span className="text-purple-400 font-bold group-hover:text-purple-300">Atmospheric Polish</span>
                        <span className="text-[10px] text-white/45">Improve flow & vocab</span>
                      </button>
                    </div>

                    {/* Tone controls */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-white/80 block">Atmosphere Adaptation (Tone Override)</label>
                      <div className="flex gap-2">
                        <select
                          value={tonePreset}
                          onChange={(e) => setTonePreset(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                        >
                          <option value="Gritty Retro Noir">Gritty Retro Noir</option>
                          <option value="Astral Cosmic Fantasy">Astral Cosmic Fantasy</option>
                          <option value="Cybernetic Tech Dystopian">Cybernetic Tech Dystopian</option>
                          <option value="Simplified Minimalist">Simplified Minimalist</option>
                        </select>
                        <button
                          onClick={() => executeCoWriter('tone')}
                          disabled={isGeneratingStory}
                          className="bg-purple-600 hover:bg-purple-500 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 disabled:bg-white/5 text-white text-xs font-semibold px-4.5 py-1 rounded-xl transition-all cursor-pointer flex items-center shadow-lg shadow-purple-600/20"
                        >
                          Shift Tone
                        </button>
                      </div>
                    </div>

                    {/* Custom prompt writer directives */}
                    <div className="space-y-2 pt-2 leading-none">
                      <span className="text-xs font-semibold text-white/80 block">Custom Directive to Co-Writer</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCoWriterPrompt}
                          onChange={(e) => setCustomCoWriterPrompt(e.target.value)}
                          placeholder="Introduce a sudden mechanical clink down the alleyway..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                        />
                        <button
                          onClick={() => executeCoWriter('custom')}
                          disabled={isGeneratingStory || !customCoWriterPrompt.trim()}
                          className="bg-white/10 hover:bg-white/15 hover:text-white text-slate-200 text-xs font-semibold px-4 py-1 rounded-xl transition-all cursor-pointer flex items-center border border-white/5"
                        >
                          Direct Action
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PROSE SUGGESTION DISPLAY */}
                  <div className="flex-1 bg-white/2 border border-white/10 backdrop-blur-md rounded-2xl flex flex-col min-h-[180px]">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 rounded-t-2xl">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-wider">AI Editor Suggestion Display</span>
                      {coWriterResponse && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => appendToStory(coWriterResponse)}
                            className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide cursor-pointer transition-colors"
                          >
                            Append Standard
                          </button>
                          {selectedText && (
                            <button
                              onClick={replaceSelectedProse}
                              className="bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-400 font-semibold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wide cursor-pointer transition-colors"
                            >
                              Replace Highlight
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-5 font-sans leading-relaxed text-sm overflow-y-auto max-h-[220px]">
                      {isGeneratingStory ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                          <p className="text-xs text-white/40 italic">Formulating suggestions...</p>
                        </div>
                      ) : coWriterResponse ? (
                        <div className="text-slate-200 bg-black/25 italic p-3 px-4 rounded-xl border border-white/5 shadow-inner">
                          "{coWriterResponse}"
                        </div>
                      ) : (
                        <div className="text-white/20 flex flex-col items-center justify-center h-full py-12 space-y-2 italic text-xs text-center">
                          <FileText className="w-8 h-8 text-white/10 stroke-1" />
                          <span>Prose suggestions will appear here. Choose a tool above.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              WORKPLACE TAB 3: JSON DATA FACTORY
              ---------------------------------------------------- */}
          {activeTab === 'json' && (
            <div className="space-y-6 max-w-6xl mx-auto w-full">
              {/* INTRO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2.5 tracking-tight">
                    <Database className="text-amber-400 w-5 h-5" />
                    <span>Structured JSON Factory</span>
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">Instantly compile complex relational datasets or mock rows that perfectly match your declared schemas.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-white/30 uppercase tracking-widest text-[9px]">Load Preset Fields:</span>
                  <div className="flex space-x-1">
                    {jsonPresets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => selectJsonPreset(preset)}
                        className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] px-2.5 py-1 rounded-lg border border-white/5 transition-all font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FACTORY CONTAINER GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* COLUMN 1: SCHEMA BUILDER TABLE */}
                <div className="lg:col-span-12 xl:col-span-5 bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex flex-col space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Configure Schema Fields</span>
                    </div>
                    <button
                      onClick={addSchemaField}
                      className="bg-white/10 hover:bg-white/15 text-white/90 border border-white/5 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow-inner"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Property</span>
                    </button>
                  </div>

                  {/* Schema fields form lists */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                    {schemaFields.map((field, index) => (
                      <div key={index} className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2 relative group-item">
                        <div className="flex items-center gap-2 pr-6">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateSchemaField(index, 'name', e.target.value)}
                            placeholder="property_name"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-xs text-amber-300 font-mono outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateSchemaField(index, 'type', e.target.value)}
                            className="w-1/2 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-slate-300 outline-none focus:border-amber-400"
                          >
                            <option value="STRING">STRING</option>
                            <option value="NUMBER">NUMBER (Decimal)</option>
                            <option value="INTEGER">INTEGER</option>
                            <option value="BOOLEAN">BOOLEAN (Flag)</option>
                          </select>
                        </div>

                        <input
                          type="text"
                          value={field.description}
                          onChange={(e) => updateSchemaField(index, 'description', e.target.value)}
                          placeholder="Short field description or guidelines for values"
                          className="w-full bg-white/3 border border-white/5 rounded-md px-2.5 py-1 text-[11px] text-slate-300 outline-none focus:border-amber-400 placeholder:text-white/20"
                        />

                        {schemaFields.length > 1 && (
                          <button
                            onClick={() => removeSchemaField(index)}
                            className="absolute top-2 right-2 text-white/30 hover:text-red-400 transition-colors p-1"
                            title="Remove Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Datasets constraint instruction */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wide block">Data Constraints & Criteria</label>
                    <textarea
                      value={jsonInstruction}
                      onChange={(e) => setJsonInstruction(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-sans leading-relaxed resize-none transition-all placeholder:text-white/20"
                      placeholder="Instruct details (e.g. Generate 5 items with active stats, medieval names)"
                    />
                  </div>

                  <button
                    onClick={executeJsonFactory}
                    disabled={isGeneratingJson || schemaFields.length === 0}
                    className="w-full bg-gradient-to-br from-blue-500 to-indigo-700 hover:brightness-110 active:scale-95 disabled:bg-white/5 disabled:hover:scale-100 disabled:text-white/20 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                    id="generateJsonBtn"
                  >
                    {isGeneratingJson ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin py-1" />
                        <span>Generating Compliant Dataset...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 py-1" />
                        <span>Compile & Materialize Dataset</span>
                      </>
                    )}
                  </button>
                </div>

                {/* COLUMN 2: RESULT DISPLAYER AND TABLE */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white/2 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex flex-col space-y-4 min-h-[500px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setJsonViewMode('table')}
                        disabled={generatedJson.length === 0}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all outline-none flex items-center space-x-1.5 font-medium ${
                          jsonViewMode === 'table' && generatedJson.length > 0
                            ? 'bg-white/10 text-white border border-white/5 shadow-inner'
                            : 'text-white/40 hover:text-white disabled:opacity-40'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5 text-amber-405" />
                        <span>Reactive Table</span>
                      </button>
                      <button
                        onClick={() => setJsonViewMode('raw')}
                        disabled={!rawJsonResponse}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all outline-none flex items-center space-x-1.5 font-medium ${
                          jsonViewMode === 'raw'
                            ? 'bg-white/10 text-white border border-white/5 shadow-inner'
                            : 'text-white/40 hover:text-white disabled:opacity-40'
                        }`}
                      >
                        <FileJson className="w-3.5 h-3.5 text-amber-405" />
                        <span>Raw JSON Specification</span>
                      </button>
                    </div>

                    {generatedJson.length > 0 && (
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadCSV}
                          className="text-slate-205 hover:text-white border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 hover:bg-white/5"
                        >
                          <FileDown className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Export CSV</span>
                        </button>
                        <button
                          onClick={() => handleCopy(rawJsonResponse, 'jsonCopy')}
                          className="text-slate-205 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center hover:bg-white/5"
                          title="Copy Full JSON Array"
                        >
                          {copyStatus['jsonCopy'] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DISPLAY SHEET CONTENT */}
                  <div className="flex-1 overflow-auto max-h-[380px] rounded-xl border border-white/10 bg-black/40">
                    {isGeneratingJson ? (
                      <div className="flex flex-col items-center justify-center h-full py-24 space-y-3">
                        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                        <p className="text-xs text-white/40 italic">Formatting array to requested properties...</p>
                      </div>
                    ) : generatedJson.length > 0 ? (
                      jsonViewMode === 'table' ? (
                        <table className="w-full text-left text-xs text-slate-200 border-collapse">
                          <thead className="bg-white/5 text-white/60 uppercase text-[9px] tracking-wider sticky top-0 backdrop-blur-md">
                            <tr>
                              {Object.keys(generatedJson[0]).map((col) => (
                                <th key={col} className="p-3 border-b border-white/10 font-semibold">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {generatedJson.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                {Object.values(row).map((val: any, cellIdx) => (
                                  <td key={cellIdx} className="p-3 text-slate-300">
                                    {typeof val === 'boolean' ? (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-400/20'}`}>
                                        {val ? 'TRUE' : 'FALSE'}
                                      </span>
                                    ) : typeof val === 'object' ? (
                                      JSON.stringify(val)
                                    ) : (
                                      <span className={typeof val === 'number' ? 'font-mono text-amber-400' : 'font-sans'}>
                                        {val}
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <pre className="p-4 font-mono text-[11px] leading-relaxed text-amber-100 overflow-x-auto whitespace-pre select-text bg-black/40">
                          {rawJsonResponse}
                        </pre>
                      )
                    ) : (
                      <div className="text-white/20 flex flex-col items-center justify-center h-full py-28 space-y-2 italic text-xs text-center">
                        <Database className="w-10 h-10 text-white/10 stroke-1" />
                        <span>No schema synthesized. Declare fields and materialize above.</span>
                      </div>
                    )}
                  </div>

                  {generatedJson.length > 0 && !isGeneratingJson && (
                    <div className="text-[10px] font-mono text-white/40 flex justify-between px-1">
                      <span>Total Synthesized Count: <strong className="text-amber-400">{generatedJson.length} Rows</strong></span>
                      <span>Target: <strong className="text-amber-400">REST Schema-Compliant Mock JSON</strong></span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* GENERATION PERSISTENCE MINI-HISTORY (Saves screen space & adds high credibility) */}
          {generationHistory.length > 0 && (
            <div className="max-w-5xl mx-auto w-full pt-4 border-t border-white/10 space-y-3">
              <span className="text-[10px] font-bold text-white/30 tracking-wider uppercase flex items-center space-x-1.5">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>Local Session History Logs</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {generationHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white/2 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all text-xs flex justify-between items-start font-sans">
                    <div className="space-y-1 truncate pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'prompt' ? 'bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.6)]' : item.type === 'story' ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'}`} />
                        <span className="font-semibold text-white/80 truncate font-mono text-[11px]">{item.title}</span>
                      </div>
                      <p className="text-[9px] text-white/30 font-mono">Completed space at {item.timestamp}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="text-white/40 hover:text-white transition-colors shrink-0 p-1"
                      title="Quick Copy Result"
                    >
                      {copyStatus[item.id] ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER BAR (FROSTED GLASS) */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-[10px] shrink-0 font-sans">
        <div className="flex items-center space-x-1.5">
          <Coffee className="w-3.5 h-3.5 text-blue-400" />
          <span>Full-stack sandbox compiled safely behind Cloud Run.</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-white/60 transition-colors">Workspace Documentation</a>
          <span className="text-white/10">|</span>
          <a href="#" className="hover:text-white/60 transition-colors">Gemini Developer SDK Reference</a>
        </div>
      </footer>
    </div>
  );
}
