import React from 'react';
import { FolderLock, ExternalLink, QrCode } from 'lucide-react';
import { Purchase, Product } from '../types';

interface VaultKeysProps {
  purchases: Purchase[];
  products: Product[];
  walletAddress: string;
  onBrowseCatalog: () => void;
}

export default function VaultKeys({
  purchases,
  products,
  walletAddress,
  onBrowseCatalog,
}: VaultKeysProps) {
  // Filter purchases belonging only to this wallet
  const myPurchases = purchases.filter(
    (p) => p.buyer_wallet.toLowerCase() === walletAddress?.toLowerCase()
  );

  return (
    <div id="tab-content-purchases" className="flex-1 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Header element */}
      <div className="pb-4 border-b border-white/5 text-left">
        <h1 className="text-3xl font-display font-light italic text-white mb-1.5">
          Vault Locked <span className="text-emerald-400 font-normal">Acquisitions</span>
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">
          Inspect code delivery credentials and retrieve product resources that you purchased programmatically.
        </p>
      </div>

      {/* Grid listing */}
      {myPurchases.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 border border-dashed border-white/5 rounded-2xl bg-[#070712]/45">
          <FolderLock className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
          <h3 className="text-base font-display font-bold text-zinc-200">Vault Currently Empty</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1 leading-relaxed">
            You havent claimed or minted any premium resources inside LaunchSphere yet! Go to the Explore tab and purchase any template to unlock download link access.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-[#9945FF] to-indigo-600 hover:from-[#a85fff] hover:to-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Browse Digital Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myPurchases.map((pur) => {
            const matchedProduct = products.find((p) => p.id === pur.product_id);
            return (
              <div 
                key={pur.id} 
                id={`purchase-item-${pur.id}`}
                className="p-5 bg-[#070712]/45 border border-emerald-500/15 rounded-2xl flex flex-col justify-between hover:border-emerald-500/40 hover:bg-[#090918]/60 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Decorative atmosphere glow behind each purchased card */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/[0.02] blur-xl rounded-full group-hover:bg-emerald-500/[0.05] transition-all"></div>
                
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-emerald-900/10 border border-emerald-500/30 text-[9px] font-mono text-[#14F195] rounded-md font-bold tracking-widest uppercase scale-95 origin-left">
                      Verified Block Signed
                    </span>
                    <span className="text-[11px] font-mono text-[#14F195] font-black">
                      {pur.amount.toFixed(2)} SOL
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={pur.product_thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"} 
                      alt={pur.product_title} 
                      className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0 bg-zinc-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-display font-bold text-zinc-100 truncate leading-none mb-1.5">{pur.product_title}</h4>
                      <p className="text-[9px] font-mono text-zinc-500 truncate" title={pur.signature}>
                        Receipt Signature: <span className="text-zinc-300 select-all">{pur.signature}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[9px] font-mono text-white/55 bg-black/45 p-2.5 rounded-lg leading-normal border border-white/5 select-all">
                    🧬 Transaction Lock: <span className="text-[#9945FF] font-semibold">{pur.id}</span>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-left select-none">
                    <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">Access Status</span>
                    <span className="text-[10px] text-[#14F195] font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full"></span>
                      Decrypted Sandbox Vault
                    </span>
                  </div>

                  {matchedProduct && (
                    <a 
                      href={matchedProduct.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="font-display">Get Build</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
