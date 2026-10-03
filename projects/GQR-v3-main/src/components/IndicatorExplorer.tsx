import React, { useState } from 'react';
import { GQR_INDICATORS } from '../data/indicators';
import { PineIndicator } from '../types';
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  Settings2, 
  BellRing, 
  Search, 
  Layers, 
  Hash,
  HelpCircle
} from 'lucide-react';

export default function IndicatorExplorer() {
  const [selectedInd, setSelectedInd] = useState<PineIndicator>(GQR_INDICATORS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const categories = ['All', ...Array.from(new Set(GQR_INDICATORS.map(i => i.category)))];

  const filteredIndicators = GQR_INDICATORS.filter(ind => {
    const matchesSearch = ind.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ind.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ind.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedInd.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]" id="indicator-explorer">
      {/* Sidebar: Navigation List */}
      <div className="lg:col-span-4 bg-panel-dark border border-border-dark rounded-2xl p-4 flex flex-col gap-4">
        {/* Search header */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search premium indicators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505]/45 border border-border-dark rounded-xl py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border-medium">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/35'
                  : 'bg-zinc-900 text-zinc-400 border border-border-dark hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Indicator list */}
        <div className="flex-1 overflow-y-auto max-h-[480px] lg:max-h-[600px] space-y-2 pr-1">
          {filteredIndicators.length > 0 ? (
            filteredIndicators.map(ind => (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedInd(ind);
                  setCopied(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 cursor-pointer ${
                  selectedInd.id === ind.id
                    ? 'bg-brand-orange/5 border-brand-orange/30 shadow-md shadow-brand-orange/10'
                    : 'bg-card-dark border-border-dark hover:bg-zinc-900/50 hover:border-border-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm transition-colors ${
                    selectedInd.id === ind.id ? 'text-brand-orange' : 'text-zinc-200'
                  }`}>
                    {ind.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-555 px-1.5 py-0.5 rounded bg-zinc-950/20">
                    {ind.alerts.length > 0 ? 'Alerts' : 'No alerts'}
                  </span>
                </div>
                <p className="text-xs text-zinc-450 line-clamp-2 leading-relaxed">
                  {ind.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-1">
                  <Layers className="h-3 w-3" />
                  <span>{ind.category}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-500 flex flex-col items-center gap-2">
              <Code2 className="h-8 w-8 text-zinc-650" />
              <p className="text-sm">No matching indicators found</p>
            </div>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-border-medium text-[11px] text-zinc-500 flex items-center justify-between font-mono bg-[#050505]/45 p-2.5 rounded-lg border border-border-dark">
          <span>Indicators Loaded</span>
          <span className="text-brand-orange font-bold">{GQR_INDICATORS.length} / 14</span>
        </div>
      </div>

      {/* Main Panel: Code Viewer and Metadata details */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-panel-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-medium">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-brand-orange bg-brand-orange/10 border border-brand-orange/10 rounded">
                  PINE SCRIPT V5
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-450 bg-zinc-950 rounded border border-border-dark">
                  {selectedInd.category}
                </span>
              </div>
              <h2 className="text-xl font-bold font-sans text-zinc-100 flex items-center gap-2">
                {selectedInd.name}
              </h2>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#1a1a1a] text-zinc-200 border border-border-medium hover:bg-[#252525] hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4.5 w-4.5" />
                  <span>COPIED CODE</span>
                </>
              ) : (
                <>
                  <Copy className="h-4.5 w-4.5" />
                  <span>COPY PINE SCRIPT</span>
                </>
              )}
            </button>
          </div>

          {/* Description Block */}
          <div className="bg-black/45 border border-border-dark p-4 rounded-xl leading-relaxed text-sm text-zinc-350">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5 font-mono flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-brand-orange" />
              Indicator Functional Objective
            </h4>
            {selectedInd.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs Table */}
            <div className="bg-[#050505]/45 border border-border-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                <Settings2 className="h-4 w-4 text-brand-orange" />
                <span>Adjustable User Inputs</span>
              </div>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {selectedInd.inputs.length > 0 ? (
                  selectedInd.inputs.map((inp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-card-dark border border-border-dark">
                      <span className="font-semibold text-zinc-350 font-sans">{inp.name}</span>
                      <div className="flex gap-2 font-mono">
                        <span className="text-zinc-500 bg-zinc-950/50 px-1.5 py-0.5 rounded text-[10px] border border-border-dark">
                          {inp.type}
                        </span>
                        <span className="text-brand-orange font-medium">{inp.defaultVal}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                    No custom user inputs. Self-calculating.
                  </div>
                )}
              </div>
            </div>

            {/* Alerts Channel */}
            <div className="bg-[#050505]/45 border border-border-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                <BellRing className="h-4 w-4 text-brand-orange" />
                <span>Integrated Alert Conditions</span>
              </div>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {selectedInd.alerts.length > 0 ? (
                  selectedInd.alerts.map((al, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs p-2 rounded bg-card-dark border border-border-dark">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                      <span className="font-mono text-zinc-300">{al}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                    No explicit alert conditions formulated inside indicator.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Code Editor Representation */}
          <div className="flex flex-col rounded-xl overflow-hidden border border-border-dark">
            {/* Tab header */}
            <div className="bg-card-dark px-4 py-2.5 flex items-center justify-between border-b border-border-dark select-none">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-mono text-zinc-400">{selectedInd.id}.pine</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-border-dark">
                <span>UTF-8</span>
                <span className="h-2 w-px bg-[#1a1a1a]"></span>
                <span>Pine v5</span>
              </div>
            </div>

            {/* Code lines */}
            <div className="bg-[#050505] p-4 font-mono text-[11px] sm:text-xs text-zinc-350 leading-relaxed overflow-x-auto max-h-[360px] overflow-y-auto scrollbar-thin">
              <table className="w-full border-collapse">
                <tbody>
                  {selectedInd.code.split('\n').map((line, idx) => {
                    // Primitive syntax highlights simulation
                    let styleClass = 'text-zinc-350';
                    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                      styleClass = 'text-zinc-550 italic';
                    } else if (line.trim().startsWith('var ') || line.trim().startsWith('if ') || line.trim().startsWith('else') || line.trim().startsWith('for ') || line.trim().startsWith('while ')) {
                      styleClass = 'text-brand-orange';
                    } else if (line.trim().includes('indicator(') || line.trim().includes('input.')) {
                      styleClass = 'text-[#f27d26]/90';
                    } else if (line.includes('color=')) {
                      styleClass = 'text-zinc-200';
                    }

                    return (
                      <tr key={idx} className="hover:bg-zinc-900/40">
                        <td className="w-10 pr-3 text-right text-zinc-650 font-mono text-[10px] border-r border-[#151515] select-none">
                          {idx + 1}
                        </td>
                        <td className={`pl-4 font-mono break-all whitespace-pre ${styleClass}`}>
                          {line}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
