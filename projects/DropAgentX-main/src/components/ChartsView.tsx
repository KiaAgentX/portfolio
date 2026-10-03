'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, Code2 } from 'lucide-react';

interface ChartsViewProps {
  files: any[];
  techStack: any[];
  categoryStats: Record<string, { count: number; lines: number; codeLines: number; valueUsd: number }>;
}

const COLORS = ['#6366F1', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6'];

export const ChartsView: React.FC<ChartsViewProps> = ({ files, techStack, categoryStats }) => {
  // Pie chart data: Valuation per Category
  const pieData = Object.entries(categoryStats).map(([cat, stat]) => ({
    name: cat,
    value: stat.valueUsd,
    lines: stat.lines,
  }));

  // Bar chart data: Top 15 largest files by total line count
  const top15Files = [...files]
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 15)
    .map(f => ({
      name: f.name.length > 20 ? f.name.substring(0, 18) + '...' : f.name,
      fullName: f.name,
      lines: f.lines,
      codeLines: f.codeLines,
      valueUsd: f.estimatedValueUsd,
    }));

  const formatUsd = (num: number) => {
    return `$${num.toLocaleString('en-US')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Chart 1: Valuation Breakdown by Category (Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart Card */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">توزیع ارزش دلاری به تفکیک ماژول‌ها</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            سهم هر بخش از پروژه DropAgentXBot (هوش مصنوعی، فرانت‌اند، دیتابیس، زیرساخت) در قیمت کل سورس‌کد.
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatUsd(Number(val)), 'ارزش تخمینی']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Category Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-indigo-300 dir-ltr">{formatUsd(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Distribution Card */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">تکنولوژی‌ها و درصد حجم زبان‌های برنامه‌نویسی</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              ترکیب زبان‌های برنامه‌نویسی استفاده شده در DropAgentXBot شامل پایتون، جاوااسکریپت و کدهای ساختاری.
            </p>

            <div className="space-y-4">
              {techStack.map((tech, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }} />
                      {tech.name}
                    </span>
                    <span className="text-slate-400 dir-ltr font-mono">{tech.percentage}% ({tech.category})</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${tech.percentage}%`, backgroundColor: tech.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mt-6">
            <span className="font-bold text-indigo-300 block mb-1">💡 نتیجه‌گیری فنی معماری:</span>
            بیش از ۴۶٪ منطق برنامه با پایتون ۳.۱۱ نوشته شده و ۳۸٪ آن فرانت‌اند تعاملی SPA تلگرام و کاکپیت ادمین است که حاکی از توازن کامل منطق AI و تجربه کاربری مدرن است.
          </div>
        </div>

      </div>

      {/* Chart 2: Top 15 Largest Files by LOC (Bar Chart) */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">۱۵ فایل بزرگ پروژه بر اساس تعداد خطوط کد (LOC)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">مرتب‌سازی نزولی</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top15Files} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} angle={-35} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                formatter={(val: any, name: any) => [val, name === 'lines' ? 'کل خطوط (LOC)' : 'خطوط کد مفید']}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="lines" fill="#6366F1" radius={[6, 6, 0, 0]} name="lines" />
              <Bar dataKey="codeLines" fill="#10B981" radius={[6, 6, 0, 0]} name="codeLines" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
