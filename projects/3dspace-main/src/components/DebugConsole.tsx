// File: src/components/DebugConsole.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Trash2, Filter } from 'lucide-react';
import { eventBus } from '../engine/eventBus';
import { DebugLog } from '../types';

export default function DebugConsole() {
  const [logs, setLogs] = useState<DebugLog[]>([
    {
      id: 'init_log_1',
      message: 'Network core boot sequence successfully completed.',
      type: 'Debug',
      timestamp: new Date().toISOString()
    },
    {
      id: 'init_log_2',
      message: 'Three.js 3D WebGL context initialized under port 3000.',
      type: 'Debug',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isOpen, setIsOpen] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Listen to debug logs from the EventBus
  useEffect(() => {
    const unsubscribe = eventBus.on('debug-log', (data: any) => {
      const newLog: DebugLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        message: data.message,
        type: data.type || 'Debug',
        timestamp: data.timestamp || new Date().toISOString(),
        nodeId: data.nodeId
      };
      setLogs((prev) => [...prev, newLog].slice(-200)); // Maintain maximum 200 logs
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll to latest log entries when open
  useEffect(() => {
    if (isOpen) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Log filter helpers
  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.type.toLowerCase() === filterType.toLowerCase();
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'TP':
        return { color: '#00FF00', borderColor: 'rgba(0,255,0,0.3)', bg: 'rgba(0,255,0,0.08)' };
      case 'SL':
        return { color: '#FF0000', borderColor: 'rgba(255,0,0,0.3)', bg: 'rgba(255,0,0,0.08)' };
      case 'Chat':
        return { color: '#0088FF', borderColor: 'rgba(0,136,255,0.3)', bg: 'rgba(0,136,255,0.08)' };
      default:
        return { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', bg: 'rgba(255,255,255,0.08)' };
    }
  };

  return (
    <div className="w-full bg-[#08080E] border border-white/10 rounded overflow-hidden flex flex-col shrink-0">
      {/* Console Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="panel-header text-white/70 cursor-pointer select-none"
      >
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Terminal className="w-3.5 h-3.5 text-white/50" />
          <span>Node Logging Interface</span>
          <span className="bg-white/10 text-[9px] px-1.5 py-0.1 rounded font-mono text-white/70">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Filtering */}
          <div className="flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded bg-black/50">
            <Filter className="w-2.5 h-2.5 text-white/40" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-[9px] font-mono text-white/60 focus:outline-none cursor-pointer"
            >
              <option value="all">ALL STREAMS</option>
              <option value="tp">TP (TOKEN)</option>
              <option value="sl">SL (LIMIT)</option>
              <option value="chat">CHAT</option>
              <option value="debug">DEBUG</option>
            </select>
          </div>

          <button
            onClick={handleClearLogs}
            className="p-1 text-white/40 hover:text-red-400 transition-colors"
            title="Wipe Logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 text-white/40 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Logs Stream */}
      {isOpen && (
        <div className="h-40 overflow-y-auto p-2 bg-black/90 font-mono text-[10px] flex flex-col gap-1 scrollbar-thin select-text">
          {filteredLogs.length === 0 ? (
            <span className="text-white/30 italic">No activity registered on current coordinates.</span>
          ) : (
            filteredLogs.map((log) => {
              const badge = getBadgeStyle(log.type);
              return (
                <div key={log.id} className="flex items-start gap-1.5 text-white/85 leading-tight">
                  <span className="text-white/30 text-[9px] select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  
                  {/* Category Type Badge */}
                  <span
                    className="text-[8px] font-bold px-1 py-0.2 rounded border uppercase tracking-wider select-none shrink-0"
                    style={{
                      color: badge.color,
                      borderColor: badge.borderColor,
                      backgroundColor: badge.bg,
                    }}
                  >
                    {log.type}
                  </span>

                  <span className="flex-1 break-all select-text text-white/80">{log.message}</span>
                  
                  {log.nodeId && (
                    <span className="text-[8px] text-blue-400 font-bold shrink-0">
                      ID: {log.nodeId.slice(0, 6)}
                    </span>
                  )}
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      )}
    </div>
  );
}
