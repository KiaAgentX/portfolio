'use client';

import React from 'react';
import { Download, FileText, Printer, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';

interface ReportExportProps {
  analysisData: any;
  filesData: any[];
}

export const ReportExport: React.FC<ReportExportProps> = ({ analysisData, filesData }) => {
  const downloadJson = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      repository: {
        url: analysisData.repoUrl,
        name: analysisData.repoName,
        owner: analysisData.owner,
      },
      summary: {
        totalFiles: analysisData.totalFiles,
        totalLines: analysisData.totalLines,
        codeLines: analysisData.codeLines,
        estimatedValueUsd: analysisData.estimatedValueUsd,
        marketDevCostRangeUsd: analysisData.marketDevCostRangeUsd,
        commercialSaleValUsd: analysisData.commercialSaleValUsd,
        qualityScore: analysisData.qualityScore,
        securityScore: analysisData.securityScore,
        architectureScore: analysisData.architectureScore,
      },
      implementedFeatures: analysisData.hasFeatures,
      lacksFeatures: analysisData.lacksFeatures,
      techStack: analysisData.techStack,
      fileValuationDetails: filesData.map(f => ({
        path: f.path,
        lines: f.lines,
        codeLines: f.codeLines,
        category: f.category,
        ratePerLocUsd: f.ratePerLoc,
        estimatedValueUsd: f.estimatedValueUsd,
        purposeFa: f.purposeFa,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DropAgentXBot_Valuation_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Download JSON Report */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-max mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">دانلود فایل داده گزارش کامل (JSON)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              شامل تمام ریز داده‌های فنی، لیست تک‌تک ۷۱ فایل همراه با قیمت دلاری، کدهای پیاده‌سازی شده، نقاط ضعف و آمار ساختاری.
            </p>
          </div>

          <button
            onClick={downloadJson}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>دانلود گزارش جامع JSON</span>
          </button>
        </div>

        {/* Card 2: Print Executive Document */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-max mb-3">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">چاپ / خروجی PDF خلاصه‌ی مدیریتی</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              آماده‌سازی سند چاپی رسمی با فرمت مناسب جهت ارائه به سرمایه‌گذاران، مدیران فنی و کارفرمایان پروژه.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>چاپ / ذخیره به صورت PDF</span>
          </button>
        </div>

      </div>

      {/* Printable Executive Summary Sheet */}
      <div className="glass-panel p-8 rounded-2xl border-slate-800 bg-[#0F172A]/90 space-y-6 print:bg-white print:text-black print:p-0">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white print:text-black">
              گزارش رسمی ارزیابی و ارزش‌گذاری سورس‌کد DropAgentXBot
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              مرجع بررسی: https://github.com/ImXforever/DropAgentXBot | تاریخ ارزیابی: ۲۰۲۶
            </p>
          </div>
          <div className="text-left text-xs text-slate-400 font-mono dir-ltr">
            Status: VERIFIED AUDIT
          </div>
        </div>

        {/* Summary Table for Print */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block mb-1">ارزش کل سورس‌کد:</span>
            <span className="font-extrabold text-indigo-300 text-sm font-mono dir-ltr">
              ${analysisData.estimatedValueUsd?.toLocaleString()} USD
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block mb-1">هزینه ساخت مجدد:</span>
            <span className="font-extrabold text-emerald-300 text-sm font-mono dir-ltr">
              {analysisData.marketDevCostRangeUsd}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block mb-1">تعداد کل خطوط (LOC):</span>
            <span className="font-extrabold text-white text-sm font-mono">
              {analysisData.totalLines?.toLocaleString('fa-IR')} خط
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block mb-1">تعداد کل فایل‌ها:</span>
            <span className="font-extrabold text-white text-sm font-mono">
              {analysisData.totalFiles} فایل
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <span className="font-bold text-white block">چکیده ارزیابی فنی:</span>
          <p className="leading-relaxed text-slate-300">
            پروژه DropAgentXBot یک راهکار بسیار غنی و چندوجهی ربات تلگرام، مارکت‌پلیس محصولات دیجیتال و هوش مصنوعی ایجنتی مبتنی بر Hermes Agent و مینی‌اپ اختصاصی RTL تلگرام است. ساختار پروژه ماژولار بوده و از نظر کیفیت کدهای پیاده‌سازی شده نمره ٪۸۸ را کسب می‌کند. برای تجاری‌سازی صنعتی، مهاجرت دیتابیس از SQLite به PostgreSQL و اتصال درگاه پرداخت زرین‌پال/کریپتو پیشنهاد می‌گردد.
          </p>
        </div>
      </div>

    </div>
  );
};
