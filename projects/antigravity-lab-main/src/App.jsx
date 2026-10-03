import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sandbox from './components/Sandbox';
import Archives from './components/Archives';
import Calculator from './components/Calculator';
import Settings from './components/Settings';

const MainAppContent = () => {
  const { activeTab, themeMode } = useSimulation();

  // Mode dependent CSS classes
  const getAppClasses = () => {
    switch (themeMode) {
      case 'academic':
        return 'bg-slate-950 text-slate-300 bg-grid-green font-sans';
      case 'classified':
        return 'bg-[#020204] text-cyber-amber bg-grid-amber crt-overlay scanline-amber font-mono';
      case 'sci-fi':
      default:
        return 'bg-[#05070f] text-cyber-text bg-grid-cyber crt-overlay scanline font-mono';
    }
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sandbox':
        return <Sandbox />;
      case 'archives':
        return <Archives />;
      case 'calculator':
        return <Calculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden relative select-none ${getAppClasses()}`}>
      
      {/* Ambient glowing particles or indicators in background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Left Collapsible Navigation Sidebar */}
      <Sidebar />

      {/* Main Simulation View Area */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative z-10 bg-transparent">
        {renderActiveModule()}
      </main>

    </div>
  );
};

function App() {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
}

export default App;
