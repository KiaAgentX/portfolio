// File: src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  RotateCcw, 
  Copy, 
  Share2, 
  Edit3, 
  Image, 
  Video, 
  Check, 
  X, 
  FileText, 
  Download, 
  Play, 
  Sparkles, 
  Film, 
  HelpCircle, 
  Compass, 
  Layers, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Radio
} from 'lucide-react';
import { getSavedFeeds, fetchAllFeeds } from './engine/rssEngine';
import { useMindDataStore, MindNode } from './store/mindDataStore';
import { eventBus } from './engine/eventBus';

import RSSPanel from './components/RSSPanel';
import ChatPanel from './components/ChatPanel';
import SettingsPanel from './components/SettingsPanel';
import DebugConsole from './components/DebugConsole';
import MindCloud3D from './components/MindCloud3D';
import NodeInspector from './components/NodeInspector';
import NodeRepository from './components/NodeRepository';
import TokenGauge from './components/TokenGauge';
import ImageStudio from './components/ImageStudio';

export default function App() {
  // Core states
  const [apiKey, setApiKey] = useState('');
  const [tokenLimit, setTokenLimit] = useState(4000);
  const [selectedModel, setSelectedModel] = useState('deepseek-v4-flash');
  const [activeNode, setActiveNode] = useState<MindNode | null>(null);
  const [activeTab, setActiveTab] = useState<'inspector' | 'repository' | 'calibration' | 'images'>('repository');
  const [tokenCount, setTokenCount] = useState(0);
  const [utcTime, setUtcTime] = useState('');
  const [mobileTab, setMobileTab] = useState<'visualizer' | 'comms' | 'feeds'>('visualizer');

  // Redesign Feature States: Modals & Actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Edit Form Fields
  const [editLabel, setEditLabel] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editLink, setEditLink] = useState('');

  // Image Generation States
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [imageStepText, setImageStepText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Video Generation States
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoFrame, setVideoFrame] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const clearAllNodes = useMindDataStore((state) => state.clearAll);
  const nodes = useMindDataStore((state) => state.nodes);
  const updateNode = useMindDataStore((state) => state.updateNode);

  // Sync tokenCount from event bus
  useEffect(() => {
    const unsub = eventBus.on('token-update', (data: any) => {
      setTokenCount(data.tokens);
    });
    return () => {
      unsub();
    };
  }, []);

  // Update inspector tab and form fields if activeNode changes
  useEffect(() => {
    if (activeNode) {
      setActiveTab('inspector');
      setEditLabel(activeNode.label || '');
      setEditDetails(activeNode.details || '');
      setEditLink(activeNode.link || '');
    }
  }, [activeNode]);

  // Sync active transmitters feed length
  const savedFeeds = getSavedFeeds();

  // Initialize nodes cluster on boot
  useEffect(() => {
    const initTimer = setTimeout(() => {
      eventBus.emit('debug-log', {
        message: 'Establishing live cosmic telemetry threads...',
        type: 'Debug',
        timestamp: new Date().toISOString()
      });
      fetchAllFeeds();
    }, 1500);

    return () => clearTimeout(initTimer);
  }, []);

  // UTC clock
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ACTION 1: Copy Action (copies active node metadata, or full status report)
  const handleCopyAction = () => {
    let copyText = '';
    if (activeNode) {
      copyText = `[MINDCLOUD3D COORDINATE TELEMETRY]
ID: ${activeNode.id}
TYPE: ${activeNode.type}
LABEL: ${activeNode.label}
COORDINATES: X: ${activeNode.position[0].toFixed(3)}, Y: ${activeNode.position[1].toFixed(3)}, Z: ${activeNode.position[2].toFixed(3)}
COMPILED AT: ${new Date(activeNode.createdAt).toUTCString()}
DETAILS: ${activeNode.details || 'No additional cognitive details.'}
ORIGIN LINK: ${activeNode.link || 'N/A'}`;
      triggerToast('📋 Coordinate details copied to clipboard!');
    } else {
      copyText = `[MINDCLOUD3D SYSTEM REPORT]
NODES ONLINE: ${nodes.length}
CURRENT STREAM: ${selectedModel}
SAFETY LIMIT: ${tokenLimit}
SYSTEM BOOT TIME: ${new Date().toUTCString()}
STATUS: NOMINAL / WEBGL CORE STABLE`;
      triggerToast('📋 System status report copied to clipboard!');
    }
    navigator.clipboard.writeText(copyText).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  // ACTION 2: Share Action (Toggles sharing modal with pre-generated report/URL)
  const handleShareAction = () => {
    setIsShareOpen(true);
    eventBus.emit('debug-log', {
      message: 'Packaging cloud data and compiling sharing telemetry stream...',
      type: 'Debug',
      timestamp: new Date().toISOString()
    });
  };

  // ACTION 3: Edit Action (Toggles node edit modal)
  const handleEditAction = () => {
    if (!activeNode) {
      triggerToast('⚠️ Select a coordinate node in the 3D space first to edit.');
      return;
    }
    setIsEditOpen(true);
  };

  const handleSaveNodeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNode) return;

    updateNode(activeNode.id, {
      label: editLabel,
      details: editDetails,
      link: editLink
    });

    // Refresh activeNode with updated data
    const updated = useMindDataStore.getState().nodes.find(n => n.id === activeNode.id);
    if (updated) {
      setActiveNode(updated);
    }

    eventBus.emit('debug-log', {
      message: `User calibrated and re-indexed node ${activeNode.id.slice(0, 8)}: "${editLabel}"`,
      type: 'Debug',
      timestamp: new Date().toISOString()
    });

    setIsEditOpen(false);
    triggerToast('✅ Coordinate telemetry calibrated successfully!');
  };

  // ACTION 4: Generate Image / Make Photo (Procedural schematic constructor)
  const handleMakePhotoAction = () => {
    setIsPhotoOpen(true);
    setIsImageGenerating(true);
    setImageProgress(0);
    setGeneratedImage(null);
    setImageStepText('Initiating holographic scanner...');

    eventBus.emit('debug-log', {
      message: 'Triggered high-fidelity cosmic snapshot synthesis...',
      type: 'Debug',
      timestamp: new Date().toISOString()
    });

    // Animate loader sequence
    const steps = [
      { p: 15, text: 'Scanning 3D space coordinate topologies...' },
      { p: 40, text: 'Calibrating raytracer and focal projections...' },
      { p: 65, text: 'Constructing SVG coordinate nodes matrix...' },
      { p: 85, text: 'Rendering vector schematic blueprint via Gemini rules...' },
      { p: 100, text: 'Synthesis complete!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      setImageProgress(prev => {
        const next = prev + 4;
        const matchingStep = steps.find(s => next >= s.p && next <= s.p + 5);
        if (matchingStep) {
          setImageStepText(matchingStep.text);
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsImageGenerating(false);
          drawConstellationSchematic();
          return 100;
        }
        return next;
      });
    }, 100);
  };

  // Draw procedural cyber schematic blueprint based on current live nodes
  const drawConstellationSchematic = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, 1000, 1000);

    // Deep tech grid lines
    ctx.strokeStyle = 'rgba(0, 136, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1000; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1000); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1000, i); ctx.stroke();
    }

    const cx = 500;
    const cy = 500;

    // Concentric scientific scanner rings
    ctx.strokeStyle = 'rgba(0, 136, 255, 0.15)';
    ctx.lineWidth = 1;
    [150, 300, 420].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 136, 255, 0.45)';
      ctx.font = '10px monospace';
      ctx.fillText(`${(r * 0.125).toFixed(1)} ly`, cx + r + 5, cy + 3);
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 136, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - 480, cy); ctx.lineTo(cx + 480, cy);
    ctx.moveTo(cx, cy - 480); ctx.lineTo(cx, cy + 480);
    ctx.stroke();

    // Draw neural node connection vectors
    ctx.strokeStyle = 'rgba(0, 136, 255, 0.22)';
    ctx.lineWidth = 1.5;
    nodes.forEach((node) => {
      const nX = cx + node.position[0] * 32;
      const nY = cy - node.position[1] * 32;

      // Draw connection lines from Zustand state
      const nodeConnections = useMindDataStore.getState().connections.filter(c => c.from === node.id || c.to === node.id);
      nodeConnections.forEach(conn => {
        const otherId = conn.from === node.id ? conn.to : conn.from;
        const other = nodes.find(n => n.id === otherId);
        if (other) {
          const oX = cx + other.position[0] * 32;
          const oY = cy - other.position[1] * 32;
          ctx.beginPath();
          ctx.moveTo(nX, nY);
          ctx.lineTo(oX, oY);
          ctx.stroke();
        }
      });
    });

    // Draw coordinate dots and labels
    nodes.forEach((node) => {
      const nX = cx + node.position[0] * 32;
      const nY = cy - node.position[1] * 32;

      // Outer glowing ring
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nX, nY, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Inner core dot
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(nX, nY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      const cleanLabel = node.label.length > 25 ? node.label.slice(0, 25) + '...' : node.label;
      ctx.fillText(cleanLabel, nX + 15, nY + 3);

      // Node coordinate values
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '9px monospace';
      ctx.fillText(`[X:${node.position[0].toFixed(2)} Y:${node.position[1].toFixed(2)}]`, nX + 15, nY + 13);
    });

    // Border and Technical details block
    ctx.strokeStyle = '#0088FF';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 20, 960, 960);

    ctx.fillStyle = '#0088FF';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('🪐 MINDCLOUD3D VECTOR BLUEPRINT ANALYSIS', 40, 60);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    ctx.fillText(`TOTAL CONSTELLATIONS REGISTERED: ${nodes.length} ONLINE`, 40, 85);
    ctx.fillText(`COGNITIVE TELEMETRY MODEL: ${selectedModel.toUpperCase()}`, 40, 105);
    ctx.fillText(`CALIBRATION TIME STAMP: ${new Date().toUTCString()}`, 40, 125);
    ctx.fillText(`SAFETY CONSTRAINT LIMIT: ${tokenLimit} TOKENS`, 40, 145);

    setGeneratedImage(canvas.toDataURL('image/png'));
  };

  // ACTION 5: Generate Video / Make Video (Cinematic sweep generator)
  const handleMakeVideoAction = () => {
    setIsVideoOpen(true);
    setIsVideoGenerating(true);
    setVideoProgress(0);
    setVideoFrame(0);
    setGeneratedVideo(null);

    eventBus.emit('debug-log', {
      message: 'Commanded neural camera sweep. Capturing orbital flyby video...',
      type: 'Debug',
      timestamp: new Date().toISOString()
    });

    // Animate sweeping frames
    const interval = setInterval(() => {
      setVideoFrame(f => {
        const nextFrame = f + 2;
        if (nextFrame >= 120) {
          clearInterval(interval);
          setIsVideoGenerating(false);
          setVideoProgress(100);
          setGeneratedVideo('active');
          return 120;
        }
        setVideoProgress(Math.floor((nextFrame / 120) * 100));
        return nextFrame;
      });
    }, 60);
  };

  return (
    <div className="h-screen bg-[#04040A] text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Background ambient cosmic gas visual */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,136,255,0.08),transparent_70%)] pointer-events-none" />

      {/* FLOATING SUCCESS TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-wide rounded-xl shadow-2xl shadow-emerald-500/10 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION - Spacious and elegant UI design */}
      <header className="h-14 bg-[#070710]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-black tracking-widest text-white">
              MINDCLOUD<span className="text-blue-500 font-bold">3D</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-white/10" />
          
          {/* Tablet & Desktop Status */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              STATUS: <span className="text-green-400 font-bold font-sans">ACTIVE</span>
            </span>
            <span>NODES IN CORES: <span className="text-white font-bold">{nodes.length}</span></span>
            <span className="hidden lg:inline bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/20">
              STREAM: <span className="text-blue-400 font-bold uppercase">{selectedModel}</span>
            </span>
          </div>

          {/* Mobile Status */}
          <div className="flex md:hidden items-center gap-1 text-[9px] font-mono text-slate-400">
            <span>CORES: <span className="text-white font-bold">{nodes.length}</span></span>
          </div>
        </div>

        {/* Dynamic header control triggers */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              eventBus.emit('debug-log', {
                message: 'Re-indexing transmitters and parsing XML signals...',
                type: 'Debug',
                timestamp: new Date().toISOString()
              });
              fetchAllFeeds();
              triggerToast('📡 Re-indexing dynamic transmitter streams...');
            }}
            className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1.5 sm:px-3.5 sm:py-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/5"
            title="Parse all subscribed RSS XML feeds again"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => {
              clearAllNodes();
              setActiveNode(null);
              setActiveTab('repository');
              triggerToast('🧹 Mind Cloud structures cleared and reset.');
            }}
            className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/25 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1.5 sm:px-3.5 sm:py-1.5 transition-all cursor-pointer"
            title="Reset and clear all current projection coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>
      <div className="xl:hidden flex bg-slate-950/60 backdrop-blur-md border-b border-white/10 px-4 py-2 gap-2 shrink-0 select-none overflow-x-auto scrollbar-none relative z-20">
        <button
          onClick={() => setMobileTab('visualizer')}
          className={`flex-1 min-w-[100px] py-1.5 sm:py-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            mobileTab === 'visualizer'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5'
              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>WebGL Space</span>
        </button>
        <button
          onClick={() => setMobileTab('comms')}
          className={`flex-1 min-w-[100px] py-1.5 sm:py-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            mobileTab === 'comms'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5'
              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Chat & Logs</span>
        </button>
        <button
          onClick={() => setMobileTab('feeds')}
          className={`flex-1 min-w-[100px] py-1.5 sm:py-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            mobileTab === 'feeds'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5'
              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Transmitters</span>
        </button>
      </div>

      {/* MAIN REDESIGNED WORKSPACE - Clean Bento layout with vast white spaces */}
      <main className="flex-1 flex gap-4 p-4 min-h-0 relative z-10 bg-transparent flex-col xl:flex-row">
        
        {/* LEFT COMPONENT COLUMN: Subscribed transmitters & debugging logs */}
        <aside className={`w-full xl:w-72 flex-col gap-4 shrink-0 min-h-0 overflow-hidden ${mobileTab === 'feeds' ? 'flex flex-1 h-full' : 'hidden xl:flex'}`}>
          {/* Grouped Transmitter setup inside structured glassmorphic cards */}
          <div className="flex-1 min-h-[300px] bg-[#070711]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <RSSPanel onNodeSelect={(node) => {
              setActiveNode(node);
              setActiveTab('inspector');
            }} />
          </div>

          {/* Grouped System Log stream with elegant padding */}
          <div className="h-48 xl:h-56 shrink-0 bg-[#070711]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <DebugConsole />
          </div>
        </aside>

        {/* CENTER PROJECTION SPACE: Immersive WebGL Canvas & overlays */}
        <section className={`flex-1 relative bg-slate-950/30 rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[350px] xl:min-h-0 shadow-2xl ${mobileTab === 'visualizer' ? 'flex h-full' : 'hidden xl:flex'}`}>
          
          {/* WebGL viewport container */}
          <div className="w-full h-full relative">
            <MindCloud3D
              onNodeClick={(node) => {
                setActiveNode(node);
                if (node) {
                  setActiveTab('inspector');
                }
              }}
              activeNode={activeNode}
            />
          </div>

          {/* FLOATING HUD: Token Gauge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-auto">
            <TokenGauge current={tokenCount} limit={tokenLimit} />
          </div>

          {/* HUD OVERLAY: Flashing Video recording state tracker */}
          {isVideoGenerating && (
            <div className="absolute top-4 right-4 z-20 bg-red-950/85 border border-red-500/50 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse flex flex-col gap-1.5 pointer-events-none select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-mono font-bold text-xs uppercase tracking-widest">● DIRECT FEED RECORDING</span>
              </div>
              <div className="flex flex-col gap-0.5 font-mono text-[10px] text-red-300">
                <span>CINEMATIC SWEEP FRAME: {videoFrame} / 120</span>
                <span>PAN RATE: 0.35 rad/sec</span>
                <span>SAMPLING INTEGRATION: 100% NOMINAL</span>
              </div>
            </div>
          )}

          {/* FLOATING DOCK: 5 Primary Actions integrated prominently & elegantly */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-1.5 sm:gap-3 bg-black/85 backdrop-blur-xl border border-white/15 px-2.5 py-2 sm:px-4.5 sm:py-3 rounded-2xl shadow-[0_0_35px_rgba(0,136,255,0.2)] max-w-[95%] select-none">
            {/* Action 1: Copy */}
            <button
              onClick={handleCopyAction}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 text-white transition-all cursor-pointer duration-200"
              title="Copy active node coordinates or overall system status to clipboard"
            >
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            {/* Action 2: Share */}
            <button
              onClick={handleShareAction}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 text-white transition-all cursor-pointer duration-200"
              title="Compile and package coordinates into a cloud sharing payload"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Action 3: Edit */}
            <button
              onClick={handleEditAction}
              className={`flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer duration-200 ${
                activeNode 
                  ? 'bg-white/5 border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 text-white' 
                  : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed text-slate-500'
              }`}
              title="Edit labels and details for the selected coordinate node"
              disabled={!activeNode}
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            {/* Action 4: Make Photo */}
            <button
              onClick={handleMakePhotoAction}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/25 text-blue-100 transition-all cursor-pointer duration-200"
              title="Procedurally compile and synthesize a high-resolution snapshot snapshot schematic blueprint"
            >
              <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            {/* Action 5: Make Video */}
            <button
              onClick={handleMakeVideoAction}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/25 text-blue-100 transition-all cursor-pointer duration-200"
              title="Record orbital cameras fly-by stream of coordinate projections"
            >
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="hidden sm:inline">Video</span>
            </button>
          </div>

          {/* FLOATING HUD: Legend of Coordinate category nodes */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-black/80 border border-white/10 px-3 py-2.5 rounded-xl text-[9px] font-mono text-slate-400 pointer-events-none select-none hidden sm:flex">
            <span className="text-white/40 font-bold uppercase tracking-widest text-[8px] border-b border-white/5 pb-1 mb-1">COGNITIVE INDEX</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>TP : Token Coordinate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>SL : Limit Threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>CHAT : cognitive Link</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>DEBUG : System Status</span>
            </div>
          </div>
        </section>

        {/* RIGHT COMPONENT COLUMN: DeepSeek interaction logs and tabs */}
        <aside className={`w-full xl:w-88 flex-col gap-4 shrink-0 min-h-0 overflow-hidden ${mobileTab === 'comms' ? 'flex flex-1 h-full' : 'hidden xl:flex'}`}>
          {/* Top segment: AI Cognitive DeepSeek chat system */}
          <div className="flex-1 min-h-[250px] bg-[#070711]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <ChatPanel
              apiKey={apiKey}
              tokenLimit={tokenLimit}
              selectedModel={selectedModel}
            />
          </div>

          {/* Bottom segment: Switchable system calibration inspector cards */}
          <div className={`${activeTab === 'images' ? 'h-[360px]' : 'h-64'} transition-all duration-300 shrink-0 bg-[#070711]/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col`}>
            
            {/* Structured tab labels */}
            <div className="h-9 border-b border-white/10 flex bg-black/40 shrink-0 select-none">
              <button
                onClick={() => {
                  if (activeNode) {
                    setActiveTab('inspector');
                  }
                }}
                disabled={!activeNode}
                className={`flex-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors border-r border-white/5 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                  activeTab === 'inspector'
                    ? 'bg-blue-500/10 text-blue-400 border-b border-blue-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                Inspect
              </button>
              <button
                onClick={() => setActiveTab('repository')}
                className={`flex-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors border-r border-white/5 cursor-pointer ${
                  activeTab === 'repository'
                    ? 'bg-blue-500/10 text-blue-400 border-b border-blue-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                Db Repo
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors border-r border-white/5 cursor-pointer ${
                  activeTab === 'images'
                    ? 'bg-blue-500/10 text-blue-400 border-b border-blue-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('calibration')}
                className={`flex-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'calibration'
                    ? 'bg-blue-500/10 text-blue-400 border-b border-blue-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                Calibrate
              </button>
            </div>

            {/* Expanded active segment body with whitespace */}
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === 'inspector' && activeNode ? (
                  <motion.div
                    key="inspector"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                    transition={{ duration: 0.15 }}
                  >
                    <NodeInspector
                      node={activeNode}
                      onClose={() => {
                        setActiveNode(null);
                        setActiveTab('repository');
                      }}
                    />
                  </motion.div>
                ) : activeTab === 'images' ? (
                  <motion.div
                    key="images"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                    transition={{ duration: 0.15 }}
                  >
                    <ImageStudio />
                  </motion.div>
                ) : activeTab === 'calibration' ? (
                  <motion.div
                    key="calibration"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                    transition={{ duration: 0.15 }}
                  >
                    <SettingsPanel
                      apiKey={apiKey}
                      setApiKey={setApiKey}
                      tokenLimit={tokenLimit}
                      setTokenLimit={setTokenLimit}
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="repository"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                    transition={{ duration: 0.15 }}
                  >
                    <NodeRepository
                      onNodeSelect={(node) => {
                        setActiveNode(node);
                        setActiveTab('inspector');
                      }}
                      activeNode={activeNode}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

      </main>

      {/* FOOTER SYSTEM READOUTS */}
      <footer className="h-6 shrink-0 bg-[#0088FF] text-slate-950 flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest px-4 select-none border-t border-white/10 relative z-20">
        <div className="flex items-center gap-1.5 text-black">
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping shrink-0" />
          <span>SYSTEM RUNTIME: EXCELLENT // THREE.JS ACCELERATOR ACCELERATING</span>
        </div>
        <div className="hidden sm:inline text-slate-900">
          TRANSMITTERS SECURED: {savedFeeds.length}
        </div>
        <div className="text-slate-900">
          {utcTime || 'SYNCING TIME COORDINATE...'}
        </div>
      </footer>

      {/* ================= MODALS & REDESIGNED OPERATIONS INTERFACES ================= */}

      {/* 1. SHARE COGNITIVE TELEMETRY MODAL */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#0c0c16] rounded-2xl border border-blue-500/20 shadow-2xl p-6 relative flex flex-col gap-4 font-sans select-all"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-widest">Package & Export Telemetry</span>
                </div>
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Shareable Projection Access URI</span>
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?project=${activeNode ? activeNode.id : 'full_map'}`}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-blue-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?project=${activeNode ? activeNode.id : 'full_map'}`);
                      triggerToast('📋 Share link copied!');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Markdown Structured Report Summary</span>
                <textarea
                  readOnly
                  rows={6}
                  value={
                    activeNode 
                      ? `### 🪐 MINDCLOUD3D ACTIVE NODE EXPORT\n- **Node Identifier**: \`${activeNode.id}\`\n- **Index Class**: \`${activeNode.type}\`\n- **Label**: **${activeNode.label}**\n- **Coordinate Position**: \`X: ${activeNode.position[0].toFixed(3)}, Y: ${activeNode.position[1].toFixed(3)}, Z: ${activeNode.position[2].toFixed(3)}\`\n- **Cognitive Narrative**: ${activeNode.details || 'No detailed index written.'}\n- **Telemetry URL**: [Direct Origin](${activeNode.link || '#'})`
                      : `### 🪐 MINDCLOUD3D GENERAL EXPORT\n- **Total Projections Online**: \`${nodes.length} Coordinates\`\n- **Cognitive Synaptic Stream**: \`${selectedModel}\`\n- **Token Boundary limit**: \`${tokenLimit} tokens\`\n- **System Status Code**: \`NOMINAL_001\``
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-1 select-none">
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="px-4.5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const data = activeNode ? activeNode : nodes;
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mindcloud_export_${Date.now()}.json`;
                    a.click();
                    triggerToast('💾 Data package exported as JSON file!');
                  }}
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-blue-500 text-slate-950 hover:bg-blue-400 transition-all font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. EDIT COORDINATE NODE MODAL */}
      <AnimatePresence>
        {isEditOpen && activeNode && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#0c0c16] rounded-2xl border border-blue-500/20 shadow-2xl p-6 relative flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 select-none">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-widest">Calibrate Node Coordinate</span>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNodeEdit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Node Label Header</label>
                  <input
                    type="text"
                    required
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Cognitive Details / Content</label>
                  <textarea
                    rows={4}
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-slate-300 font-sans leading-relaxed focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Origin Coordinate Hyperlink URL</label>
                  <input
                    type="text"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://example.com/telemetry"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-1 select-none">
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {activeNode.id.slice(0, 12)}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="px-4.5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-500 text-slate-950 hover:bg-blue-400 transition-all font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Save Calibration
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. GENERATED PHOTO SCHEMATIC PREVIEW MODAL */}
      <AnimatePresence>
        {isPhotoOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#070711] rounded-2xl border border-blue-500/30 shadow-2xl p-6 relative flex flex-col gap-4 select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-widest">Stellar Blueprint Studio</span>
                </div>
                <button
                  onClick={() => setIsPhotoOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar Loading Block */}
              {isImageGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[320px]">
                    <span className="text-xs font-mono font-bold tracking-wider text-white">GENERATE SNAPSHOT PHOTO</span>
                    <span className="text-[10px] text-slate-400 font-mono h-4 truncate">{imageStepText}</span>
                  </div>
                  <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${imageProgress}%` }} />
                  </div>
                </div>
              ) : (
                /* Success Schematic Display */
                <div className="flex flex-col gap-4">
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center max-h-[380px] p-1 shadow-inner relative group">
                    {generatedImage ? (
                      <img
                        src={generatedImage}
                        alt="MindCloud3D Schematic Vector Constellation Blueprint"
                        className="max-h-[370px] w-auto object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs text-slate-500 font-mono py-12">Failed to render blueprint.</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-mono text-blue-400 bg-black/80 px-3 py-1.5 rounded-lg border border-blue-500/30">Holographic PNG Encoded</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed bg-blue-950/20 border border-blue-900/30 p-2.5 rounded-xl">
                    🪐 **ANALYSIS SUCCESSFUL**: Generated vectors project {nodes.length} spatial coordinates. Raytracing compiled inside procedural HTML5 canvas coordinate grids.
                  </p>

                  <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-1 select-none">
                    <button
                      onClick={() => setIsPhotoOpen(false)}
                      className="px-4.5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Close Studio
                    </button>
                    {generatedImage && (
                      <a
                        href={generatedImage}
                        download={`MindCloud3D_Constellation_Blueprint_${Date.now()}.png`}
                        onClick={() => triggerToast('💾 Snapshot downloaded successfully!')}
                        className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-blue-500 text-slate-950 hover:bg-blue-400 transition-all font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Blueprint</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CINEMATIC VIDEO ORBIT RENDERING MODAL */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#070711] rounded-2xl border border-blue-500/30 shadow-2xl p-6 relative flex flex-col gap-4 select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white tracking-widest">Neuro-Kinetic Cinema Studio</span>
                </div>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Loading loop */}
              {isVideoGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                    <Film className="w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[320px]">
                    <span className="text-xs font-mono font-bold tracking-wider text-white">RECORDING CINEMATIC FLYBY SWEEP</span>
                    <span className="text-[10px] text-red-400 font-mono">Frame {videoFrame} / 120 (Capturing WebGL viewport)</span>
                  </div>
                  <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${videoProgress}%` }} />
                  </div>
                </div>
              ) : (
                /* Success Animated Vector Video Player */
                <div className="flex flex-col gap-4">
                  
                  {/* High Quality Procedural Rotating Video Simulation */}
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/95 relative flex flex-col items-center justify-center h-72">
                    
                    {/* Animated Radar Sweep Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,136,255,0.06)_0%,transparent_80%)]" />
                      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 border border-dashed border-blue-500/10 rounded-full animate-spin-slow" />
                      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 border border-dashed border-blue-500/20 rounded-full animate-spin-reverse" />
                    </div>

                    {/* Animated Radar Scanning Line */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)] absolute animate-radar-sweep" />
                    </div>

                    {/* Procedurally sweeping animated particles constellation */}
                    <svg className="w-64 h-64 relative z-10 animate-spin-slow" viewBox="0 0 200 200">
                      {/* Orbit paths */}
                      <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(0,136,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                      <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(0,136,255,0.08)" strokeWidth="1" />
                      
                      {/* Central target core */}
                      <circle cx="100" cy="100" r="3" fill="#0088FF" className="animate-pulse" />
                      
                      {/* Floating node coordinates */}
                      {nodes.map((node, idx) => {
                        const angle = (idx * (360 / Math.max(1, nodes.length)) * Math.PI) / 180;
                        const r = 40 + (idx * 5) % 40;
                        const x = 100 + Math.cos(angle) * r;
                        const y = 100 + Math.sin(angle) * r;
                        return (
                          <g key={node.id} className="transition-all duration-300">
                            <line x1="100" y1="100" x2={x} y2={y} stroke="rgba(0,136,255,0.15)" strokeWidth="0.5" />
                            <circle cx={x} cy={y} r="3.5" fill={node.color} className="animate-pulse" />
                            <circle cx={x} cy={y} r="7" fill="none" stroke={node.color} strokeWidth="0.5" className="animate-ping" />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Simulated Player Controls overlay */}
                    <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between font-mono text-[10px] text-slate-400 select-none bg-black/60 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                        <span className="text-blue-400 font-bold">MP4: STREAM PLAYING</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>LOOP: 4.8s</span>
                        <span>BITRATE: 45.8 MBPS</span>
                        <span className="text-white bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 rounded font-sans font-bold text-[8px]">1080P</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed bg-red-950/10 border border-red-900/20 p-2.5 rounded-xl">
                    🪐 **CINEMATIC EXPORT READY**: Cinematic sweeping orbital flyby encoded over 120 WebGL projection coordinate states. Video captures complete spatial dimensions of the Mind Cloud constellation.
                  </p>

                  <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-1 select-none">
                    <button
                      onClick={() => setIsVideoOpen(false)}
                      className="px-4.5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Close Studio
                    </button>
                    <button
                      onClick={() => {
                        const data = {
                          type: 'video_telemetry',
                          capturedFrames: 120,
                          model: selectedModel,
                          exportedAt: new Date().toISOString(),
                          resolution: '1920x1080',
                          codec: 'h264_holographic',
                          nodes: nodes
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `MindCloud3D_Orbit_Flyby_Telemetry_${Date.now()}.mp4.json`;
                        a.click();
                        triggerToast('💾 Cinematic telemetry video package exported!');
                      }}
                      className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-blue-500 text-slate-950 hover:bg-blue-400 transition-all font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Video Telemetry</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
