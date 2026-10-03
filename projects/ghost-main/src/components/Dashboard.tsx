import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, DollarSign, Calendar, Clock, RefreshCcw, Layers, ArrowUpRight, ThumbsUp, AlertCircle, HelpCircle } from 'lucide-react';

interface DashboardProps {
  walletAddress: string;
  onRefreshWalletBalance: () => void;
}

interface CreatorStats {
  pendingBalance: number;
  totalSettled: number;
  totalSales: number;
  referralCount: number;
  referralEarnings: number;
  salesHistory: any[];
  settlementHistory: any[];
}

export default function Dashboard({ walletAddress, onRefreshWalletBalance }: DashboardProps) {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isSettleTriggering, setIsSettleTriggering] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [timerString, setTimerString] = useState('16h 08m 42s');

  const fetchStats = async () => {
    if (!walletAddress) return;
    try {
      const response = await fetch(`/api/earnings/${walletAddress}`);
      const data = await response.json();
      setStats({
        pendingBalance: data.pendingBalance,
        totalSettled: data.totalSettled,
        totalSales: data.totalSales,
        referralCount: data.referralCount,
        referralEarnings: data.referralEarnings,
        salesHistory: data.salesHistory || [],
        settlementHistory: data.settlementHistory || []
      });
    } catch (err) {
      console.error('Failed fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Simulate dynamic countdown clock towards 00:00 UTC midnight
    const interval = setInterval(() => {
      const now = new Date();
      const hours = 23 - now.getUTCHours();
      const minutes = 59 - now.getUTCMinutes();
      const seconds = 59 - now.getUTCSeconds();
      setTimerString(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleManualSettlementTrigger = async () => {
    if (isSettleTriggering) return;
    setIsSettleTriggering(true);
    setSuccessBanner('');

    try {
      const response = await fetch('/api/settlement/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessBanner(`⚡ ${data.message || 'Automated Settlement Complete.'}`);
        // Refresh statistics and active wallet holdings
        await fetchStats();
        onRefreshWalletBalance();
        
        setTimeout(() => setSuccessBanner(''), 8000);
      } else {
        setSuccessBanner('⚠️ No outstanding earnings found to transfer of values.');
      }
    } catch (err) {
      console.error(err);
      setSuccessBanner('⚠️ Settlement timeout calling core Node network chain.');
    } finally {
      setIsSettleTriggering(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-12 text-center text-slate-550 flex flex-col items-center max-w-xl mx-auto animate-in fade-in duration-300">
        <TrendingUp size={48} className="text-slate-700 mb-4" />
        <h3 className="text-lg font-semibold text-slate-350">Connect Solana Wallet to View Dashboard</h3>
        <p className="text-sm text-slate-550 mt-1 max-w-sm">
          GhostVault features localized automatic smart-contract payouts. Authenticate your account via the wallet widget on the navigation header.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-1">
            <TrendingUp size={14} />
            <span>SOLANA MERCHANDISE ACCOUNT</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
            Creator Earnings & Settlements
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track daily sales, pending credits, and historical automated ledger disbursements.
          </p>
        </div>

        {/* Dynamic Countdown */}
        <div className="bg-slate-950 border border-indigo-500/15 p-4 rounded-2xl flex items-center gap-3 shrink-0">
          <Clock size={20} className="text-indigo-400 animate-pulse" />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider">NEXT AUTOMATED SOLANA SETTLE</span>
            <span className="text-sm font-mono font-bold text-indigo-300 block">{timerString}</span>
          </div>
        </div>
      </div>

      {/* Trigger alert banners */}
      {successBanner && (
        <div className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-indigo-300 animate-in slide-in-from-top-2 duration-300">
          <ThumbsUp size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{successBanner}</p>
            <p className="mt-1 text-slate-400">
              Midnight payment simulation finished. Unsettled USDC net balances were routed to your Solana Wallet address via simulated Devnet ledger transfers.
            </p>
          </div>
        </div>
      )}

      {/* Stats Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Unsettled Balance CARD */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl" />
          <span className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">PENDING BALANCE</span>
          <h3 className="text-2xl font-mono font-bold text-amber-400 mt-1">
            ${stats?.pendingBalance.toFixed(2) || '0.00'} <span className="text-xs text-slate-500 font-sans">USDC</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Locked in secure escrow vault. Auto-settled every 24h at 00:00 UTC.
          </p>
        </div>

        {/* Settled balance CARD */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl" />
          <span className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">TOTAL SETTLED</span>
          <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            ${stats?.totalSettled.toFixed(2) || '0.00'} <span className="text-xs text-slate-500 font-sans">USDC</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Fully disbursed directly to your connected Solana wallet address.
          </p>
        </div>

        {/* Volume purchases CARD */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl" />
          <span className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">MERCHANDISE SALES</span>
          <h3 className="text-2xl font-mono font-bold text-white mt-1">
            {stats?.totalSales || 0} <span className="text-xs text-slate-500 font-sans">orders</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Total sales transactions recorded on your AI generated blueprints.
          </p>
        </div>

        {/* Affiliate yield CARD */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl" />
          <span className="text-[10px] text-slate-500 uppercase font-sans tracking-widest">REFERRAL EARNINGS</span>
          <h3 className="text-2xl font-mono font-bold text-indigo-400 mt-1">
            ${stats?.referralEarnings.toFixed(2) || '0.00'} <span className="text-xs text-slate-500 font-sans">USDC</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Bonus earned from users invited ({stats?.referralCount || 0} referees).
          </p>
        </div>

      </div>

      {/* Manual Settlement Simulation Trigger CTA */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-slate-950 to-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -left-12 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h4 className="text-md font-bold text-white flex items-center gap-1.5 font-sans">
            <Sparkles size={16} className="text-indigo-400" />
            <span>Simulate Daily Payout Cycle</span>
          </h4>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Don't want to wait for 00:00 UTC? Manually trigger the daily automatic settlement engine right now to test the Solana USDC transfer simulation flow!
          </p>
        </div>

        <button
          onClick={handleManualSettlementTrigger}
          disabled={isSettleTriggering}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-indigo-550/15 transition cursor-pointer active:scale-95 text-sm shrink-0 justify-center"
        >
          <RefreshCcw size={16} className={isSettleTriggering ? 'animate-spin' : ''} />
          <span>{isSettleTriggering ? 'Executing Settle Cron...' : 'Trigger Settlement Now'}</span>
        </button>
      </div>

      {/* Chart and History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Earnings graph simulation */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">DEX GRAPH VOLUME</span>
              <h4 className="text-md font-bold text-slate-200">Daily Sales Growth Rate</h4>
            </div>
            <span className="text-xs text-indigo-400 font-bold bg-indigo-600/10 px-3 py-1 rounded-full border border-indigo-500/20">USDC Unit</span>
          </div>

          {/* Pure stylish custom SVG Graph */}
          <div className="h-52 w-full flex items-end justify-between px-2 pt-6">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-lg transition h-12 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$15</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Jun 1</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-indigo-600/35 hover:bg-indigo-600/50 rounded-t-lg transition h-20 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$30</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Jun 2</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t-lg transition h-16 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$25</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Jun 3</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-indigo-600/50 hover:bg-indigo-500/70 rounded-t-lg transition h-32 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$55</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Jun 4</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-indigo-600/80 hover:bg-indigo-500/90 rounded-t-lg transition h-44 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$75</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Jun 5</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition h-48 relative group">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-350 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">${(stats?.pendingBalance === 0 && stats?.totalSettled > 0) ? stats?.totalSettled : (stats?.pendingBalance || 65)}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono uppercase font-bold">Today</span>
            </div>
          </div>
        </div>

        {/* Ledger Settlements Logs */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-550 block uppercase tracking-widest font-mono">SOLANA EXPLORER LEDGER</span>
            <h4 className="text-md font-bold text-slate-200 mb-4">Payout Transaction History</h4>

            {stats?.settlementHistory && stats.settlementHistory.length > 0 ? (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {stats.settlementHistory.map((settle, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-850/50 p-3 rounded-2xl text-xs">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold block">+${settle.netEarnings.toFixed(2)} USDC</span>
                      <span className="font-mono text-[10px] text-slate-550 block truncate w-44" title={settle.settlementTxId}>{settle.settlementTxId}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">CONFIRMED</span>
                      <span className="text-slate-400 text-[10px]">{new Date(settle.settledAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600 bg-slate-900/50 border border-dashed border-slate-850 rounded-2xl">
                <Calendar size={24} className="mx-auto text-slate-755 mb-2" />
                <p className="text-xs">No disbursements recorded yet.</p>
                <p className="text-[10px] text-slate-655 mt-1 max-w-xs mx-auto">When your digital creations sell, they earn pending USDC which triggers automated transfers.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
