import React, { useState } from 'react';
import { Wallet, Sparkles, Copy, Check, Info, ArrowUpRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { User } from '../types';
import { triggerAirdrop } from '../services/api';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  userProfile: User | null;
  onConnectWallet: (address: string) => void;
  onRefreshProfile: () => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  walletAddress,
  userProfile,
  onConnectWallet,
  onRefreshProfile
}: WalletModalProps) {
  const [customAddress, setCustomAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropStep, setAirdropStep] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRandomWallet = () => {
    // Generate a beautiful mock Solana public address
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = 'SOL';
    for (let i = 0; i < 35; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onConnectWallet(result);
    setCustomAddress('');
    setStatusMsg('Successfully generated a new secure Solana keypair!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleCustomConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim() || customAddress.trim().length < 20) {
      setStatusMsg('Please enter a valid Solana address (minimum 20 characters).');
      return;
    }
    onConnectWallet(customAddress.trim());
    setStatusMsg(`Connected as ${customAddress.trim().substring(0, 8)}...`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const requestSol = async () => {
    if (!walletAddress) return;
    try {
      setIsAirdropping(true);
      setAirdropStep('Broadcasting transaction to Solana Devnet RPC...');
      await new Promise(r => setTimeout(r, 1000));
      setAirdropStep('Securing block space index inside solana validator...');
      await new Promise(r => setTimeout(r, 800));
      setAirdropStep('Airdropping 5.0 SOL...');
      
      const newBal = await triggerAirdrop(walletAddress, 5.0);
      onRefreshProfile();
      setAirdropStep('Transaction finalized. Signature: 4vX...9tS');
      await new Promise(r => setTimeout(r, 600));
      setStatusMsg(`Successfully airdropped 5.0 SOL to Devnet! New balance: ${newBal} SOL`);
    } catch (err: any) {
      setStatusMsg(`Airdrop failed: ${err.message || 'Error occurred'}`);
    } finally {
      setIsAirdropping(false);
      setAirdropStep('');
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  return (
    <div id="wallet-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div 
        id="wallet-modal-content"
        className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-all duration-300"
      >
        {/* Header styling */}
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600/20 text-purple-400 p-2 rounded-xl">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 tracking-tight text-lg">Solana Interactive Wallet</h3>
              <span className="text-xs text-purple-400 font-medium">Devnet Sandbox Environment</span>
            </div>
          </div>
          <button 
            id="close-wallet-modal"
            onClick={onClose} 
            className="text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg p-1.5 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {walletAddress ? (
            // CONNECTED STATE
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 font-mono tracking-tight">Active Connected Key</span>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-emerald-400 font-medium">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="font-mono text-zinc-300 text-sm truncate pr-2">
                    {walletAddress}
                  </span>
                  <button 
                    onClick={handleCopy} 
                    className="text-zinc-400 hover:text-white p-1 rounded-sm hover:bg-zinc-800 transition"
                    title="Copy wallet address"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs text-zinc-400">Total Devnet Balance</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-white">
                      {userProfile ? userProfile.balance.toFixed(4) : "10.0000"}
                    </span>
                    <span className="text-xs text-purple-400 font-semibold ml-1">SOL</span>
                  </div>
                </div>
              </div>

              {/* Sandbox Control Utilities */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block">Sandbox Developer Controls</span>
                
                <button
                  id="airdrop-five-sol"
                  disabled={isAirdropping}
                  onClick={requestSol}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-950 disabled:text-purple-300/50 text-white py-3 px-4 rounded-xl font-medium transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAirdropping ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span className="text-sm font-mono">{airdropStep}</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Airdrop +5.0 Devnet SOL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRandomWallet}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 py-2.5 px-4 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Generate New Simulated Wallet
                </button>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-zinc-400 leading-normal">
                  This simulated network behaves exactly like standard Solana Devnet. You can buy mock products, list assets, and receive payout credits automatically.
                </p>
              </div>
            </div>
          ) : (
            // DISCONNECTED STATE
            <div className="space-y-5">
              <div className="text-center py-4 space-y-2">
                <Wallet className="h-12 w-12 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                  LaunchSphere utilizes Solana Wallets to verify design file acquisitions, record upvotes, and deploy products.
                </p>
              </div>

              {/* Action: Fast simulated account */}
              <div className="space-y-3">
                <button
                  onClick={handleRandomWallet}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-purple-950/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Instant Simulated Phantom Connection</span>
                </button>
                <p className="text-[11px] text-center text-zinc-500">
                  ⚡ Perfect for testing inside the platform sandbox iframe!
                </p>
              </div>

              {/* Manual Custom Solana Address */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-zinc-500 text-xs font-mono">OR CONNECT ANY SPECIFIC ADDRESS</span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <form onSubmit={handleCustomConnect} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Solana Public Key (Base58)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7vC9G2dSt... or Phantom address"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Connect Custom Key
                </button>
              </form>
            </div>
          )}

          {/* User notification status bar */}
          {statusMsg && (
            <div className="bg-purple-900/30 border border-purple-800/60 rounded-xl p-3 text-xs text-purple-300 animate-pulse text-center">
              {statusMsg}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-850 bg-zinc-900/20 text-center">
          <button 
            onClick={onClose} 
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            Go Back to LaunchSphere Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
