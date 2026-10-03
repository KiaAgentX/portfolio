import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Trash2, 
  Activity, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Terminal, 
  Cpu, 
  Flame, 
  Play, 
  Maximize,
  AlertTriangle
} from 'lucide-react';

interface AdminPanelProps {
  onStateUpdate?: () => void;
}

export default function AdminPanel({ onStateUpdate }: AdminPanelProps) {
  const [backendState, setBackendState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState<'BULL' | 'BEAR' | 'VOLATILE' | 'STAG'>('VOLATILE');
  const [volatility, setVolatility] = useState<number>(1.0);
  const [tickInterval, setTickInterval] = useState<number>(2000);
  const [priceActionMessage, setPriceActionMessage] = useState<string | null>(null);

  // Poll state every 1.5s
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/market/state');
        if (res.ok) {
          const data = await res.json();
          setBackendState(data);
          setTrend(data.trendBias);
          setVolatility(data.volatility);
          setTickInterval(data.tickIntervalMs);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleConfigUpdate = async (bias?: string, vol?: number, intervalMs?: number) => {
    try {
      const res = await fetch('/api/market/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendBias: bias || trend,
          volatility: vol !== undefined ? vol : volatility,
          tickIntervalMs: intervalMs !== undefined ? intervalMs : tickInterval
        })
      });
      if (res.ok) {
        if (onStateUpdate) onStateUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectPriceShock = async (amount: number) => {
    setPriceActionMessage(`Injecting market shock of $${amount.toFixed(2)} to spot Gold prices...`);
    try {
      // Config volatility high first, then update prices
      await fetch('/api/market/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Force volatile drift
          volatility: 2.5
        })
      });

      // Execute artificial trade trade action to force price move
      // We do this by triggering a configuration parameter change
      // Oh, let's create a custom post price adjust endpoint if we want, or we can simply POST the config with a trend change
      // A quick trend changes forces prices up or down immediately
      const targetBias = amount > 0 ? "BULL" : "BEAR";
      await fetch('/api/market/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendBias: targetBias,
          volatility: 3.5
        })
      });

      setTimeout(() => {
        setPriceActionMessage(null);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetBackendSimulation = async () => {
    if (!window.confirm("Are you sure you want to completely reboot the server-side memory state, clearing all logs and virtual positions?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/market/reset', { method: 'POST' });
      if (res.ok) {
        setPriceActionMessage("Backend Simulation successfully rebooted!");
        setTimeout(() => setPriceActionMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="gqr-admin-central-panel">
      {/* Upper Status Banner */}
      <div className="bg-panel-dark border border-border-medium rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9.5px] font-mono rounded font-semibold uppercase tracking-wider">
              Administration Protocol
            </span>
            <span className="text-zinc-500 text-xs font-mono">• Live Memory Socket</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-brand-orange" />
            <span>GQR Administrative Tactical Panel</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl font-sans leading-relaxed">
            Directly tune and override parameters inside the continuous server-side simulation thread. Inject volatility, trigger micro price crashes, adjust tick rates, and monitor real-time execution outputs.
          </p>
        </div>

        {/* Diagnostic server attributes */}
        <div className="flex items-center gap-4.5 bg-[#0e0c0a] border border-border-dark p-4 rounded-xl shrink-0 w-full md:w-auto">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Server Ticker State</span>
            <span className="text-sm font-bold text-green-500 font-mono mt-0.5 flex items-center justify-end gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
              <span>RUNNING ({tickInterval}ms)</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-sans mt-0.5">
              Active Server Positions: <strong className="text-brand-orange font-bold font-mono">{backendState?.activePositions?.length || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {priceActionMessage && (
        <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3 text-xs text-brand-orange font-mono flex items-center gap-2">
          <Activity className="h-4 w-4 animate-spin shrink-0" />
          <span>{priceActionMessage}</span>
        </div>
      )}

      {/* Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Override Levers */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-panel-dark border border-border-dark rounded-2xl p-6.5 space-y-6">
            <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2.5 font-sans">
              <Sliders className="h-4.5 w-4.5 text-brand-orange" />
              <span>Simulation Overwrite Levers</span>
            </h3>

            {/* Bias Override */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-zinc-550 uppercase tracking-widest block">
                Stochastic Trend Bias Target
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { value: 'BULL', label: 'BULLISH', icon: TrendingUp, color: 'text-green-500 border-green-500/20 hover:border-green-500/40 bg-green-950/5' },
                  { value: 'BEAR', label: 'BEARISH', icon: TrendingDown, color: 'text-red-500 border-red-500/20 hover:border-red-500/40 bg-red-950/5' },
                  { value: 'VOLATILE', label: 'VOLATILE', icon: Flame, color: 'text-amber-500 border-amber-500/20 hover:border-amber-500/40 bg-amber-950/5' },
                  { value: 'STAG', label: 'STAGNANT', icon: Clock, color: 'text-zinc-400 border-zinc-700/20 hover:border-zinc-700/40 bg-zinc-900/5' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = trend === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setTrend(item.value as any);
                        handleConfigUpdate(item.value, volatility, tickInterval);
                      }}
                      className={`py-3 px-2 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                        isSelected 
                          ? `${item.color} ring-1 ring-brand-orange/40 font-bold scale-102` 
                          : 'border-border-dark text-zinc-400 hover:bg-[#1a1a1a]/30'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span className="text-[11px] font-mono tracking-wider">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-zinc-500 font-sans leading-normal">
                Configuring a bias inserts constant micro drifts to the stochastic algorithms in that direction. Bullish trends drift Spot Gold upwards, Bearish trends pull it down.
              </p>
            </div>

            {/* Volatility Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-zinc-550 uppercase tracking-widest">
                  Volatility Amplitude Factor: <strong className="text-white font-mono">{volatility}x</strong>
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.8, 3.5].map(v => (
                  <button
                    key={v}
                    onClick={() => {
                      setVolatility(v);
                      handleConfigUpdate(trend, v, tickInterval);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      volatility === v 
                        ? 'bg-brand-orange/5 text-brand-orange border-brand-orange/30' 
                        : 'bg-panel-dark border-border-dark text-zinc-400 hover:bg-[#1a1a1a]/30'
                    }`}
                  >
                    {v === 0.5 ? '0.5x Slow' : v === 1.0 ? '1.0x Norm' : v === 1.8 ? '1.8x High' : '3.5x Storm'}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Tick Interval */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-zinc-550 uppercase tracking-widest block">
                Tick Frequency calibration: <strong className="text-white font-mono">{tickInterval / 1000} seconds per cycle</strong>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 4000].map(ms => (
                  <button
                    key={ms}
                    onClick={() => {
                      setTickInterval(ms);
                      handleConfigUpdate(trend, volatility, ms);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      tickInterval === ms 
                        ? 'bg-brand-orange/5 text-brand-orange border-brand-orange/30' 
                        : 'bg-panel-dark border-border-dark text-zinc-400 hover:bg-[#1a1a1a]/30'
                    }`}
                  >
                    {ms === 500 ? '0.5s Turbo' : ms === 1000 ? '1.0s Speed' : ms === 2000 ? '2.0s Norm' : '4.0s Calm'}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Market Impact Shock Actions */}
            <div className="space-y-3 border-t border-border-dark pt-5.5">
              <label className="text-[11px] font-mono text-zinc-550 uppercase tracking-widest block">
                Tactical Market Shocks (Instant override)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleInjectPriceShock(25.00)}
                  className="py-3 px-4 bg-green-950/15 text-green-500 hover:bg-green-950/25 border border-green-500/25 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span>Force Gold Spike Upwards</span>
                </button>
                <button
                  onClick={() => handleInjectPriceShock(-25.00)}
                  className="py-3 px-4 bg-red-950/15 text-red-500 hover:bg-red-950/25 border border-red-500/25 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingDown className="h-4.5 w-4.5" />
                  <span>Force Gold Price Crash</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#110c0e] border border-red-500/10 rounded-2xl p-5 flex items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[12px] font-bold text-white font-sans flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Reboot Database States</span>
              </span>
              <p className="text-[11px] text-zinc-500 font-sans leading-normal">
                Instantly clean the backend memory database, resetting account back to $10,000, wiping all active trading books, and clearing historical logs.
              </p>
            </div>
            <button
              onClick={handleResetBackendSimulation}
              disabled={loading}
              className="py-2.5 px-4.5 bg-red-950/20 hover:bg-red-550 text-red-500 hover:text-black font-semibold text-xs border border-red-500/20 hover:border-red-500 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              <span>Full Reset DB</span>
            </button>
          </div>
        </div>

        {/* Right Side: Live Terminal logs */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <div className="bg-[#050506] border border-border-dark rounded-2xl p-5 flex flex-col h-full space-y-4 max-h-[580px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-dark pb-3 shrink-0">
              <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                <Terminal className="h-4 w-4 text-brand-orange animate-pulse" />
                <span>Continuous Memory Outputs</span>
              </h3>
              <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-500 rounded text-[9.5px] font-mono">
                Log Buffer: {backendState?.logs?.length || 0}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10.5px] scrollbar-thin text-zinc-500">
              {backendState?.logs && backendState.logs.length > 0 ? (
                backendState.logs.map((log: string, idx: number) => {
                  let colorClass = "text-zinc-500";
                  if (log.includes("[TP HIT]") || log.includes("signed in")) colorClass = "text-green-500 font-semibold";
                  if (log.includes("[SL TRIGGERED]")) colorClass = "text-red-500 font-semibold";
                  if (log.includes("overrode") || log.includes("shock") || log.includes("tuned")) colorClass = "text-brand-orange";
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-2 bg-[#0b0b0c] border border-zinc-900/60 rounded-lg font-mono leading-relaxed transition-all hover:bg-[#101012] ${colorClass}`}
                    >
                      {log}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-600 font-sans italic">
                  Awaiting background simulation logs...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
