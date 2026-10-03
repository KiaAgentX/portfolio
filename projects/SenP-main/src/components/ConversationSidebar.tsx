import React from "react";
import { SavedConversation } from "../types";
import { Folder, Trash2, X, MessageSquare, Clock } from "lucide-react";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: SavedConversation[];
  onLoad: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  onLoad,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end select-none font-mono text-xs animate-in fade-in duration-150">
      <div className="w-80 sm:w-96 bg-[#0d1117] border-l border-cyan-500/50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-gray-800 text-cyan-400 font-bold uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-cyan-400" />
            <span>Saved Neural Archives ({conversations.length})</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="text-gray-500 italic text-center py-12">No archived conversations. Send messages or switch tabs to auto-archive.</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onLoad(c.id);
                  onClose();
                }}
                className="group p-3 rounded-lg border border-gray-800 bg-[#141820] hover:border-cyan-500/80 cursor-pointer transition-all flex flex-col gap-1 relative shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-gray-200 font-sans text-xs truncate max-w-[80%] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{c.title || "Untitled Neural Session"}</span>
                  </div>
                  <button
                    onClick={(e) => onDelete(c.id, e)}
                    className="opacity-60 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all shrink-0"
                    title="Delete archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(c.date).toLocaleDateString()} {new Date(c.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="ml-auto text-amber-400/80 font-semibold">{c.messages.length} msgs</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-gray-800 bg-[#141820]">
            <button
              onClick={onClearAll}
              className="w-full py-2 rounded-lg bg-red-950/80 border border-red-600/80 text-red-300 font-bold uppercase tracking-wider hover:bg-red-900 transition-colors shadow-sm"
            >
              Clear All Archives
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
