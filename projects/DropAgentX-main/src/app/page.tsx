'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ValuationSummaryCards } from '@/components/ValuationSummaryCards';
import { HasFeaturesTab } from '@/components/HasFeaturesTab';
import { LacksFeaturesTab } from '@/components/LacksFeaturesTab';
import { FilesValuationTable } from '@/components/FilesValuationTable';
import { CodeInspectorModal } from '@/components/CodeInspectorModal';
import { ChartsView } from '@/components/ChartsView';
import { ValuationCalculator } from '@/components/ValuationCalculator';
import { ReportExport } from '@/components/ReportExport';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  BarChart3,
  Calculator,
  Download,
  Bot,
  RefreshCw,
  Sparkles,
  Layers,
  Code2
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'has_features' | 'lacks_features' | 'files_valuation' | 'charts' | 'calculator' | 'export'
  >('overview');

  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/ImXforever/DropAgentXBot');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [filesData, setFilesData] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal inspector
  const [selectedInspectFile, setSelectedInspectFile] = useState<string | null>(null);

  const fetchInitialData = async (repoName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch summary
      const resSummary = await fetch(`/api/analysis?repo=${repoName}`);
      const dataSummary = await resSummary.json();

      if (!dataSummary.success) {
        throw new Error(dataSummary.error || 'خطا در بارگذاری داده‌های اولیه');
      }

      setAnalysisData(dataSummary.data);

      // Fetch files breakdown
      const resFiles = await fetch(`/api/analysis/files?repo=${repoName}&sortBy=value&sortOrder=desc`);
      const dataFiles = await resFiles.json();

      if (dataFiles.success) {
        setFilesData(dataFiles.files);
        setCategoryStats(dataFiles.categoryStats);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial dashboard fetch on mount (async continuation, not a render cascade)
    fetchInitialData('DropAgentXBot');
  }, []);

  const handleAnalyzeCustomRepo = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setRepoUrl(url);

      const res = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'تحلیل ریپوزیتوری با خطا مواجه شد.');
      }

      // Format response as analysisData and filesData
      const info = data.repoInfo;
      setAnalysisData({
        repoUrl: url,
        repoName: info.repo,
        owner: info.owner,
        totalFiles: info.totalFiles,
        totalLines: info.totalLines,
        codeLines: info.codeLines,
        commentLines: Math.round(info.totalLines * 0.1),
        blankLines: Math.round(info.totalLines * 0.05),
        estimatedValueUsd: info.estimatedValueUsd,
        marketDevCostRangeUsd: `$${Math.round(info.estimatedValueUsd * 0.15).toLocaleString()} - $${Math.round(info.estimatedValueUsd * 0.25).toLocaleString()} USD`,
        commercialSaleValUsd: `$${Math.round(info.estimatedValueUsd * 0.08).toLocaleString()} - $${Math.round(info.estimatedValueUsd * 0.12).toLocaleString()} USD`,
        qualityScore: 85,
        securityScore: 80,
        architectureScore: 88,
        hasFeatures: analysisData?.hasFeatures || [],
        lacksFeatures: analysisData?.lacksFeatures || [],
        techStack: analysisData?.techStack || [],
      });

      setFilesData(data.files);
    } catch (err: any) {
      setError(err.message || 'خطا در تحلیل لینک ریپوزیتوری');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      
      {/* Navbar */}
      <Navbar currentRepoUrl={repoUrl} onAnalyzeRepo={handleAnalyzeCustomRepo} isLoading={isLoading} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Repository Header Title Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  گزارش رسمی ارزیابی و قیمت‌گذاری
                </span>
                <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 dir-ltr">
                  ImXforever/DropAgentXBot
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                ارزیابی سورس‌کد، قابلیت‌ها، کمبودها و ارزیابی دلاری پروژه DropAgentXBot
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                تحلیل جامع ربات مارکت‌پلیس تلگرام مجهز به ایجنت هوش مصنوعی Hermes، مینی‌اپ اختصاصی RTL، کاکپیت مدیریت سنپای و سیستم اقتصاد کردیت.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('export')}
                className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <Download className="w-4 h-4" />
                <span>دریافت گزارش JSON / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>نمای کلی و ارزش‌گذاری</span>
          </button>

          <button
            onClick={() => setActiveTab('has_features')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'has_features'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>چیا داره (قابلیت‌ها)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
              {analysisData?.hasFeatures?.length || 8}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lacks_features')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'lacks_features'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>چیا نداره (کمبودها و باگ‌ها)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
              {analysisData?.lacksFeatures?.length || 6}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('files_valuation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'files_valuation'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>قیمت هر تکه کد به دلار</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
              {filesData.length || 71} فایل
            </span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'charts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>نمودارهای تحلیلی</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>ماشین‌حساب ارزش‌گذاری</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'export'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>خروجی و پرینت</span>
          </button>
        </div>

        {/* Dynamic Loading / Error State */}
        {isLoading ? (
          <div className="glass-panel p-16 rounded-3xl border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-10 h-10 animate-spin text-indigo-400" />
            <h3 className="text-base font-bold text-white">در حال استخراج و آنالیز خط به خط سورس‌کد DropAgentXBot...</h3>
            <p className="text-xs text-slate-400 max-w-md">
              محاسبه خطوط کد مفید، وزن ماژول‌ها، هزینه توسعه مجدد و ارزش‌گذاری میکرومتریک تک‌تک فایل‌ها به دلار.
            </p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 rounded-2xl border-rose-500/30 bg-rose-500/10 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-200">خطا در دریافت یا تحلیل اطلاعات</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchInitialData('DropAgentXBot')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <div>
            
            {/* TAB 1: Overview & Summary */}
            {activeTab === 'overview' && analysisData && (
              <div className="space-y-8">
                <ValuationSummaryCards data={analysisData} />

                {/* Quick Highlights Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Implemented Highlights Preview */}
                  <div className="glass-panel p-6 rounded-2xl border-emerald-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        خلاصه قابلیت‌های برجسته (چیا داره)
                      </h3>
                      <button
                        onClick={() => setActiveTab('has_features')}
                        className="text-xs text-emerald-400 hover:underline font-medium"
                      >
                        مشاهده همه ({analysisData.hasFeatures?.length})
                      </button>
                    </div>

                    <div className="space-y-2">
                      {analysisData.hasFeatures?.slice(0, 4).map((f: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                          <span className="font-bold text-slate-200 block mb-0.5">{f.titleFa}</span>
                          <p className="text-[11px] text-slate-400 truncate">{f.descriptionFa}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lacks Highlights Preview */}
                  <div className="glass-panel p-6 rounded-2xl border-rose-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        خلاصه کمبودها و باگ‌ها (چیا نداره)
                      </h3>
                      <button
                        onClick={() => setActiveTab('lacks_features')}
                        className="text-xs text-rose-400 hover:underline font-medium"
                      >
                        مشاهده همه ({analysisData.lacksFeatures?.length})
                      </button>
                    </div>

                    <div className="space-y-2">
                      {analysisData.lacksFeatures?.slice(0, 4).map((l: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                          <span className="font-bold text-rose-300 block mb-0.5">{l.titleFa}</span>
                          <p className="text-[11px] text-slate-400 truncate">{l.descriptionFa}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: Has Features */}
            {activeTab === 'has_features' && analysisData?.hasFeatures && (
              <HasFeaturesTab
                features={analysisData.hasFeatures}
                onViewFile={(filePath) => setSelectedInspectFile(filePath)}
              />
            )}

            {/* TAB 3: Lacks Features */}
            {activeTab === 'lacks_features' && analysisData?.lacksFeatures && (
              <LacksFeaturesTab lacks={analysisData.lacksFeatures} />
            )}

            {/* TAB 4: Files Valuation Table */}
            {activeTab === 'files_valuation' && (
              <FilesValuationTable
                files={filesData}
                onViewFileCode={(filePath) => setSelectedInspectFile(filePath)}
              />
            )}

            {/* TAB 5: Charts */}
            {activeTab === 'charts' && analysisData && (
              <ChartsView
                files={filesData}
                techStack={analysisData.techStack || []}
                categoryStats={categoryStats}
              />
            )}

            {/* TAB 6: Calculator */}
            {activeTab === 'calculator' && analysisData && (
              <ValuationCalculator
                baseCodeLines={analysisData.codeLines}
                baseValuation={analysisData.estimatedValueUsd}
              />
            )}

            {/* TAB 7: Export & Print */}
            {activeTab === 'export' && analysisData && (
              <ReportExport analysisData={analysisData} filesData={filesData} />
            )}

          </div>
        )}

      </main>

      {/* Code Inspector Modal */}
      <CodeInspectorModal
        filePath={selectedInspectFile}
        onClose={() => setSelectedInspectFile(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0F172A]/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            ارزیابی تخصصی و ارزش‌گذاری پروژه DropAgentXBot — تحلیل ۲0۲۶
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            LOC Metric Valuation Standard · AI Agent Valuation Engine
          </div>
        </div>
      </footer>

    </div>
  );
}
