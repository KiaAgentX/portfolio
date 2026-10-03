// File: src/components/ImageStudio.tsx

import React, { useState, useRef, DragEvent } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Trash2, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  RefreshCw,
  Layers,
  FileImage,
  AlertCircle
} from 'lucide-react';
import { useMindDataStore } from '../store/mindDataStore';
import { eventBus } from '../engine/eventBus';
import { motion } from 'motion/react';

export default function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [imageSize, setImageSize] = useState<'512px' | '1K' | '2K' | '4K'>('1K');
  const [model, setModel] = useState<'gemini-3.1-flash-image' | 'gemini-2.5-flash-image'>('gemini-3.1-flash-image');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addNode = useMindDataStore(state => state.addNode);

  // Drag and drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setSourceImage(e.target.result);
        setError(null);
        eventBus.emit('debug-log', {
          message: `Loaded source image for AI editing: ${file.name}`,
          type: 'Debug',
          timestamp: new Date().toISOString()
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide an image prompt.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    eventBus.emit('debug-log', {
      message: sourceImage 
        ? `Initiating image edit sequence with model: ${model}` 
        : `Initiating image generation sequence with model: ${model}`,
      type: 'Debug',
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch('/api/images/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: sourceImage,
          aspectRatio,
          imageSize,
          model
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image request');
      }

      setGeneratedImage(data.image);
      eventBus.emit('debug-log', {
        message: sourceImage 
          ? `Successfully compiled modified neural projection image.` 
          : `Successfully synthesized new dynamic projection image.`,
        type: 'Debug',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during image synthesis.');
      eventBus.emit('debug-log', {
        message: `Image synthesis error: ${err.message || err}`,
        type: 'SL',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProjectToMap = () => {
    if (!generatedImage) return;

    // Add node in 3D Space
    addNode('Media', '#FF00FF', {
      label: prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt,
      details: `Synthesized under AI prompt:\n"${prompt}"\n\nModel: ${model}\nAspect Ratio: ${aspectRatio}\nSize: ${imageSize}`,
      image: generatedImage
    });

    eventBus.emit('debug-log', {
      message: `Projected generated image coordinate directly to 3D Mind Map.`,
      type: 'Debug',
      timestamp: new Date().toISOString()
    });
  };

  const handleUseAsBase = () => {
    if (!generatedImage) return;
    setSourceImage(generatedImage);
    setGeneratedImage(null);
    setPrompt('');
    eventBus.emit('debug-log', {
      message: `Set generated image as new source editing baseline.`,
      type: 'Debug',
      timestamp: new Date().toISOString()
    });
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `mindcloud3d-synthesized-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-white/90 font-mono text-xs select-none">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 scrollbar-thin">
        {/* Model and Config */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Model Node</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded px-2 py-1.5 text-[10px] text-blue-400 font-bold focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image</option>
              <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Aspect Ratio</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded px-2 py-1.5 text-[10px] text-blue-400 font-bold focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              <option value="1:1">Square (1:1)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="4:3">Landscape (4:3)</option>
              <option value="9:16">Story (9:16)</option>
              <option value="16:9">Widescreen (16:9)</option>
            </select>
          </div>
        </div>

        {/* Source Image (Drag & Drop or Manual selection) */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Edit Source (Optional)</span>
          {sourceImage ? (
            <div className="bg-black/40 border border-white/10 rounded p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-10 h-10 border border-white/10 rounded overflow-hidden bg-black/50 shrink-0">
                  <img src={sourceImage} alt="Source thumbnail" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col overflow-hidden leading-tight">
                  <span className="text-[10px] text-white/80 font-bold truncate">Editing Baseline Active</span>
                  <span className="text-[8px] text-white/40 truncate">Image-to-Image editing mode</span>
                </div>
              </div>
              <button
                onClick={() => setSourceImage(null)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded transition-colors cursor-pointer"
                title="Remove editing baseline"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded p-3 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5 text-blue-300' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-white/40'
              }`}
              style={{ minHeight: '64px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="flex flex-col text-[9px] leading-normal">
                <span className="font-bold text-white/60">Drag & Drop Image here</span>
                <span>or click to browse local storage</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Creative Instruction</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate, or the changes you want to apply to the source..."
            className="w-full min-h-[60px] max-h-[100px] bg-black/60 border border-white/10 rounded p-2 text-[10px] leading-normal placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 select-text resize-y scrollbar-thin"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
        </div>

        {/* Action button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full h-11 rounded-lg border flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-xs transition-all ${
            isGenerating || !prompt.trim()
              ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
              : 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/35 hover:border-blue-400 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Synthesizing projection...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{sourceImage ? 'Modify Projection' : 'Synthesize Image'}</span>
            </>
          )}
        </button>

        {/* Output Area */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-2.5 rounded flex items-start gap-2 text-[9px] leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-wider">Synthesis Failure</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {generatedImage && (
          <div className="flex flex-col gap-2 border border-white/10 rounded bg-[#0a0a14] p-2 shrink-0 animate-fadeIn">
            <span className="text-[9px] text-pink-400 uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              Projection Synthesized
            </span>

            <div className="border border-white/5 rounded overflow-hidden aspect-video flex items-center justify-center bg-black/40 relative max-h-40">
              <img src={generatedImage} alt="AI Generated" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={handleProjectToMap}
                className="py-2 px-1.5 rounded border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-500/40 text-purple-300 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Project directly as a 3D Mind Map Node"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Project</span>
              </button>
              <button
                onClick={handleUseAsBase}
                className="py-2 px-1.5 rounded border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-500/40 text-blue-300 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Use as editing baseline for next sequence"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Edit Base</span>
              </button>
              <button
                onClick={downloadImage}
                className="py-2 px-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Download high resolution image payload"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
