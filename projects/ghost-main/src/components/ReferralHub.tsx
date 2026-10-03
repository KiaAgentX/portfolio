import React, { useState } from 'react';
import { Sparkles, Users, Award, Copy, Check, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

interface ReferralHubProps {
  walletAddress: string;
  referralCode: string;
}

export default function ReferralHub({ walletAddress, referralCode }: ReferralHubProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/?ref=${referralCode || 'CODE'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!walletAddress) {
    return (
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-12 text-center text-slate-550 flex flex-col items-center max-w-xl mx-auto animate-in fade-in duration-300">
        <Users size={48} className="text-slate-700 mb-4" />
        <h3 className="text-lg font-semibold text-slate-350">Connect Wallet to Participate in referrals</h3>
        <p className="text-sm text-slate-550 mt-1 max-w-sm">
          Participate in our Solana Affiliate Pool to earn commissions from digital sales under your network. Connect your Solana Wallet above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-1">
          <Users size={14} />
          <span>AFFILIATE NETWORK GROUPS</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
          Solana Referral Hub
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Share your custom referral code and capture 0.5 USDC forever on every template purchased by your referees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Referral Code generator Card */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <h3 className="text-md font-bold text-white mb-2">Your Invitation Hook</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Distribute this link inside communities, blogs, or Discord channels. When a developer hooks up their wallet and completes their first acquisition, transaction commissions are automatically routed to your ledger.
            </p>

            {/* Custom Link card */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl gap-3 text-xs font-mono text-slate-300 mt-6 relative">
              <span className="truncate pr-4">{inviteLink}</span>
              <button
                onClick={handleCopy}
                className="bg-indigo-600 hover:bg-indigo-550 hover:text-white px-4 py-2 font-sans font-semibold rounded-xl text-xs transition active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles size={14} />
              <span>Affiliate payout frequency: Instant in Daily Settlement Vault runs</span>
            </div>
            <span className="text-slate-500 font-mono">Commission multiplier: 1x</span>
          </div>
        </div>

        {/* Tiers display Card */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Award size={18} className="text-indigo-400" />
            <span>Referral rank rewards</span>
          </h3>

          <div className="space-y-3.5">
            {/* Bronze Tier */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-600/15 text-orange-400 font-bold flex items-center justify-center text-xs border border-orange-500/10">B</span>
              <div>
                <span className="text-xs font-bold text-white block">Bronze Rank</span>
                <span className="text-[10px] text-slate-500">Base level. Earns 0.5 USDC commissions.</span>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100/10 text-slate-300 font-bold flex items-center justify-center text-xs border border-slate-100/10">S</span>
              <div>
                <span className="text-xs font-bold text-slate-300 block">Silver Rank (5+ Invites)</span>
                <span className="text-[10px] text-slate-500">Earns 0.6 USDC commissions.</span>
              </div>
            </div>

            {/* Golden Tier */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/10">G</span>
              <div>
                <span className="text-xs font-bold text-amber-300 block">Golden Elite (10+ Invites)</span>
                <span className="text-[10px] text-slate-500">Earns 0.8 USDC commissions. Platform fees reduced to 3%!</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
