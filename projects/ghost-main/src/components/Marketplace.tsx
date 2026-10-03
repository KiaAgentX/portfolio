import React, { useState } from 'react';
import { Search, Tag, Sparkles, ShoppingBag, Eye, Code, ThumbsUp, DollarSign, Download, Server, Key, AlertTriangle, FileText } from 'lucide-react';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
  walletAddress: string;
  usdcBalance: number;
  userPurchasedProductIds: string[];
  onPurchase: (product: Product) => void;
}

export default function Marketplace({
  products,
  walletAddress,
  usdcBalance,
  userPurchasedProductIds,
  onPurchase
}: MarketplaceProps) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract all unique tags
  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  // Filter listings
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) || 
                          product.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? product.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleBuyClick = async (product: Product) => {
    if (!walletAddress) {
      setErrorMsg('Please connect your Solana Sandbox wallet to purchase.');
      setPurchaseStatus('error');
      return;
    }

    if (usdcBalance < product.price) {
      setErrorMsg('Insufficient Solana USDC balance in your sandbox wallet. Try refilling via the top-right wallet controller.');
      setPurchaseStatus('error');
      return;
    }

    setPurchaseStatus('signing');
    
    // Simulate smart contract Solana transaction signature
    setTimeout(() => {
      onPurchase(product);
      setPurchaseStatus('success');
    }, 1500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Source code template copied to clipboard!');
  };

  const handleDownloadCode = (product: Product) => {
    const element = document.createElement("a");
    const file = new Blob([product.fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = product.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-1">
            <Sparkles size={14} className="animate-pulse" />
            <span>Digital Vault</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
            Digital Asset Marketplace
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Buy functional smart scripts, automated traders, and dashboard templates vetted by our AI.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550" />
          <input
            type="text"
            placeholder="Search assets, scripts, bots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition duration-350"
          />
        </div>
      </div>

      {/* Tags Filter Row */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition cursor-pointer ${
            !selectedTag 
              ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md' 
              : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-750'
          }`}
        >
          All Categories
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedTag === tag 
                ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md' 
                : 'bg-slate-950 border border-slate-855 text-slate-400 hover:text-slate-200 hover:border-slate-750'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center max-w-lg mx-auto">
          <ShoppingBag size={48} className="text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-350">No products found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search tags, or navigate to the AI Creator Terminal to produce your own in seconds!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const hasPurchased = userPurchasedProductIds.includes(product.id) || product.sellerAddress === walletAddress;
            return (
              <div 
                key={product.id}
                className="bg-slate-950 border border-slate-850/50 hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden"
              >
                {/* Visual Glass Glow Background on Hover */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300 pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] uppercase font-mono px-2.5 py-1 rounded-lg">
                      {product.fileName.split('.').pop() || 'CODE'} File
                    </span>
                    <div className="flex gap-1 items-center bg-indigo-950/20 text-indigo-400 text-xs px-2.5 py-1 rounded-md">
                      <ShoppingBag size={12} />
                      <span className="font-mono">{product.salesCount} sold</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-300 transition duration-150">
                    {product.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Metadata Tag Row */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {product.tags.map(t => (
                      <span key={t} className="text-slate-500 text-[11px] font-medium bg-slate-900 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-900 mt-6 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 tracking-wider block">PRICE</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      {product.price} USDC
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setPurchaseStatus('idle');
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>{hasPurchased ? 'View asset' : 'Inspect Code'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Buy / Download Asset Modal Drawer overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-900 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono">PRODUCT SPECIFICATIONS</span>
                <h3 className="text-xl md:text-2xl font-bold text-white pr-6 mt-1 font-sans">
                  {selectedProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-900 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Scroll container */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Specifications Sidebar */}
                <div className="space-y-4 md:col-span-1 border-r border-slate-900 pr-0 md:pr-6">
                  <div>
                    <span className="text-[10px] text-slate-550 block uppercase tracking-wider">CREATOR</span>
                    <span className="text-xs font-mono text-slate-350 block truncate bg-slate-900 p-2 rounded-lg mt-1" title={selectedProduct.sellerAddress}>
                      {selectedProduct.sellerAddress.substring(0, 9)}...{selectedProduct.sellerAddress.substring(selectedProduct.sellerAddress.length - 8)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-550 block uppercase tracking-wider font-sans">FILE NAME</span>
                    <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5 bg-slate-900 p-2 rounded-lg mt-1">
                      <FileText size={13} />
                      {selectedProduct.fileName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-550 block uppercase tracking-wider">PRICE</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400 block mt-1">
                      {selectedProduct.price} USDC
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-550 block uppercase tracking-wider">LICENSE</span>
                    <span className="text-xs text-slate-400 block mt-1">Apache-2.0 (Open-Source Royalty free)</span>
                  </div>
                </div>

                {/* Description and Sandbox Code window */}
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <span className="text-[10px] text-slate-550 block uppercase tracking-wider">ASSET OVERVIEW</span>
                    <p className="text-slate-300 text-sm leading-relaxed mt-1">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Sample Code Header section */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-slate-550 uppercase tracking-widest font-mono">SOURCE FILE SPECIMEN</span>
                      {(userPurchasedProductIds.includes(selectedProduct.id) || selectedProduct.sellerAddress === walletAddress) ? (
                        <span className="text-[10px] font-sans font-medium text-emerald-400">✓ ACCESSED</span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-sans flex items-center gap-1"><Key size={10} /> Locked specimen</span>
                      )}
                    </div>

                    {/* Styled code box container */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-56 select-all relative group text-slate-300">
                      
                      {/* Code Sample blur overlay if locked */}
                      {!(userPurchasedProductIds.includes(selectedProduct.id) || selectedProduct.sellerAddress === walletAddress) && (
                        <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent flex flex-col items-center justify-end pb-4 font-sans text-xs text-slate-400">
                          <span className="p-1 px-3 bg-slate-950/80 rounded-full border border-slate-805/50">Purchase to decrypt full blueprint</span>
                        </div>
                      )}

                      <pre className="text-left leading-relaxed">
                        {/* Only render specimen if locked, full sample if bought */}
                        {(userPurchasedProductIds.includes(selectedProduct.id) || selectedProduct.sellerAddress === walletAddress)
                          ? selectedProduct.fileContent 
                          : selectedProduct.fileContent.split('\n').slice(0, 10).join('\n') + '\n\n// ... REST OF Blueprint FILE SECURED ...'
                        }
                      </pre>
                    </div>

                    {/* Download controls if purchased */}
                    {(userPurchasedProductIds.includes(selectedProduct.id) || selectedProduct.sellerAddress === walletAddress) && (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => handleCopyCode(selectedProduct.fileContent)}
                          className="flex-1 flex justify-center items-center gap-1.5 bg-slate-900 hover:bg-slate-850 p-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition border border-slate-800 cursor-pointer"
                        >
                          <Code size={13} /> Copy code
                        </button>
                        <button
                          onClick={() => handleDownloadCode(selectedProduct)}
                          className="flex-1 flex justify-center items-center gap-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 p-2 text-xs font-semibold rounded-xl text-indigo-300 hover:text-indigo-200 transition border border-indigo-500/20 cursor-pointer"
                        >
                          <Download size={13} /> Save as file
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-slate-950 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs">Contract standard:</span>
                <span className="bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 px-3 py-1 rounded-full">
                  Solana USDC PeerEscrow v0.1
                </span>
              </div>

              {/* Status Alert and dynamic Button */}
              <div className="w-full sm:w-auto">
                {userPurchasedProductIds.includes(selectedProduct.id) || selectedProduct.sellerAddress === walletAddress ? (
                  <button
                    disabled
                    className="w-full sm:w-auto bg-slate-900 text-emerald-400 rounded-2xl py-3 px-6 font-semibold text-sm flex items-center justify-center gap-1.5 opacity-80"
                  >
                    Asset Fully Unlocked
                  </button>
                ) : (
                  <div>
                    {purchaseStatus === 'signing' ? (
                      <button
                        disabled
                        className="w-full sm:w-auto bg-indigo-600/50 text-white rounded-2xl py-3 px-6 font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Approving On-Chain Vault Escrow...
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(selectedProduct)}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm py-3 px-8 rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Buy blueprint with {selectedProduct.price} USDC</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error alerts reporting */}
            {purchaseStatus === 'error' && (
              <div className="bg-rose-950/40 p-4 border-t border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Success notification */}
            {purchaseStatus === 'success' && (
              <div className="bg-emerald-950/40 p-4 border-t border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-300">
                <ThumbsUp size={15} className="mt-0.5 shrink-0" />
                <p>On-chain Solana swap successful! Download your source codes using the file utility above.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
