'use client';

import React, { useState } from 'react';
import { Bot, Code2, Search, RefreshCw, Sparkles, Layers, ShieldCheck, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentRepoUrl: string;
  onAnalyzeRepo: (url: string) => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRepoUrl, onAnalyzeRepo, isLoading }) => {
  const [inputUrl, setInputUrl] = useState(currentRepoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyzeRepo(inputUrl.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#0F172A]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  ارزیاب و ارزش‌گذار DropAgentXBot
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  تحلیل تخصصی ۲0۲۶
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                بررسی ارزش ریپوزیتوری، خطوط کد، قابلیت‌ها، نقاط ضعف و قیمت‌گذاری تک‌تک فایل‌ها به دلار
              </p>
            </div>
          </div>

          {/* Repo Input Search Form */}
          <form onSubmit={handleSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Code2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="لینک ریپوزیتوری گیت‌هاب (مثلاً https://github.com/ImXforever/DropAgentXBot)..."
                className="w-full pl-24 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-left dir-ltr"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute left-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>تحلیل</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Direct Link to Target Repo */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ImXforever/DropAgentXBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all group"
            >
              <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-left dir-ltr">ImXforever/DropAgentXBot</span>
              <span className="sm:hidden">مشاهده گیت‌هاب</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
