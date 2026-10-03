import React, { useState, useEffect } from 'react';
import { Wallet, Sparkles, RefreshCw, Layers, Copy, Check, DollarSign } from 'lucide-react';

interface WalletWidgetProps {
  walletAddress: string;
  solBalance: number;
  usdcBalance: number;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  onAirdrop: (sol: number, usdc: number) => void;
}

export default function WalletWidget({
  walletAddress,
  solBalance,
  usdcBalance,
  onConnect,
  onDisconnect,
  onAirdrop
}: WalletWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [recentTXs, setRecentTXs] = useState<{ id: string; type: string; amount: string; time: string }[]>([]);

  // Generate a random high-quality Solana address for newcomers
  const generateNewAddress = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let addr = 'Gv';
    for (let i = 0; i < 42; i++) {
      addr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return addr;
  };

  const handleConnectSandbox = () => {
    const newAddr = generateNewAddress();
    onConnect(newAddr);
    // Add default initial drop
    onAirdrop(1.5, 100);
    setIsOpen(true);
    
    setRecentTXs([
      {
        id: `tx_${Math.random().toString(36).substring(2, 9)}`,
        type: 'Wallet Genesis',
        amount: '+1.50 SOL',
        time: 'Just now'
      },
      {
        id: `tx_${Math.random().toString(36).substring(2, 9)}`,
        type: 'USDC Faucet Drop',
        amount: '+100.00 USDC',
        time: 'Just now'
      }
    ]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const triggerFaucet = () => {
    setIsAirdropping(true);
    setTimeout(() => {
      onAirdrop(0.5, 50);
      setIsAirdropping(false);
      
      setRecentTXs(prev => [
        {
          id: `tx_${Math.random().toString(36).substring(2, 9)}`,
          type: 'Faucet Refill',
          amount: '+50.0 USDC',
          time: '1s ago'
        },
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="relative z-50">
      {/* Wallet Status Header Trigger */}
      {!walletAddress ? (
        <button
          onClick={handleConnectSandbox}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-sans font-medium px-5 py-2.5 rounded-full shadow-lg hover:shadow-indigo-500/25 transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          id="connect-wallet-btn"
        >
          <Wallet size={16} />
          <span>Connect Solana Wallet</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-900 border border-indigo-500/30 text-indigo-200 font-mono font-medium px-4 py-2 rounded-full hover:border-indigo-400/80 hover:bg-slate-850 transition duration-300 focus:outline-none cursor-pointer"
          id="active-wallet-btn"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {walletAddress.substring(0, 5)}...{walletAddress.substring(walletAddress.length - 4)}
          </span>
        </button>
      )}

      {/* Sleek Floating Wallet Modal */}
      {isOpen && walletAddress && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 neon-border">
          {/* Decorative Gradient Accent */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Sparkles size={16} />
              <span>GhostVault Sandbox Wallet</span>
            </div>
            <button
              onClick={onDisconnect}
              className="text-xs text-slate-500 hover:text-rose-400 transition"
              id="disconnect-wallet-btn"
            >
              Disconnect
            </button>
          </div>

          {/* Copy Address */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2.5 mb-5 font-mono text-xs text-slate-400 relative">
            <span className="truncate pr-4">{walletAddress}</span>
            <button
              onClick={handleCopy}
              className="hover:text-white transition duration-150 p-1 bg-slate-850 rounded"
              title="Copy SOL Address"
            >
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Balances */}
          <div className="space-y-3 mb-5">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-900/30 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase">Solana Token</span>
                <span className="text-xl font-mono font-bold text-white block mt-0.5">
                  {solBalance.toFixed(2)} SOL
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">(Devnet)</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-900/30 p-3.5 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase">Solana USDC</span>
                <span className="text-xl font-mono font-bold text-emerald-400 block mt-0.5">
                  ${usdcBalance.toFixed(2)} USDC
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">stablecoin</span>
            </div>
          </div>

          {/* Actions - Request Airdrop */}
          <button
            onClick={triggerFaucet}
            disabled={isAirdropping}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-sm font-sans font-medium text-slate-100 py-3 rounded-2xl transition duration-200 mb-5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isAirdropping ? 'animate-spin text-indigo-400' : 'text-indigo-400'} />
            {isAirdropping ? 'Refilling Fund...' : 'Get USDC & SOL Faucet Info'}
          </button>

          {/* Recent Transact History */}
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-widest mb-2.5">
              IN-APP TRANSACTION LOG
            </span>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {recentTXs.map(tx => (
                <div key={tx.id} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <div>
                    <span className="text-slate-300 block font-sans">{tx.type}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{tx.id}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
