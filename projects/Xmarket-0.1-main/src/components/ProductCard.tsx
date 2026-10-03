import React from 'react';
import { Flame, CheckCircle, ShoppingBag, Send } from 'lucide-react';
import { Product, User } from '../types';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  walletAddress: string;
  userProfile: User | null;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onPurchase: (product: Product) => void;
  onSelect: (product: Product) => void;
  isPurchasing: boolean;
  isBought: boolean;
}

export default function ProductCard({
  product,
  walletAddress,
  userProfile,
  onUpvote,
  onPurchase,
  onSelect,
  isPurchasing,
  isBought,
}: ProductCardProps) {
  const isOwnProduct = product.seller_wallet.toLowerCase() === walletAddress?.toLowerCase();
  const hasUpvoted = walletAddress && userProfile && product.upvoted_by.includes(userProfile.id);

  return (
    <div 
      id={`prod-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group matrix-card bg-[#070712]/45 border border-white/5 rounded-2xl p-5 flex flex-col hover:border-[#9945FF]/40 hover:bg-[#090918]/60 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Visual representation thumbnail block */}
      <div className="h-40 w-full bg-[#030308] rounded-xl mb-4 relative overflow-hidden shrink-0 border border-white/5">
        <img 
          src={product.thumbnail_url} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
        
        {/* Category tag */}
        <div className="absolute top-2.5 right-2.5 flex gap-1">
          <span className="px-2.5 py-0.5 bg-black/75 border border-white/10 rounded-md text-[9px] font-mono font-bold text-[#14F195] uppercase tracking-wider scale-95">
            {product.category}
          </span>
        </div>

        {/* Access status indicators */}
        {isBought && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-md text-[9px] font-mono font-black text-[#14F195] tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>UNLOCKED SECURE KEY</span>
          </div>
        )}

        {isOwnProduct && !isBought && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#9945FF]">
            <span>CREATOR</span>
          </div>
        )}
      </div>

      {/* Product metadata specs */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-display font-medium text-zinc-100 group-hover:text-[#9945FF] transition duration-200 line-clamp-1 mb-1.5 leading-tight">
            {product.title}
          </h3>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4 font-sans font-light">
            {product.description || 'No descriptive specifications registered.'}
          </p>
        </div>

        <div>
          {/* Creator detail row */}
          <div className="flex items-center gap-2 mb-4 self-start">
            <img 
              src={product.seller_avatar} 
              alt={product.seller_username} 
              className="w-5.5 h-5.5 rounded-full object-cover border border-white/10 bg-zinc-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${product.seller_wallet}`;
              }}
            />
            <p className="text-[10px] text-zinc-400 font-sans">
              Minter: <span className="font-semibold text-white/90">{product.seller_username}</span>
            </p>
          </div>

          {/* Pricing and Action controls footer */}
          <div className="pt-3.5 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">MINT COST</span>
              <p className="text-[#14F195] font-mono font-bold text-sm leading-none flex items-center gap-1 mt-0.5">
                {product.price === 0 ? "FREE" : `${product.price.toFixed(3)} SOL`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Upvote controller */}
              <button
                type="button"
                onClick={(e) => onUpvote(product.id, e)}
                className={`h-8 px-2.5 rounded-lg border text-xs font-semibold font-mono flex items-center gap-1.5 transition-all duration-200 hover:scale-105 cursor-pointer ${
                  hasUpvoted 
                    ? 'bg-[#14F195]/10 border-[#14F195]/40 text-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.1)]' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/10'
                }`}
                title="Broadcast upvote on Solana Devnet ledger"
              >
                <Flame className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-[#14F195] fill-[#14F195]' : 'opacity-65'}`} />
                <span>{product.upvotes}</span>
              </button>

              {/* Purchase controller */}
              {isBought ? (
                <span className="h-8 px-3 bg-emerald-950/20 text-[#14F195] border border-emerald-500/20 rounded-lg text-[10px] font-mono font-bold flex items-center">
                  Owned
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchase(product);
                  }}
                  disabled={isPurchasing}
                  className="h-8 px-3 bg-gradient-to-r from-[#9945FF] to-indigo-600 hover:from-[#a85fff] hover:to-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  {isPurchasing ? (
                    <div className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Mint</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
