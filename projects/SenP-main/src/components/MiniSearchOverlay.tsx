import React, { useState, useEffect, useRef } from "react";
import { Search, MessageSquare, Folder, Terminal, ArrowRight, CornerDownLeft, Sparkles, X } from "lucide-react";
import { ConversationTab, SavedConversation, Message } from "../types";

interface MiniSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ConversationTab | null;
  savedConversations: SavedConversation[];
  onSelectMessage: (msgId: string) => void;
  onSelectConversation: (convId: string) => void;
  onOpenAdmin: () => void;
  onOpenMission: () => void;
}

interface SearchResult {
  id: string;
  type: "message" | "conversation" | "action";
  title: string;
  subtitle: string;
  meta?: string;
  action: () => void;
}

export const MiniSearchOverlay: React.FC<MiniSearchOverlayProps> = ({
  isOpen,
  onClose,
  activeTab,
  savedConversations,
  onSelectMessage,
  onSelectConversation,
  onOpenAdmin,
  onOpenMission,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results: SearchResult[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: SearchResult[] = [];

    // Quick system actions if empty or matches
    const actions = [
      { id: "act-admin", name: "Open Admin Portal & News Manager", desc: "Configure AI OS, News (Markdown), SKILL.md & Passwords", act: () => { onClose(); onOpenAdmin(); } },
      { id: "act-mission", name: "Launch Autonomous Mission Mode", desc: "3D cognitive task decomposition & execution", act: () => { onClose(); onOpenMission(); } },
    ];

    if (!q) {
      actions.forEach((a) => {
        list.push({
          id: a.id,
          type: "action",
          title: a.name,
          subtitle: a.desc,
          meta: "COMMAND",
          action: a.act,
        });
      });
    } else {
      actions.forEach((a) => {
        if (a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)) {
          list.push({
            id: a.id,
            type: "action",
            title: a.name,
            subtitle: a.desc,
            meta: "COMMAND",
            action: a.act,
          });
        }
      });
    }

    // Search active tab messages
    if (activeTab) {
      activeTab.messages.forEach((m) => {
        if (!q || m.content.toLowerCase().includes(q)) {
          const preview = m.content.replace(/\n/g, " ").slice(0, 85) + (m.content.length > 85 ? "..." : "");
          list.push({
            id: `msg-${m.id}`,
            type: "message",
            title: m.role === "user" ? "USER PROMPT" : "SENPAI RESPONSE",
            subtitle: preview,
            meta: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            action: () => {
              onClose();
              onSelectMessage(m.id);
            },
          });
        }
      });
    }

    // Search archives
    savedConversations.forEach((c) => {
      if (!q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q))) {
        list.push({
          id: `conv-${c.id}`,
          type: "conversation",
          title: c.title || "Untitled Conversation",
          subtitle: `Saved archive with ${c.messages.length} messages (${c.date})`,
          meta: "ARCHIVE",
          action: () => {
            onClose();
            onSelectConversation(c.id);
          },
        });
      }
    });

    return list.slice(0, 12);
  }, [query, activeTab, savedConversations, onClose, onOpenAdmin, onOpenMission, onSelectMessage, onSelectConversation]);

  useEffect(() => {
    if (selectedIndex >= results.length && results.length > 0) {
      setSelectedIndex(results.length - 1);
    }
  }, [results.length, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col font-mono text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-cyan-500/20 bg-slate-950/60">
          <Search className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type to search active messages, archived chats, or commands..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm font-sans"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold">ESC</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5 p-2">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">
              No neural records matching "{query}" found in current synapse memory.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "hover:bg-white/5 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      item.type === "action" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                      item.type === "conversation" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" :
                      "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    }`}>
                      {item.type === "action" ? <Terminal className="w-4 h-4" /> :
                       item.type === "conversation" ? <Folder className="w-4 h-4" /> :
                       <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs truncate">{item.title}</span>
                        {item.meta && (
                          <span className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-slate-400 uppercase tracking-wider">{item.meta}</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] truncate mt-0.5 font-sans">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 shrink-0">
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Search Footer */}
        <div className="px-4 py-2 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-slate-300">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-slate-300">ENTER</kbd> to jump</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>NEURAL SEARCH INDEX v4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
