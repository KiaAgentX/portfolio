'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, DollarSign, Code2, RefreshCw, Terminal } from 'lucide-react';

interface CodeInspectorModalProps {
  filePath: string | null;
  onClose: () => void;
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({ filePath, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCode = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/analysis/file-content?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
      } else {
        setError(data.error || 'امکان بارگذاری محتوای فایل وجود نداشت');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در شبکه');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filePath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-open for the inspector modal
      fetchCode(filePath);
    }
  }, [filePath]);

  if (!filePath) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-2xl border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono dir-ltr text-left">
                {filePath}
              </h3>
              <p className="text-[11px] text-slate-400">
                نمایش زنده سورس‌کد پروژه DropAgentXBot ({lines.length} خط کد)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              disabled={isLoading || !content}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی کدها</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Code Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-[#0B0F17] font-mono text-xs text-slate-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span>در حال خواندن فایل از سورس‌کد...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 my-10">
              {error}
            </div>
          ) : (
            <div className="space-y-0.5 dir-ltr text-left">
              {lines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-900/60 rounded px-1 group">
                  <span className="w-12 shrink-0 text-slate-600 select-none text-right pr-3 text-[11px]">
                    {idx + 1}
                  </span>
                  <pre className="flex-1 whitespace-pre-wrap break-all text-slate-300 group-hover:text-white leading-relaxed">
                    {line || ' '}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>تعداد کل خطوط: <strong className="text-slate-200 font-mono">{lines.length}</strong></span>
            <span>حجم محتوا: <strong className="text-slate-200 font-mono">{(new Blob([content]).size / 1024).toFixed(1)} KB</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
