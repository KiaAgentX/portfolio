import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string; // 'XAUUSD' | 'EURUSD' | 'DXY'
  height?: number | string;
}

export default function TradingViewChart({ symbol, height = 450 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map internal symbols to official TradingView symbols
  const getTradingViewSymbol = (sym: string): string => {
    switch (sym) {
      case 'XAUUSD':
        return 'OANDA:XAUUSD';
      case 'EURUSD':
        return 'FX:EURUSD';
      case 'DXY':
        return 'CAPITALCOM:DXY';
      default:
        return 'OANDA:XAUUSD';
    }
  };

  useEffect(() => {
    const containerId = 'tradingview_advanced_chart';
    
    // Clear legacy elements before mounting a new widget to avoid duplicates
    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${containerId}" style="height: 100%; width: 100%;"></div>`;
    }

    const loadWidget = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: getTradingViewSymbol(symbol),
          interval: '5',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
          backgroundColor: '#050505',
          gridColor: 'rgba(42, 46, 57, 0.2)',
          hide_volume: false,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies' // Moving Average
          ],
          disabled_features: [
            'header_compare',
            'header_screenshot'
          ],
          enabled_features: [
            'dont_show_boolean_study_arguments',
            'use_localstorage_for_settings'
          ],
          loading_screen: {
            backgroundColor: '#050505',
            foregroundColor: '#f27d26'
          }
        });
      }
    };

    // Check if script is already added to document head
    let scriptExists = document.getElementById('tradingview-widget-script');

    if (!scriptExists) {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        loadWidget();
      };
      document.head.appendChild(script);
    } else {
      // If script is already loaded but we are switching symbol or remounting
      if (window.TradingView) {
        loadWidget();
      } else {
        // In case script is injected but not yet loaded
        const checkInterval = setInterval(() => {
          if (window.TradingView) {
            loadWidget();
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
    }
  }, [symbol]);

  return (
    <div className="w-full bg-[#050505] border border-border-dark rounded-xl overflow-hidden p-1 relative" style={{ height }}>
      {/* Visual background indicator */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-650 tracking-wider flex items-center gap-1.5 pointer-events-none z-10 bg-[#050505]/75 px-2 py-1 rounded border border-border-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-ping"></span>
        <span>TRADINGVIEW SYSTEM CORE: {symbol} LIVE TERMINAL</span>
      </div>
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        id="tradingview_advanced_chart_container"
      />
    </div>
  );
}
