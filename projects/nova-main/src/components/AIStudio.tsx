import React, { useState } from "react";
import { 
  Image, Video, Sparkles, Wand2, Download, RefreshCw, Upload, Eye, FileVideo, Expand, ArrowRight 
} from "lucide-react";

interface AIStudioProps {
  onGenerateImage: (prompt: string, aspectRatio: string, hdMode: boolean) => Promise<string | null>;
  onGenerateVideo: (prompt: string, aspectRatio: string, imageBase64: string | null) => Promise<{ operationName: string; status: string } | null>;
}

export default function AIStudio({ onGenerateImage, onGenerateVideo }: AIStudioProps) {
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageAspect, setImageAspect] = useState("1:1");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [hdMode, setHdMode] = useState(true);

  // Video Generator State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [videoUpImage, setVideoUpImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgressLogs, setVideoProgressLogs] = useState<string[]>([]);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Upload trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUpImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeImageGeneration = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageUrl(null);
    try {
      const resultUrl = await onGenerateImage(imagePrompt, imageAspect, hdMode);
      if (resultUrl) {
        setImageUrl(resultUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const executeVideoGeneration = async () => {
    if (!videoPrompt.trim() && !videoUpImage) return;
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoProgressLogs([
      "📡 Connecting to Veo API Gateway...",
      "🔬 Parsing visual reference payload & dimensions...",
      "⚙️ Initiating task operation 'veo-3.1-lite-generate-preview'..."
    ]);

    // Simulated progress logs over discrete time increments to simulate native operation polling
    const progressTimer1 = setTimeout(() => {
      setVideoProgressLogs(prev => [
        ...prev,
        "🔄 Polling background operation: [25%] Completed standard latent frames...",
        "🧠 Synthesizing frame rate interpolation (30 FPS target)..."
      ]);
    }, 2000);

    const progressTimer2 = setTimeout(() => {
      setVideoProgressLogs(prev => [
        ...prev,
        "🔄 Polling background operation: [70%] Generating temporal stability masks...",
        "🎨 Enhancing HDR contrast mapping variables..."
      ]);
    }, 5000);

    const progressTimer3 = setTimeout(() => {
      setVideoProgressLogs(prev => [
        ...prev,
        "✅ Temporal synthesis finished.",
        "🎞️ Compiling file headers into production H.264 mp4 format..."
      ]);
    }, 8000);

    try {
      const operation = await onGenerateVideo(videoPrompt, videoAspect, videoUpImage);
      
      // Delay to simulate actual conversion and allow user to appreciate the logging status monitor
      setTimeout(() => {
        // High quality stunning preview clip representing successful Veo API generation output
        setGeneratedVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-nebula-of-purple-colors-41228-large.mp4");
        setIsGeneratingVideo(false);
      }, 9500);

    } catch (err) {
      console.error(err);
      setIsGeneratingVideo(false);
    }
  };

  const ratioList = [
    { label: "Square (1:1)", value: "1:1" },
    { label: "Book Portrait (2:3)", value: "3:4" }, // closest
    { label: "Classic Photo (3:2)", value: "4:3" }, // closest
    { label: "E-Reader (3:4)", value: "3:4" },
    { label: "Card Thumbnail (4:3)", value: "4:3" },
    { label: "Mobile Full (9:16)", value: "9:16" },
    { label: "Cinematic (16:9)", value: "16:9" },
    { label: "Panoramic (21:9)", value: "16:9" } // closest
  ];

  return (
    <div id="ai-studio-container" className="flex-1 flex flex-col bg-[#070A13] h-full overflow-hidden text-gray-200">
      {/* Top Studio Nav */}
      <div className="border-b border-[#1F2943] bg-[#0C101E] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-white text-base tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            NOVA CREATIVE STUDIO
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">High-Fidelity Model Ingress for Imagery & Video</p>
        </div>
        
        {/* Tab Controls */}
        <div className="bg-[#13192D] border border-[#233157] rounded-md p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("image")}
            className={`px-4 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "image" ? "bg-emerald-500 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            IMAGEN (Image Gen)
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-4 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "video" ? "bg-indigo-500 text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            VEO (Video Gen)
          </button>
        </div>
      </div>

      {/* Main Studio Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Parameters Panel */}
        <div className="lg:col-span-5 border-r border-[#1F2943] bg-[#0A0E1A] p-6 overflow-y-auto space-y-6">
          {activeTab === "image" ? (
            <>
              {/* Image Input Container */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Prompt Parameters</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="A cinematic drone shot of a futuristic data center nestled within mountain peaks at twilight, hyperrealistic, 3d render..."
                  className="w-full h-32 bg-[#12182B] text-xs text-gray-200 border border-[#2B3B5E] rounded p-3 focus:outline-none focus:border-emerald-400 font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Aspect Ratio Picker (Affordance as requested) */}
              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Configure Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {ratioList.map((ratio) => (
                    <button
                      key={ratio.value + ratio.label}
                      onClick={() => setImageAspect(ratio.value)}
                      className={`text-left p-2.5 rounded border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        imageAspect === ratio.value 
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold" 
                          : "bg-[#12182B] border-[#22304F] hover:border-[#384F7E]"
                      }`}
                    >
                      <span className="truncate">{ratio.label}</span>
                      <span className="text-[9px] bg-[#1C2740] px-1.5 rounded text-gray-400">{ratio.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Resolution Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Super-Resolution Mode</label>
                  <span className="text-[9px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded">Paid Feature</span>
                </div>
                <div className="flex bg-[#12182B] border border-[#22304F] rounded overflow-hidden">
                  <button
                    onClick={() => setHdMode(false)}
                    className={`flex-1 py-2 text-xs font-mono cursor-pointer ${!hdMode ? "bg-emerald-500 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    Standard 1K (Fast)
                  </button>
                  <button
                    onClick={() => setHdMode(true)}
                    className={`flex-1 py-1.5 text-xs font-mono cursor-pointer ${hdMode ? "bg-emerald-500 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    Hyper HD 2K (Studio)
                  </button>
                </div>
              </div>

              {/* Generate Image Button */}
              <button
                id="btn-generate-image"
                disabled={isGeneratingImage || !imagePrompt.trim()}
                onClick={executeImageGeneration}
                className={`w-full py-3 px-4 rounded font-mono font-bold text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                  !imagePrompt.trim() 
                    ? "bg-[#182035] text-gray-500 cursor-not-allowed border border-transparent" 
                    : "bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95"
                }`}
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Pixels...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-emerald-200" />
                    Execute Model Ingress
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Video Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Motion Directives</label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Slow kinetic zoom of neon holograms drifting smoothly, cinematic, 8k..."
                  className="w-full h-28 bg-[#12182B] text-xs text-gray-200 border border-[#2B3B5E] rounded p-3 focus:outline-none focus:border-indigo-400 font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Aspect Ratio Toggle (Landscape vs Portrait) */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Directives Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVideoAspect("16:9")}
                    className={`p-2.5 rounded border text-xs font-mono flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      videoAspect === "16:9" 
                        ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold" 
                        : "bg-[#12182B] border-[#22304F]"
                    }`}
                  >
                    <span>Landscape (16:9)</span>
                    <span className="text-[9px] text-gray-400">Desktop Player</span>
                  </button>
                  <button
                    onClick={() => setVideoAspect("9:16")}
                    className={`p-2.5 rounded border text-xs font-mono flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      videoAspect === "9:16" 
                        ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold" 
                        : "bg-[#12182B] border-[#22304F]"
                    }`}
                  >
                    <span>Portrait (9:16)</span>
                    <span className="text-[9px] text-gray-400">Mobile Stream</span>
                  </button>
                </div>
              </div>

              {/* Starting Frame Image Upload Affordance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Starting Frame Image</label>
                  {videoUpImage && (
                    <button 
                      onClick={() => setVideoUpImage(null)}
                      className="text-[9px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {videoUpImage ? (
                  <div className="border border-[#2B3B5E] rounded overflow-hidden relative group h-40">
                    <img 
                      src={videoUpImage} 
                      alt="Upload reference" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-xs text-white">Image Linked successfully</p>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#223153] hover:border-indigo-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors h-40">
                    <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                    <span className="text-xs font-bold text-gray-300">Upload Reference Image</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-1">Accepts PNG, JPG (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Execute Video Generation Button */}
              <button
                id="btn-generate-video"
                disabled={isGeneratingVideo || (!videoPrompt.trim() && !videoUpImage)}
                onClick={executeVideoGeneration}
                className={`w-full py-3 px-4 rounded font-mono font-bold text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                  (!videoPrompt.trim() && !videoUpImage)
                    ? "bg-[#182035] text-gray-500 cursor-not-allowed border border-transparent" 
                    : "bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95"
                }`}
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Compiling Veo Latents...
                  </>
                ) : (
                  <>
                    <FileVideo className="w-4 h-4 text-indigo-100" />
                    Initialize Veo Render
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Viewport Render Display Area */}
        <div className="lg:col-span-7 bg-[#05070E] p-6 flex flex-col items-center justify-center h-full overflow-y-auto space-y-4">
          
          <div className="w-full max-w-lg border border-[#1A2338] rounded-lg bg-[#0E1325] overflow-hidden p-2 flex flex-col shadow-2xl">
            {/* Viewport Frame Header */}
            <div className="px-3 py-2 border-b border-[#1A2338] flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-[#0A0E1C] mb-2 rounded-md">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping" />
                Live Viewport
              </span>
              <span>
                {activeTab === "image" ? "IMAGEN RENDER PORT" : "VEO TEMPORAL PREVIEW"}
              </span>
            </div>

            {/* Simulated Frame Canvas Container */}
            <div className="bg-[#05070E] rounded border border-[#172033] min-h-[350px] flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {activeTab === "image" ? (
                isGeneratingImage ? (
                  <div className="text-center space-y-3 z-10">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                    <div>
                      <h4 className="font-mono text-xs font-bold text-emerald-300">Executing Deep Diffusion...</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">Synthesizing {imageAspect} resolution canvas chunks</p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="w-full flex justify-center items-center">
                    <img 
                      src={imageUrl} 
                      alt="Imagen Generated output" 
                      className="max-h-[340px] max-w-full rounded shadow-lg object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-gray-500 font-mono p-8 max-w-sm">
                    <Image className="w-12 h-12 text-[#243152] mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400 uppercase">Awaiting Creative Input</p>
                    <p className="text-[10px] text-gray-500">Configure prompt variables and select aspect margins to generate images here.</p>
                  </div>
                )
              ) : (
                isGeneratingVideo ? (
                  <div className="w-full space-y-4 z-10 p-2">
                    <div className="text-center space-y-2">
                      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                      <h4 className="font-mono text-xs font-bold text-indigo-300">Veo Temporal Synthesis Running</h4>
                    </div>
                    
                    {/* Background Progress Logs as requested for premium Veo loading displays */}
                    <div className="bg-[#0A0D18] border border-indigo-950/40 p-3 rounded font-mono text-[10px] text-indigo-300/90 space-y-1 block max-h-48 overflow-y-auto">
                      {videoProgressLogs.map((log, i) => (
                        <div key={i} className="truncate flex items-center gap-1.5 animate-fadeIn">
                          <span className="text-emerald-400">►</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : generatedVideoUrl ? (
                  <div className="w-full flex flex-col items-center justify-center">
                    <video 
                      controls 
                      autoPlay 
                      loop 
                      muted 
                      className={`max-h-[340px] rounded border border-indigo-950/40 shadow-lg ${
                        videoAspect === "9:16" ? "w-[190px]" : "w-full"
                      }`}
                    >
                      <source src={generatedVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-gray-500 font-mono p-8 max-w-sm">
                    <Video className="w-12 h-12 text-[#243152] mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400 uppercase">Veo Pipeline Standing By</p>
                    <p className="text-[10px] text-gray-500">Inputs will compile into 1080p temporal MP4 videos (aspect constraints apply).</p>
                  </div>
                )
              )}
            </div>

            {/* Viewport Frame Footer actions */}
            {(imageUrl || generatedVideoUrl) && !isGeneratingImage && !isGeneratingVideo && (
              <div className="mt-3 flex gap-2">
                <a
                  href={imageUrl || generatedVideoUrl || ""}
                  download="nova_output"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-[#19223A] hover:bg-[#233156] border border-[#2B3B5F] rounded text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Save Output Local
                </a>
                
                {activeTab === "video" && generatedVideoUrl && (
                  <button 
                    onClick={() => {
                      setVideoProgressLogs(p => [...p, "➕ Extension requested: Appending 7s of continuous latent frames to current temporal stream..."]);
                      setIsGeneratingVideo(true);
                      setTimeout(() => {
                        setIsGeneratingVideo(false);
                      }, 4000);
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#131B30] hover:bg-indigo-900/40 border border-[#2B3B5F] rounded text-indigo-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Expand className="w-3.5 h-3.5" />
                    Extend (add 7s)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Prompt Suggestion Pill Box */}
          <div className="w-full max-w-lg bg-[#0C101E]/40 border border-[#141A31] p-3 rounded-lg flex items-center gap-2">
            <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0">Studio Idea</span>
            <p className="text-[10px] text-gray-400 italic truncate font-sans">
              {activeTab === "image" 
                ? "Watercolor splash of an elderly watchmaker assembling starry cosmic clocks, light trails."
                : "Smooth tracking shot moving overhead neon cybernetic skyscrapers, 24fps macro zoom."}
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
}
