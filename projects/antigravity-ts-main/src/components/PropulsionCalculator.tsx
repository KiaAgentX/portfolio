import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  Zap, 
  ArrowRight, 
  Cpu, 
  TrendingUp, 
  Layers, 
  Terminal, 
  Bookmark, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { SimulationVariables, SimulationMode } from '../types';

interface PropulsionCalculatorProps {
  simulationMode: SimulationMode;
  variables: SimulationVariables;
  powerOnline: boolean;
}

export default function PropulsionCalculator({
  simulationMode,
  variables,
  powerOnline,
}: PropulsionCalculatorProps) {
  // Input parameters
  const [targetMass, setTargetMass] = useState<number>(variables.mass || 120);
  const [desiredLiftG, setDesiredLiftG] = useState<number>(1.2); // multiple of g (e.g. 1.2g)
  
  // Output states
  const [totalForceReq, setTotalForceReq] = useState<number>(0);
  const [requiredNegativeEnergy, setRequiredNegativeEnergy] = useState<number>(0);
  const [requiredVoltageKV, setRequiredVoltageKV] = useState<number>(0);
  
  // Report state
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync with global variables if they change
  useEffect(() => {
    setTargetMass(variables.mass);
  }, [variables.mass]);

  // Perform gravitational acceleration equations
  useEffect(() => {
    const g = 9.80665; // standard gravitational acceleration
    
    // F_req = mass * gravity_acceleration * desiredG
    const forceN = targetMass * g * desiredLiftG;
    const forceKN = forceN / 1000;
    setTotalForceReq(forceKN);

    // E = (ForceN * Distance) / factor
    // Using standard physics layout metrics
    const distanceFactor = Math.max(0.1, variables.distance);
    const logFreq = Math.log10(variables.frequency || 100000);
    const calculatedE = (forceKN * distanceFactor * 12.5) / (logFreq || 1.1);
    setRequiredNegativeEnergy(calculatedE);

    // Required Voltage for Electrogravitics
    // F_bb = (1/2) * (K * e0 * A * V^2) / distance -> V = sqrt( (2 * F * d) / (K * e0 * A) )
    // Let's model a streamlined high-voltage converter output in kilovolts
    const calculatedV = Math.sqrt((forceN * distanceFactor * 50) / 12000);
    setRequiredVoltageKV(calculatedV);

  }, [targetMass, desiredLiftG, variables.distance, variables.frequency]);

  // Generate complete platform report
  const handleGenerateReport = () => {
    const timestamp = new Date().toISOString();
    const gmiCheck = powerOnline ? '94.2% operational reduction' : '0.00% (coils offline)';
    
    const reportText = `================================================================
APEX PROPULSION NETWORK OPERATIONS - TELEMETRY REPORT
SECURITY GRADE: TOP SECRET // AUTHORITY E-8
GENERATED AT: ${timestamp}
================================================================

[ENGINE CLASSIFICATION MODES]
Mode Profile: ${simulationMode.toUpperCase()}
Reactor Power Connection: ${powerOnline ? 'ONLINE' : 'STANDBY'}

[CRITICAL INERTIAL INPUTS]
Target Mass Vector (M): ${targetMass.toLocaleString()} kg
Desired Displacement Thrust: ${desiredLiftG.toFixed(2)}G (${(desiredLiftG * 9.81).toFixed(2)} m/s²)
Local Spatial Distance (d): ${variables.distance.toFixed(3)} m
Coherence Excitation (f): ${(variables.frequency / 1000).toLocaleString()} kHz

[DERIVED DISPLACEMENT FORMULAS]
1. Required Lifting Force (F_req):
   Formula: F = M * g * a_des
   Result: ${totalForceReq.toFixed(4)} kN

2. Required Negative Casimir Density (E_cas):
   Formula: E = (F * d * K) / log_10(f)
   Result: ${requiredNegativeEnergy.toFixed(3)} MJ (Negative Energy Reserves)

3. Electro-gravitic Potential Gradient (V_kv):
   Formula: V = sqrt( (2 * F * d) / coeff )
   Result: ${requiredVoltageKV.toFixed(1)} Kilovolts (DC Peak Load)

----------------------------------------------------------------
[ANOMALY CORRELATION OVERVIEWS]
System stability sits normal. No localized space-time tears 
detected inside the vacuum envelope. 
GMI Projection Model: ${gmiCheck}

================================================================
END OF RESTRICTED TELEMETRY TRANSMISSION // APEX RESEARCH LABS
================================================================`;

    setGeneratedReport(reportText);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-transparent text-slate-100 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#18181b] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-widest text-[#00ff88]">
            PROPULSION FORMULA SANDBOX & CALCULATOR
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Physics Framework: <span className="text-[#00d4ff]">Biefeld-Brown & Casimir Electrohydrodynamic Tensors</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input parameters (5 columns) */}
        <div className="lg:col-span-5 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#18181b] pb-3 mb-2">
            <Calculator size={14} className="text-[#00d4ff]" />
            <h2 className="text-xs font-sans tracking-widest font-bold uppercase text-slate-300">
              DISPLACEMENT EQUATIONS SETUP
            </h2>
          </div>
          {/* Mass Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
              Target Vessel Mass (<span className="italic font-serif">M</span>)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000000"
                value={targetMass || ''}
                onChange={(e) => setTargetMass(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#080809] border border-[#18181b] rounded-sm px-3.5 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-[#00d4ff]/50"
              />
              <span className="absolute right-3.5 top-2.5 text-[10px] font-mono text-zinc-600 uppercase">
                kg
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono italic">
              Vessel mass to displace using Casimir vacuum waves.
            </p>
          </div>

          {/* Desired Lift Acceleration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#71717a] uppercase tracking-wider">DESIRED ACCELERATION (G)</span>
              <span className="text-[#fbbf24] font-bold">{desiredLiftG.toFixed(2)} G</span>
            </div>
            <input 
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={desiredLiftG}
              onChange={(e) => setDesiredLiftG(Number(e.target.value))}
              className="w-full h-1 bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-[#fbbf24] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] font-mono text-zinc-600">
              <span>0.1G (Hover)</span>
              <span>2.5G</span>
              <span>5.0G (Hyperlift)</span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono italic">
              Desired acceleration vector height scalar. 1.0G matches standard earth weight.
            </p>
          </div>

          {/* Constant Variables Display */}
          <div className="p-3.5 rounded bg-[#080809] border border-[#18181b] space-y-2 font-mono text-[11px] text-[#71717a]">
            <span className="text-zinc-600 font-bold block text-[9px] uppercase border-b border-[#18181b] pb-1 tracking-widest">
              CONNECTED PLATFORM REFERENCE FORCES:
            </span>
            <div className="flex justify-between">
              <span>Spatial Proximity (d):</span>
              <span className="text-[#00ff88]">{variables.distance.toFixed(3)} m</span>
            </div>
            <div className="flex justify-between">
              <span>Wave Coherence (f):</span>
              <span className="text-[#fbbf24]">{(variables.frequency / 1000).toLocaleString()} kHz</span>
            </div>
            <div className="flex justify-between">
              <span>Earth Gravity Const (g):</span>
              <span className="text-zinc-600">9.80665 m/s²</span>
            </div>
          </div>

          {/* Generate Report Button */}
          <button
            onClick={handleGenerateReport}
            className="w-full py-2.5 px-4 bg-[#111113] hover:bg-[#18181b] text-[#00d4ff] font-sans text-xs tracking-widest font-bold rounded-sm border border-[#18181b] transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <FileText size={14} />
            <span>GENERATE CLASSIFIED REPORT</span>
          </button>
        </div>

        {/* Right: Solved derived formulas and report visualization (7 columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Mathematical physics equations output cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Box 1: Required Force */}
            <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-4 relative">
              <div className="absolute top-3 right-3 text-[#00d4ff]/40">
                <Cpu size={14} />
              </div>
              <span className="font-mono text-[9px] text-[#52525b] block uppercase">REQUIRED FORCE</span>
              <span className="font-mono text-xs text-slate-300 font-bold block mt-1 leading-none uppercase">F_req Vector</span>
              <div className="mt-3 flex items-baseline space-x-0.5">
                <span className="text-xl font-mono font-extrabold text-[#00d4ff]">
                  {totalForceReq.toFixed(3)}
                </span>
                <span className="text-[9px] font-mono text-zinc-600">kN</span>
              </div>
            </div>

            {/* Box 2: Required Negative Energy */}
            <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-4 relative">
              <div className="absolute top-3 right-3 text-[#c084fc]/40">
                <Layers size={14} />
              </div>
              <span className="font-mono text-[9px] text-[#52525b] block uppercase">CASIMIR REQ</span>
              <span className="font-mono text-xs text-slate-300 font-bold block mt-1 leading-none uppercase">Neg-Energy</span>
              <div className="mt-3 flex items-baseline space-x-0.5">
                <span className="text-xl font-mono font-extrabold text-[#c084fc]">
                  {requiredNegativeEnergy.toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-zinc-600">MJ</span>
              </div>
            </div>

            {/* Box 3: Electrogravitics Peak Load */}
            <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-4 relative">
              <div className="absolute top-3 right-3 text-[#fbbf24]/40">
                <Zap size={14} />
              </div>
              <span className="font-mono text-[9px] text-[#52525b] block uppercase">DIELECTRIC THROW</span>
              <span className="font-mono text-xs text-slate-300 font-bold block mt-1 leading-none uppercase">Biefeld V-Peak</span>
              <div className="mt-3 flex items-baseline space-x-0.5">
                <span className="text-xl font-mono font-extrabold text-[#fbbf24]">
                  {requiredVoltageKV.toFixed(1)}
                </span>
                <span className="text-[9px] font-mono text-zinc-600">kV</span>
              </div>
            </div>

          </div>

          {/* Formatted Equations list */}
          <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e]/90 p-5 space-y-4 font-mono text-xs text-slate-300">
            <span className="text-[10px] text-[#52525b] block font-bold uppercase border-b border-[#18181b] pb-2 tracking-widest">
              LATEX-STYLE DISPLACEMENT MATRICES
            </span>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-[#080809] p-3 rounded-sm border border-[#18181b]">
                <div>
                  <span className="text-[9px] text-[#52525b] block uppercase tracking-wider">THRUST VECTOR REQUIREMENT:</span>
                  <span className="font-serif italic text-[#00d4ff]">F_req = M &middot; g &middot; a_des</span>
                </div>
                <div className="text-right">
                  <span className="block text-[#00ff88] font-bold">{totalForceReq.toFixed(4)} kN</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#080809] p-3 rounded-sm border border-[#18181b]">
                <div>
                  <span className="text-[9px] text-[#52525b] block uppercase tracking-wider">CASIMIR ENERGY DILATION:</span>
                  <span className="font-serif italic text-[#c084fc]">E = (F_req &middot; d &middot; K_dielectric) / log_10(f)</span>
                </div>
                <div className="text-right">
                  <span className="block text-[#00ff88] font-bold">{requiredNegativeEnergy.toFixed(3)} MJ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Document Report Panel display */}
          {generatedReport && (
            <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 relative animate-fade-in flex flex-col justify-between">
              
              <div className="flex items-center justify-between mb-3 border-b border-[#18181b] pb-2.5">
                <span className="font-mono text-xs text-[#ff4444] font-bold tracking-wider uppercase">
                  CLASSIFIED TELEMETRY REPORT SUMMARY
                </span>
                
                {/* Copy report */}
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1.5 font-mono text-[10px] text-[#00d4ff] hover:text-[#00d4ff]/80 focus:outline-none cursor-pointer"
                >
                  {isCopied ? <Check size={12} className="text-[#00ff88]" /> : <Copy size={12} />}
                  <span>{isCopied ? 'COPIED!' : 'COPY REPORT'}</span>
                </button>
              </div>

              <pre className="font-mono text-[10px] text-[#00ff88] overflow-x-auto whitespace-pre leading-relaxed p-4 rounded-sm bg-[#050506] border border-[#18181b]">
                {generatedReport}
              </pre>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
