'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2, Search, Filter } from 'lucide-react';

interface LackItem {
  category: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  impactFa: string;
  recommendationFa: string;
  severity: 'high' | 'medium' | 'critical';
}

interface LacksFeaturesTabProps {
  lacks: LackItem[];
}

export const LacksFeaturesTab: React.FC<LacksFeaturesTabProps> = ({ lacks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = lacks.filter(item => {
    const matchesSearch = item.titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.descriptionFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.recommendationFa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            نقص بحرانی (Critical Risk)
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            اهمیت بالا (High)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <InfoIcon className="w-3.5 h-3.5 text-blue-400" />
            پیشنهاد توسعه (Medium)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">کمبودها، نقاط ضعف و موارد نیازمند توسعه (چیا نداره)</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {lacks.length} مورد ارزیابی شده
            </span>
          </div>
          <p className="text-xs text-slate-400">
            شناسایی ریسک‌های فنی، گلوگاه‌های دیتابیس، امنیت وب و قابلیت‌های غایب در پروژه DropAgentXBot همراه با راهکار مهندسی.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در نقاط ضعف و راهکارها..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">همه سطوح ریسک ({lacks.length})</option>
            <option value="critical">بحرانی (Critical)</option>
            <option value="high">اهمیت بالا (High)</option>
            <option value="medium">متوسط (Medium)</option>
          </select>
        </div>
      </div>

      {/* Lack Cards List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border-slate-800/90 hover:border-rose-500/40 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  دسته‌بندی: {item.category}
                </span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${item.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                  {item.titleFa}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono dir-ltr text-left mt-0.5">
                  {item.titleEn}
                </p>
              </div>
              <div className="shrink-0">
                {getSeverityBadge(item.severity)}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {item.descriptionFa}
            </p>

            {/* Impact & Recommendation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
              
              {/* Impact */}
              <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-xs font-bold text-rose-300 block mb-1">
                  ⚠️ پیامد و اثر روی سیستم (Impact):
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.impactFa}
                </p>
              </div>

              {/* Recommendation */}
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <span className="text-xs font-bold text-indigo-300 block mb-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                  💡 راهکار و پیشنهاد توسعه مهندسی:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.recommendationFa}
                </p>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </svg>
  );
}
