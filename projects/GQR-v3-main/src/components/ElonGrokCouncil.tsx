import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Flame, Send, Globe, ChevronRight, Zap, RefreshCw, Cpu } from 'lucide-react';

interface ElonGrokCouncilProps {
  goldPrice: number;
  rsi: number;
  equity: number;
  drawdown: number;
  winRate: number;
  loss: number;
  activePositionsCount: number;
}

export default function ElonGrokCouncil({
  goldPrice,
  rsi,
  equity,
  drawdown,
  winRate,
  loss,
  activePositionsCount
}: ElonGrokCouncilProps) {
  const [askQuery, setAskQuery] = useState('');
  const [grokLoading, setGrokLoading] = useState(false);
  const [grokAnswer, setGrokAnswer] = useState<string | null>(null);
  const [grokError, setGrokError] = useState<string | null>(null);
  const [activeTweet, setActiveTweet] = useState('');

  // Sarcastic real-time tweet feed generator
  const elonTweets = [
    {
      trigger: () => rsi > 70,
      text: `RSI is sitting at ${rsi.toFixed(1)}! Extreme momentum overhead. This is like firing Falcon Heavy thrusters at 130% payload. High probability of rapid unscheduled disassembly (RUD) if you keep leveraging up. Settle down the neuron weights!`
    },
    {
      trigger: () => rsi < 35,
      text: `Spot Gold is oversold with RSI at ${rsi.toFixed(1)}. Basically absolute bedrock. The inflation engine of fiat currencies is running at infinite RPM, meaning paper dollars are becoming toilet paper. Stack the hard assets. Buy the dip, accumulate orbit coordinates.`
    },
    {
      trigger: () => drawdown > 8,
      text: `Drawdown alert! We are down ${drawdown.toFixed(2)}% on equity. Do not panic. S-Curve adoption of neural estimators always has rocky dips. Remember when Falcon 1 failed three times in the Pacific? We adjusted the liquid oxygen pipes and reached orbit. Recalibrate learning rates!`
    },
    {
      trigger: () => winRate > 70,
      text: `Current GQR RL accuracy is ${winRate.toFixed(1)}%! This is wild. Legacy Wall Street suits with their physical offices and expensive lunches are officially deprecated by a few lines of self-supervised reinforcement learning. Let's code!`
    },
    {
      trigger: () => activePositionsCount >= 2,
      text: `Currently managing ${activePositionsCount} active positions in the server memory database. Heavy computational payload on the cluster. Deploying neural heat dissipators. If we crash, we'll call it a successful stress test.`
    },
    {
      trigger: () => loss > 0.08,
      text: `Neural net MSE is hovering around ${loss.toFixed(4)}. Convergence is a bit sloppy, looks like early Tesla Autopilot in a heavy Arizona rainstorm. Activate online backpropagation with higher weights dampening!`
    },
    {
      trigger: () => true, // default tweet fallback
      text: `Spot Gold trading is okay, but physical gold is just heavy space dust from binary neutron star collisions. Pretty cool but hard to use on Mars. Better to buy the digital GQR neural weights or support physical manufacture. Civilization needs more hardware, less vaporware!`
    }
  ];

  useEffect(() => {
    // Select the best matching tweet based on active metrics, and set it
    const matched = elonTweets.find(t => t.trigger());
    if (matched) {
      setActiveTweet(matched.text);
    }
  }, [goldPrice, rsi, drawdown, winRate, loss, activePositionsCount]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    setGrokLoading(true);
    setGrokError(null);
    setGrokAnswer(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: 'XAUUSD',
          price: goldPrice,
          rsi: rsi,
          emaFast: goldPrice + 1.2,
          emaSlow: goldPrice - 0.8,
          rlLoss: loss,
          winRate: winRate,
          activePositions: [], // empty for question general
          isBacktest: false,
          grokMode: true, // This turns on Elon/Grok Mode!
          userCustomQuestion: askQuery // Custom question support in backend!
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Grok was temporarily distracted with a Starship launch.");
      }
      setGrokAnswer(data.analysis);
    } catch (err: any) {
      setGrokError(err.message || "Failed to establish telemetry hook to Grok node.");
    } finally {
      setGrokLoading(false);
    }
  };

  return (
    <div className="bg-[#08080a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden shadow-2xl space-y-5" id="elon-grok-council-widget">
      {/* Dynamic scanlines for cyber-theme */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-[#10b981] flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <Cpu className="h-5 w-5 text-black animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#10b981] font-bold leading-none">XAI REAL-TIME OVERSEE</span>
            <h4 className="text-sm font-bold text-white mt-1 leading-none font-sans flex items-center gap-1.5">
              <span>Grok AI / Elon Musk Co-Pilot</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-cyan-950/20 border border-cyan-800/30 px-2 py-0.5 rounded text-[9.5px] font-mono text-cyan-400">
          <Zap className="h-3 w-3" />
          <span>ELON COGNITIVE RATIO: 98%</span>
        </div>
      </div>

      {/* Verified Twitter Post Aesthetic Render */}
      <div className="bg-[#0b0c10] border border-zinc-800/60 rounded-xl p-4 space-y-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Circular Space Suit Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-800 to-cyan-500/45 p-0.5 shrink-0 flex items-center justify-center">
              <div className="h-full w-full rounded-full bg-black flex items-center justify-center font-extrabold text-[11px] text-cyan-400 font-mono tracking-tighter">
                𝕏_AI
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xs font-bold text-white font-sans">Elon Musk</span>
                <span className="w-3.5 h-3.5 bg-cyan-400 rounded-full flex items-center justify-center text-[8px] text-black font-bold">✓</span>
              </div>
              <span className="text-[10px] text-zinc-550 font-mono mt-0.5">@elonmusk • starlink_feed</span>
            </div>
          </div>
          <span className="text-[9.5px] font-mono text-zinc-650">v3.5 GQR-Hook</span>
        </div>

        <p className="text-xs text-zinc-200 leading-relaxed font-sans select-text">
          "{activeTweet}"
        </p>

        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
          <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
            <Flame className="h-3.5 w-3.5 text-zinc-600 hover:text-cyan-400" />
            <span>24.8k Reposts</span>
          </span>
          <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-600 hover:text-cyan-400" />
            <span>121k Likes</span>
          </span>
          <span className="ml-auto text-zinc-600 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>Mars Latency Sync</span>
          </span>
        </div>
      </div>

      {/* Interactive Command Center / Ask Elon Box */}
      <div className="bg-[#0d0e14] border border-cyan-500/10 rounded-xl p-4.5 space-y-3.5">
        <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
          𝕏_Grok Oracle Direct Synapse
        </label>
        
        <form onSubmit={handleSubmitQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Elon/Grok's advice on spot gold leverage or RL loss..."
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            disabled={grokLoading}
            className="flex-1 bg-[#060608] border border-cyan-500/25 focus:border-cyan-400 px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none placeholder:text-zinc-600 font-sans transition-all"
          />
          <button
            type="submit"
            disabled={grokLoading || !askQuery.trim()}
            className="px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900 disabled:text-cyan-700 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {grokLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Transmit</span>
              </>
            )}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {grokAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 bg-[#07090f] border border-cyan-500/15 rounded-xl space-y-2 text-xs font-sans text-zinc-350 leading-relaxed max-h-56 overflow-y-auto scrollbar-thin select-text"
            >
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1.5 shrink-0">
                <span className="w-2 h-2 rounded bg-cyan-400 animate-pulse"></span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">𝕏_Grok Response Packet:</span>
              </div>
              <div className="markdown-body text-[11.5px] leading-relaxed">
                {grokAnswer}
              </div>
            </motion.div>
          )}

          {grokError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-950/15 border border-red-500/25 rounded-xl text-xs text-red-500 font-mono"
            >
              🚀 Signal Interference: {grokError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
