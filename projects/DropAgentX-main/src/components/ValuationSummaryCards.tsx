'use client';

import React from 'react';
import { DollarSign, Code2, FolderGit2, ShieldCheck, Zap, Layers, Award, Sparkles, Building2, Tag } from 'lucide-react';

interface SummaryProps {
  data: {
    totalFiles: number;
    totalLines: number;
    codeLines: number;
    commentLines: number;
    blankLines: number;
    estimatedValueUsd: number;
    marketDevCostRangeUsd: string;
    commercialSaleValUsd: string;
    qualityScore: number;
    securityScore: number;
    architectureScore: number;
  };
}

export const ValuationSummaryCards: React.FC<SummaryProps> = ({ data }) => {
  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Main Valuation Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Micro LOC Component Valuation */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/90 glow-blue">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              ارزش میکرومتریک سورس‌کد
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="text-3xl font-black text-white tracking-tight text-left dir-ltr mb-1">
            {formatUsd(data.estimatedValueUsd)}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            مجموع قیمت تخمینی قطعات کد پروژه بر اساس نرخ استانداردهای جهانی توسعه هوش مصنوعی و ربات تلگرام به دلار.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">میانگین هر خط کد:</span>
            <span className="font-bold text-indigo-300 dir-ltr">${Math.round(data.estimatedValueUsd / (data.codeLines || 1))}/LOC</span>
          </div>
        </div>

        {/* Card 2: Agency Development Cost */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-900/90 glow-emerald">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-400" />
              هزینه توسعه مجدد تیم اختصاصی
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight text-left dir-ltr mb-1">
            {data.marketDevCostRangeUsd}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            برآورد هزینه و زمان لازم جهت سفارش ساخت مجدد این سیستم به یک آژانس توسعه نرم‌افزار حرفه‌ای.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">زمان توسعه برآوردی:</span>
            <span className="font-bold text-emerald-300">۸۵۰ تا ۱,۲۰۰ ساعت کاری</span>
          </div>
        </div>

        {/* Card 3: Commercial Sale Value */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-slate-900/90">
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-400" />
              قیمت فروش تجاری آماده به کار
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight text-left dir-ltr mb-1">
            {data.commercialSaleValUsd}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            ارزش بازار سورس‌کد و شاسی آماده به عنوان محصول SaaS یا لایسنس تجاری برای سرمایه‌گذار.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="text-slate-400">سطح آمادگی محصول:</span>
            <span className="font-bold text-purple-300">Turnkey Asset (آماده راه‌اندازی)</span>
          </div>
        </div>

      </div>

      {/* Code Metrics Secondary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Lines */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">
              {formatNumber(data.totalLines)}
            </div>
            <p className="text-xs text-slate-400 font-medium">کل خطوط کد (LOC)</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {formatNumber(data.codeLines)} خط کد خالص
            </p>
          </div>
        </div>

        {/* Metric 2: Total Files */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">
              {formatNumber(data.totalFiles)}
            </div>
            <p className="text-xs text-slate-400 font-medium">تعداد کل فایل‌ها</p>
            <p className="text-[10px] text-slate-500 mt-0.5">پایتون، فرانت‌اند، داکر و کانفیگ</p>
          </div>
        </div>

        {/* Metric 3: Architecture Score */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-300 font-mono">
              {data.architectureScore}٪
            </div>
            <p className="text-xs text-slate-400 font-medium">امتیاز معماری سیستم</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ماژولار و چند ایجنتی</p>
          </div>
        </div>

        {/* Metric 4: Quality & Security Score */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-300 font-mono">
              {data.qualityScore}٪
            </div>
            <p className="text-xs text-slate-400 font-medium">کیفیت و خوانایی کد</p>
            <p className="text-[10px] text-slate-500 mt-0.5">امنیت: {data.securityScore}٪</p>
          </div>
        </div>

      </div>

    </div>
  );
};
