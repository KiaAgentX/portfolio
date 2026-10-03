// File: src/components/NodeRepository.tsx

import React, { useState } from 'react';
import { useMindDataStore, MindNode } from '../store/mindDataStore';
import { Layers, Database, Search, X } from 'lucide-react';

interface NodeRepositoryProps {
  onNodeSelect: (node: MindNode) => void;
  activeNode: MindNode | null;
}

export default function NodeRepository({ onNodeSelect, activeNode }: NodeRepositoryProps) {
  const nodes = useMindDataStore((state) => state.nodes);
  const [searchQuery, setSearchQuery] = useState('');

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'TP':
        return 'text-[#00FF00] border-[#00FF00]/30 bg-[#00FF00]/5';
      case 'SL':
        return 'text-[#FF0000] border-[#FF0000]/30 bg-[#FF0000]/5';
      case 'Chat':
        return 'text-[#0088FF] border-[#0088FF]/30 bg-[#0088FF]/5';
      default:
        return 'text-[#FFFFFF] border-white/30 bg-white/5';
    }
  };

  // Filter nodes by label or type (case-insensitive)
  const filteredNodes = nodes.filter((node) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      node.label.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col bg-[#08080E] h-full overflow-hidden">
      {/* Header */}
      <div className="panel-header text-white/70 select-none shrink-0 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Node Repository</span>
          <span className="bg-white/10 text-[9px] px-1.5 py-0.1 rounded font-mono text-white/70">
            {filteredNodes.length === nodes.length ? nodes.length : `${filteredNodes.length}/${nodes.length}`}
          </span>
        </div>
      </div>

      {/* Cybernetic Search Bar */}
      <div className="p-2 border-b border-white/5 bg-black/20 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes by label or type..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded font-mono text-[10px] text-white/90 placeholder-white/30 focus:outline-none focus:border-[#0088FF] focus:ring-1 focus:ring-[#0088FF]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-white/45 hover:text-white transition-colors cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 font-mono text-[10px] italic">
            Repository empty. Run sync or query chat.
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 font-mono text-[10px] p-4 text-center">
            <span className="mb-1 text-white/40">No coordinates match selection query.</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead className="bg-black/40 text-white/40 uppercase text-[8px] tracking-wider select-none sticky top-0 border-b border-white/10">
              <tr>
                <th className="py-1.5 px-2">ID</th>
                <th className="py-1.5 px-2">Type</th>
                <th className="py-1.5 px-2">Label</th>
                <th className="py-1.5 px-2 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...filteredNodes].reverse().map((node) => {
                const isSelected = activeNode?.id === node.id;
                const ageSecs = Math.floor((Date.now() - new Date(node.createdAt).getTime()) / 1000);
                const ageText = ageSecs < 60 ? `${ageSecs}s` : `${Math.floor(ageSecs / 60)}m`;
                
                return (
                  <tr
                    key={node.id}
                    onClick={() => onNodeSelect(node)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-500/10 hover:bg-blue-500/15 text-blue-300' 
                        : 'hover:bg-white/3 text-white/70'
                    }`}
                  >
                    <td className="py-1 px-2 font-bold select-all">
                      {node.id.slice(0, 6)}
                    </td>
                    <td className="py-1 px-2">
                      <span className={`px-1 rounded border text-[8px] font-bold uppercase tracking-wide shrink-0 ${getBadgeStyle(node.type)}`}>
                        {node.type}
                      </span>
                    </td>
                    <td className="py-1 px-2 truncate max-w-[100px]" title={node.label}>
                      {node.label}
                    </td>
                    <td className="py-1 px-2 text-right text-white/40">
                      {ageText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
