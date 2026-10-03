import React from "react";
import { ConversationTab } from "../types";
import { Plus, X, MessageSquare } from "lucide-react";

interface TabBarProps {
  tabs: ConversationTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
}) => {
  return (
    <div className="flex items-center gap-1.5 px-6 py-1.5 border-b border-white/10 bg-slate-950/40 backdrop-blur-md overflow-x-auto scrollbar-none select-none shrink-0 font-mono text-xs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg border-t border-l border-r cursor-pointer transition-all duration-150 max-w-[160px] sm:max-w-[200px] shrink-0 ${
              isActive
                ? "bg-white/10 border-cyan-400/80 text-cyan-400 font-bold shadow-[0_-2px_12px_rgba(34,211,238,0.25)] backdrop-blur-md"
                : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
            <span className="truncate text-[11px] font-mono tracking-wide uppercase">{tab.name}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => onCloseTab(tab.id, e)}
                className="p-0.5 rounded opacity-60 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 transition-all ml-auto shrink-0"
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onAddTab}
        className="flex items-center justify-center p-1.5 rounded-lg border border-dashed border-white/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all ml-1 shrink-0"
        title="New conversation tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
