import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PhysicsSandbox from './components/PhysicsSandbox';
import ClassifiedArchives from './components/ClassifiedArchives';
import PropulsionCalculator from './components/PropulsionCalculator';
import SettingsExport from './components/SettingsExport';

import { SimulationMode, ActivePreset, SimulationVariables } from './types';
import { PRESET_VARIABLES } from './constants';
import { ShieldAlert, Terminal, EyeOff, Radio } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('scifi');
  const [activePreset, setActivePreset] = useState<ActivePreset>('electrogravitics');
  
  // High-fidelity synchronized variables across all modules!
  const [variables, setVariables] = useState<SimulationVariables>({
    ...PRESET_VARIABLES.electrogravitics
  });

  // Power configurations
  const [powerOnline, setPowerOnline] = useState<boolean>(true);
  const [quantumNetworkConnected, setQuantumNetworkConnected] = useState<boolean>(true);

  // Auto-collapse sidebar on smaller mobile viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger once on start
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync quantum connection with main reactor power Online state for fun visual logic
  useEffect(() => {
    if (!powerOnline) {
      setQuantumNetworkConnected(false);
    } else {
      setQuantumNetworkConnected(true);
    }
  }, [powerOnline]);

  // Render active component module
  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return (
          <Dashboard 
            simulationMode={simulationMode}
            variables={variables}
            setVariables={setVariables}
            activePreset={activePreset}
            setActivePreset={setActivePreset}
            powerOnline={powerOnline}
            quantumNetworkConnected={quantumNetworkConnected}
            setQuantumNetworkConnected={setQuantumNetworkConnected}
          />
        );
      case 'sandbox':
        return (
          <PhysicsSandbox 
            simulationMode={simulationMode}
            variables={variables}
            setVariables={setVariables}
            powerOnline={powerOnline}
          />
        );
      case 'archives':
        return (
          <ClassifiedArchives 
            simulationMode={simulationMode}
          />
        );
      case 'calculator':
        return (
          <PropulsionCalculator 
            simulationMode={simulationMode}
            variables={variables}
            powerOnline={powerOnline}
          />
        );
      case 'settings':
        return (
          <SettingsExport 
            simulationMode={simulationMode}
            setSimulationMode={setSimulationMode}
            variables={variables}
            powerOnline={powerOnline}
            quantumNetworkConnected={quantumNetworkConnected}
          />
        );
      default:
        return (
          <Dashboard 
            simulationMode={simulationMode}
            variables={variables}
            setVariables={setVariables}
            activePreset={activePreset}
            setActivePreset={setActivePreset}
            powerOnline={powerOnline}
            quantumNetworkConnected={quantumNetworkConnected}
            setQuantumNetworkConnected={setQuantumNetworkConnected}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex overflow-hidden font-sans select-none sophisticated-bg-gradient bg-[#050505]">
      {/* Sidebar Component */}
      <Sidebar 
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        simulationMode={simulationMode}
        powerOnline={powerOnline}
        setPowerOnline={setPowerOnline}
        quantumNetworkConnected={quantumNetworkConnected}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Classified Alert Ribbon (Only visible in CLASSIFIED MODE) */}
        {simulationMode === 'classified' && (
          <div className="bg-red-950/20 border-b border-rose-950/30 text-rose-400 py-2.5 px-4 font-mono text-[10px] sm:text-xs flex items-center justify-between z-10 select-none tracking-widest animate-pulse">
            <span className="flex items-center gap-1.5 uppercase font-medium">
              <ShieldAlert size={12} className="text-rose-500" /> CLASSIFIED PROTOCOL ACTIVE: ALL LOGS AND ANOMALIES RECORDED
            </span>
            <span className="hidden md:inline font-bold uppercase text-[9px] bg-red-950/40 px-2 py-0.5 rounded border border-red-500/10">
              Clearance Level VIII
            </span>
          </div>
        )}

        {/* Global Standby Ribbon when Reactor goes offline */}
        {!powerOnline && (
          <div className="bg-zinc-950 border-b border-zinc-900 text-amber-500 py-2 px-4 font-mono text-[10px] flex items-center justify-center gap-2 z-10 tracking-widest select-none font-bold uppercase">
            <EyeOff size={12} className="animate-bounce" /> PRIMARY COILS OFFLINE - ANTIGRAV TELEMETRY PAUSED
          </div>
        )}

        {/* Dynamic Inner Module Content */}
        {renderModuleContent()}

        {/* Interactive Floating Status Footer */}
        <footer className="h-10 bg-[#080809] border-t border-[#18181b] px-6 flex items-center justify-between text-[10px] font-mono text-[#71717a] select-none z-10">
          <div className="flex items-center space-x-3">
            <span>TENSOR STATUS:</span>
            <span className={`font-bold uppercase ${powerOnline ? 'text-[#00ff88]' : 'text-[#71717a]'}`}>
              {powerOnline ? 'STABILIZED' : 'INERT_LOCK'}
            </span>
            <span className="text-[#18181b]">|</span>
            <span className="hidden sm:inline">MASS VECTORS COUPLING:</span>
            <span className="hidden sm:inline font-bold text-[#00d4ff]">{variables.mass.toLocaleString()} kg</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>APEX ENGINE STATUS:</span>
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${powerOnline ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-[#71717a]'}`} />
              {powerOnline ? 'ONLINE' : 'LOCKED'}
            </span>
          </div>
        </footer>

      </main>
    </div>
  );
}
