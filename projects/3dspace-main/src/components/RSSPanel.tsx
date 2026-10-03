// File: src/components/RSSPanel.tsx

import React, { useState, useEffect } from 'react';
import { Rss, Plus, Trash2, RefreshCw, Layers, Link as LinkIcon, BadgeHelp } from 'lucide-react';
import { getSavedFeeds, addFeed, removeFeed, fetchAllFeeds } from '../engine/rssEngine';
import { eventBus } from '../engine/eventBus';
import { useMindDataStore, MindNode } from '../store/mindDataStore';

interface RSSPanelProps {
  onNodeSelect: (node: MindNode) => void;
}

export default function RSSPanel({ onNodeSelect }: RSSPanelProps) {
  const [feeds, setFeeds] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const nodes = useMindDataStore((state) => state.nodes);

  // Sync state with local storage
  const reloadFeeds = () => {
    setFeeds(getSavedFeeds());
  };

  useEffect(() => {
    reloadFeeds();
    // Refresh feeds list on build node to catch updates
    const unsub = eventBus.on('build-new-node', () => {
      reloadFeeds();
    });
    return () => {
      unsub();
    };
  }, []);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      // Basic URL format validation
      new URL(newUrl);
      addFeed(newUrl);
      setFeeds(getSavedFeeds());
      setNewUrl('');
    } catch (_) {
      eventBus.emit('debug-log', {
        message: `Validation Error: "${newUrl}" is not a valid URL coordinate!`,
        type: 'SL',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRemoveFeed = (url: string) => {
    removeFeed(url);
    setFeeds(getSavedFeeds());
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchAllFeeds();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get only feed nodes (which we categorize as Debug white nodes with labels starting with [Feed:)
  const rssNodes = nodes.filter(n => n.type === 'Debug' && n.label.startsWith('[Feed:'));

  return (
    <div className="flex flex-col bg-[#08080E] h-full overflow-hidden border border-white/10 rounded">
      {/* Panel Header */}
      <div className="panel-header text-white/70 select-none shrink-0">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Rss className="w-3 h-3 text-emerald-400" />
          <span>RSS Feed Coordinates</span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-[#00FF00] text-[9px] font-mono animate-pulse">SYNCING...</span>
          ) : (
            <span className="text-emerald-400 text-[9px] font-mono tracking-wider">LIVE</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-1 rounded bg-white/5 border border-white/10 text-white/60 hover:text-[#00FF00] hover:bg-white/10 transition-colors ${
              loading ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Refresh coordinate feeds"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-3 scrollbar-thin">
        {/* Subscription Input Form */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="stat-label">ADD NEW TRANSMITTER</span>
          <form onSubmit={handleAddFeed} className="flex gap-1.5">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://hnrss.org/frontpage"
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
            />
            <button
              type="submit"
              className="px-2.5 bg-emerald-500 text-black text-[10px] font-black rounded hover:bg-emerald-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-black" strokeWidth={3} />
            </button>
          </form>
        </div>

        {/* List of active feeds */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="stat-label flex justify-between">
            <span>Active Transmitters</span>
            <span className="mono font-bold text-white/50">({feeds.length})</span>
          </span>
          {feeds.length === 0 ? (
            <span className="text-[10px] text-white/30 font-mono italic p-1.5 bg-white/3 border border-dashed border-white/5 rounded">
              No active transmitters.
            </span>
          ) : (
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
              {feeds.map((feed, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded border border-white/5 bg-white/3 group"
                >
                  <span className="text-[10px] font-mono text-white/70 truncate max-w-[170px]" title={feed}>
                    {feed.replace('https://', '')}
                  </span>
                  <button
                    onClick={() => handleRemoveFeed(feed)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-white/40 hover:text-red-400 transition-colors"
                    title="Remove coordinate"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discovered Items List */}
        <div className="flex-1 flex flex-col gap-1.5 min-h-[140px]">
          <span className="stat-label flex justify-between">
            <span>Discovered Nodes</span>
            <span className="mono font-bold text-[#00FF00]">({rssNodes.length})</span>
          </span>

          {rssNodes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/10 rounded p-4 text-center bg-white/2">
              <Layers className="w-4 h-4 text-white/20 animate-pulse" />
              <span className="text-[10px] text-white/40 font-mono leading-relaxed max-w-[160px]">
                No coordinates discovered. Sync feeds to register nodes.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
              {[...rssNodes].reverse().map((node) => {
                const cleanedLabel = node.label.replace(/^\[Feed:\s*[^\]]+\]\s*/, '');
                const feedSource = node.label.match(/^\[Feed:\s*([^\]]+)\]/)?.[1] || 'Feed';
                
                return (
                  <button
                    key={node.id}
                    onClick={() => onNodeSelect(node)}
                    className="w-full text-left p-2 rounded bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all flex flex-col gap-1 select-text"
                  >
                    <div className="flex justify-between items-start gap-2 w-full">
                      <span className="bg-black/80 border border-white/10 text-blue-400 text-[8px] font-bold font-mono px-1 py-0.2 rounded uppercase tracking-wider">
                        {feedSource}
                      </span>
                      <span className="text-[8px] text-white/30 font-mono">
                        {new Date(node.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-white/80 line-clamp-2 leading-tight">
                      {cleanedLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
