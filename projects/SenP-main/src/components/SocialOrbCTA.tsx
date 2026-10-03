import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Youtube, Github, Twitter, Send, CheckCircle, ShieldAlert, Heart, Globe, MessageSquare } from "lucide-react";
import { MediaLinks } from "../types";

interface SocialOrbCTAProps {
  mediaLinks?: MediaLinks;
}

export const SocialOrbCTA: React.FC<SocialOrbCTAProps> = ({ mediaLinks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [subStatus, setSubStatus] = useState<{ msg: string; type: "success" | "error" | null }>({ msg: "", type: null });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== "") {
      // Bot detected! Block silently or show security warning
      setSubStatus({ msg: "Bot spam detected and blocked by Honeypot!", type: "error" });
      return;
    }
    if (!email.includes("@")) {
      setSubStatus({ msg: "Please enter a valid email address.", type: "error" });
      return;
    }
    setSubStatus({ msg: "Subscribed to SenPai Neural Bulletins!", type: "success" });
    setEmail("");
    setTimeout(() => setSubStatus({ msg: "", type: null }), 4000);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const size = canvas.clientWidth || 56;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(size, size, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x00d4ff, 2, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Shell & Core
    const shellGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.6 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.4 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const colors = [0x00d4ff, 0xffb347, 0xa78bfa, 0x3fb950, 0xf87171, 0xfbbf24, 0x38bdf8, 0xe879f9];
    let colIdx = 0;
    let lastSwap = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();

      shell.rotation.y += 0.01;
      shell.rotation.x += 0.004;
      core.rotation.y -= 0.015;
      core.rotation.x += 0.007;

      if (now - lastSwap > 3500) {
        lastSwap = now;
        colIdx = (colIdx + 1) % colors.length;
        const hex = colors[colIdx];
        shellMat.color.setHex(hex);
        coreMat.color.setHex(hex);
        coreMat.emissive.setHex(hex);
        pointLight.color.setHex(hex);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      shellGeo.dispose();
      shellMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 select-none font-sans">
      {/* Panel popup */}
      {isOpen && (
        <div className="bg-[#0d1117]/95 border border-gray-700/80 rounded-xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl w-64 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 text-[10px] font-mono font-bold tracking-widest text-gray-300">
            <span>先輩 FOLLOW SENPAI</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-1.5 text-xs font-semibold max-h-48 overflow-y-auto pr-1">
            <a
              href={mediaLinks?.youtubeUrl || "https://www.youtube.com/@Matin_SenPai"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube</span>
            </a>
            <a
              href={mediaLinks?.githubUrl || "https://github.com/MatinSenPai"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-white hover:text-white hover:bg-gray-800/40 transition-all"
            >
              <Github className="w-4 h-4 text-gray-300" />
              <span>GitHub</span>
            </a>
            <a
              href={mediaLinks?.twitterUrl || "https://x.com/MatinSenPai"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-950/20 transition-all"
            >
              <Twitter className="w-4 h-4 text-cyan-400" />
              <span>X (Twitter)</span>
            </a>
            {mediaLinks?.discordUrl && (
              <a
                href={mediaLinks.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-950/20 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Discord</span>
              </a>
            )}
            {mediaLinks?.telegramUrl && (
              <a
                href={mediaLinks.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-950/20 transition-all"
              >
                <Send className="w-4 h-4 text-blue-400" />
                <span>Telegram</span>
              </a>
            )}
            {mediaLinks?.customMediaUrl && (
              <a
                href={mediaLinks.customMediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#141820] border border-gray-800 hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-950/20 transition-all"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{mediaLinks.customMediaLabel || "Custom Website"}</span>
              </a>
            )}
            {mediaLinks?.donationUrl && (
              <a
                href={mediaLinks.donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:bg-amber-500/20 transition-all font-bold animate-pulse"
              >
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{mediaLinks.donationText || "Support / Donate"}</span>
              </a>
            )}
          </div>

          {/* Neural Bulletin Subscription with Honeypot */}
          <div className="pt-2 border-t border-gray-800/80 space-y-2 font-mono">
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>NEURAL BULLETIN</span>
              <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1 py-0.5 rounded border border-cyan-800">BOT PROTECTED</span>
            </div>
            
            {subStatus.type && (
              <div className={`p-2 rounded-lg text-[10px] flex items-center gap-1.5 ${subStatus.type === "success" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-rose-950/80 text-rose-300 border border-rose-800"}`}>
                {subStatus.type === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
                <span>{subStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleSubscribe} className="relative flex items-center gap-1">
              {/* HONEYPOT FIELD - HIDDEN FROM REAL USERS TO TRAP SPAM BOTS */}
              <input
                type="text"
                name="honeypot_bot_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
                aria-hidden="true"
                placeholder="Leave this empty if you are human"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                className="w-full bg-[#141820] border border-gray-800 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-sans"
              />
              <button
                type="submit"
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shrink-0"
                title="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orb Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full p-0 border border-gray-700 bg-radial from-[#14161b] to-[#050608] cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-105 hover:border-cyan-400 transition-all animate-pulse"
        title="Follow SenPai — Open Social Links"
      >
        <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
      </button>
    </div>
  );
};
