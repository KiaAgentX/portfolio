import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Settings as SettingsIcon, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  HardDrive,
  Moon,
  Laptop,
  FileCheck
} from 'lucide-react';

const Settings = () => {
  const {
    themeMode,
    setThemeMode,
    mass,
    energy,
    frequency,
    distance,
    stability,
    gmi,
    power,
    preset,
    addNotification,
    playClick
  } = useSimulation();

  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Configuration JSON representation
  const configObj = {
    platform: "Antigravity Research & Simulation Platform",
    version: "1.0.8-quantum",
    timestamp: new Date().toISOString(),
    theme: themeMode,
    presetLoaded: preset,
    parameters: {
      mass_kg: mass,
      negative_energy_ev: energy,
      oscillator_frequency_hz: frequency,
      field_distance_m: distance
    },
    telemetry: {
      field_stability_percent: stability,
      gravity_manipulation_index_gmi: gmi,
      power_grid_consumption_gw: power
    }
  };

  const jsonString = JSON.stringify(configObj, null, 2);

  // Shell script mock deployment
  const deployScript = `#!/bin/bash
# ==============================================================================
# QUANTUM PROPULSION CORE DEPLOYMENT SCRIPT
# TARGET CORE: Q-NET-NODE-42
# CONFIGURATION ID: GMI-${gmi.toFixed(2)}-STAB-${stability}
# ==============================================================================

echo "Initializing Quantum Propulsion Net handshake..."
curl -s -X POST https://qnet.tele.aerospace/core/handshake \\
  -H "Authorization: Bearer QNET_WINTERHAVEN_SECURE_TOKEN_57" \\
  -d '{"client_version": "1.0.8"}'

echo "Core handshake successful. Injecting parameter matrix..."
curl -s -X PUT https://qnet.tele.aerospace/core/simulate \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(configObj.parameters)}'

echo "Calibrating microwave resonance frequency to ${frequency} Hz..."
sleep 1.5
echo "Stabilizing Casimir boundary vacuum fields at ${distance} meters..."
sleep 1

# Verify safety thresholds
stability_check=$(curl -s https://qnet.tele.aerospace/core/telemetry | grep -o '"stability":[0-9]*' | cut -d: -f2)

if [ "$stability_check" -lt 70 ]; then
  echo "[-] WARNING: Telemetry stability ($stability_check%) below threshold!"
  echo "[-] Engaging frequency phase-shifting tuning loops..."
else
  echo "[+] SUCCESS: Telemetry lock holding stable at $stability_check%!"
fi

echo "=============================================================================="
echo "DEPLOYMENT COMPLETE. LOCAL GRAV VECTOR MODIFIED."
echo "=============================================================================="`;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJSON(true);
    playClick();
    addNotification("Configuration JSON copied to clipboard.");
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(deployScript);
    setCopiedScript(true);
    playClick();
    addNotification("Deployment script copied to clipboard.");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `antigravity_config_gmi_${gmi.toFixed(1)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playClick();
    addNotification("Configuration JSON downloaded.");
  };

  const getThemeStyles = () => {
    switch (themeMode) {
      case 'academic':
        return {
          border: 'border-slate-800',
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-600 hover:bg-emerald-500',
          badge: 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40',
          consoleBorder: 'border-slate-800 bg-slate-950/60 text-slate-300'
        };
      case 'classified':
        return {
          border: 'border-cyber-amber/20',
          accent: 'text-cyber-amber',
          accentBg: 'bg-cyber-amber text-black hover:bg-cyber-amber/90',
          badge: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30',
          consoleBorder: 'border-cyber-amber/15 bg-cyber-obsidian/90 text-cyber-amber'
        };
      case 'sci-fi':
      default:
        return {
          border: 'border-cyber-blue/15',
          accent: 'text-cyber-blue',
          accentBg: 'bg-cyber-blue text-black hover:bg-cyber-blue/90',
          badge: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/25',
          consoleBorder: 'border-cyber-blue/10 bg-cyber-obsidian/75 text-cyber-blue'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto h-full max-h-screen select-none">
      
      {/* Column 1: System Mode & Workspace Control */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-dark/40 p-5 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-cyber-blue" />
              Simulation Interface Configuration
            </h2>
            <span className="text-[9px] text-gray-500 font-mono">SETTINGS</span>
          </div>

          <div className="space-y-6">
            
            {/* Theme / Mode Selector */}
            <div className="space-y-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Select Interface Mode</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Academic Mode */}
                <button
                  onClick={() => { setThemeMode('academic'); playClick(); addNotification("Interface mode changed to ACADEMIC."); }}
                  className={`p-3 rounded border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'academic' 
                      ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400' 
                      : 'border-gray-900 bg-gray-950/40 text-gray-400 hover:border-gray-800'
                  }`}
                >
                  <Moon className="w-5 h-5 mb-2" />
                  <div className="font-orbitron text-[10px] font-bold">Academic</div>
                  <div className="text-[9px] text-gray-500 font-sans mt-0.5 leading-snug">Clean teal layout, static equations, minimal grid lines.</div>
                </button>

                {/* Sci-Fi Mode */}
                <button
                  onClick={() => { setThemeMode('sci-fi'); playClick(); addNotification("Interface mode changed to SCI-FI."); }}
                  className={`p-3 rounded border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'sci-fi' 
                      ? 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue' 
                      : 'border-gray-900 bg-gray-950/40 text-gray-400 hover:border-gray-800'
                  }`}
                >
                  <Laptop className="w-5 h-5 mb-2" />
                  <div className="font-orbitron text-[10px] font-bold">Sci-Fi Core</div>
                  <div className="text-[9px] text-gray-500 font-sans mt-0.5 leading-snug">Default theme. Cyber cyan and neon green grid warp overlays.</div>
                </button>

                {/* Classified Mode */}
                <button
                  onClick={() => { setThemeMode('classified'); playClick(); addNotification("Interface mode changed to CLASSIFIED."); }}
                  className={`p-3 rounded border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'classified' 
                      ? 'border-cyber-amber bg-cyber-amber/10 text-cyber-amber' 
                      : 'border-gray-900 bg-gray-950/40 text-gray-400 hover:border-gray-800'
                  }`}
                >
                  <Terminal className="w-5 h-5 mb-2" />
                  <div className="font-orbitron text-[10px] font-bold">Classified</div>
                  <div className="text-[9px] text-gray-500 font-sans mt-0.5 leading-snug">Retro amber console layout, monochrome CRT scanlines.</div>
                </button>

              </div>
            </div>

            {/* Diagnostic check */}
            <div className="border border-gray-900 bg-[#020204] p-4 rounded text-xs font-mono space-y-2">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">System Diagnostics</span>
              <div className="flex gap-2 items-center text-cyber-green">
                <FileCheck className="w-4 h-4 flex-shrink-0" />
                <span>React-Vite Core Architecture: v18.3.1</span>
              </div>
              <div className="flex gap-2 items-center text-cyber-green">
                <Cpu className="w-4 h-4 flex-shrink-0" />
                <span>Quantum Propulsion Simulator Engine: ONLINE</span>
              </div>
              <div className="flex gap-2 items-center text-cyber-green">
                <HardDrive className="w-4 h-4 flex-shrink-0" />
                <span>Desktop Electron Standalone Ready: YES</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer notes */}
        <div className="mt-8 border-t border-gray-900 pt-4 text-[9px] text-gray-600 font-mono">
          <p>ANTIGRAVITY TELEMETRY SYSTEMS OPERATES UNDER RE-ENTRY CLASS-4 INERTIAL LAWS. ACCESS KEY: 0xDEADBEEF42</p>
        </div>
      </div>

      {/* Column 2: Configuration Export & Deployment Code */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-obsidian/75 p-5 flex flex-col justify-between`}>
        
        {/* Export JSON Block */}
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4">
            <span className="font-orbitron text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-blue" />
              Workspace JSON Configuration
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopyJSON}
                className="text-[9px] border border-gray-800 hover:text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-mono"
              >
                {copiedJSON ? <Check className="w-2.5 h-2.5 text-cyber-green" /> : <Copy className="w-2.5 h-2.5" />}
                {copiedJSON ? "COPIED" : "COPY"}
              </button>
              <button
                onClick={handleDownloadJSON}
                className="text-[9px] border border-gray-800 hover:text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-mono"
              >
                <Download className="w-2.5 h-2.5" />
                JSON
              </button>
            </div>
          </div>

          <pre className={`text-[10px] p-3 border rounded font-mono select-all leading-relaxed whitespace-pre overflow-x-auto max-h-[170px] scrollbar-thin ${theme.consoleBorder}`}>
            {jsonString}
          </pre>
        </div>

        {/* Cloud deployment shell script */}
        <div className="mt-6">
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4">
            <span className="font-orbitron text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-blue" />
              Quantum cloud Deployment Script
            </span>
            <button
              onClick={handleCopyScript}
              className="text-[9px] border border-gray-800 hover:text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-mono"
            >
              {copiedScript ? <Check className="w-2.5 h-2.5 text-cyber-green" /> : <Copy className="w-2.5 h-2.5" />}
              {copiedScript ? "COPIED SCRIPT" : "COPY SCRIPT"}
            </button>
          </div>

          <pre className={`text-[10px] p-3 border rounded font-mono select-all leading-relaxed whitespace-pre overflow-x-auto max-h-[170px] scrollbar-thin ${theme.consoleBorder}`}>
            {deployScript}
          </pre>
        </div>

      </div>

    </div>
  );
};

export default Settings;
