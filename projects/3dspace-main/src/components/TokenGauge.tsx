// File: src/components/TokenGauge.tsx

import React from 'react';

interface TokenGaugeProps {
  current: number;
  limit: number;
}

export default function TokenGauge({ current, limit }: TokenGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (current / limit) * 100));
  
  // Color calculation based on limits
  let color = '#00FF00'; // Green
  let textShadow = '0 0 10px rgba(0, 255, 0, 0.4)';
  if (percentage > 85) {
    color = '#FF0000'; // Red
    textShadow = '0 0 12px rgba(255, 0, 0, 0.6)';
  } else if (percentage > 60) {
    color = '#FFFF00'; // Yellow/orange
    textShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
  }

  // Circular gauge values
  const radius = 34;
  const strokeDash = 2 * Math.PI * radius;
  const offset = strokeDash - (percentage / 100) * strokeDash;

  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-[#08080E]/90 border border-white/10 rounded w-40 relative backdrop-blur-md select-none shrink-0">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* SVG Outer Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDash}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* Dynamic Inner Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span 
            className="text-xs font-black font-mono tracking-tighter"
            style={{ color, textShadow }}
          >
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[7px] text-white/40 font-mono uppercase tracking-widest font-bold">
            LIMIT
          </span>
        </div>
      </div>

      <div className="flex justify-between w-full text-[9px] font-mono px-1 mt-0.5">
        <div className="flex flex-col">
          <span className="stat-label text-[7px]">USED</span>
          <span className="font-bold text-white/90">{current}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="stat-label text-[7px]">LIMIT</span>
          <span className="font-bold text-white/70">{limit}</span>
        </div>
      </div>
    </div>
  );
}
