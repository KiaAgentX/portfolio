import React from 'react';
import { 
  Activity, 
  Atom, 
  History, 
  Calculator, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  ShieldAlert, 
  Cpu,
  Power
} from 'lucide-react';
import { SimulationMode } from '../types';

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  simulationMode: SimulationMode;
  powerOnline: boolean;
  setPowerOnline: (online: boolean) => void;
  quantumNetworkConnected: boolean;
}

export default function Sidebar({
  currentModule,
  setCurrentModule,
  sidebarOpen,
  setSidebarOpen,
  simulationMode,
  powerOnline,
  setPowerOnline,
  quantumNetworkConnected,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Control Center', icon: Activity, desc: 'Telemetry & Presets' },
    { id: 'sandbox', label: 'Theoretical Sandbox', icon: Atom, desc: 'Physics Simulator' },
    { id: 'archives', label: 'Classified Archives', icon: History, desc: 'Documentaries & Blueprints' },
    { id: 'calculator', label: 'Propulsion Calculator', icon: Calculator, desc: 'Formulas & Reports' },
    { id: 'settings', label: 'Settings & Export', icon: Sliders, desc: 'Modes & JSON Deployment' },
  ];

  return (
    <aside 
      className={`relative flex flex-col bg-[#080809] border-r border-[#18181b] transition-all duration-300 ease-in-out select-none
        ${sidebarOpen ? 'w-64 sm:w-72' : 'w-16 sm:w-20'} 
      `}
    >
      {/* Platform Header */}
      <div className="p-6 border-b border-[#18181b] space-y-1">
        {sidebarOpen ? (
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#00ff88] rounded-full shadow-[0_0_8px_#00ff88]"></div>
              <span className="text-[#00ff88] font-bold text-sm tracking-[0.2em] uppercase font-sans">Gravitas-X</span>
            </div>
            <div className="text-[9px] text-[#52525b] uppercase font-mono tracking-tighter">
              {simulationMode === 'classified' ? 'Neural Research Sector VIII' : 'Neural Research Node: 042-S-5'}
            </div>
          </div>
        ) : (
          <div className="mx-auto block">
            <div className="w-3 h-3 bg-[#00ff88] rounded-full shadow-[0_0_8px_#00ff88] mx-auto animate-pulse"></div>
          </div>
        )}

        {/* Toggle Collapse Button on Desktop */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-6 -right-3 p-1 rounded-full border border-[#18181b] bg-[#080809] hover:bg-[#111113] text-[#71717a] hover:text-[#00d4ff] transition-colors duration-200 z-50 cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Connection Indicator Area */}
      {sidebarOpen && (
        <div className="px-5 py-4 m-4 rounded bg-[#0c0c0e] border border-[#18181b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-[#71717a] uppercase">
              Quantum Link
            </span>
            <span className={`font-mono text-[9px] font-bold uppercase ${quantumNetworkConnected ? 'text-[#00ff88]' : 'text-rose-500'}`}>
              {quantumNetworkConnected ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="h-1 bg-[#18181b] rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-500 rounded-full
                ${quantumNetworkConnected ? 'bg-[#00ff88] shadow-[0_0_5px_#00ff88]' : 'bg-red-500/20'}
              `}
              style={{ width: quantumNetworkConnected ? '75%' : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`w-full flex items-center rounded-sm p-3 transition-all duration-155 group cursor-pointer text-[11px] uppercase tracking-wider font-medium text-left
                ${isActive 
                  ? 'bg-[#111113] text-[#00d4ff] border-l-2 border-[#00d4ff]'
                  : 'text-[#71717a] hover:bg-[#111113] hover:text-slate-300 border-l-2 border-transparent'
                }
              `}
            >
              <Icon 
                size={16} 
                className={`flex-shrink-0 mr-3 transition-transform duration-150
                  ${isActive ? 'text-[#00d4ff]' : 'text-[#71717a] group-hover:text-slate-400'}
                `} 
              />
              
              {sidebarOpen && (
                <div className="overflow-hidden leading-tight">
                  <p className="font-sans text-xs tracking-wider">
                    {item.label}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Main Reactor Power Area */}
      <div className="p-4 border-t border-[#18181b]">
        <button
          onClick={() => setPowerOnline(!powerOnline)}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-sm font-mono text-xs font-bold transition-all duration-200 cursor-pointer border
            ${powerOnline 
              ? 'bg-[#111113]/85 text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_12px_rgba(0,255,136,0.06)] hover:bg-[#00ff88]/10' 
              : 'bg-[#0c0c0e] text-[#71717a] border-[#18181b] hover:bg-[#111113]'}
          `}
        >
          <Power size={14} className={powerOnline ? 'animate-pulse text-[#00ff88]' : ''} />
          {sidebarOpen ? (
            <span className="tracking-widest uppercase text-[10px]">{powerOnline ? 'REACTOR ON' : 'SYS STANDBY'}</span>
          ) : (
            <span>{powerOnline ? 'ON' : 'OFF'}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
