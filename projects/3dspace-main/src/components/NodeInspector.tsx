// File: src/components/NodeInspector.tsx

import React from 'react';
import { X, Layers, Clock, Globe, HelpCircle } from 'lucide-react';
import { MindNode } from '../store/mindDataStore';
import { motion } from 'motion/react';

interface NodeInspectorProps {
  node: MindNode | null;
  onClose: () => void;
}

export default function NodeInspector({ node, onClose }: NodeInspectorProps) {
  if (!node) return null;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'TP':
        return { color: '#00FF00', bg: 'rgba(0,255,0,0.1)', text: 'Token consumption coordinate' };
      case 'SL':
        return { color: '#FF0000', bg: 'rgba(255,0,0,0.1)', text: 'Safety limit threshold exceeded' };
      case 'Chat':
        return { color: '#0088FF', bg: 'rgba(0,136,255,0.1)', text: 'Cognitive thread node' };
      case 'Media':
        return { color: '#FF00FF', bg: 'rgba(255,0,255,0.1)', text: 'AI Media generated image' };
      default:
        return { color: '#FFFFFF', bg: 'rgba(255,255,255,0.1)', text: 'RSS live feed coordinate' };
    }
  };

  const badge = getBadgeStyle(node.type);

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col bg-[#08080E] border border-white/10 rounded h-full overflow-hidden relative"
    >
      {/* Header */}
      <div className="panel-header text-white/70 select-none shrink-0 pr-10">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Coordinate Analysis</span>
        </div>
      </div>

      {/* Close button inside header space */}
      <button
        onClick={onClose}
        className="absolute top-1.5 right-2 text-white/40 hover:text-white transition-colors cursor-pointer"
        title="Close Inspector"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-3 scrollbar-thin">
        {/* Meta Specs */}
        <div className="flex flex-col gap-1.5 font-mono text-[10px]">
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span className="text-white/40 uppercase">Node ID</span>
            <span className="text-white/80 select-all">{node.id.split('_').slice(0, 3).join('_')}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span className="text-white/40 uppercase">Category</span>
            <span
              className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider"
              style={{ color: badge.color, backgroundColor: badge.bg }}
            >
              {node.type}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1 items-center">
            <span className="text-white/40 uppercase">Created At</span>
            <span className="text-white/80 flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/40" />
              {new Date(node.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span className="text-white/40 uppercase">Coordinates</span>
            <span className="text-[#00FF00] font-bold">
              {node.position.map(p => p.toFixed(2)).join(' : ')}
            </span>
          </div>
        </div>

        {/* Node Details Content */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <span className="stat-label">Node Payload</span>

          {/* Render image preview if present */}
          {node.image && (
            <div className="bg-black/40 border border-white/10 rounded overflow-hidden flex items-center justify-center relative group shrink-0 max-h-24">
              <img
                src={node.image}
                alt={node.label}
                referrerPolicy="no-referrer"
                className="w-full h-24 object-contain"
              />
              <div className="absolute top-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[7px] font-mono font-bold text-pink-400 border border-pink-500/25 uppercase select-none">
                AI GEN
              </div>
            </div>
          )}

          {/* Title / Label of Node */}
          <div className="bg-black/40 p-2.5 rounded border border-white/10 font-mono text-[11px] leading-snug font-bold text-white/95 select-text">
            {node.label}
          </div>

          {/* Detailed text */}
          {node.details ? (
            <div className="flex-1 overflow-y-auto max-h-36 bg-black/40 p-2.5 rounded border border-white/10 text-white/80 text-[11px] leading-relaxed font-mono whitespace-pre-wrap select-text scrollbar-thin">
              {node.details}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded p-4 text-center">
              <HelpCircle className="w-4 h-4 text-white/20 mb-1 animate-pulse" />
              <span className="text-[10px] text-white/40 font-mono">No detailed text compiled.</span>
            </div>
          )}

          {/* Action Link for RSS feeds */}
          {node.link && (
            <a
              href={node.link}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full py-1.5 rounded border border-blue-500/30 hover:border-[#0088FF] bg-[#0088FF]/10 text-[#0088FF] font-mono text-[10px] text-center flex items-center justify-center gap-1.5 hover:shadow-[0_0_10px_rgba(0,136,255,0.25)] transition-all cursor-pointer font-bold shrink-0"
            >
              <Globe className="w-3.5 h-3.5" /> Navigate to Origin Coordinate
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
