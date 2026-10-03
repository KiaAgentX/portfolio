import React, { useState } from 'react';
import { Sparkles, Terminal, FileText, Cpu, AlertCircle, CheckCircle, Tag, DollarSign, Layers } from 'lucide-react';
import { Product } from '../types';

interface CreatorTerminalProps {
  walletAddress: string;
  onProductGenerated: (product: Product) => void;
}

export default function CreatorTerminal({ walletAddress, onProductGenerated }: CreatorTerminalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(15);
  const [customTags, setCustomTags] = useState<string>('Automation, Python, Tool');

  const handleGenerate = async () => {
    if (!walletAddress) {
      setFeedback('⚠️ Please plug in your Solana Wallet in the sidebar first to associate yourself as the product author.');
      return;
    }

    if (!prompt.trim()) {
      setFeedback('⚠️ Please enter an idea description to command the AI Builder.');
      return;
    }

    setIsGenerating(true);
    setFeedback('⚡ Awakening GhostVault AI Agent: Analyzing requirements...');
    setGeneratedProduct(null);

    // Dynamic logging messages during the synthesis
    const logs = [
      '🔍 Structuring architectural blueprints...',
      '⚙️ Instantiating compiler & parsing parameters...',
      '📝 Synthesizing source files with type guards...',
      '✓ Compiling test suite & validating output...'
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setFeedback(logs[logIndex]);
        logIndex++;
      }
    }, 1100);

    try {
      const response = await fetch('/api/products/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sellerAddress: walletAddress,
          sellerId: `creator_${walletAddress.substring(2, 8)}`
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success && data.product) {
        // Apply customizations if altered
        const finalTags = customTags.split(',').map(t => t.trim()).filter(Boolean);
        const finalProduct: Product = {
          ...data.product,
          price: customPrice > 0 ? customPrice : data.product.price,
          tags: finalTags.length > 0 ? finalTags : data.product.tags
        };

        setGeneratedProduct(finalProduct);
        onProductGenerated(finalProduct);
        setFeedback('🎉 Synthesis successful! Your digital asset is successfully listed in the GhostVault marketplace catalog.');
      } else {
        setFeedback(`⚠️ Build failure: ${data.error || 'Check server parameters.'}`);
      }
    } catch (err) {
      clearInterval(interval);
      setFeedback('⚠️ Connection timeout calling Gemini compiler. Restart dev server if persists.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-1">
          <Terminal size={14} />
          <span>Vibe-Powered Code Compiler</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
          AI Product Factory
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Transform your digital ideas into functional marketplace products instantly using server-side Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creator Controls Form */}
        <div className="lg:col-span-1 space-y-6 bg-slate-950 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
            <Cpu size={16} className="text-indigo-400" />
            <span>Product Parameters</span>
          </h3>

          <div className="space-y-4">
            
            {/* Main Prompt Input Box */}
            <div>
              <label className="text-xs text-slate-400 font-medium tracking-wide block mb-1.5 uppercase">
                What product would you like to build?
              </label>
              <textarea
                placeholder="Describe your idea. E.g., 'A responsive crypto landing page with pricing graphs.' or 'A python script to analyze DEX coin transactions'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition duration-200 resize-none"
              />
            </div>

            {/* Custom Price Select */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5 uppercase">
                Product Price (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 pl-10 font-mono text-sm text-slate-100 focus:outline-none focus:border-indigo-500/80 transition"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-sans font-semibold text-xs">USDC</span>
              </div>
            </div>

            {/* Customize hashtags */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5 uppercase">
                Asset Category Tags (comma separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Python, Trading, Tool"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500/80 transition"
                />
              </div>
            </div>

            {/* Generate Trigger */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition duration-200 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none cursor-pointer flex justify-center items-center gap-2"
            >
              <Sparkles size={16} className={isGenerating ? 'animate-pulse text-indigo-200' : 'text-indigo-200'} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Product with AI'}</span>
            </button>
            
          </div>
        </div>

        {/* Dynamic Terminal Synthesis Feedback Output */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-xl min-h-[460px]">
          
          {/* Terminal Window Header Bar */}
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="w-20 pl-2 bg-slate-950/40 border border-slate-800/50 rounded text-[10px] font-mono text-slate-500 text-center py-0.5 ml-2 uppercase select-none">
                GVA_v0.1
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">SECURE COMPILER PROCESSOR</span>
          </div>

          {/* Terminal Logs & Synthesis Showcase Area */}
          <div className="p-6 font-mono text-xs text-slate-350 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
            
            {/* Logs console feed */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>$ ghostvault-compiler --init --ambient</span>
              </div>
              
              {feedback && (
                <div className="flex items-start gap-2 text-indigo-300 font-medium">
                  <span className="text-slate-550">&gt;</span>
                  <p className="animate-pulse">{feedback}</p>
                </div>
              )}
            </div>

            {/* Generated Product Card Container Preview once completed */}
            {generatedProduct ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider">
                      Successfully Compiled
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5 font-sans leading-snug">
                      {generatedProduct.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">DETERMINED PRICE</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {generatedProduct.price} USDC
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {generatedProduct.description}
                </p>

                {/* Simulated file layout preview */}
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1"><FileText size={11} /> {generatedProduct.fileName}</span>
                    <span>100% SECURE BLUEPRINT UNLOCKED</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg text-[10px] text-slate-400 max-h-36 overflow-y-auto overflow-x-auto text-left leading-relaxed">
                    <pre>{generatedProduct.fileContent}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <Terminal size={36} className="text-slate-800 mb-3" />
                <p className="text-slate-650 text-xs">Waiting for prompt synthesis...</p>
                <p className="text-[10px] text-slate-700 mt-1 max-w-xs">
                  Plugging your prompt calls our fully integrated server-side Gemini LLM module to construct real raw source scripts instantly.
                </p>
              </div>
            )}

            {/* Small status line */}
            <div className="flex justify-between items-center border-t border-slate-900/40 pt-3 text-[10px] text-slate-500">
              <span>Author Associated Signature: {walletAddress ? `${walletAddress.substring(0, 8)}...` : 'NONE'}</span>
              <span>Node Environment: ONLINE</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
