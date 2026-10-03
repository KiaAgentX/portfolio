import React from 'react';
import { Wallet, Clock, User as UserIcon, Coins, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  walletAddress: string;
  userProfile: User | null;
  solPrice: number;
  epochNum: number;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
}

export default function Header({
  walletAddress,
  userProfile,
  solPrice,
  epochNum,
  onOpenWallet,
  onOpenProfile,
}: HeaderProps) {
  return (
    <header className="relative z-20 h-20 border-b border-white/5 backdrop-blur-xl bg-[#020205]/75 flex items-center justify-between px-4 sm:px-8 shrink-0">
      {/* Brand Launcher Block */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#9945FF] to-[#14F195] rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-xl flex items-center justify-center p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#04040a] rounded-[10px] flex items-center justify-center">
              <span className="text-sm font-display font-black tracking-widest text-[#14F195]">LS</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xl font-display font-light text-white tracking-tight flex items-center gap-1.5 leading-none">
            Launch<span className="font-bold text-[#14F195]">Sphere</span>
          </span>
          <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase mt-0.5">Decentralized Asset Hub</span>
        </div>
      </div>

      {/* Network Metrics Row (Hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-4 font-mono text-[10px]">
        {/* SOL Ticker Card */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-white/[0.02] to-transparent px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></div>
          <span className="text-white/40">SOL/USD:</span>
          <span className="text-white font-bold font-mono text-xs">${solPrice.toFixed(2)}</span>
        </div>

        {/* Epoch block height card */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-white/[0.02] to-transparent px-3 py-1.5 rounded-lg border border-white/5">
          <Clock className="w-3.5 h-3.5 text-[#9945FF]" />
          <span className="text-white/40">EPOCH:</span>
          <span className="text-white font-bold font-mono text-xs">{epochNum}</span>
        </div>

        {/* Validator status speed block */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-white/[0.02] to-transparent px-3 py-1.5 rounded-lg border border-white/5 select-none">
          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin-slow" style={{ animationDuration: '8s' }} />
          <span className="text-white/40">OPS RATE:</span>
          <span className="text-cyan-400 font-bold font-mono text-xs">2,410 TPS</span>
        </div>
      </div>

      {/* Account cockpit and connect buttons */}
      <div className="flex items-center gap-3">
        {userProfile && (
          <button 
            id="header-profile-toggle"
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-[#070712] border border-white/10 hover:border-[#9945FF]/40 rounded-full pl-2 pr-4 py-1 transition-all duration-200 cursor-pointer shadow-inner shadow-black/80"
          >
            <img 
              src={userProfile.avatar_url} 
              alt="User representation" 
              className="w-7 h-7 rounded-full border border-white/10 object-cover shadow-sm bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`;
              }}
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-zinc-100 max-w-[90px] truncate leading-tight">{userProfile.username}</span>
              <span className="text-[9px] font-mono font-bold text-[#14F195] flex items-center gap-0.5">
                <Coins className="w-2.5 h-2.5" />
                {userProfile.balance.toFixed(2)} SOL
              </span>
            </div>
          </button>
        )}

        {walletAddress ? (
          <button 
            id="wallet-toggle-btn"
            onClick={onOpenWallet}
            className="px-4 py-1.5 bg-[#14F195]/10 border border-[#14F195]/30 hover:border-[#13f094] hover:bg-[#14F195]/20 text-[#14F195] font-mono text-xs font-semibold rounded-full shadow-[0_0_15px_rgba(20,241,149,0.1)] hover:shadow-[0_0_20px_rgba(20,241,149,0.2)] transition-all cursor-pointer"
          >
            {walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)}
          </button>
        ) : (
          <button 
            id="wallet-connect-btn"
            onClick={onOpenWallet}
            className="px-5 py-1.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:brightness-110 text-black text-xs font-bold rounded-full shadow-[0_0_20px_rgba(153,69,255,0.45)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="font-display tracking-wide">Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
