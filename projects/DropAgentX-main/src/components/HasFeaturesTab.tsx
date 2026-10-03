'use client';

import React, { useState } from 'react';
import { CheckCircle2, Sparkles, FileCode, Layers, ShieldCheck, Search, Info } from 'lucide-react';

interface FeatureItem {
  category: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  files: string[];
  importance: 'high' | 'medium' | 'critical';
}

interface HasFeaturesTabProps {
  features: FeatureItem[];
  onViewFile: (filePath: string) => void;
}

export const HasFeaturesTab: React.FC<HasFeaturesTabProps> = ({ features, onViewFile }) => {
  const [searchTerm, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(features.map(f => f.category)));

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.descriptionFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.files.some(file => file.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">حیاتی و کلیدی</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">اهمیت بالا</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30">استاندارد</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">قابلیت‌ها و امکانات پیاده‌سازی شده (چیا داره)</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {features.length} بخش اصلی
            </span>
          </div>
          <p className="text-xs text-slate-400">
            بررسی جامع قابلیت‌های عملیاتی موجود در سورس‌کد DropAgentXBot شامل موتور هوش مصنوعی، مینی‌اپ RTL، بازار محصولات و اتوماسیون.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="جستجو در قابلیت‌ها و فایل‌ها..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">همه دسته‌بندی‌ها ({features.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category & Badge Header */}
              <div className="flex items-center justify-between mb-3 gap-2">
                <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  {item.category}
                </span>
                {getImportanceBadge(item.importance)}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {item.titleFa}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono dir-ltr mb-3 text-left">
                {item.titleEn}
              </p>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.descriptionFa}
              </p>
            </div>

            {/* Associated Files */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                فایل‌های مربوطه در سورس‌کد:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.files.map((file, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => onViewFile(file)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-slate-700/80 text-[11px] font-mono dir-ltr flex items-center gap-1 transition-all group"
                    title={`مشاهده کدهای ${file}`}
                  >
                    <FileCode className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>{file}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
