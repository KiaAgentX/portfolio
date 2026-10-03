import React from "react";
import Markdown from "react-markdown";
import { X, Globe, Sparkles, BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import { CustomPage } from "../types";

interface CustomPageModalProps {
  page: CustomPage | null;
  onClose: () => void;
}

export const CustomPageModal: React.FC<CustomPageModalProps> = ({ page, onClose }) => {
  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-emerald-500/20 font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold uppercase">
                  PAGE // {page.slug}
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white mt-0.5">
                {page.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Close Page</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-200 font-sans">
          {page.description && (
            <div className="p-4 bg-emerald-950/20 border-l-4 border-emerald-400 rounded-r-xl text-emerald-200 text-sm italic">
              {page.description}
            </div>
          )}

          <div className="prose prose-invert prose-emerald max-w-none text-slate-300 space-y-4 leading-relaxed">
            <Markdown>{page.content}</Markdown>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-white/10 flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Virtual Endpoint: https://neuro-os.ai{page.slug.startsWith("/") ? "" : "/"}{page.slug}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl transition-colors font-bold uppercase tracking-wider"
          >
            Return to OS
          </button>
        </div>
      </div>
    </div>
  );
};
