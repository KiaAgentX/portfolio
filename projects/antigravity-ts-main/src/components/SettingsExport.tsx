import React, { useState } from 'react';
import { 
  Sliders, 
  Download, 
  Terminal, 
  Database, 
  Copy, 
  Check, 
  Globe, 
  TrendingUp, 
  ShieldAlert, 
  CloudUpload,
  Cpu
} from 'lucide-react';
import { SimulationMode, SimulationVariables } from '../types';

interface SettingsExportProps {
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  variables: SimulationVariables;
  powerOnline: boolean;
  quantumNetworkConnected: boolean;
}

export default function SettingsExport({
  simulationMode,
  setSimulationMode,
  variables,
  powerOnline,
  quantumNetworkConnected,
}: SettingsExportProps) {
  const [jsonCopied, setJsonCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Pack variables into a JSON deployment string
  const getJsonExport = () => {
    const config = {
      platformId: 'APEX-ANTIGRAV-RESEARCH-V2',
      timestamp: new Date().toISOString(),
      activeVariables: { ...variables },
      environmentStatus: {
        powerOnline,
        quantumNetworkConnected,
        selectedMode: simulationMode
      },
      gravityAnomalyAdjustmentCoefficient: 0.99823
    };
    return JSON.stringify(config, null, 2);
  };

  // Automated bash container launcher script
  const getCloudScriptExport = () => {
    return `#!/bin/bash
# ==============================================================================
# APEX QUANTUM CONTAINER LAUNCHER - CLOUD SIMULATION DEPLOYMENT
# SYSTEM ENVIRONMENT PROFILE: ${simulationMode.toUpperCase()}
# ==============================================================================

set -e

# Core Simulation Vectors
export GMI_MASS_KG=${variables.mass}
export GMI_NEGATIVE_ENERGY_MJ=${variables.negativeEnergy}
export GMI_COHERENCE_FREQ_HZ=${variables.frequency}
export GMI_DISTANCE_EMITTER_M=${variables.distance}
export GMI_POWER_ONLINE=${powerOnline ? 'true' : 'false'}
export GMI_QUANTUM_CONNECTED=${quantumNetworkConnected ? 'true' : 'false'}

echo "==> Pulling Apex Propulsion Base Image (v2.8-stable)..."
# docker pull apexresearch/propulsion-core:v2.8

echo "==> Configuring quantum field grid parameters..."
# init-quantum-grid --coherence=$GMI_COHERENCE_FREQ_HZ

echo "==> Initializing simulated lifting engine with active tensors..."
# run-simulation-engine \\
#   --mass=$GMI_MASS_KG \\
#   --negative-energy=$GMI_NEGATIVE_ENERGY_MJ \\
#   --distance=$GMI_DISTANCE_EMITTER_M \\
#   --mode="${simulationMode}"

echo "=============================================================================="
echo "DEPLOYMENT COMPLETE. LOCAL TENSOR REDUCTION STABILIZED."
echo "=============================================================================="`;
  };

  const copyJson = () => {
    navigator.clipboard.writeText(getJsonExport());
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(getCloudScriptExport());
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-transparent text-slate-100 flex flex-col space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-[#18181b] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-widest text-[#00ff88]">
            SYSTEM SETTINGS & CLOUD DEPLOYMENTS
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Hardware Mode: <span className="text-[#00d4ff]">Electron-Build Compatible (Stand-Alone ready)</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Choose Simulation Mode (5 columns) */}
        <div className="lg:col-span-5 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#18181b] pb-3 mb-2">
            <Sliders size={14} className="text-[#00d4ff]" />
            <h2 className="text-xs font-sans tracking-widest font-bold uppercase text-slate-300">
              SIMULATION HARDWARE SETTINGS
            </h2>
          </div>

          {/* Mode choices */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono text-[#71717a] uppercase tracking-wider mb-2">
              Select Global Simulation Mode Profile:
            </label>

            {/* Academic Mode item */}
            <button
              onClick={() => setSimulationMode('academic')}
              className={`w-full text-left p-3.5 rounded-sm border transition-all cursor-pointer
                ${simulationMode === 'academic' 
                  ? 'bg-[#111113] border-zinc-500 shadow-[0_4px_16px_rgba(255,255,255,0.02)]' 
                  : 'bg-[#080809]/80 border-[#18181b] hover:border-zinc-700/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wide">ACADEMIC MODE PRO-LEVEL</span>
                <span className="text-[9px] font-mono bg-zinc-800/40 px-1.5 py-0.5 rounded-sm text-slate-400 font-bold uppercase">Standard</span>
              </div>
              <p className="text-[10px] text-[#71717a] font-mono mt-1.5 leading-relaxed">
                Standard clean physics metrics. Visual highlights set to calm slate levels. No military security warnings.
              </p>
            </button>

            {/* Sci-Fi engine mode item */}
            <button
              onClick={() => setSimulationMode('scifi')}
              className={`w-full text-left p-3.5 rounded-sm border transition-all cursor-pointer
                ${simulationMode === 'scifi' 
                  ? 'bg-[#111113] border-[#00d4ff]/40 shadow-[0_4px_16px_rgba(0,212,255,0.02)]' 
                  : 'bg-[#080809]/80 border-[#18181b] hover:border-zinc-700/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00d4ff] uppercase tracking-wide">SCI-FI TELEMETRY CORE</span>
                <span className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 rounded-sm text-[#00d4ff] font-bold uppercase">Dynamic</span>
              </div>
              <p className="text-[10px] text-[#71717a] font-mono mt-1.5 leading-relaxed">
                Enhanced emerald green and deep violet accents. Optimized for cinematic visual overlays and quantum wave science fiction terms.
              </p>
            </button>

            {/* Military Classified mode item */}
            <button
              onClick={() => setSimulationMode('classified')}
              className={`w-full text-left p-3.5 rounded-sm border transition-all cursor-pointer
                ${simulationMode === 'classified' 
                  ? 'bg-[#111113] border-[#ff4444]/40 shadow-[0_4px_16px_rgba(255,68,68,0.02)]' 
                  : 'bg-[#080809]/80 border-[#18181b] hover:border-zinc-700/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#ff4444] uppercase tracking-wide">CLASSIFIED MILITARY CORE</span>
                <span className="text-[9px] font-mono bg-red-950/20 px-1.5 py-0.5 rounded-sm text-[#ff4444] font-bold uppercase">Restricted</span>
              </div>
              <p className="text-[10px] text-[#71717a] font-mono mt-1.5 leading-relaxed">
                Triggers visual alarms! Intense crimson-red warning nodes, classified file clearances, and restricted military sensor dashboards.
              </p>
            </button>
          </div>

          {/* Stand-alone Electron details box */}
          <div className="pt-4 border-t border-[#18181b] mt-4 text-[10px] font-mono text-[#71717a] space-y-1">
            <div className="text-zinc-600 font-bold uppercase block text-[9px] mb-1 tracking-widest">
              Stand-alone desktop configuration:
            </div>
            <p className="leading-relaxed">
              This SPA environment is optimized for <span className="text-[#00d4ff]">Electron.js bundling</span>. Packaging script handles local filesystem variables via IPC tunnels without server overheads.
            </p>
          </div>

        </div>

        {/* Right Side: Cloud Export & Deployment codes (7 columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Box 1: JSON Workspace configuration */}
          <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#18181b] pb-2.5">
              <div className="flex items-center space-x-1.5">
                <Database size={14} className="text-[#00d4ff]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  EXPORT WORKSPACE VARIABLES (JSON)
                </span>
              </div>

              <button
                onClick={copyJson}
                className="flex items-center space-x-1.5 font-mono text-[10px] text-[#00d4ff] hover:text-[#00d4ff]/80 focus:outline-none cursor-pointer"
              >
                {jsonCopied ? <Check size={12} className="text-[#00ff88]" /> : <Copy size={12} />}
                <span>{jsonCopied ? 'COPIED!' : 'COPY CONFIG'}</span>
              </button>
            </div>

            <pre className="font-mono text-[10px] text-[#00d4ff] p-4 rounded-sm bg-[#050506] border border-[#18181b] overflow-x-auto whitespace-pre max-h-48 leading-relaxed">
              {getJsonExport()}
            </pre>
          </div>

          {/* Box 2: Cloud Deployment automated script */}
          <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#18181b] pb-2.5">
              <div className="flex items-center space-x-1.5">
                <CloudUpload size={14} className="text-[#fbbf24]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  AUTOMATED CONTROLLER DEPLOYMENT SCRIPT
                </span>
              </div>

              <button
                onClick={copyScript}
                className="flex items-center space-x-1.5 font-mono text-[10px] text-[#fbbf24] hover:text-[#fbbf24]/80 focus:outline-none cursor-pointer"
              >
                {scriptCopied ? <Check size={12} className="text-[#00ff88]" /> : <Copy size={12} />}
                <span>{scriptCopied ? 'COPIED!' : 'COPY SCRIPT'}</span>
              </button>
            </div>

            <p className="text-[10px] text-[#71717a] font-mono leading-relaxed">
              Copy this self-contained shell environment launcher to deploy the current gravity displacement values inside of a Docker container cluster effortlessly.
            </p>

            <pre className="font-mono text-[10px] text-[#fbbf24] p-4 rounded-sm bg-[#050506] border border-[#18181b] overflow-x-auto whitespace-pre max-h-48 leading-relaxed">
              {getCloudScriptExport()}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
