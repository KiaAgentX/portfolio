import React, { useState, useEffect } from 'react';
import { ShoppingBag, Terminal, TrendingUp, Users, Sparkles, Layers, DollarSign, Wallet, HelpCircle, ShieldCheck } from 'lucide-react';
import WalletWidget from './components/WalletWidget';
import Marketplace from './components/Marketplace';
import CreatorTerminal from './components/CreatorTerminal';
import Dashboard from './components/Dashboard';
import ReferralHub from './components/ReferralHub';
import { Product } from './types';

export default function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [solBalance, setSolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [referredByCookie, setReferredByCookie] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'marketplace' | 'creator' | 'dashboard' | 'referral'>('marketplace');

  // Parse invite referral queries at mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferredByCookie(refCode);
      console.log('Affiliate referral detected code:', refCode);
    }

    // Pull initial merchandise catalog list
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const resp = await fetch('/api/products');
      const data = await resp.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed listing products:', err);
    }
  };

  const handleWalletConnect = async (address: string) => {
    setWalletAddress(address);
    try {
      const raw = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solanaAddress: address,
          referredBy: referredByCookie
        })
      });
      const data = await raw.json();
      if (data.success && data.user) {
        setReferralCode(data.user.referralCode);
        
        // Retrieve if seller possessed existing assets registered or purchased
        const statsRaw = await fetch(`/api/earnings/${address}`);
        const statsData = await statsRaw.json();
        
        if (statsData && statsData.salesHistory) {
          // Add previously purchased products
          const previouslyBought = statsData.salesHistory
            .filter((tx: any) => tx.buyerAddress === address)
            .map((tx: any) => tx.productId);
          setPurchasedProductIds(previouslyBought);
        }
      }
    } catch (err) {
      console.error('Failed register user during onboarding:', err);
    }
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setSolBalance(0);
    setUsdcBalance(0);
    setReferralCode('');
    setPurchasedProductIds([]);
  };

  const handleAirdropFaucet = (sol: number, usdc: number) => {
    setSolBalance(prev => Number((prev + sol).toFixed(2)));
    setUsdcBalance(prev => Number((prev + usdc).toFixed(2)));
  };

  const handleRefreshBalance = () => {
    // Recovers latest virtual settlement updates disbursed
    if (!walletAddress) return;
    // Faucet maintains local balance and updates from newly settled payouts
    fetch(`/api/earnings/${walletAddress}`)
      .then(r => r.json())
      .then(statsData => {
        if (statsData) {
          const settledTotalGainedShare = statsData.totalSettled;
          // Apply a simulation credit update based on newly disbursed transaction nets
          console.log('Balance synced updated net gains:', settledTotalGainedShare);
          setUsdcBalance(prev => Number((prev + settledTotalGainedShare).toFixed(2)));
        }
      });
  };

  const handlePurchaseProduct = async (product: Product) => {
    // Generate dummy on-chain transaction hash
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let mockTxSig = 'sol_tx_';
    for (let i = 0; i < 48; i++) {
      mockTxSig += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      const resp = await fetch('/api/transactions/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerAddress: walletAddress,
          txSignature: mockTxSig
        })
      });

      const data = await resp.json();
      if (data.success) {
        // Update local transaction ledger representation
        setUsdcBalance(prev => Number((prev - product.price).toFixed(2)));
        setPurchasedProductIds(prev => [...prev, product.id]);
        
        // Refresh catalog listing parameters
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed recording transactions:', err);
    }
  };

  const handleProductGenerated = (newProduct: Product) => {
    // Append newly compiled file structure to the local browser arrays
    setProducts(prev => [newProduct, ...prev]);
    // Redirect view back to catalog showcase so user can review/inspect it
    setCurrentTab('marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Dynamic Cosmic Backing Grid Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* Primary Top Header Navigation Rail */}
      <header className="relative border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Core Brand Mark */}
        <div 
          onClick={() => setCurrentTab('marketplace')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/25 transition duration-300">
            <Layers className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
              <span>GHOSTVAULT</span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-bold tracking-widest px-2 py-0.5 rounded-md">v0.1</span>
            </h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-1">DEX Digital Marketplace</span>
          </div>
        </div>

        {/* Dynamic Desktop/Mobile Views Tabs Panel */}
        <nav className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setCurrentTab('marketplace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition leading-none cursor-pointer ${
              currentTab === 'marketplace'
                ? 'bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-indigo-400 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setCurrentTab('creator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition leading-none cursor-pointer ${
              currentTab === 'creator'
                ? 'bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-indigo-400 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <Terminal size={14} />
            <span>AI Product Factory</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition leading-none cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-indigo-400 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <TrendingUp size={14} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('referral')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition leading-none cursor-pointer ${
              currentTab === 'referral'
                ? 'bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 text-indigo-400 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
            }`}
          >
            <Users size={14} />
            <span>Referrals</span>
          </button>
        </nav>

        {/* Solana Wallet Trigger controls */}
        <WalletWidget
          walletAddress={walletAddress}
          solBalance={solBalance}
          usdcBalance={usdcBalance}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
          onAirdrop={handleAirdropFaucet}
        />

      </header>

      {/* Main Responsive Views Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 relative z-30">
        
        {currentTab === 'marketplace' && (
          <Marketplace
            products={products}
            walletAddress={walletAddress}
            usdcBalance={usdcBalance}
            userPurchasedProductIds={purchasedProductIds}
            onPurchase={handlePurchaseProduct}
          />
        )}

        {currentTab === 'creator' && (
          <CreatorTerminal
            walletAddress={walletAddress}
            onProductGenerated={handleProductGenerated}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            walletAddress={walletAddress}
            onRefreshWalletBalance={handleRefreshBalance}
          />
        )}

        {currentTab === 'referral' && (
          <ReferralHub
            walletAddress={walletAddress}
            referralCode={referralCode}
          />
        )}

      </main>

      {/* Ambient footer margin bar status lines */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-600 py-6 px-6 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-sans">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-500">GHOSTVAULT SOLANA STABLE-BRIDGE</span>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-widest font-mono text-[9px] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Solana Devnet Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Server-Side Gemini AI & Sandbox Escrows</span>
            <span>All rights reserved &copy; 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
