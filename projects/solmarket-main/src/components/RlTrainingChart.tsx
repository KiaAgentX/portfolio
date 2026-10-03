import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  Brain, 
  RotateCcw, 
  Sliders, 
  Play, 
  Pause,
  SlidersHorizontal,
  TrendingDown
} from 'lucide-react';

interface RlTrainingChartProps {
  currentLoss: number;
  isAutopilotActive: boolean;
  equity: number;
  balance: number;
}

interface DataPoint {
  epoch: number;
  reward: number;
  loss: number;
  accuracy: number;
  epsilon: number;
}

export default function RlTrainingChart({ currentLoss, isAutopilotActive, equity, balance }: RlTrainingChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [epsilon, setEpsilon] = useState<number>(0.85);
  const [epochsCount, setEpochsCount] = useState<number>(104);
  const [selectedMetric, setSelectedMetric] = useState<'reward' | 'loss' | 'accuracy'>('reward');
  const [learningRateSlider, setLearningRateSlider] = useState<number>(0.02);
  
  // Create some initial mock RL performance data leading up to the current epoch
  useEffect(() => {
    const initialPoints: DataPoint[] = [];
    let startReward = -120;
    let startLoss = 0.42;
    let startAcc = 48.5;
    let startEps = 1.0;

    for (let i = 1; i <= 30; i++) {
      startReward += Math.random() * 22 - (i < 10 ? 4 : 8);
      startLoss = Math.max(0.02, startLoss - Math.random() * 0.015);
      startAcc = Math.min(98.5, startAcc + Math.random() * 1.5 - 0.2);
      startEps = Math.max(0.15, startEps * 0.96);

      initialPoints.push({
        epoch: i,
        reward: Number(startReward.toFixed(1)),
        loss: Number(startLoss.toFixed(4)),
        accuracy: Number(startAcc.toFixed(1)),
        epsilon: Number(startEps.toFixed(2))
      });
    }
    setDataPoints(initialPoints);
  }, []);

  // Update dataPoints in real-time as the ticker cycles
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isAutopilotActive) {
      intervalId = setInterval(() => {
        setDataPoints(prev => {
          const lastPoint = prev[prev.length - 1];
          if (!lastPoint) return prev;
          
          const nextEpoch = lastPoint.epoch + 1;
          setEpochsCount(nextEpoch);
          
          // Reward increases with floating profits, drops slightly on commissions/sl
          const pnlFactor = equity - balance;
          const nextReward = lastPoint.reward + (pnlFactor * 0.05) + (Math.random() * 4 - 1.8);
          
          // Loss drops smoothly, occasionally spiking on unexpected market swings
          const randomSpike = Math.random() > 0.95 ? 0.04 : 0;
          const nextLoss = Math.max(0.01, lastPoint.loss - 0.0002 + randomSpike);
          
          // Accuracy climbs
          const nextAcc = Math.min(99.2, lastPoint.accuracy + (Math.random() * 0.2 - 0.08));
          
          // Epsilon decays continuously down to 0.15 (exploitation boundary)
          const nextEps = Math.max(0.15, lastPoint.epsilon * 0.995);

          const nextPoint = {
            epoch: nextEpoch,
            reward: Number(nextReward.toFixed(1)),
            loss: Number(nextLoss.toFixed(4)),
            accuracy: Number(nextAcc.toFixed(1)),
            epsilon: Number(nextEps.toFixed(2))
          };

          return [...prev.slice(1), nextPoint];
        });
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutopilotActive, equity, balance]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // SVG helper coordinates calculations
  const getCoordinates = (points: DataPoint[], metric: 'reward' | 'loss' | 'accuracy', width: number, height: number) => {
    if (points.length === 0) return '';
    
    const values = points.map(p => p[metric]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const padding = 25;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    return points.map((p, i) => {
      const x = padding + (i / (points.length - 1)) * chartW;
      const y = padding + chartH - ((p[metric] - minVal) / valRange) * chartH;
      return `${x},${y}`;
    }).join(' ');
  };

  const activePoints = dataPoints;
  const currentMetricValue = activePoints.length > 0 ? activePoints[activePoints.length - 1][selectedMetric] : 0;

  const chartId = isFullscreen ? "rl_chart_fullscreen" : "rl_chart_standard";

  const renderInnerChartAndControls = (w: number, h: number) => {
    const pointsStr = getCoordinates(activePoints, selectedMetric, w, h);
    
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Metric Selector Tab Bar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-dark pb-3.5">
          <div className="flex gap-2 bg-black/60 p-1.5 rounded-xl border border-border-dark">
            <button
              onClick={() => setSelectedMetric('reward')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedMetric === 'reward' 
                  ? 'bg-brand-gold text-black shadow-md' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              CUMULATIVE REWARD
            </button>
            <button
              onClick={() => setSelectedMetric('loss')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedMetric === 'loss' 
                  ? 'bg-brand-gold text-black shadow-md' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              POLICY LOSS (MSE)
            </button>
            <button
              onClick={() => setSelectedMetric('accuracy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedMetric === 'accuracy' 
                  ? 'bg-brand-gold text-black shadow-md' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              STATE ACCURACY
            </button>
          </div>

          <div className="flex items-center gap-3.5 font-mono text-[10.5px]">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-550 uppercase">Active metric:</span>
              <span className={`font-bold tracking-wider uppercase font-mono ${
                selectedMetric === 'reward' ? 'text-emerald-400' : selectedMetric === 'loss' ? 'text-rose-450' : 'text-cyan-400'
              }`}>
                {selectedMetric} ({currentMetricValue})
              </span>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-1 px-2.5 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 border border-border-medium rounded-lg hover:text-zinc-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isFullscreen ? "COLLAPSE" : "FULLSCREEN"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Vector Curve SVG Drawing Stage */}
        <div className="relative flex-1 bg-black/85 border border-border-dark rounded-xl overflow-hidden min-h-[220px]">
          {/* Futuristic grid background overlay */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-r border-b border-[#c5a85c]" />
            ))}
          </div>

          {/* Glowing background gradient reflecting selection */}
          <div className={`absolute -bottom-16 left-12 right-12 h-44 rounded-full blur-[80px] pointer-events-none opacity-15 transition-all duration-700 ${
            selectedMetric === 'reward' ? 'bg-emerald-500' : selectedMetric === 'loss' ? 'bg-rose-500' : 'bg-cyan-500'
          }`} />

          {/* SVG canvas */}
          <svg className="w-full h-full overflow-visible" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Draw curve path line */}
            {pointsStr && (
              <>
                <polyline
                  fill="none"
                  stroke={selectedMetric === 'reward' ? '#10b981' : selectedMetric === 'loss' ? '#f43f5e' : '#06b6d4'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsStr}
                  className="transition-all duration-500"
                />
                
                {/* Visual Area under curve projection */}
                <path
                  d={`M 25,${h - 25} L ${pointsStr} L ${w - 25},${h - 25} Z`}
                  fill={selectedMetric === 'reward' ? 'url(#emeraldGrad)' : selectedMetric === 'loss' ? 'url(#roseGrad)' : 'url(#cyanGrad)'}
                  className="transition-all duration-500"
                  opacity="0.12"
                />
              </>
            )}

            {/* Render vector nodes on nodes list */}
            {activePoints.map((p, i) => {
              if (i === activePoints.length - 1) {
                // last active point pulsing trigger
                const coords = pointsStr.split(' ');
                const lastCoord = coords[coords.length - 1]?.split(',');
                if (lastCoord) {
                  const cx = parseFloat(lastCoord[0]);
                  const cy = parseFloat(lastCoord[1]);
                  return (
                    <g key={`pulse-${i}`}>
                      <circle cx={cx} cy={cy} r="8" fill={selectedMetric === 'reward' ? '#10b981' : selectedMetric === '#f43f5e' ? 'red' : '#06b6d4'} opacity="0.4" className="animate-ping" />
                      <circle cx={cx} cy={cy} r="4.5" fill={selectedMetric === 'reward' ? '#10b981' : selectedMetric === 'loss' ? '#f43f5e' : '#06b6d4'} stroke="#ffffff" strokeWidth="1" />
                    </g>
                  );
                }
              }
              return null;
            })}

            {/* Custom Gradients Defs table */}
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Embedded diagnostic statistics absolute banners */}
          <div className="absolute top-4.5 right-4.5 flex items-center gap-1.5 p-1 px-2.5 rounded bg-black/75 border border-border-dark font-mono text-[9px] text-zinc-400">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>AGENT MEMORY FEED: SYNAPTIC BATCH SIZE 64</span>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-6 font-mono text-[9.5px]">
            <div>
              <span className="text-zinc-550 uppercase">RL EPOCHS PROCESSED:</span>
              <span className="text-zinc-250 font-bold ml-1">{epochsCount} cycles</span>
            </div>
            <div>
              <span className="text-zinc-550 uppercase">EXPLORATION GAP (EPSILON):</span>
              <span className="text-brand-gold font-bold ml-1">{Math.floor(epsilon * 100)}%</span>
            </div>
            <div>
              <span className="text-zinc-550 uppercase">LEARNING CONVERGENCE RATE (ETA):</span>
              <span className="text-emerald-450 font-bold ml-1">{learningRateSlider}</span>
            </div>
          </div>
        </div>

        {/* Real-time interactive RL weights settings tuning slider rails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 p-4 bg-[#121415] border border-border-dark rounded-xl">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span className="uppercase flex items-center gap-1 font-bold text-zinc-400">
                <Brain className="h-3 w-3 text-brand-gold" />
                Exploration decay (Epsilon)
              </span>
              <span>{(epsilon * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full accent-brand-gold cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span className="uppercase flex items-center gap-1 font-bold text-zinc-400">
                <Sliders className="h-3 w-3 text-[#c5a85c]" />
                RL Network Learning rate
              </span>
              <span>{learningRateSlider}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.08"
              step="0.005"
              value={learningRateSlider}
              onChange={(e) => setLearningRateSlider(parseFloat(e.target.value))}
              className="w-full accent-brand-gold cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-l border-zinc-800/80 pl-4">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono text-zinc-500 uppercase block">Autopilot Decision Pace</span>
              <span className="text-[11px] font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-brand-gold animate-bounce" />
                Adaptive (1.2s Sync Interval)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Standard embedded layout container */}
      <div id={chartId} className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-[#c5a85c]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4.5 w-4.5 text-brand-gold" />
            <h3 className="font-serif font-black text-sm text-[#c5a85c] tracking-widest uppercase">
              REINFORCEMENT LEARNING CONVERGENCE VISUALIZER
            </h3>
          </div>
          <span className="font-mono text-[9px] text-zinc-550 border border-border-dark/50 p-1 rounded px-2">
            STABLE PYTHIAN Q-LEARNING CORE
          </span>
        </div>
        <div className="h-[280px]">
          {renderInnerChartAndControls(640, 240)}
        </div>
      </div>

      {/* Fullscreen Overlay HUD */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md select-none">
          <div className="w-full max-w-6xl h-[88vh] bg-[#0c0d0f] border-2 border-brand-gold/60 p-8 rounded-2xl flex flex-col justify-between shadow-2xl relative">
            <div className="absolute top-4.5 right-6 flex items-center gap-4">
              <span className="font-mono text-[10.5px] text-[#c5a85c] font-black tracking-widest animate-pulse flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-gold" />
                EXPANDED SUPERQUANT OPERATIONAL HUDRATE TERMINAL
              </span>
              <button 
                onClick={toggleFullscreen}
                className="p-1 px-3 bg-red-950/20 text-red-450 hover:bg-red-950 border border-red-500/20 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>EXIT WORKSPACE</span>
              </button>
            </div>

            <div className="border-b border-border-dark pb-4">
              <h2 className="font-serif font-black text-lg text-brand-gold tracking-widest uppercase flex items-center gap-2">
                <Brain className="h-6 w-6 text-brand-gold animate-bounce" />
                Q-Learning Reward Matrices & Gradient Convergences
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                SECURE SANDBOX COPROCESSOR DIAGNOSTICS & MULTI-OBJECTIVE WEIGHTED BACKWARD PROPAGATION
              </p>
            </div>

            <div className="flex-1 my-6 min-h-[350px]">
              {renderInnerChartAndControls(1080, 400)}
            </div>

            <div className="border-t border-border-dark pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500 gap-4">
              <div className="flex gap-6">
                <div>
                  <span className="text-zinc-550">CURRENT POLICY:</span>
                  <span className="text-[#10b981] font-bold ml-1.5">CONVERGED MODEL - AUTO SHIELDS ACTIVE</span>
                </div>
                <div>
                  <span className="text-zinc-550">SAMPLE DENSITY:</span>
                  <span className="text-zinc-350 ml-1.5">100 Ticks / Epoch</span>
                </div>
              </div>
              <div>
                <span>AUTHENTICATED SECURITY IDENTIFIER: <span className="text-[#c5a85c]">SECURE-ATHENA-GQR-DENSITY-STREAM-2026</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
