import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Activity, 
  Sliders, 
  Archive, 
  Calculator, 
  Settings, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Cpu,
  Orbit
} from 'lucide-react';

const Sidebar = () => {
  const { 
    activeTab, 
    handleTabChange, 
    themeMode, 
    isMuted, 
    setIsMuted, 
    playClick,
    gmi,
    stability,
    levitationStatus
  } = useSimulation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper styles based on themeMode
  const getThemeStyles = () => {
    switch (themeMode) {
      case 'academic':
        return {
          border: 'border-slate-800',
          textActive: 'text-emerald-400 bg-slate-800/50',
          textHover: 'hover:text-emerald-300 hover:bg-slate-800/20',
          accent: 'text-emerald-500',
          badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
          glow: ''
        };
      case 'classified':
        return {
          border: 'border-cyber-amber/20',
          textActive: 'text-cyber-amber bg-cyber-amber/10 border-r border-cyber-amber',
          textHover: 'hover:text-cyber-amber/80 hover:bg-cyber-amber/5',
          accent: 'text-cyber-amber',
          badge: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30',
          glow: 'shadow-[0_0_8px_rgba(255,170,0,0.15)]'
        };
      case 'sci-fi':
      default:
        return {
          border: 'border-cyber-blue/15',
          textActive: 'text-cyber-blue bg-cyber-blue/10 border-r-2 border-cyber-blue',
          textHover: 'hover:text-cyber-blue/80 hover:bg-cyber-blue/5',
          accent: 'text-cyber-blue',
          badge: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/30',
          glow: 'shadow-[0_0_10px_rgba(0,240,255,0.25)]'
        };
    }
  };

  const theme = getThemeStyles();

  const menuItems = [
    { id: 'dashboard', name: 'Control Center', icon: Activity },
    { id: 'sandbox', name: 'Theoretical Hub', icon: Sliders },
    { id: 'archives', name: 'Classified Archives', icon: Archive },
    { id: 'calculator', name: 'Propulsion Calc', icon: Calculator },
    { id: 'settings', name: 'System Config', icon: Settings },
  ];

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    playClick();
  };

  return (
    <div 
      className={`h-screen flex flex-col justify-between transition-all duration-300 relative z-30 border-r bg-cyber-obsidian/95 ${theme.border} ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top Header */}
      <div>
        <div className={`p-4 flex items-center justify-between border-b ${theme.border}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 select-none">
              <Orbit className={`w-6 h-6 animate-spin-slow ${theme.accent}`} />
              <div className="flex flex-col">
                <span className="font-orbitron font-black text-sm tracking-wider text-white">ANTIGRAVITY</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Research Lab</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <Orbit className={`w-8 h-8 mx-auto animate-spin-slow ${theme.accent}`} />
          )}

          {!isCollapsed && (
            <button 
              onClick={() => { setIsCollapsed(true); playClick(); }}
              className="text-gray-500 hover:text-white p-1 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded font-orbitron text-xs tracking-wider transition-all duration-150 ${
                  isActive ? theme.textActive : `text-gray-400 ${theme.textHover}`
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom telemetry & Mute toggle */}
      <div className="p-3 border-t border-inherit">
        {/* Real-time telemetry summary widget inside sidebar */}
        {!isCollapsed && (
          <div className={`mb-4 p-3 rounded-lg border text-[10px] space-y-2 bg-cyber-bg/30 ${theme.badge}`}>
            <div className="flex justify-between items-center border-b border-gray-800 pb-1">
              <span className="text-gray-500 font-bold uppercase tracking-wider">Telemetry Link</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GMI:</span>
              <span className="font-bold">{gmi} / 5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">STABILITY:</span>
              <span className={`font-bold ${stability < 50 ? 'text-cyber-red animate-pulse' : ''}`}>{stability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LEV. CORE:</span>
              <span className={`font-bold ${
                levitationStatus === 'STABLE' ? 'text-cyber-green' : levitationStatus === 'UNSTABLE' ? 'text-cyber-amber' : 'text-cyber-red'
              }`}>{levitationStatus}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleMuteToggle}
            className="p-2 text-gray-500 hover:text-white rounded transition-colors"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyber-blue" />}
          </button>

          {isCollapsed ? (
            <button 
              onClick={() => { setIsCollapsed(false); playClick(); }}
              className="text-gray-500 hover:text-white p-1 mx-auto rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-semibold select-none">
              <Cpu className="w-3.5 h-3.5" />
              <span>Q-NET v1.0.8</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
