import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  Layers, 
  Cpu, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Menu, 
  X,
  FileCheck,
  Coins,
  Sliders,
  Sparkles,
  Flame,
  Rocket,
  LogOut
} from 'lucide-react';

import AgentSimulator from './components/AgentSimulator';
import IndicatorExplorer from './components/IndicatorExplorer';
import BacktestEngine from './components/BacktestEngine';
import CodebaseExplorer from './components/CodebaseExplorer';
import QuickStartGuide from './components/QuickStartGuide';
import LoginGate from './components/LoginGate';
import AdminPanel from './components/AdminPanel';
import UxAuditForge from './components/UxAuditForge';
import ElonGrokCouncil from './components/ElonGrokCouncil';
import GqrTimeline from './components/GqrTimeline';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [grokTheme, setGrokTheme] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'arena' | 'indicators' | 'backtest' | 'codebase' | 'roadmap' | 'xai_grok' | 'uxforge' | 'admin'>('arena');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latency, setLatency] = useState(12);
  const [activeFeeds, setActiveFeeds] = useState(3);
  
  const [marketState, setMarketState] = useState<any>({
    goldPrice: 2585.50,
    eurusdPrice: 1.0850,
    dxyPrice: 101.90,
    balance: 10000.00,
    equity: 10000.00,
    activePositions: [],
    trendBias: 'VOLATILE',
    volatility: 1.0,
    history: []
  });

  // Check existing session & theme preference
  useEffect(() => {
    const token = localStorage.getItem('gqr_auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    const isGrok = localStorage.getItem('gqr_grok_mode_active');
    if (isGrok === 'true') {
      setGrokTheme(true);
    }
  }, []);

  const handleToggleGrokTheme = () => {
    const nextVal = !grokTheme;
    setGrokTheme(nextVal);
    localStorage.setItem('gqr_grok_mode_active', String(nextVal));
  };

  // Sync real-time global server-synchronous polling loop
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    const fetchGlobalState = async () => {
      try {
        const res = await fetch('/api/market/state');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setMarketState(data);
            setLatency(Math.floor(10 + Math.random() * 6));
            setActiveFeeds(3 + (data.activePositions?.length || 0));
          }
        }
      } catch (err) {
        console.warn("Telemetry global check bypassed.");
      }
    };

    fetchGlobalState();
    const stateInterval = setInterval(fetchGlobalState, 1500);

    return () => {
      active = false;
      clearInterval(stateInterval);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('gqr_auth_token');
    setIsAuthenticated(false);
  };

  const menuItems = [
    { id: 'arena', label: 'Inference Arena', icon: Zap, subtitle: 'RL Agent Simulator' },
    { id: 'indicators', label: 'Indicator Toolkit', icon: Layers, subtitle: '14 GQR indicators code' },
    { id: 'backtest', label: 'Event Backtester', icon: TrendingUp, subtitle: 'Monte Carlo simulations' },
    { id: 'codebase', label: 'System Codebase', icon: Cpu, subtitle: 'Core file analyzer' },
    { id: 'roadmap', label: 'Roadmap Manual', icon: BookOpen, subtitle: 'License & Quick-Start' },
    { id: 'xai_grok', label: 'xAI Grok Reactor', icon: Flame, subtitle: 'Elon Mode & Cybernetics' },
    { id: 'uxforge', label: 'UX Audit Forge', icon: Sparkles, subtitle: '100 diagnostic rules' },
    { id: 'admin', label: 'Admin Controller', icon: Sliders, subtitle: 'Direct server overrides' }
  ] as const;

  // Render Login Gate if unauthenticated
  if (!isAuthenticated) {
    return <LoginGate onLoginSuccess={(token) => {
      localStorage.setItem('gqr_auth_token', token);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className={`min-h-screen text-[#d1d1d1] font-sans antialiased selection:text-black transition-colors duration-300 ${
      grokTheme 
        ? 'bg-[#030304] text-cyan-50 selection:bg-cyan-400' 
        : 'bg-canvas-dark text-[#d1d1d1] selection:bg-brand-orange'
    }`}>
      
      {/* Top Banner Status Bar */}
      <header className={`border-b sticky top-0 z-50 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors duration-300 ${
        grokTheme ? 'bg-[#08080a] border-cyan-500/20' : 'bg-panel-dark border-border-medium'
      }`}>
        <div className="flex items-center gap-2.5">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-border-dark rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              grokTheme 
                ? 'bg-gradient-to-br from-cyan-400 to-[#10b981] shadow-lg shadow-cyan-400/20' 
                : 'bg-gradient-to-br from-brand-orange to-brand-orange-dark glow-orange-sm'
            }`}>
              <span className="text-black font-extrabold text-xs">GQR</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-mono font-bold tracking-widest leading-none ${grokTheme ? 'text-cyan-400' : 'text-brand-orange'}`}>
                {grokTheme ? '𝕏_GQR NEURAL CORE' : 'GQR INSTITUTIONAL V3.3'}
              </span>
              <span className="text-[10px] opacity-50 mt-0.5 leading-none">REINFORCEMENT LEARNING ENGINE</span>
            </div>
          </div>
        </div>

        {/* Global Live Tickers Integration */}
        <div className="hidden xl:flex items-center gap-5 bg-[#07070a]/80 border border-zinc-850 px-4 py-1.5 rounded-xl text-[10.5px] font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">SPOT GOLD:</span>
            <span className={`font-bold transition-all ${grokTheme ? 'text-cyan-400 animate-pulse' : 'text-brand-orange animate-pulse'}`}>
              ${marketState.goldPrice?.toFixed(2) || '2341.60'}
            </span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">EURUSD:</span>
            <span className="text-zinc-200 font-bold">${marketState.eurusdPrice?.toFixed(4) || '1.0850'}</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">DXY:</span>
            <span className="text-zinc-200 font-bold">{marketState.dxyPrice?.toFixed(2) || '104.15'}</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">EQUITY:</span>
            <span className={`font-bold ${marketState.equity >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
              ${marketState.equity?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '10,000.00'}
            </span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">BIAS:</span>
            <span className={`font-extrabold px-1 py-0.5 rounded text-[8.5px] ${
              marketState.trendBias === 'BULL' ? 'text-green-400 bg-green-500/10' : 
              marketState.trendBias === 'BEAR' ? 'text-red-400 bg-red-500/10' : 
              'text-yellow-400 bg-yellow-500/10'
            }`}>{marketState.trendBias}</span>
          </div>
        </div>

        {/* Global Controls & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Grok Theme Switch */}
          <button
            onClick={handleToggleGrokTheme}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight transition-all border shrink-0 cursor-pointer flex items-center gap-1.5 ${
              grokTheme 
                ? 'bg-cyan-505/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Rocket className={`h-3.5 w-3.5 ${grokTheme ? 'rotate-45' : ''} transition-transform duration-500 text-cyan-400`} />
            <span className="hidden sm:inline">{grokTheme ? "𝕏 GROK MODE ACTIVE" : "ACTIVATE 𝕏 GROK"}</span>
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg cursor-pointer transition-all"
            title="Secure Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-4.1rem)]">

        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex w-72 bg-[#050505] border-r border-border-dark flex-col p-4 shrink-0 justify-between">
          <div className="space-y-6">
            
            <div className={`p-4 rounded-xl border flex flex-col gap-1 select-none transition-all ${
              grokTheme ? 'bg-[#080c10] border-cyan-500/20' : 'bg-panel-dark border-border-dark'
            }`}>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Registered License</span>
              <span className="text-zinc-200 font-bold text-sm truncate">VIP: NexusDigitalArtShop</span>
              <span className={`text-[9.5px] font-mono tracking-wider font-semibold ${grokTheme ? 'text-cyan-400' : 'text-brand-orange'}`}>
                {grokTheme ? '𝕏 UNLIMITED ACCESS ACTIVE' : 'GQR LEVEL-3 ACCESS'}
              </span>
            </div>

            <nav className="space-y-1">
              <span className="text-[9.5px] font-mono text-zinc-650 uppercase tracking-widest block ml-3 mb-2 font-boldScale">NAVIGATION TERMINAL</span>
              {menuItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-sans relative text-left cursor-pointer ${
                      isSelected
                        ? grokTheme
                          ? 'bg-cyan-500/5 text-cyan-400 border-l-[3.5px] border-cyan-400 pl-2.5 font-semibold'
                          : 'bg-brand-orange/5 text-brand-orange border-l-[3.5px] border-brand-orange pl-2.5 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]/30 border-l-[3.5px] border-transparent'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${
                      isSelected 
                        ? grokTheme ? 'text-cyan-400 animate-pulse' : 'text-brand-orange animate-pulse'
                        : 'text-zinc-600'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] leading-none">{item.label}</span>
                      <span className="text-[9.5px] text-zinc-500 mt-0.5 leading-none">{item.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* SaaS Promotional Checkout Card (Optimized for Software Sales) */}
            <div className="bg-[#110d0a] border border-[#f27d26]/25 rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden mt-4 shadow-xl">
              <div className="absolute top-0 right-0 h-16 w-16 bg-[#f27d26]/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-brand-orange text-black font-extrabold text-[9px] uppercase tracking-widest rounded-md">
                  HOT OFFER
                </span>
                <span className="text-[10px] font-mono text-[#f27d26] font-bold">COMMERCIAL PASS AVAILABLE</span>
              </div>
              
              <div>
                <h4 className="text-[13px] font-bold text-zinc-150 font-sans leading-tight">Unlock Infinite Real-Broker Live Executions</h4>
                <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-normal">
                  Connect live MetaTrader 5 (MT5) or cTrader endpoints. Bypass Sandbox limitations and operate real capital.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span className="h-1 w-1 bg-brand-orange rounded-full"></span>
                  <span>Zero lag dedicated server feeds</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span className="h-1 w-1 bg-brand-orange rounded-full"></span>
                  <span>Institutional Risk Overwatches</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#f27d26] font-bold font-mono">
                  <span>SPECIAL VIP DISCOUNT ACTIVE</span>
                </div>
              </div>

              <a
                href="https://t.me/NexusDigitalArtShop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:from-brand-orange-light hover:to-brand-orange text-black font-bold text-center text-xs rounded-xl shadow-lg shadow-brand-orange/10 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Get Full Lifetime License</span>
              </a>
            </div>

          </div>

          <div className="border-t border-border-dark pt-4 flex flex-col gap-1 text-[11px] text-zinc-650 font-mono">
            <span className="text-zinc-550 text-[10px]">PREPARED BY</span>
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
                id="mobile-drawer-backdrop"
              />
              {/* Sidebar Content drawer */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`relative flex flex-col w-72 p-5 justify-between h-full z-10 border-r ${
                  grokTheme ? 'bg-[#060608] border-cyan-500/20' : 'bg-canvas-dark border-border-dark'
                }`}
                id="mobile-drawer-container"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-border-dark">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-5 w-5 ${grokTheme ? 'text-cyan-455' : 'text-brand-orange'}`} />
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
                              ? grokTheme
                                ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                                : 'bg-brand-orange/10 text-brand-orange font-semibold'
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

                  {/* Mobile Premium Sales CTA */}
                  <div className="bg-[#110d0a] border border-[#f27d26]/25 rounded-xl p-3.5 space-y-2 relative overflow-hidden mt-2">
                    <p className="text-[10px] font-mono text-[#f27d26] font-bold">COMMERCIAL LICENSE</p>
                    <p className="text-[11px] text-zinc-300 font-sans leading-tight">Unlock MT5/cTrader live brokers execution.</p>
                    <a
                      href="https://t.me/NexusDigitalArtShop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-brand-orange text-black font-bold text-center text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs"
                    >
                      <Coins className="h-3 w-3" />
                      <span>Upgrade Plan</span>
                    </a>
                  </div>

                </div>

                <div className="text-[11px] text-zinc-650 font-mono border-t border-border-dark pt-4">
                  <p className="text-zinc-550 text-[10px]">SYSTEM DESIGNER</p>
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
              {activeTab === 'xai_grok' && (
                <div className="space-y-6" id="grok-hub-panel">
                  {/* Elon Grok Council live board */}
                  <ElonGrokCouncil 
                    goldPrice={marketState.goldPrice}
                    rsi={marketState.history?.length > 0 ? marketState.history[marketState.history.length - 1].rsi : 53.4}
                    equity={marketState.equity}
                    drawdown={marketState.equity < 10000 ? parseFloat((((10000 - marketState.equity) / 10000) * 100).toFixed(2)) : 0.0}
                    winRate={73.2}
                    loss={0.031}
                    activePositionsCount={marketState.activePositions?.length || 0}
                  />

                  {/* Physics-first Elon principles bento */}
                  <div className={`border rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300 ${
                    grokTheme ? 'bg-[#08080a] border-cyan-500/20' : 'bg-panel-dark border-border-medium'
                  }`} id="elon-axioms-card">
                    <div className="absolute top-0 right-0 h-44 w-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-cyan-400 animate-pulse" />
                      <span>xAI Cybernetic Axioms: High-Leverage Physics</span>
                    </h3>
                    <p className="text-zinc-400 text-xs font-sans mt-2.5 leading-relaxed">
                      "First-principles thinking is basically physics. You boil things down to their absolute fundamental truths and reason up from there, as opposed to reasoning by analogy." — <strong className="text-white">Elon Musk</strong>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 mt-6">
                      <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl space-y-1.5 hover:border-cyan-500/35 transition-all">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Rule #1: Mass Reduction</span>
                        <span className="text-xs text-zinc-350 font-sans block leading-relaxed">
                          Eliminate any indicator variable that doesn't hold physical predictive weight. Simpler networks avoid overfitting.
                        </span>
                      </div>
                      <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl space-y-1.5 hover:border-cyan-500/35 transition-all">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Rule #2: Thermal Limits</span>
                        <span className="text-xs text-zinc-350 font-sans block leading-relaxed">
                          Define precise Stop-Loss boundaries according to gold's atomic volatility. Never gamble orbit heights.
                        </span>
                      </div>
                      <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl space-y-1.5 hover:border-cyan-500/35 transition-all">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Rule #3: Iteration Frequency</span>
                        <span className="text-xs text-zinc-350 font-sans block leading-relaxed">
                          Optimize weights continuously inside the sandbox. Autopilots are only as good as the incoming telemetry frequency.
                        </span>
                      </div>
                    </div>

                    {/* Integrated Horizontal Release Roadmap Timeline component */}
                    <GqrTimeline />
                  </div>
                </div>
              )}
              {activeTab === 'uxforge' && <UxAuditForge />}
              {activeTab === 'admin' && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
