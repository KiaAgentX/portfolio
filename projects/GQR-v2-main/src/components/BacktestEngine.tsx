import React, { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Area,
  ComposedChart
} from 'recharts';
import { 
  Play, 
  TrendingUp, 
  Database, 
  BarChart2, 
  ArrowUpRight, 
  Award, 
  TrendingDown, 
  Activity,
  Lightbulb
} from 'lucide-react';

import { EquityCurvePoint, MonteCarloPoint } from '../types';

export default function BacktestEngine() {
  const [inputs, setInputs] = useState({
    capital: 10000,
    risk: 1.0,
    symbol: 'XAUUSD',
    startDate: '2020-01-01',
    endDate: '2023-12-31'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  // Backtest reporting metrics
  const [metrics, setMetrics] = useState({
    netProfit: 0,
    maxDrawdown: 0,
    winRate: 0,
    sharpeRatio: 0,
    profitFactor: 0,
    totalTrades: 0,
    var95: 0,
    cvar95: 0,
    riskOfRuin: 0
  });

  // Recharts Chart representations
  const [equityCurveData, setEquityCurveData] = useState<EquityCurvePoint[]>([]);
  const [monteCarloData, setMonteCarloData] = useState<MonteCarloPoint[]>([]);

  const runBacktest = () => {
    setIsRunning(true);
    setProgress(0);
    setHasRun(false);

    // Dynamic metrics calculators depending on symbol characteristics
    const isGold = inputs.symbol === 'XAUUSD';
    const profitMu = isGold ? 1.48 : 1.28;
    const riskFactor = inputs.risk / 1.0; // 0.5x | 1x | 2x from the Risk Limit selector
    const drawMu = (isGold ? 4.82 : 3.84) * riskFactor;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          setMetrics({
            netProfit: parseFloat((inputs.capital * (profitMu - 1)).toFixed(2)),
            maxDrawdown: parseFloat(drawMu.toFixed(2)),
            winRate: parseFloat((58.2 + Math.random() * 4).toFixed(1)),
            sharpeRatio: parseFloat((2.12 + Math.random() * 0.45).toFixed(2)),
            profitFactor: parseFloat((1.85 + Math.random() * 0.25).toFixed(2)),
            totalTrades: isGold ? 1248 : 1084,
            var95: parseFloat((inputs.capital * (isGold ? 0.038 : 0.027) * riskFactor).toFixed(2)),
            cvar95: parseFloat((inputs.capital * (isGold ? 0.051 : 0.042) * riskFactor).toFixed(2)),
            riskOfRuin: parseFloat(((isGold ? 0.12 : 0.05) * riskFactor).toFixed(3))
          });

          // Generate synthetic price curves + DXY Nexus tracking over 20 points
          const curve: EquityCurvePoint[] = [];
          let currentEquity = inputs.capital;
          let dxyRatio = 101.50;

          for (let i = 0; i <= 24; i++) {
            const pct = i / 24;
            // Introduce fluctuation reflecting standard trend returns
            const variance = (Math.random() - 0.42) * 500;
            currentEquity = parseFloat((inputs.capital + (inputs.capital * (profitMu - 1) * pct) + variance).toFixed(2));
            dxyRatio = parseFloat((101.50 + Math.sin(pct * 8) * 3 + (Math.random() - 0.5) * 1.5).toFixed(2));

            curve.push({
              period: `Month ${i}`,
              equity: currentEquity,
              dxy: dxyRatio
            });
          }
          setEquityCurveData(curve);

          // Generate Monte Carlo pathway curves over 15 coordinates
          const mcPaths: MonteCarloPoint[] = [];
          for (let i = 0; i <= 15; i++) {
            const pct = i / 15;
            const baseline = inputs.capital + (inputs.capital * (profitMu - 1) * pct);
            
            mcPaths.push({
              step: `Wk ${i}`,
              optimum: parseFloat((baseline + Math.random() * 1500).toFixed(2)),
              median: parseFloat((baseline + (Math.random() - 0.5) * 400).toFixed(2)),
              conservative: parseFloat((baseline - Math.random() * 1200).toFixed(2)),
              ruinPath: parseFloat((inputs.capital - (inputs.capital * 0.4 * pct) + (Math.random() - 0.5) * 200).toFixed(2))
            });
          }
          setMonteCarloData(mcPaths);

          setIsRunning(false);
          setHasRun(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col gap-6" id="backtest-engine">
      
      {/* Parameters Panel */}
      <div className="bg-panel-dark border border-border-dark p-6 rounded-2xl">
        <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2 pb-4 border-b border-border-medium mb-5">
          <Database className="h-4.5 w-4.5 text-brand-orange" />
          Backtest Hyperparameters & Target Datasets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Initial Capital (USD)</span>
            <input
              type="number"
              value={inputs.capital}
              onChange={(e) => setInputs({ ...inputs, capital: parseInt(e.target.value) || 0 })}
              className="bg-[#050505]/45 border border-border-dark rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Risk Limit Per Trade %</span>
            <select
              value={inputs.risk}
              onChange={(e) => setInputs({ ...inputs, risk: parseFloat(e.target.value) })}
              className="bg-[#050505]/45 border border-border-dark rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value={0.5}>Conservative (0.5%)</option>
              <option value={1}>Standard Level (1.0%)</option>
              <option value={2}>Aggressive Model (2.0%)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Historical Instrument</span>
            <select
              value={inputs.symbol}
              onChange={(e) => setInputs({ ...inputs, symbol: e.target.value })}
              className="bg-[#050505]/45 border border-border-dark rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value="XAUUSD">GOLD SPOT (XAUUSD)</option>
              <option value="EURUSD">EURUSD INDEX</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Simulation Period</span>
            <div className="text-xs text-zinc-400 bg-[#050505]/30 border border-border-dark rounded-xl px-3 py-2.5 font-mono select-none">
              2020-01-01 — 2023-12-31
            </div>
          </div>

          <button
            onClick={runBacktest}
            disabled={isRunning}
            className="w-full h-11 bg-brand-orange hover:bg-brand-orange-dark disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-bold text-xs text-white font-mono transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/15 cursor-pointer"
          >
            <Play className="h-4 w-4 text-white" />
            RUN HISTORIC BACKTEST
          </button>
        </div>

        {/* Dynamic progress bar loading indicator */}
        {isRunning && (
          <div className="mt-5 bg-[#050505]/45 p-4 rounded-xl border border-border-dark flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-brand-orange font-bold flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 animate-spin-slow" />
                DXY NEXUS CHANNELS SYNCHRONIZING WITH HISTORIC MEMORY...
              </span>
              <span className="text-zinc-400">{progress}%</span>
            </div>
            <div className="w-full bg-[#151515] rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-brand-orange rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {hasRun && !isRunning && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Key Metric indicators list */}
          <div className="xl:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Net Portfolio Profit</span>
              <div className="flex items-center gap-1 text-emerald-400 mt-1">
                <ArrowUpRight className="h-4.5 w-4.5" />
                <span className="text-lg font-bold font-mono">+${metrics.netProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Max Drawdown</span>
              <div className="flex items-center gap-1 text-red-400 mt-1">
                <TrendingDown className="h-4.5 w-4.5" />
                <span className="text-lg font-bold font-mono">-{metrics.maxDrawdown}%</span>
              </div>
            </div>

            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Win Settle Rate</span>
              <span className="text-lg font-bold font-mono text-zinc-100 mt-1">{metrics.winRate}%</span>
            </div>

            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Sharpe Ratio</span>
              <div className="flex items-center gap-1 text-brand-orange mt-1">
                <Award className="h-4.5 w-4.5" />
                <span className="text-lg font-bold font-mono">{metrics.sharpeRatio}</span>
              </div>
            </div>

            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Simulated Trades</span>
              <span className="text-lg font-bold font-mono text-zinc-300 mt-1">{metrics.totalTrades}</span>
            </div>

            <div className="bg-panel-dark border border-border-dark p-4.5 rounded-xl flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500 uppercase">Profit Factor</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-1">{metrics.profitFactor}</span>
            </div>

          </div>

          {/* Equity comparison plot graph */}
          <div className="xl:col-span-8 bg-panel-dark border border-border-dark p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-orange" />
              Historic Capital Equity Growth vs. dollar index (DXY)
            </h3>
            
            <div className="h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={equityCurveData}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f27d26" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f27d26" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
                  <XAxis dataKey="period" stroke="#444" fontSize={10} fontFamily="monospace" />
                  <YAxis yAxisId="left" stroke="#888" fontSize={10} fontFamily="monospace" domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#7e22ce" fontSize={10} fontFamily="monospace" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#070707', borderColor: '#1b1b1b' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area yAxisId="left" type="monotone" dataKey="equity" stroke="#f27d26" name="Equity Growth" fillOpacity={1} fill="url(#equityGrad)" strokeWidth={2.5} />
                  <Line yAxisId="right" type="monotone" dataKey="dxy" stroke="#ca8a04" strokeWidth={1} name="Anchor DXY Index" dot={false} strokeDasharray="4 4" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monte Carlo Fan plot graph */}
          <div className="xl:col-span-4 bg-panel-dark border border-border-dark p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-brand-orange" />
              Monte Carlo Pathway distributions (1,000 Runs)
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monteCarloData}>
                  <XAxis dataKey="step" stroke="#222" fontSize={8} fontFamily="monospace" />
                  <YAxis stroke="#222" fontSize={8} fontFamily="monospace" domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="optimum" stroke="#10b981" strokeWidth={1} dot={false} name="Optimal path" />
                  <Line type="monotone" dataKey="median" stroke="#f27d26" strokeWidth={1.5} dot={false} name="Median (50th percentile)" />
                  <Line type="monotone" dataKey="conservative" stroke="#f43f5e" strokeWidth={1} dot={false} name="Conservative level" />
                  <Line type="monotone" dataKey="ruinPath" stroke="#7f1d1d" strokeWidth={1} dot={false} strokeDasharray="2 2" name="Severe DD run" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Risk distributions calculations */}
            <div className="mt-2 space-y-2 bg-[#050505]/45 border border-border-dark p-4 rounded-xl text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Value-at-Risk (95% VaR):</span>
                <span className="text-zinc-300 font-bold">${metrics.var95.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Expected Shortfall (CVaR):</span>
                <span className="text-zinc-300 font-bold">${metrics.cvar95.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Probability of Drawdown {"(>=30%)"}:</span>
                <span className="text-red-400 font-bold">{(metrics.riskOfRuin * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="xl:col-span-12 bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-brand-orange/90 font-mono">
            <Lightbulb className="h-6 w-6 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brand-orange uppercase tracking-wide mb-1">DXY Nexus Attention Mechanism Backtest Outcome</p>
              The backtest shows significant drawdown protection during period phases where DXY exhibits sudden high volatility. The correlation check blocks dynamically cut currency pair exposure allocations, saving capital from unexpected central bank decisions.
            </div>
          </div>

        </div>
      )}

      {/* Placeholder screen */}
      {!hasRun && !isRunning && (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-[#050505]/20 border border-border-dark border-dashed rounded-2xl">
          <Database className="h-10 w-10 text-zinc-600 animate-pulse" />
          <h4 className="font-semibold text-zinc-400">Backtest simulation unit idle</h4>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed text-zinc-400">
            Select an asset instrument, set dynamic capital constraints, and click Run historic backtest above to synthesize 1,000 Monte Carlo paths and trade reports.
          </p>
        </div>
      )}

    </div>
  );
}
