import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  Network, 
  Zap, 
  Gauge, 
  Database, 
  RefreshCw, 
  Cpu, 
  Flame, 
  Fingerprint, 
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { SimulationVariables, SimulationMode, ActivePreset, MetricData } from '../types';
import { PRESET_VARIABLES } from '../constants';

interface DashboardProps {
  simulationMode: SimulationMode;
  variables: SimulationVariables;
  setVariables: (vars: SimulationVariables) => void;
  activePreset: ActivePreset;
  setActivePreset: (preset: ActivePreset) => void;
  powerOnline: boolean;
  quantumNetworkConnected: boolean;
  setQuantumNetworkConnected: (connected: boolean) => void;
}

export default function Dashboard({
  simulationMode,
  variables,
  setVariables,
  activePreset,
  setActivePreset,
  powerOnline,
  quantumNetworkConnected,
  setQuantumNetworkConnected,
}: DashboardProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [currentGmi, setCurrentGmi] = useState(0);
  const [currentStability, setCurrentStability] = useState(0);
  const [currentNegativeDensity, setCurrentNegativeDensity] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);

  // Generate initial history timeline
  useEffect(() => {
    const data: MetricData[] = [];
    const baseTime = Date.now();
    for (let i = 15; i >= 0; i--) {
      const gmiNoise = Math.sin(i * 0.4) * 5;
      data.push({
        time: new Date(baseTime - i * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        gmi: powerOnline ? Math.max(0, Math.min(100, 75 + gmiNoise)) : 0,
        stability: powerOnline ? Math.max(0, Math.min(100, 94 - Math.abs(gmiNoise))) : 0,
        negativeDensity: powerOnline ? Math.max(0, 4.2 + (gmiNoise / 10)) : 0,
        power: powerOnline ? Math.max(0, 15.6 + (gmiNoise * 0.2)) : 0,
      });
    }
    setMetrics(data);
  }, [powerOnline]);

  // Handle preset loading
  const handlePresetSelect = (preset: ActivePreset) => {
    setActivePreset(preset);
    setVariables({ ...PRESET_VARIABLES[preset] });
  };

  // Real-time telemetry generator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (powerOnline) {
      interval = setInterval(() => {
        // Calculate GMI based on physical params
        // mass: kg, negativeEnergy: MJ, frequency: Hz, distance: m
        const logFreq = Math.log10(variables.frequency || 1000);
        const numerator = (variables.negativeEnergy * logFreq) / 100;
        const denominator = Math.max(0.01, (variables.mass * Math.pow(variables.distance, 0.5)) / 1000);
        const calculatedGmi = Math.min(99.98, Math.max(0, (numerator / (denominator || 1)) * 0.25));

        // Stability depends on frequency harmonics and density balance
        const freqHarmonic = (variables.frequency % 100) / 100;
        const stabilityFactor = Math.max(20, Math.min(99.4, 98.7 - (variables.mass > 500 ? (variables.mass / 2000) : 0) - (freqHarmonic * 4)));
        
        // Negative Mass Density
        const density = (variables.negativeEnergy / 100) * (variables.distance > 0 ? (1 / variables.distance) : 1);

        // Power consumption (GW)
        const power = (variables.frequency * variables.mass) / 5e7 + (variables.negativeEnergy / 200);

        // Perturbations
        const noise = (Math.random() - 0.5) * 1.5;
        const finalGmi = Number(Math.min(99.9, Math.max(0, calculatedGmi + noise * 0.5)).toFixed(2));
        const finalStability = Number(Math.max(10, Math.min(100, stabilityFactor + noise * 1.2)).toFixed(1));
        const finalDensity = Number(Math.max(0, density + noise * 0.05).toFixed(3));
        const finalPower = Number(Math.max(0, power + noise * 0.1).toFixed(2));

        setCurrentGmi(finalGmi);
        setCurrentStability(finalStability);
        setCurrentNegativeDensity(finalDensity);
        setCurrentPower(finalPower);

        // Update Recharts list
        setMetrics((prev) => {
          const next = [...prev.slice(1)];
          next.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            gmi: finalGmi,
            stability: finalStability,
            negativeDensity: finalDensity,
            power: finalPower,
          });
          return next;
        });
      }, 1500);
    } else {
      setCurrentGmi(0);
      setCurrentStability(0);
      setCurrentNegativeDensity(0);
      setCurrentPower(0);
    }

    return () => clearInterval(interval);
  }, [powerOnline, variables]);

  const activeColor = simulationMode === 'classified' ? '#ef4444' : '#06b6d4';
  const shadowColor = simulationMode === 'classified' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)';

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-transparent text-slate-100">
      
      {/* Dynamic Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#18181b] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-widest text-[#00ff88] uppercase">
            G-PROPULSION CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Operational Node ID: <span className="text-[#00d4ff]">APEX-N3-GMI</span> | Local Status Terminal
          </p>
        </div>
        
        {/* Network Button and Presets Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setQuantumNetworkConnected(!quantumNetworkConnected)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-sm text-[10px] uppercase font-mono tracking-wider border transition-all cursor-pointer
              ${quantumNetworkConnected 
                ? 'bg-[#111113] text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_8px_rgba(0,255,136,0.05)]' 
                : 'bg-[#0c0c0e] text-[#71717a] border-[#18181b] hover:bg-[#111113]'
              }
            `}
          >
            <Network size={12} className={quantumNetworkConnected ? 'animate-pulse text-[#00ff88]' : ''} />
            <span>{quantumNetworkConnected ? 'QUANTUM LINK ACTIVE' : 'CONNECT QUANTUM NET'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Simulated Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: GMI */}
        <div className={`p-5 rounded-sm border bg-[#0c0c0e] border-[#18181b] relative overflow-hidden transition-all duration-300
          ${powerOnline ? 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'opacity-50'}
        `}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#71717a] tracking-widest">GRAVITY INDEX (GMI)</span>
            <Gauge size={14} className={powerOnline ? 'text-[#00d4ff]' : 'text-[#71717a]'} />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className={`text-3xl font-mono font-bold ${powerOnline ? 'text-[#00d4ff]' : 'text-[#71717a]'}`}>
              {powerOnline ? currentGmi : '0.00'}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">% REDUCTION</span>
          </div>
          {/* Custom micro spark bar */}
          <div className="h-1 bg-[#18181b] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-[#00d4ff] transition-all duration-500" 
              style={{ width: `${powerOnline ? currentGmi : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Field Stability */}
        <div className={`p-5 rounded-sm border bg-[#0c0c0e] border-[#18181b] relative overflow-hidden transition-all duration-300
          ${powerOnline ? 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'opacity-50'}
        `}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#71717a] tracking-widest">FIELD STABILITY</span>
            <RefreshCw size={14} className={`animate-spin-slow ${powerOnline ? 'text-[#00ff88]' : 'text-[#71717a]'}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className={`text-3xl font-mono font-bold ${powerOnline ? 'text-[#00ff88]' : 'text-[#71717a]'}`}>
              {powerOnline ? currentStability : '0.00'}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">% STABLE</span>
          </div>
          <div className="h-1 bg-[#18181b] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-[#00ff88] transition-all duration-500" 
              style={{ width: `${powerOnline ? currentStability : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Negative Mass Density */}
        <div className={`p-5 rounded-sm border bg-[#0c0c0e] border-[#18181b] relative overflow-hidden transition-all duration-300
          ${powerOnline ? 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'opacity-50'}
        `}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#71717a] tracking-widest">NEGATIVE ENERGY DENSITY</span>
            <Database size={14} className={powerOnline ? 'text-indigo-400' : 'text-[#71717a]'} />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className={`text-3xl font-mono font-bold ${powerOnline ? 'text-[#818cf8]' : 'text-[#71717a]'}`}>
              {powerOnline ? currentNegativeDensity : '0.000'}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">M-TENS / M³</span>
          </div>
          <div className="h-1 bg-[#18181b] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${powerOnline ? Math.min(100, currentNegativeDensity * 10) : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Power Consumption */}
        <div className={`p-5 rounded-sm border bg-[#0c0c0e] border-[#18181b] relative overflow-hidden transition-all duration-300
          ${powerOnline ? 'shadow-[0_4px_24px_rgba(0,0,0,0.5)]' : 'opacity-50'}
        `}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#71717a] tracking-widest">REACTOR EXCITATION</span>
            <Zap size={14} className={powerOnline ? 'text-amber-400' : 'text-[#71717a]'} />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className={`text-3xl font-mono font-bold ${powerOnline ? 'text-[#fbbf24]' : 'text-[#71717a]'}`}>
              {powerOnline ? currentPower : '0.00'}
            </span>
            <span className="text-[10px] font-mono text-[#71717a]">GW / SEC</span>
          </div>
          <div className="h-1 bg-[#18181b] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-[#f59e0b] transition-all duration-500" 
              style={{ width: `${powerOnline ? Math.min(100, currentPower * 3) : 0}%` }}
            />
          </div>
        </div>

      </div>

      {/* Global Config Panel & Preset Loaders Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Presets and Global Config Panel */}
        <div className="lg:col-span-1 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#18181b] pb-4">
              <Cpu size={14} className="text-[#00d4ff]" />
              <h2 className="text-xs font-sans tracking-widest font-bold uppercase text-slate-300">
                PROLOGUE ENGINE PARAMETERS & PRESETS
              </h2>
            </div>
            
            <p className="text-xs text-[#71717a] font-mono my-4 leading-relaxed">
              Select one of the legendary documentary research presets listed below to load historically modeled physics parameters directly into the levitation coils.
            </p>

            <div className="space-y-2 mt-4">
              
              {/* Preset 1: Electrogravitics */}
              <button
                onClick={() => handlePresetSelect('electrogravitics')}
                className={`w-full text-left p-4 rounded-sm border transition-all duration-150 cursor-pointer
                  ${activePreset === 'electrogravitics' 
                    ? 'bg-[#111113] border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.06)]' 
                    : 'bg-[#080809] border-[#18181b] hover:border-zinc-700/60 hover:bg-[#111113]'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#00d4ff]">1. ELECTROGRAVITICS PRESET</span>
                  <span className="text-[9px] font-mono bg-[#111113] border border-[#18181b] px-1.5 py-0.5 rounded-sm text-sky-400">T. T. BROWN</span>
                </div>
                <p className="text-[10px] text-[#71717a] font-mono mt-2 leading-normal">
                  High-voltage asymmetric capacitive shielding. Fast levitation coupling at higher dielectric coefficients.
                </p>
              </button>

              {/* Preset 2: Quantum Levitation */}
              <button
                onClick={() => handlePresetSelect('quantum_levitation')}
                className={`w-full text-left p-4 rounded-sm border transition-all duration-150 cursor-pointer
                  ${activePreset === 'quantum_levitation' 
                    ? 'bg-[#111113] border-[#00ff88]/40 shadow-[0_0_12px_rgba(0,255,136,0.06)]' 
                    : 'bg-[#080809] border-[#18181b] hover:border-zinc-700/60 hover:bg-[#111113]'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-[#00ff88]">2. QUANTUM LEVITATION PRESET</span>
                  <span className="text-[9px] font-mono bg-[#111113] border border-[#18181b] px-1.5 py-0.5 rounded-sm text-emerald-400">MEISSNER MOD</span>
                </div>
                <p className="text-[10px] text-[#71717a] font-mono mt-2 leading-normal">
                  Magnetic flux pinning using extreme electromagnetic sub-zero superlattice frequencies.
                </p>
              </button>

              {/* Preset 3: Alcubierre Metric */}
              <button
                onClick={() => handlePresetSelect('alcubierre_metric')}
                className={`w-full text-left p-4 rounded-sm border transition-all duration-150 cursor-pointer
                  ${activePreset === 'alcubierre_metric' 
                    ? 'bg-[#111113] border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.06)]' 
                    : 'bg-[#080809] border-[#18181b] hover:border-zinc-700/60 hover:bg-[#111113]'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-purple-400">3. ALCUBIERRE WARP METRIC</span>
                  <span className="text-[9px] font-mono bg-[#111113] border border-[#18181b] px-1.5 py-0.5 rounded-sm text-purple-400">WARIP DRIVE</span>
                </div>
                <p className="text-[10px] text-[#71717a] font-mono mt-2 leading-normal">
                  Spacetime expansion matrix requiring massive negative mass density reserves.
                </p>
              </button>

            </div>
          </div>

          <div className="pt-4 border-t border-[#18181b] mt-5">
            <div className="flex justify-between text-[10px] font-mono text-[#52525b]">
              <span>ACTIVE COILS LOADED:</span>
              <span className="font-bold text-[#00ff88] uppercase tracking-widest">{activePreset}</span>
            </div>
          </div>
        </div>

        {/* Real-time Charts Core */}
        <div className="lg:col-span-2 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5">
          <div className="flex items-center justify-between border-b border-[#18181b] pb-4 mb-5">
            <div className="flex items-center space-x-2">
              <Radio size={14} className={`text-[#00d4ff] ${powerOnline ? 'animate-pulse' : ''}`} />
              <h2 className="text-xs font-sans tracking-widest font-bold uppercase text-slate-300">
                WAVE FREQUENCY SPECTRAL & GRAVITATIONAL SPIKES
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
              <span className="font-mono text-[10px] tracking-wider text-[#71717a]">TELEMETRY FEED</span>
            </div>
          </div>

          {/* Telemetry Chart Component */}
          <div className="h-64 sm:h-72 w-full font-mono text-[10px]">
            {powerOnline ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gmiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeColor} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" opacity={0.6} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#1c1c1f"
                    tick={{ fill: '#71717a', fontSize: 9 }}
                  />
                  <YAxis 
                    stroke="#1c1c1f"
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0c0e',
                      borderColor: '#18181b',
                      borderRadius: '2px',
                      color: '#fff',
                      fontSize: '10px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gmi"
                    name="GMI Value (%)"
                    stroke={activeColor}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#gmiGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    name="Power Draw (GW)"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    fillOpacity={1}
                    fill="url(#powerGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border border-dashed border-[#18181b] rounded-sm flex flex-col items-center justify-center space-y-3 bg-[#080809]/40">
                <Flame size={18} className="text-zinc-800" />
                <span className="font-mono text-[#71717a] uppercase tracking-widest text-xs">Propulsion offline</span>
                <span className="font-mono text-[10px] text-[#52525b]">Activate primary reactor standby switch in sidebar</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#18181b] text-[10px] font-mono text-[#71717a]">
            <div>
              <span className="text-[#52525b] block">EXCITATION WAVEHARMONIC</span>
              <span className="text-[#00d4ff] font-bold">Scalar Doublet Loop</span>
            </div>
            <div className="text-right">
              <span className="text-[#52525b] block">DETECTOR NOISE THRESHOLD</span>
              <span className="text-[#00ff88] font-bold">~ 0.0456 mHz (Pass)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Auxiliary Documentary Info card */}
      <div className="p-5 rounded-sm border border-[#18181b] bg-[#0c0c0e]/30 flex items-start space-x-4">
        <Fingerprint size={28} className="text-[#00d4ff] flex-shrink-0" />
        <div>
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wide">DOCUMENTARY CLASSIFICATION MANUAL NOTE:</span>
          <p className="text-xs text-[#71717a] font-mono mt-1 leading-relaxed">
            For military or physics sandbox evaluations, it is advised to coordinate mass matrices alongside negative energy limits. Exceeding <span className="text-amber-500">2,500 Megajoules</span> of negative Casimir energy without stabilizing high harmonic electromagnetic field coils may lead to full simulation lockouts or gravitational spacetime rips.
          </p>
        </div>
      </div>

    </div>
  );
}
