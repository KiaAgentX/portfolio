'use client';

import React, { useState, useMemo } from 'react';
import { DollarSign, Code2, Search, ArrowUpDown, Eye, FileCode, Layers, Filter, Sparkles } from 'lucide-react';

interface FileValuation {
  id: number;
  path: string;
  name: string;
  lines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  sizeBytes: number;
  category: string;
  complexity: string;
  ratePerLoc: number;
  estimatedValueUsd: number;
  purposeFa: string;
  status: string;
}

interface FilesValuationTableProps {
  files: FileValuation[];
  onViewFileCode: (filePath: string) => void;
}

export const FilesValuationTable: React.FC<FilesValuationTableProps> = ({ files, onViewFileCode }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'lines' | 'value' | 'code' | 'name' | 'size'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(files.map(f => f.category)));
  }, [files]);

  // Filtered & Sorted files
  const processedFiles = useMemo(() => {
    return files
      .filter(f => {
        const matchesSearch =
          f.path.toLowerCase().includes(search.toLowerCase()) ||
          f.purposeFa.toLowerCase().includes(search.toLowerCase()) ||
          f.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const mult = sortOrder === 'desc' ? -1 : 1;
        if (sortBy === 'value') return (a.estimatedValueUsd - b.estimatedValueUsd) * mult;
        if (sortBy === 'lines') return (a.lines - b.lines) * mult;
        if (sortBy === 'code') return (a.codeLines - b.codeLines) * mult;
        if (sortBy === 'size') return (a.sizeBytes - b.sizeBytes) * mult;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * mult;
        return 0;
      });
  }, [files, search, selectedCategory, sortBy, sortOrder]);

  const toggleSort = (field: 'lines' | 'value' | 'code' | 'name' | 'size') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalFilteredValue = processedFiles.reduce((acc, curr) => acc + curr.estimatedValueUsd, 0);
  const totalFilteredLines = processedFiles.reduce((acc, curr) => acc + curr.lines, 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Panel */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">جدول ارزش‌گذاری و قیمت هر تکه کد به دلار</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {processedFiles.length} فایل از {files.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              قیمت‌گذاری ریز هر فایل بر اساس تعداد خطوط کد مفید، پیچیدگی منطق نرم‌افزاری و نرخ استاندارد توسعه هوش مصنوعی و تلگرام.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium">
            <span className="text-slate-400">مجموع ارزش فایل‌های انتخابی:</span>
            <span className="text-indigo-300 font-extrabold text-sm dir-ltr">{formatUsd(totalFilteredValue)}</span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام فایل، مسیر یا توضیحات..."
              className="w-full pr-9 pl-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">همه دسته‌بندی‌ها ({files.length} فایل)</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="value">مرتب‌سازی بر اساس قیمت دلاری</option>
              <option value="lines">مرتب‌سازی بر اساس تعداد خطوط (LOC)</option>
              <option value="code">مرتب‌سازی بر اساس خطوط کد مفید</option>
              <option value="size">مرتب‌سازی بر اساس حجم فایل</option>
              <option value="name">مرتب‌سازی بر اساس نام فایل</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 text-xs transition-colors"
              title="تغییر جهت صعودی/نزولی"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Valuation Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">نام و مسیر فایل</th>
                <th className="py-3.5 px-3">دسته‌بندی و پیچیدگی</th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => toggleSort('lines')}>
                  <div className="flex items-center gap-1">
                    <span>خطوط (LOC)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => toggleSort('code')}>
                  <div className="flex items-center gap-1">
                    <span>کد مفید</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3">نرخ هر خط ($/LOC)</th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => toggleSort('value')}>
                  <div className="flex items-center gap-1">
                    <span>قیمت تخمینی ($)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">توضیح کارکرد ماژول</th>
                <th className="py-3.5 px-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedFiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    هیچ فایلی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                processedFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Path & Name */}
                    <td className="py-3 px-4 font-mono dir-ltr text-left">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="font-bold text-slate-200 block text-xs">{f.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">{f.path}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 block w-max mb-1">
                        {f.category}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {f.complexity}
                      </span>
                    </td>

                    {/* Total Lines */}
                    <td className="py-3 px-3 font-mono text-slate-200 font-semibold">
                      {formatNumber(f.lines)}
                    </td>

                    {/* Code Lines */}
                    <td className="py-3 px-3 font-mono text-emerald-400 font-medium">
                      {formatNumber(f.codeLines)}
                    </td>

                    {/* Rate per LOC */}
                    <td className="py-3 px-3 font-mono text-slate-400 dir-ltr text-left">
                      ${f.ratePerLoc}
                    </td>

                    {/* Price USD */}
                    <td className="py-3 px-3 font-mono dir-ltr text-left">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 inline-block">
                        {formatUsd(f.estimatedValueUsd)}
                      </span>
                    </td>

                    {/* Purpose Description */}
                    <td className="py-3 px-4 text-slate-300 leading-normal max-w-[240px]">
                      {f.purposeFa || 'توضیحات ماژول در ساختار پروژه'}
                    </td>

                    {/* Action: View Code */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onViewFileCode(f.path)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-medium transition-all flex items-center gap-1 mx-auto"
                        title="بازرسی سورس‌کد فایل"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
