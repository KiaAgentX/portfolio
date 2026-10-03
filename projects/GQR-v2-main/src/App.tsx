import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  Layers, 
  Cpu, 
  BookOpen, 
  ShieldCheck, 
  Menu, 
  X,
} from 'lucide-react';

import AgentSimulator from './components/AgentSimulator';
import IndicatorExplorer from './components/IndicatorExplorer';
import BacktestEngine from './components/BacktestEngine';
import CodebaseExplorer from './components/CodebaseExplorer';
import QuickStartGuide from './components/QuickStartGuide';

const VALID_TABS = ['arena', 'indicators', 'backtest', 'codebase', 'roadmap'] as const;
type TabId = (typeof VALID_TABS)[number];

function tabFromHash(): TabId {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (VALID_TABS as readonly string[]).includes(h) ? (h as TabId) : 'arena';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(tabFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latency, setLatency] = useState(12);
  const [activeFeeds, setActiveFeeds] = useState(3);

  // Small background tick updates for live diagnostic visual feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1;
        return Math.max(8, Math.min(18, prev + diff));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Deep-linkable tabs (#/arena, #/indicators, ...) — shareable and back-button safe
  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
  }, [activeTab]);

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const menuItems = [
    { id: 'arena', label: 'Inference Arena', icon: Zap, subtitle: 'RL Agent Simulator' },
    { id: 'indicators', label: 'Indicator Toolkit', icon: Layers, subtitle: '14 GQR indicators code' },
    { id: 'backtest', label: 'Event Backtester', icon: TrendingUp, subtitle: 'Monte Carlo simulations' },
    { id: 'codebase', label: 'System Codebase', icon: Cpu, subtitle: 'Core file analyzer' },
    { id: 'roadmap', label: 'Roadmap Manual', icon: BookOpen, subtitle: 'License & Quick-Start' }
  ] as const;

  return (
    <div className="min-h-screen bg-canvas-dark text-[#d1d1d1] font-sans antialiased selection:bg-brand-orange/10 selection:text-brand-orange">
      
      {/* Top Banner Status Bar */}
      <header className="bg-panel-dark border-b border-border-medium sticky top-0 z-55 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-border-dark rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center glow-orange-sm">
              <span className="text-black font-extrabold text-xs">GQR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono text-brand-orange font-bold tracking-widest leading-none">INSTITUTIONAL V3.3</span>
              <span className="text-[10px] opacity-50 mt-0.5 leading-none">REINFORCEMENT LEARNING ENGINE</span>
            </div>
          </div>
        </div>

        {/* Global state registers (Anti-AI-Slop, Clean, human Diagnostic indicators) */}
        <div className="hidden sm:flex items-center gap-6 text-[10.5px] font-mono text-zinc-500">
          <div className="flex items-center gap-2 border-r border-border-dark pr-4">
            <span className="h-2 w-2 rounded-full bg-green-500 glow-green"></span>
            <span>SYSTEM STATE: <span className="text-green-500 font-bold">ONLINE</span></span>
          </div>
          <div className="flex items-center gap-2 border-r border-border-dark pr-4">
            <span className="text-zinc-500">INF LATENCY:</span>
            <span className="text-zinc-400">{latency}ms</span>
          </div>
          <div className="flex items-center gap-2 border-r border-border-dark pr-4">
            <span className="text-zinc-500">ACTIVE CHANNELS:</span>
            <span className="text-zinc-400">{activeFeeds} Feeds</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>AUDIT CHAIN SECURE</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-4.1rem)]">

        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex w-72 bg-[#050505] border-r border-border-dark flex-col p-4 shrink-0 justify-between">
          <div className="space-y-6">
            
            <div className="p-4 rounded-xl bg-panel-dark border border-border-dark flex flex-col gap-1 select-none">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Registered License</span>
              <span className="text-zinc-200 font-bold text-sm truncate">VIP: NexusDigitalArtShop</span>
              <span className="text-[9.5px] font-mono text-brand-orange tracking-wider font-semibold">GQR LEVEL-3 ACCESS</span>
            </div>

            <nav className="space-y-1">
              <span className="text-[9.5px] font-mono text-zinc-600 uppercase tracking-widest block ml-3 mb-2 font-bold">NAVIGATION TERMINAL</span>
              {menuItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-sans relative text-left cursor-pointer ${
                      isSelected
                        ? 'bg-brand-orange/5 text-brand-orange border-l-[3.5px] border-brand-orange pl-2.5 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]/30 border-l-[3.5px] border-transparent'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${
                      isSelected ? 'text-brand-orange animate-pulse' : 'text-zinc-600'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] leading-none">{item.label}</span>
                      <span className="text-[9.5px] text-zinc-500 mt-0.5 leading-none">{item.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border-dark pt-4 flex flex-col gap-1 text-[11px] text-zinc-600 font-mono">
            <span className="text-zinc-500 text-[10px]">PREPARED BY</span>
            <span className="text-zinc-400 font-bold text-xs font-sans">Kianoosh Karimi</span>
            <span>GQR Institutional Suite © 2026</span>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Back backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black"
              />
              {/* Sidebar Content drawer */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative flex flex-col w-72 bg-canvas-dark border-r border-border-dark p-5 justify-between h-full z-10"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-border-dark">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-brand-orange" />
                      <span className="font-bold text-zinc-200 font-sans">GQR Interface Menu</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-zinc-400 hover:bg-border-dark rounded-lg cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map(item => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-brand-orange/10 text-brand-orange font-semibold'
                              : 'text-zinc-400 hover:bg-[#1a1a1a]/40'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm">{item.label}</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">{item.subtitle}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="text-[11px] text-zinc-600 font-mono border-t border-border-dark pt-4">
                  <p className="text-zinc-500 text-[10px]">SYSTEM DESIGNER</p>
                  <p className="text-zinc-400 font-bold font-sans">Kianoosh Karimi</p>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 bg-grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.20, ease: 'easeOut' }}
              className="w-full"
            >
              {activeTab === 'arena' && <AgentSimulator />}
              {activeTab === 'indicators' && <IndicatorExplorer />}
              {activeTab === 'backtest' && <BacktestEngine />}
              {activeTab === 'codebase' && <CodebaseExplorer />}
              {activeTab === 'roadmap' && <QuickStartGuide />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
