import React, { useState } from 'react';
import { 
  Terminal, 
  HelpCircle, 
  Settings, 
  FileText, 
  Layers, 
  CheckCircle, 
  Copy, 
  Check, 
  Search, 
  Info, 
  Lock,
  MessageSquare
} from 'lucide-react';

const ENV_VARS = [
  {
    key: 'GQR_DATA_FEEDER__SYMBOLS',
    defaultVal: '["XAUUSD","EURUSD","DXY"]',
    description: 'Symbols to continuously monitor and trade. Anchor index (DXY) is used symmetrically for cross-attention projection.'
  },
  {
    key: 'GQR_DATA_FEEDER__TIMEFRAME',
    defaultVal: 'M1',
    description: 'The algorithmic interval resolution size of calculated data ticks.'
  },
  {
    key: 'GQR_DATA_FEEDER__LOOKBACK_BARS',
    defaultVal: '500',
    description: 'Number of sliding candles loaded into memory sequence inputs for the Neural Transformer.'
  },
  {
    key: 'GQR_EXECUTION_ENGINE__COMMISSION_PER_LOT',
    defaultVal: '7.0',
    description: 'Broker fee commission sizing for calculations (important for real-world P&L net scaling).'
  },
  {
    key: 'GQR_RISK_MANAGEMENT__MAX_DAILY_DRAWDOWN',
    defaultVal: '0.05',
    description: 'The critical daily drawdown threshold (5.0%). Exceeding this triggers the instant Async risk kill-switch and clears exposure.'
  },
  {
    key: 'GQR_RL__LEARNING_RATE',
    defaultVal: '0.00003',
    description: 'Policy network AdamW learning rate speed steps.'
  },
  {
    key: 'GQR_RL__TRAIN_EVERY_N_STEPS',
    defaultVal: '1024',
    description: 'Number of logged experiences buffered between PPO training epoch iterations.'
  }
];

export default function QuickStartGuide() {
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyEnv = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedEnv(val);
    setTimeout(() => setCopiedEnv(null), 1500);
  };

  const filteredEnv = ENV_VARS.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 text-sm" id="quick-start-guide">
      
      {/* Introduction Welcome Banner */}
      <div className="bg-[#050505]/45 border border-border-dark p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-orange mb-1">
          <Layers className="h-4 w-4" />
          <span>ROADMAP CORE MANUAL</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2 font-sans">
          GQR Institutional V3.3 Complete Deployment Guide
        </h2>
        <p className="text-zinc-400 max-w-3xl leading-relaxed text-xs font-sans">
          Engineered explicitly for systematic quant-trading, combining real-time Pytorch Deep Reinforcement learning, multihead cross-attention currency index tracking, and modular risk gateways. Prepared and curated by Creator: <span className="text-brand-orange font-semibold font-mono">Kianoosh Karimi</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Step-by-Step setup roadmap */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-panel-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-widest font-mono flex items-center gap-2 pb-3.5 border-b border-border-medium">
              <Terminal className="h-4.5 w-4.5 text-brand-orange animate-pulse" />
              Deployment Pipeline Steps
            </h3>

            {/* Steps Timeline visual */}
            <div className="space-y-6 relative border-l border-[#1b1b1b] ml-4.5 pl-6">
              
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-10 top-0 h-7 w-7 rounded-full bg-card-dark border border-border-dark flex items-center justify-center font-mono text-xs font-semibold text-brand-orange">1</span>
                <h4 className="font-bold text-zinc-300 text-sm">Create Virtual Environment & Dependencies</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Terminal directly inside the downloaded <code className="text-[11px] text-brand-orange bg-[#050505]/45 px-1 py-0.5 rounded font-mono border border-border-dark">gqr_institutional/</code> root directory. Install the curated PIP package list.
                </p>
                <pre className="bg-[#050505] border border-border-dark p-3 rounded-lg text-[11px] font-mono text-[#f27d26]/90 mt-2 whitespace-pre overflow-x-auto">
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
.venv\Scripts\activate          # Windows
pip install -r requirements.txt</pre>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-10 top-0 h-7 w-7 rounded-full bg-card-dark border border-border-dark flex items-center justify-center font-mono text-xs font-semibold text-brand-orange">2</span>
                <h4 className="font-bold text-zinc-300 text-sm">Produce Storage & Runtime directories</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  GQR utilizes persistent directories on-disk to manage trade log folders, SQLite experienced experience blocks, and model weight checkpoints.
                </p>
                <pre className="bg-[#050505] border border-border-dark p-3 rounded-lg text-[11px] font-mono text-[#f27d26]/90 mt-2 whitespace-pre overflow-x-auto">
mkdir -p data/memory data/raw data/processed models/weights reports logs certs</pre>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-10 top-0 h-7 w-7 rounded-full bg-card-dark border border-border-dark flex items-center justify-center font-mono text-xs font-semibold text-brand-orange">3</span>
                <h4 className="font-bold text-zinc-300 text-sm">Translate Historical Tick Files to Parquet</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Input raw CSV files containing standard <code className="text-[11px] text-brand-orange">time,open,high,low,close</code> coordinates. Translates toSnappy-compressed Parquet lake arrays.
                </p>
                <pre className="bg-[#050505] border border-border-dark p-3 rounded-lg text-[11px] font-mono text-[#f27d26]/90 mt-2 whitespace-pre overflow-x-auto">
python scripts/convert_csv_to_parquet.py --input data/raw --output data/processed
python scripts/precompute_features.py --input data/processed/XAUUSD.parquet --output data/processed/XAUUSD.features.parquet</pre>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <span className="absolute -left-10 top-0 h-7 w-7 rounded-full bg-card-dark border border-border-dark flex items-center justify-center font-mono text-xs font-semibold text-brand-orange">4</span>
                <h4 className="font-bold text-zinc-300 text-sm">Launch Autonomous Trade Agent Loop</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Spawns the continuous PPO learning loop. Connects to the simulated risk controller and saves SQLite experience vaults.
                </p>
                <pre className="bg-[#050505] border border-border-dark p-3 rounded-lg text-[11px] font-mono text-[#f27d26]/90 mt-2 whitespace-pre overflow-x-auto">
python src/main.py               # Single instrument simulator
python src/multi_asset_runner.py  # Portfolio orchestrator</pre>
              </div>

            </div>
          </div>
        </div>

        {/* Right column: Environmental .env config files */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-panel-dark border border-border-dark rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-border-medium">
              <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-widest font-mono flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-brand-orange" />
                Variable Registry (.env)
              </h3>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-zinc-550" />
              <input
                type="text"
                placeholder="Search env config vars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050505]/45 border border-border-dark rounded-xl py-1.5 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {filteredEnv.map(v => (
                <div key={v.key} className="bg-[#050505]/45 border border-border-dark p-3 rounded-xl flex flex-col gap-1.5 font-mono text-[11px]">
                  <div className="flex justify-between items-start">
                    <span className="text-brand-orange font-bold font-mono truncate mr-2 text-[10.5px]">{v.key}</span>
                    <button
                      onClick={() => handleCopyEnv(v.key)}
                      className="text-zinc-550 hover:text-zinc-350 cursor-pointer"
                    >
                      {copiedEnv === v.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div>
                    <span className="text-zinc-550 text-[10px]">VAL: </span>
                    <span className="text-zinc-305 font-mono text-[10.5px] bg-card-dark px-1.5 py-0.5 rounded border border-border-dark inline-block mt-0.5">{v.defaultVal}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-0.5">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Software Licensing Agreement layout */}
      <div className="bg-panel-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-sm text-zinc-100 uppercase tracking-widest font-mono flex items-center gap-2 pb-3.5 border-b border-border-medium">
          <FileText className="h-4.5 w-4.5 text-brand-orange" />
          Software Licensing Agreement (Personal / Educational)
        </h3>

        <div className="bg-[#050505] border border-border-dark rounded-xl p-5 h-64 overflow-y-auto font-mono text-xs text-zinc-450 leading-relaxed space-y-4">
          <p className="font-bold text-zinc-300 text-sm">GQR Institutional V3.3 – Software License Agreement</p>
          <p className="text-zinc-500">Copyright © 2025 NexusDigitalArtShop / GQR Development Team. All rights reserved.</p>
          
          <div>
            <span className="font-bold text-zinc-200 block mb-1">1. GRANT OF LICENSE</span>
            Subject to compliance with terms, the GQR team grants a non-transferable, non-sublicensable limit license to download, explore, and run simulation agents for educational evaluation and research. Does not grant lives trading privileges with client portfolios.
          </div>

          <div>
            <span className="font-bold text-zinc-200 block mb-1">2. INTELLECTUAL PROPERTY & BONUS INDICATORS</span>
            The Software and associated 14 Pine Script TradingView indicators are the intellectual property of Licensor. Provided as visual aid strategies. Distribution to outside groups is strictly prohibited.
          </div>

          <div>
            <span className="font-bold text-zinc-200 block mb-1">3. RESTRICTIONS</span>
            No resale, sub-licensing, or proprietary firm funds management operations without explicit Enterprise License validation credentials from the VIP support team.
          </div>

          <div>
            <span className="font-bold text-zinc-200 block mb-1">4. DISCLAIMER OF WARRANTIES</span>
            THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. ALGORITHMIC TRADING CARRIES DANGEROUS FINANCIAL RISK POTENTIALS. PAST EVALUATIONS DO NOT ASSURE FUTURE REAL RETURNS.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-border-medium font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>Licence registered: <span className="text-emerald-400 font-bold">EDUCATIONAL EVALUATION</span></span>
          </div>

          <a 
            href="https://t.me/NexusDigitalArtShop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange/10 border border-brand-orange/25 rounded-xl text-brand-orange font-bold text-xs hover:bg-brand-orange/20 transition-all font-mono"
          >
            <MessageSquare className="h-4 w-4 text-brand-orange" />
            VIP SUPPORT: @NexusDigitalArtShop
          </a>
        </div>
      </div>

    </div>
  );
}
