import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Calculator as CalcIcon, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  AlertCircle 
} from 'lucide-react';

const Calculator = () => {
  const {
    themeMode,
    mass: simMass,
    energy: simEnergy,
    frequency: simFreq,
    distance: simDist,
    gmi,
    stability,
    power,
    levitationStatus,
    targetFrequency,
    addNotification,
    playClick
  } = useSimulation();

  // Local calculator inputs
  const [calcMass, setCalcMass] = useState(simMass);
  const [calcLift, setCalcLift] = useState(500); // Newtons
  const [calcDist, setCalcDist] = useState(simDist);
  const [calcFreq, setCalcFreq] = useState(simFreq);
  
  // Report modal state
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);

  // Math equations
  const localTargetFrequency = Math.round((calcMass * 3.5) + (calcDist * 14));
  const deviation = Math.abs(calcFreq - localTargetFrequency);
  const resonanceFactor = Math.max(0.1, parseFloat((1 - (deviation * 0.0035)).toFixed(3)));
  
  // Required negative energy calculation: E = (Lift * Dist^2) / (15 * ResonanceFactor)
  const requiredEnergy = Math.max(0, Math.round(
    (calcLift * (calcDist * calcDist)) / (12 * resonanceFactor)
  ));

  // Power projection: P = E * 1.8 + Freq * 0.95 + Mass * 0.15
  const projectedPower = parseFloat(
    ((requiredEnergy * 1.8) + (calcFreq * 0.95) + (calcMass * 0.15) - (calcDist * 2)).toFixed(1)
  );

  const handleCopyReport = (reportText) => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    playClick();
    addNotification("Simulation report copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getThemeStyles = () => {
    switch (themeMode) {
      case 'academic':
        return {
          border: 'border-slate-800',
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-600 hover:bg-emerald-500',
          badge: 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40',
          input: 'border-slate-800 focus:border-emerald-500'
        };
      case 'classified':
        return {
          border: 'border-cyber-amber/20',
          accent: 'text-cyber-amber',
          accentBg: 'bg-cyber-amber text-black hover:bg-cyber-amber/90',
          badge: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30',
          input: 'border-cyber-amber/20 focus:border-cyber-amber'
        };
      case 'sci-fi':
      default:
        return {
          border: 'border-cyber-blue/15',
          accent: 'text-cyber-blue',
          accentBg: 'bg-cyber-blue text-black hover:bg-cyber-blue/90',
          badge: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/25',
          input: 'border-cyber-blue/10 focus:border-cyber-blue'
        };
    }
  };

  const theme = getThemeStyles();

  // Construct report details
  const timestamp = new Date().toUTCString();
  const reportString = `------------------------------------------------------------
ANTIGRAVITY SIMULATION & PROPULSION CORE REPORT
DOCUMENT STATUS: CLASSIFIED - PROJECT WINTERHAVEN
GENERATED ON: ${timestamp}
------------------------------------------------------------

[1] SIMULATION PARAMETERS
- Core Mass Load:       ${calcMass} kg
- Desired Lift Thrust:  ${calcLift} N
- Operational Altitude:  ${calcDist} m
- Resonance Frequency:  ${calcFreq} Hz
- Target Resonance:     ${localTargetFrequency} Hz
- Frequency Alignment:   ${(resonanceFactor * 100).toFixed(1)}% Coherence

[2] COMPUTED PROPULSION METRICS
- Required Neg Energy:  ${requiredEnergy} eV
- Projected Power Draw: ${projectedPower} GW
- Lift Status Assess:   ${resonanceFactor > 0.8 && requiredEnergy > 100 ? 'STABLE LEVITATION' : 'HIGH INSTABILITY RISK'}

[3] CORE SYSTEMS WARPING ASSESSMENT
- GMI warping index:    ${gmi} G₀
- Live Core Stability:  ${stability}%
- Power Draw (System):  ${power} GW

AUTHENTICATED BY: ADVANCED ANTIGRAVITY QUANTUM NETWORK
------------------------------------------------------------`;

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto h-full max-h-screen select-none">
      
      {/* Column 1: Propulsion Inputs & Calculator */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-dark/40 p-5 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-cyber-blue" />
              Theoretical Propulsion Solver
            </h2>
            <span className="text-[9px] text-gray-500 font-mono">SOLVER v4.1</span>
          </div>

          <div className="space-y-4">
            
            {/* Input grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mass Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Mass Load (kg)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={calcMass}
                  onChange={(e) => setCalcMass(Math.max(10, parseInt(e.target.value) || 10))}
                  className={`w-full bg-black/60 border rounded p-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.input}`}
                />
              </div>

              {/* Lift Force Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Desired Lift (Newtons)</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={calcLift}
                  onChange={(e) => setCalcLift(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full bg-black/60 border rounded p-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.input}`}
                />
              </div>

              {/* Distance Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Distance Altitude (meters)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={calcDist}
                  onChange={(e) => setCalcDist(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full bg-black/60 border rounded p-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.input}`}
                />
              </div>

              {/* Frequency Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Resonance Frequency (Hz)</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={calcFreq}
                  onChange={(e) => setCalcFreq(Math.max(10, parseInt(e.target.value) || 10))}
                  className={`w-full bg-black/60 border rounded p-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50 ${theme.input}`}
                />
              </div>

            </div>

            {/* Sync button to load active values from sandbox */}
            <button
              onClick={() => { setCalcMass(simMass); setCalcDist(simDist); setCalcFreq(simFreq); playClick(); addNotification("Loaded current simulation parameters into calculator."); }}
              className="text-[9px] text-gray-500 hover:text-white uppercase tracking-widest border border-gray-800 px-2 py-1 rounded w-fit self-start transition-colors"
            >
              Sync Current Simulation Parameters
            </button>

            {/* Mathematical Step-by-Step Solver */}
            <div className="mt-6 border-t border-gray-900 pt-4 space-y-2.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Calculations Breakdown</span>
              <div className="bg-[#020204] border border-gray-900 rounded p-3 text-[10px] font-mono space-y-1.5 text-gray-400">
                <div>1. Gravity Downward Force: <span className="text-white">{`\\(F_g = ${calcMass} \\cdot 9.81 \\text{ m/s}^2 = ${(calcMass * 9.81).toFixed(1)} \\text{ N}\\)`}</span></div>
                <div>2. Ideal Resonance Peak: <span className="text-white">{`\\(f_{res} = 3.5 \\cdot ${calcMass} + 14 \\cdot ${calcDist} = ${localTargetFrequency} \\text{ Hz}\\)`}</span></div>
                <div>3. Wave Alignment Factor: <span className={`font-semibold ${resonanceFactor > 0.8 ? 'text-cyber-green' : 'text-cyber-amber'}`}>{`\\(\\eta_{wave} = ${resonanceFactor} \\ (${(resonanceFactor*100).toFixed(1)}\\%)\\)`}</span></div>
                <div>4. Distance Attenuation Squared: <span className="text-white">{`\\(d^2 = ${calcDist * calcDist} \\text{ m}^2\\)`}</span></div>
                <div className="border-t border-gray-900 pt-1.5 mt-1.5 text-xs">
                  Required Neg Energy: <span className={`font-bold ${theme.accent}`}>{`\\(E_{req} = \\frac{${calcLift} \\cdot ${calcDist * calcDist}}{12 \\cdot ${resonanceFactor}} = ${requiredEnergy} \\text{ eV}\\)`}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sync into Sandbox button */}
        <div className="mt-8">
          <button
            onClick={() => { setShowReport(true); playClick(); }}
            className={`w-full py-2.5 rounded font-orbitron font-bold text-xs tracking-widest transition-all duration-200 ${theme.accentBg}`}
          >
            GENERATE SIMULATION REPORT
          </button>
        </div>

      </div>

      {/* Column 2: Calculated Outputs & Report Viewer */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-obsidian/75 p-5 flex flex-col justify-between relative`}>
        
        {/* Results Card */}
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyber-blue" />
              System Power Projection
            </h2>
            <span className="text-[9px] text-gray-500 font-mono">OUTPUT TELEMETRY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Required Energy Card */}
            <div className="border border-gray-900 bg-gray-950/80 p-4 rounded text-center space-y-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Required Energy Field</span>
              <span className={`text-3xl font-orbitron font-black ${theme.accent}`}>{requiredEnergy} eV</span>
              <span className="text-[10px] text-gray-500 block">Negative energy charge</span>
            </div>

            {/* Projected Power Card */}
            <div className="border border-gray-900 bg-gray-950/80 p-4 rounded text-center space-y-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Projected Grid Power</span>
              <span className="text-3xl font-orbitron font-black text-white">{projectedPower} GW</span>
              <span className="text-[10px] text-gray-500 block">Estimated generator draw</span>
            </div>

          </div>

          {/* Resonance warnings */}
          {resonanceFactor < 0.6 && (
            <div className="mt-6 p-3 rounded border border-cyber-red/30 bg-cyber-red/5 text-[11px] text-cyber-red flex items-start gap-2 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>DANGER: Low Wave Alignment ({(resonanceFactor*100).toFixed(1)}%).</strong> 
                The current frequency ({calcFreq} Hz) deviates significantly from the target resonance peak ({localTargetFrequency} Hz). This inefficiency requires extreme power grid draw ({projectedPower} GW) and risks capacitor breakdown.
              </span>
            </div>
          )}

          {resonanceFactor >= 0.9 && (
            <div className="mt-6 p-3 rounded border border-cyber-green/30 bg-cyber-green/5 text-[11px] text-cyber-green flex items-start gap-2 font-mono">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>COHERENT RESONANCE LOCK ({(resonanceFactor*100).toFixed(1)}%).</strong> 
                The frequency configuration matches the gravitational lattice load. Wave attenuation is optimal. Required negative energy is minimized.
              </span>
            </div>
          )}

        </div>

        {/* Diagnostic info at bottom */}
        <div className="mt-8 border-t border-gray-900 pt-4 text-[10px] font-mono text-gray-500 leading-relaxed">
          <p>This calculator processes classical and relativistic metric forces: Casimir plate separation, asymmetric electrostatic lift, and quantum vacuum drag tensors. Use calculated settings in the Theoretical Hub to verify levitation coefficients.</p>
        </div>

      </div>

      {/* Floating Report Modal Overlay */}
      {showReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`cyber-panel border ${theme.border} bg-cyber-obsidian w-full max-w-xl p-5 space-y-4`}>
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <span className="font-orbitron text-xs font-bold tracking-widest text-white uppercase">Generated Classified Telemetry Report</span>
              <button 
                onClick={() => setShowReport(false)}
                className="text-gray-500 hover:text-white text-xs font-mono border border-gray-800 px-1.5 py-0.5 rounded"
              >
                CLOSE [ESC]
              </button>
            </div>

            <pre className="bg-black text-[10px] p-4 border border-gray-900 rounded font-mono text-cyber-green select-all leading-relaxed whitespace-pre overflow-x-auto max-h-[300px] scrollbar-thin">
              {reportString}
            </pre>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyReport(reportString)}
                className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded font-mono text-xs flex items-center justify-center gap-2 border border-gray-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-cyber-green" /> : <Copy className="w-4 h-4" />}
                {copied ? "COPIED TO CLIPBOARD" : "COPY TELEMETRY TEXT"}
              </button>

              <button
                onClick={handlePrint}
                className={`py-2 px-4 rounded font-mono text-xs flex items-center justify-center gap-2 transition-all ${theme.badge} hover:text-white`}
              >
                <Printer className="w-4 h-4" />
                PRINT / PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calculator;
