import React, { useEffect, useRef } from "react";
import { Message } from "../types";
import { MessageItem } from "./MessageItem";
import { Pin, X, ArrowDown, ArrowRight, Search, Radio, Activity } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  onCopyText: (text: string) => void;
  onSpeak: (text: string) => void;
  onTogglePin: (id: string) => void;
  onRegenerate: (id: string) => void;
  onContinue: (id: string) => void;
  onFeedback: (id: string, type: "up" | "down") => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onRunCode?: (code: string) => void;
  onOpenFrontEnd?: (code: string, lang: string) => void;
  speakingMsgId: string | null;
  isStreaming: boolean;
  streamingText: string;
  pinnedMessages: Message[];
  searchActive: boolean;
  searchQuery: string;
  onSearchSelect: (id: string) => void;
  onCloseSearch: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onCopyText,
  onSpeak,
  onTogglePin,
  onRegenerate,
  onContinue,
  onFeedback,
  onEdit,
  onDelete,
  onRunCode,
  onOpenFrontEnd,
  speakingMsgId,
  isStreaming,
  streamingText,
  pinnedMessages,
  searchActive,
  searchQuery,
  onSearchSelect,
  onCloseSearch,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, isStreaming]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  // Filter messages for search
  const searchResults = React.useMemo(() => {
    if (!searchActive || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.content.toLowerCase().includes(q));
  }, [searchActive, searchQuery, messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-gradient-to-b from-[#0a0c10]/40 to-[#0e1218]/40 overflow-hidden">
      {/* Pinned Messages Bar */}
      {pinnedMessages.length > 0 && (
        <div className="px-3 py-1.5 bg-amber-950/20 border-b border-amber-500/30 text-xs font-mono select-none max-h-28 overflow-y-auto shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1 text-[10px] uppercase tracking-wider">
            <Pin className="w-3 h-3" />
            <span>Pinned Neural Concepts ({pinnedMessages.length})</span>
          </div>
          <div className="space-y-1">
            {pinnedMessages.map(pm => (
              <div key={pm.id} className="flex items-center justify-between gap-2 bg-black/40 px-2 py-1 rounded border border-amber-500/20 text-gray-300">
                <span className="truncate max-w-[85%] text-[11px]">{pm.content}</span>
                <button
                  onClick={() => onTogglePin(pm.id)}
                  className="text-gray-500 hover:text-red-400 p-0.5"
                  title="Unpin concept"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Overlay */}
      {searchActive && (
        <div className="absolute inset-0 bg-[#0d1117]/98 z-30 flex flex-col p-4 font-mono select-none animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 text-gray-200">
            <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs uppercase tracking-wider">
              <Search className="w-4 h-4" />
              <span>Search Results for &quot;{searchQuery}&quot; ({searchResults.length})</span>
            </div>
            <button
              onClick={onCloseSearch}
              className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {searchResults.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">No matching messages found in this tab.</div>
            ) : (
              searchResults.map((res, i) => (
                <div
                  key={res.id}
                  onClick={() => {
                    onSearchSelect(res.id);
                    onCloseSearch();
                  }}
                  className="p-2.5 rounded-lg border border-gray-800 bg-[#141820] hover:border-cyan-500 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-bold uppercase">
                    <span>{res.role} · Match #{i + 1}</span>
                    <span>{new Date(res.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="text-gray-300 line-clamp-2 font-sans">{res.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 font-mono select-none">
            <Activity className="w-10 h-10 text-cyan-500/40 animate-pulse mb-3" />
            <h3 className="text-sm font-bold text-gray-300 tracking-wider uppercase mb-1">Cortex Synapse Ready</h3>
            <p className="max-w-md text-xs text-gray-500 leading-relaxed">
              Initiate a neural stimulus below. Ask SenPai a question, attach code or documents, or trigger Autonomous Mission Mode.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onCopyText={onCopyText}
              onSpeak={onSpeak}
              onTogglePin={onTogglePin}
              onRegenerate={onRegenerate}
              onContinue={onContinue}
              onFeedback={onFeedback}
              onEdit={onEdit}
              onDelete={onDelete}
              onRunCode={onRunCode}
              onOpenFrontEnd={onOpenFrontEnd}
              isSpeaking={speakingMsgId === msg.id}
            />
          ))
        )}

        {/* Streaming / Typing Indicator */}
        {isStreaming && (
          <div className="flex flex-col gap-1 items-start max-w-[85%] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-[#11131a] border border-purple-500/20 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-spin text-cyan-400" />
              <span>SENPAI NEURAL PROCESSING...</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl rounded-tl-none bg-[#11131a] border border-purple-500/20 text-gray-100 shadow-md text-xs sm:text-[13px] font-sans whitespace-pre-wrap w-full">
              {streamingText || <span className="text-gray-500 italic font-mono">Receiving synaptic token stream...</span>}
              <span className="inline-block ml-1 w-2 h-4 bg-cyan-400 animate-pulse align-middle" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-[#161b22] border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-lg transition-all animate-bounce"
          title="Scroll to bottom"
        >
          <ArrowRight className="w-4 h-4 rotate-90" />
        </button>
      )}
    </div>
  );
};
