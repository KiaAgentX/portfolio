'use client';

import React, { useState } from 'react';
import { Sliders, DollarSign, Calculator, RefreshCw, Sparkles, Building2, Zap } from 'lucide-react';

interface ValuationCalculatorProps {
  baseCodeLines: number;
  baseValuation: number;
}

export const ValuationCalculator: React.FC<ValuationCalculatorProps> = ({ baseCodeLines, baseValuation }) => {
  const [aiRate, setAiRate] = useState<number>(45); // $/LOC for AI
  const [backendRate, setBackendRate] = useState<number>(35); // $/LOC for Backend
  const [frontendRate, setFrontendRate] = useState<number>(25); // $/LOC for Frontend
  const [hourlyDevRate, setHourlyDevRate] = useState<number>(95); // $/hour

  // Calculated custom valuation
  // AI ~ 2,400 code lines
  // Backend ~ 7,800 code lines
  // Frontend ~ 11,500 code lines
  // Others ~ 2,287 code lines
  const customAiVal = 2400 * aiRate;
  const customBackendVal = 7800 * backendRate;
  const customFrontendVal = 11500 * frontendRate;
  const customOtherVal = 2287 * 15;

  const totalCustomValuation = customAiVal + customBackendVal + customFrontendVal + customOtherVal;

  // Estimated Dev Hours ~ 950 hrs
  const customDevCost = 950 * hourlyDevRate;

  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const handleReset = () => {
    setAiRate(45);
    setBackendRate(35);
    setFrontendRate(25);
    setHourlyDevRate(95);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">ماشین‌حساب و سندباکس شخصی‌سازی ارزش‌گذاری کدهای پروژه</h2>
          </div>
          <p className="text-xs text-slate-400">
            نرخ‌های دلار به ازای هر خط کد ($/LOC) یا دستمزد ساعتی توسعه‌دهندگان را تغییر دهید تا ارزش تخمینی پروژه بر اساس معیارهای شما محاسبه شود.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>بازنشانی به مقادیر پیش‌فرض</span>
        </button>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sliders Input Panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">تنظیم نرخ‌های محاسبه ($/LOC)</h3>
          </div>

          {/* Slider 1: AI Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">نرخ کدهای هوش مصنوعی و ایجنتی:</span>
              <span className="text-indigo-400 font-bold font-mono dir-ltr">${aiRate} / LOC</span>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              value={aiRate}
              onChange={(e) => setAiRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>۱۵ دلار (استاندارد)</span>
              <span>۱۰۰ دلار (بسیار تخصصی)</span>
            </div>
          </div>

          {/* Slider 2: Backend Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">نرخ کدهای بک‌اند، دیتابیس و API:</span>
              <span className="text-emerald-400 font-bold font-mono dir-ltr">${backendRate} / LOC</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={backendRate}
              onChange={(e) => setBackendRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>۱۰ دلار</span>
              <span>۸۰ دلار</span>
            </div>
          </div>

          {/* Slider 3: Frontend Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">نرخ کدهای فرانت‌اند مینی‌اپ و پنل وب:</span>
              <span className="text-purple-400 font-bold font-mono dir-ltr">${frontendRate} / LOC</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={frontendRate}
              onChange={(e) => setFrontendRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>۱۰ دلار</span>
              <span>۶۰ دلار</span>
            </div>
          </div>

          {/* Slider 4: Hourly Dev Rate */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">دستمزد ساعتی برنامه نویس ارشد:</span>
              <span className="text-amber-400 font-bold font-mono dir-ltr">${hourlyDevRate} / Hour</span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              value={hourlyDevRate}
              onChange={(e) => setHourlyDevRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>۴۰ دلار / ساعت</span>
              <span>۲۰۰ دلار / ساعت</span>
            </div>
          </div>

        </div>

        {/* Calculated Results Panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">نتایج ارزیابی سفارشی پروژه</h3>
            </div>

            <div className="space-y-4">
              
              {/* Calculated Result 1 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">ارزش میکرومتریک محاسباتی پروژه:</span>
                  <span className="text-[10px] text-slate-500">جمع قیمت ماژول‌ها با نرخ‌های سفارشی شما</span>
                </div>
                <div className="text-2xl font-black text-indigo-300 font-mono dir-ltr">
                  {formatUsd(totalCustomValuation)}
                </div>
              </div>

              {/* Calculated Result 2 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">هزینه توسعه مجدد (۹۵۰ ساعت کاری):</span>
                  <span className="text-[10px] text-slate-500">بر اساس دستمزد ${hourlyDevRate}/ساعت</span>
                </div>
                <div className="text-xl font-bold text-amber-300 font-mono dir-ltr">
                  {formatUsd(customDevCost)}
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
            <span className="font-bold block mb-1">تفاوت با ارزش پایه پیش‌فرض:</span>
            {totalCustomValuation > baseValuation ? (
              <span className="text-emerald-300 font-medium">
                +{formatUsd(totalCustomValuation - baseValuation)} بالاتر از ارزیابی استاندارد صنعت
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                -{formatUsd(baseValuation - totalCustomValuation)} پایین‌تر از ارزیابی استاندارد صنعت
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
