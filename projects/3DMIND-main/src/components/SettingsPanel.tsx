// File: src/components/SettingsPanel.tsx

import React, { useState } from 'react';
import { Settings, Eye, EyeOff, ShieldAlert, Cpu } from 'lucide-react';

interface SettingsPanelProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  tokenLimit: number;
  setTokenLimit: (limit: number) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export default function SettingsPanel({
  apiKey,
  setApiKey,
  tokenLimit,
  setTokenLimit,
  selectedModel,
  setSelectedModel
}: SettingsPanelProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-col bg-[#08080E] border border-white/10 rounded h-full overflow-hidden">
      <div className="panel-header text-white/70 select-none shrink-0">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Settings className="w-3.5 h-3.5 text-blue-400" />
          <span>Cosmic Calibration</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-3 scrollbar-thin">
        {/* Model Selector */}
        <div className="flex flex-col gap-1">
          <label className="stat-label flex items-center gap-1">
            <Cpu className="w-3 h-3 text-white/40" /> API Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#0088FF] font-mono transition-colors"
          >
            <option value="deepseek-v4-flash">DeepSeek V4 Flash</option>
            <option value="deepseek-v4-pro">DeepSeek V4 Pro (Reasoner)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash Fallback</option>
          </select>
        </div>

        {/* Token Ceiling limit selector */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center stat-label">
            <span>Token Safety Limit</span>
            <span className="text-red-400 font-bold font-mono text-[10px]">{tokenLimit}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={tokenLimit}
            onChange={(e) => setTokenLimit(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-[#0088FF]"
          />
          <span className="text-[8px] text-white/45 font-mono text-right italic select-none">
            Max threshold before SL lock
          </span>
        </div>

        {/* API Credentials */}
        <div className="flex flex-col gap-1">
          <label className="stat-label">
            DeepSeek API Key
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Using Server Key Fallback"
              className="w-full bg-white/5 border border-white/10 rounded pl-2.5 pr-8 py-1 text-[11px] text-white focus:outline-none focus:border-[#0088FF] font-mono transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 text-white/40 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[8px] text-white/45 leading-tight select-none">
            If left blank, the system automatically uses the pre-authorized server keys.
          </p>
        </div>

        {/* Key Security Notice */}
        <div className="flex items-start gap-1.5 bg-blue-950/25 border border-blue-900/35 p-2 rounded">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span className="text-[9px] text-white/60 leading-normal font-sans select-none">
            Your key remains encrypted. Requests are secure and routed server-side to prevent client leaks.
          </span>
        </div>
      </div>
    </div>
  );
}
