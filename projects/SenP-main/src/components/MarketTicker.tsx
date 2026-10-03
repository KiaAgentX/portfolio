import React, { useState, useEffect } from "react";
import { Bitcoin, Coins, TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";

interface CryptoData {
  price: number;
  change24h: number;
}

interface MarketState {
  btc: CryptoData;
  eth: CryptoData;
  lastUpdated: string;
  loading: boolean;
  error?: string;
}

export const MarketTicker: React.FC = () => {
  const [market, setMarket] = useState<MarketState>({
    btc: { price: 97840.50, change24h: 3.42 },
    eth: { price: 2845.20, change24h: 1.85 },
    lastUpdated: new Date().toLocaleTimeString(),
    loading: false,
  });

  const fetchPrices = async () => {
    setMarket((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
      );
      if (!res.ok) throw new Error("API rate limit or error");
      const data = await res.json();

      if (data && data.bitcoin && data.ethereum) {
        setMarket({
          btc: {
            price: data.bitcoin.usd || 97840.50,
            change24h: data.bitcoin.usd_24h_change || 0,
          },
          eth: {
            price: data.ethereum.usd || 2845.20,
            change24h: data.ethereum.usd_24h_change || 0,
          },
          lastUpdated: new Date().toLocaleTimeString(),
          loading: false,
        });
      } else {
        setMarket((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      // Keep previous data on network failure or rate limit
      setMarket((prev) => ({
        ...prev,
        loading: false,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: val >= 1000 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatChange = (val: number) => {
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(2)}%`;
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3.5 bg-slate-950/85 border border-cyan-500/30 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full font-mono text-[10px] sm:text-xs text-slate-200 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-xl pointer-events-auto select-none transition-all hover:border-cyan-400/60">
      {/* Live status indicator */}
      <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider shrink-0 border-r border-white/10 pr-2 sm:pr-3">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#22d3ee]" />
        <span className="hidden lg:inline">MARKET //</span>
      </div>

      {/* Bitcoin Ticker Item */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <Bitcoin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="font-bold text-slate-100">BTC</span>
        <span className="text-amber-300 font-semibold">{formatPrice(market.btc.price)}</span>
        <span
          className={`flex items-center text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            market.btc.change24h >= 0
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
          }`}
        >
          {market.btc.change24h >= 0 ? (
            <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
          ) : (
            <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
          )}
          {formatChange(market.btc.change24h)}
        </span>
      </div>

      <span className="text-white/20 hidden sm:inline">|</span>

      {/* Ethereum Ticker Item */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
          <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="font-bold text-slate-100">ETH</span>
        <span className="text-indigo-300 font-semibold">{formatPrice(market.eth.price)}</span>
        <span
          className={`flex items-center text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            market.eth.change24h >= 0
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
          }`}
        >
          {market.eth.change24h >= 0 ? (
            <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
          ) : (
            <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
          )}
          {formatChange(market.eth.change24h)}
        </span>
      </div>

      {/* Refresh action */}
      <button
        onClick={fetchPrices}
        disabled={market.loading}
        title={`Refresh prices (Last updated: ${market.lastUpdated})`}
        className="ml-1 text-slate-400 hover:text-cyan-400 transition-colors p-1 rounded-full hover:bg-white/5 focus:outline-none shrink-0"
      >
        <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${market.loading ? "animate-spin text-cyan-400" : ""}`} />
      </button>
    </div>
  );
};
