import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Zap, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Sandbox = () => {
  const {
    themeMode,
    mass,
    setMass,
    energy,
    setEnergy,
    frequency,
    setFrequency,
    distance,
    setDistance,
    gmi,
    stability,
    negMassDensity,
    power,
    levitationStatus,
    targetFrequency,
    addNotification,
    playSuccess,
    playWarning,
    playClick
  } = useSimulation();

  const canvasRef = useRef(null);
  const successPlayedRef = useRef(false);

  // Auto-tune frequency helper
  const handleAutoTune = () => {
    setFrequency(targetFrequency);
    playClick();
    addNotification(`Automatic Resonance Tune engaged: Frequency set to ${targetFrequency} Hz.`);
  };

  // Play success chime when stability is achieved
  useEffect(() => {
    if (levitationStatus === 'STABLE') {
      if (!successPlayedRef.current) {
        playSuccess();
        successPlayedRef.current = true;
        // Explode minor cyber green/blue confetti!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#00ff87', '#0f172a']
        });
      }
    } else {
      successPlayedRef.current = false;
    }
  }, [levitationStatus]);

  // Color mappings
  const getColors = () => {
    switch (themeMode) {
      case 'academic':
        return {
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-500',
          accentBorder: 'border-emerald-800/40',
          sliderThumb: 'accent-emerald-500',
          canvasGlow: 'rgba(16, 185, 129, ',
          textLabel: 'text-slate-400'
        };
      case 'classified':
        return {
          accent: 'text-cyber-amber',
          accentBg: 'bg-cyber-amber',
          accentBorder: 'border-cyber-amber/30',
          sliderThumb: 'accent-cyber-amber',
          canvasGlow: 'rgba(255, 170, 0, ',
          textLabel: 'text-amber-600/70'
        };
      case 'sci-fi':
      default:
        return {
          accent: 'text-cyber-blue',
          accentBg: 'bg-cyber-blue',
          accentBorder: 'border-cyber-blue/25',
          sliderThumb: 'accent-cyber-blue',
          canvasGlow: 'rgba(0, 240, 255, ',
          textLabel: 'text-gray-500'
        };
    }
  };

  const colors = getColors();

  // Draw simulation physics sandbox on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // Particle class for energy streams
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * (canvas.height / window.devicePixelRatio);
      }
      reset() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        this.x = Math.random() * w;
        this.y = h + Math.random() * 40; // start at bottom
        this.speed = 1 + Math.random() * 2.5;
        this.size = 0.5 + Math.random() * 1.5;
        this.alpha = 0.1 + Math.random() * 0.5;
      }
      update(levStatus, energyVal) {
        const h = canvas.height / window.devicePixelRatio;
        
        // Speed proportional to negative energy
        this.y -= this.speed * (0.3 + (energyVal / 300));
        
        // Horizontal jitter
        this.x += Math.sin(this.y * 0.05) * 0.5;

        // Reset if goes off top
        if (this.y < 0) {
          this.reset();
        }
      }
      draw(cCtx, themeType) {
        cCtx.save();
        cCtx.globalAlpha = this.alpha;
        if (themeType === 'classified') {
          cCtx.fillStyle = '#ffaa00';
        } else if (themeType === 'academic') {
          cCtx.fillStyle = '#34d399';
        } else {
          cCtx.fillStyle = '#00ff87'; // green-ish negative energy flow
        }
        cCtx.beginPath();
        cCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        cCtx.fill();
        cCtx.restore();
      }
    }

    const particles = Array.from({ length: 45 }, () => new Particle());

    // Main animation loop
    const render = () => {
      time += 0.04;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      // Clear with obsidian background
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, w, h);

      // Render Gravity Wave Particles (if mass is high, draw downward gravity ripples)
      particles.forEach(p => {
        p.update(levitationStatus, energy);
        p.draw(ctx, themeMode);
      });

      // 1. Draw Space-Time Grid Warping
      // Draw grid lines that bend around the center capsule based on GMI and Mass
      const gridSpacing = 24;
      const capsuleX = w / 2;
      
      // Calculate target Y coordinate of capsule
      let targetCapsuleY = h - 40; // crashed
      if (levitationStatus === 'STABLE') {
        // stable float
        targetCapsuleY = h / 2 + Math.sin(time * 1.5) * 6;
      } else if (levitationStatus === 'UNSTABLE') {
        // unstable float - shakes & jumps
        const shake = (Math.random() - 0.5) * 6;
        targetCapsuleY = h / 2 - 20 + Math.sin(time * 6) * 18 + shake;
      }
      
      // Interpolate capsule drawing position (smooth drift)
      const currentCapsuleY = targetCapsuleY;

      ctx.strokeStyle = themeMode === 'classified' 
        ? 'rgba(255, 170, 0, 0.05)' 
        : themeMode === 'academic'
        ? 'rgba(16, 185, 129, 0.04)'
        : 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 0; y < h; y += 4) {
          // Calculate grid node displacement from capsule
          const dx = x - capsuleX;
          const dy = y - currentCapsuleY;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          // Force factor of warping
          const warpForce = (gmi * 45) + (mass * 0.05);
          const warpRadius = 110;
          
          let offsetX = 0;
          if (dist < warpRadius && dist > 1) {
            const ratio = (warpRadius - dist) / warpRadius; // 1 at center, 0 at boundary
            offsetX = dx * ratio * (warpForce / 120);
          }

          if (y === 0) {
            ctx.moveTo(x - offsetX, y);
          } else {
            ctx.lineTo(x - offsetX, y);
          }
        }
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const dx = x - capsuleX;
          const dy = y - currentCapsuleY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const warpForce = (gmi * 45) + (mass * 0.05);
          const warpRadius = 110;

          let offsetY = 0;
          if (dist < warpRadius && dist > 1) {
            const ratio = (warpRadius - dist) / warpRadius;
            offsetY = dy * ratio * (warpForce / 120);
          }

          if (x === 0) {
            ctx.moveTo(x, y - offsetY);
          } else {
            ctx.lineTo(x, y - offsetY);
          }
        }
        ctx.stroke();
      }

      // 2. Draw Anti-Gravity Field Waves (Glowing rings around levitation core)
      if (levitationStatus !== 'CRASHED') {
        ctx.save();
        const glowOpacity = levitationStatus === 'STABLE' ? 0.2 + Math.abs(Math.sin(time * 2)) * 0.15 : 0.4 + Math.random() * 0.2;
        const glowColor = themeMode === 'classified' ? '255, 170, 0' : themeMode === 'academic' ? '16, 185, 129' : '0, 240, 255';
        
        ctx.shadowBlur = levitationStatus === 'STABLE' ? 20 : 35;
        ctx.shadowColor = `rgba(${glowColor}, 0.8)`;
        
        ctx.strokeStyle = `rgba(${glowColor}, ${glowOpacity})`;
        ctx.lineWidth = 2;

        // Draw multiple resonance field rings
        const ringCount = levitationStatus === 'STABLE' ? 3 : 4;
        for (let r = 0; r < ringCount; r++) {
          const radius = 25 + r * 15 + (Math.sin(time * 3 + r) * 4);
          ctx.beginPath();
          ctx.arc(capsuleX, currentCapsuleY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Draw Levitating Capsule / Vehicle (Sci-Fi saucer/pod design)
      ctx.save();
      
      // Shadow glow for the capsule itself
      if (levitationStatus === 'STABLE') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#10b981' : '#00f0ff';
      } else if (levitationStatus === 'UNSTABLE') {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffaa00'; // Amber alert
      } else {
        ctx.shadowBlur = 0;
      }

      const accentHex = themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#10b981' : '#00f0ff';
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 2;

      // Draw reactor capsule (futuristic diamond-wing silhouette)
      ctx.beginPath();
      ctx.moveTo(capsuleX - 25, currentCapsuleY + 5);
      ctx.lineTo(capsuleX - 35, currentCapsuleY - 5);
      ctx.lineTo(capsuleX - 10, currentCapsuleY - 12);
      ctx.lineTo(capsuleX + 10, currentCapsuleY - 12);
      ctx.lineTo(capsuleX + 35, currentCapsuleY - 5);
      ctx.lineTo(capsuleX + 25, currentCapsuleY + 5);
      ctx.lineTo(capsuleX + 15, currentCapsuleY + 12);
      ctx.lineTo(capsuleX - 15, currentCapsuleY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Core thruster / emitter node (glow dot)
      ctx.beginPath();
      ctx.arc(capsuleX, currentCapsuleY, 5, 0, Math.PI * 2);
      ctx.fillStyle = levitationStatus === 'STABLE' 
        ? (themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#34d399' : '#00f0ff')
        : levitationStatus === 'UNSTABLE'
        ? '#ffaa00'
        : '#ff0055';
      ctx.fill();
      ctx.restore();

      // Draw force vector indicators (arrows showing gravity vs lift)
      if (levitationStatus !== 'CRASHED') {
        ctx.lineWidth = 1.5;
        const arrowOffset = 20;

        // Lift Force vector (Up arrow in cyan/green)
        ctx.strokeStyle = themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#10b981' : '#00ff87';
        ctx.fillStyle = ctx.strokeStyle;
        const liftLen = Math.min(60, energy * 0.08 + gmi * 8);
        ctx.beginPath();
        ctx.moveTo(capsuleX, currentCapsuleY - arrowOffset);
        ctx.lineTo(capsuleX, currentCapsuleY - arrowOffset - liftLen);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(capsuleX, currentCapsuleY - arrowOffset - liftLen - 4);
        ctx.lineTo(capsuleX - 4, currentCapsuleY - arrowOffset - liftLen);
        ctx.lineTo(capsuleX + 4, currentCapsuleY - arrowOffset - liftLen);
        ctx.closePath();
        ctx.fill();

        // Gravity Force vector (Down arrow in red/blue)
        ctx.strokeStyle = '#ff0055';
        ctx.fillStyle = ctx.strokeStyle;
        const gravLen = Math.min(60, mass * 0.04 + (50 - distance) * 0.2);
        ctx.beginPath();
        ctx.moveTo(capsuleX, currentCapsuleY + arrowOffset);
        ctx.lineTo(capsuleX, currentCapsuleY + arrowOffset + gravLen);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(capsuleX, currentCapsuleY + arrowOffset + gravLen + 4);
        ctx.lineTo(capsuleX - 4, currentCapsuleY + arrowOffset + gravLen);
        ctx.lineTo(capsuleX + 4, currentCapsuleY + arrowOffset + gravLen);
        ctx.closePath();
        ctx.fill();

        // Label arrows
        ctx.font = '8px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`F_lift: ${(energy * 0.15).toFixed(1)} N`, capsuleX + 8, currentCapsuleY - arrowOffset - (liftLen/2));
        ctx.fillText(`F_grav: ${(mass * 9.8).toFixed(0)} N`, capsuleX + 8, currentCapsuleY + arrowOffset + (gravLen/2));
      }

      // 4. Critical Collapse Text Overlay (if crashed)
      if (levitationStatus === 'CRASHED') {
        ctx.fillStyle = 'rgba(255, 0, 85, 0.08)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.font = 'bold 12px Orbitron';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText("CRITICAL FIELD COLLAPSE", w / 2, h / 2 - 25);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#9b0b30';
        ctx.fillText("INSUFFICIENT LIFT FORCE OR TUNING FREQUENCY OUT OF RANGE", w / 2, h / 2 - 12);
        
        // Render spark explosions on base
        ctx.fillStyle = '#ff5500';
        for (let i = 0; i < 5; i++) {
          const sparkX = capsuleX + (Math.random() - 0.5) * 40;
          const sparkY = currentCapsuleY + 12 + Math.random() * 4;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mass, energy, frequency, distance, gmi, stability, levitationStatus, themeMode]);

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-y-auto h-full max-h-screen select-none">
      
      {/* Physics Sandbox Environment Visualizer */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        
        {/* Canvas Card */}
        <div className={`cyber-panel border ${colors.accentBorder} bg-gray-950/60 p-2 flex flex-col relative h-[380px]`}>
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-900 text-[10px] uppercase font-bold tracking-widest text-white">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${
                levitationStatus === 'STABLE' ? 'bg-cyber-green' : levitationStatus === 'UNSTABLE' ? 'bg-cyber-amber animate-ping' : 'bg-cyber-red'
              }`} />
              Resonance Physics Sandbox [2D TELEMETRY]
            </span>
            <span className={colors.accent}>CORE STATUS: {levitationStatus}</span>
          </div>

          <canvas ref={canvasRef} className="w-full flex-grow bg-[#020306] border border-gray-900/60 mt-2" />
        </div>

        {/* Real-time Equations and scientific formulas */}
        <div className="cyber-panel border border-gray-800 bg-gray-950/40 p-4">
          <div className="flex justify-between items-center border-b border-gray-900 pb-2 mb-3">
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-white uppercase">Physics Core Equations</span>
            <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="border border-gray-900/60 bg-cyber-obsidian p-3 rounded">
              <div className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Local Gravitational Force</div>
              <div className="text-white font-semibold">{`\\(F_g = m \\cdot g_0 = ${Math.round(mass * 9.81)} \\text{ N}\\)`}</div>
              <div className="text-[10px] text-gray-500 mt-1">Local Earth constant {`\\(g_0 = 9.81 \\text{ m/s}^2\\)`}</div>
            </div>

            <div className="border border-gray-900/60 bg-cyber-obsidian p-3 rounded">
              <div className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Antimatter Lift Generator</div>
              <div className={`font-semibold ${levitationStatus === 'STABLE' ? 'text-cyber-green' : 'text-white'}`}>
                {`\\(F_l = \\frac{E \\cdot \\Phi(Hz)}{d^2} = ${Math.round(energy * 0.15 * (1 - (Math.abs(frequency - targetFrequency) * 0.005)))} \\text{ N}\\)`}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Resonating efficiency coefficient.</div>
            </div>

            <div className="border border-gray-900/60 bg-cyber-obsidian p-3 rounded">
              <div className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Space-Time Warp Ratio</div>
              <div className="text-cyber-blue font-semibold">{`\\(\\alpha_{warp} = \\frac{GMI}{Stability} = ${(gmi / (stability + 0.1)).toFixed(4)}\\)`}</div>
              <div className="text-[10px] text-gray-500 mt-1">Gravitational stress tensor factor.</div>
            </div>
          </div>
        </div>

      </div>

      {/* Physics Control Panel (Sliders and variables) */}
      <div className={`cyber-panel border ${colors.accentBorder} bg-cyber-obsidian/75 p-5 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyber-blue" />
              Dynamic Parameter Matrix
            </h2>
            <button 
              onClick={() => { setMass(150); setEnergy(400); setFrequency(250); setDistance(15); playClick(); }}
              className="text-[9px] text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 border border-gray-800 px-1.5 py-0.5 rounded"
              title="Reset Parameters"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Mass Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">Object Mass (M)</span>
                <span className="text-white font-bold">{mass} kg</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={mass}
                onChange={(e) => setMass(parseInt(e.target.value))}
                className={`w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer ${colors.sliderThumb}`}
              />
              <div className="flex justify-between text-[9px] text-gray-600">
                <span>10 kg (Light drone)</span>
                <span>2,000 kg (Heavy capsule)</span>
              </div>
            </div>

            {/* Negative Energy Density Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">Negative Energy (E)</span>
                <span className="text-white font-bold">{energy} eV</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className={`w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer ${colors.sliderThumb}`}
              />
              <div className="flex justify-between text-[9px] text-gray-600">
                <span>0 eV (Normal Space)</span>
                <span>1,000 eV (Warp Drive Load)</span>
              </div>
            </div>

            {/* Electromagnetic Frequency Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">Electromagnetic Frequency</span>
                <span className={`font-bold ${Math.abs(frequency - targetFrequency) < 15 ? 'text-cyber-green' : 'text-white'}`}>
                  {frequency} Hz
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className={`w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer ${colors.sliderThumb}`}
              />
              <div className="flex justify-between text-[9px] text-gray-600">
                <span>10 Hz (Low ripple)</span>
                <span>1,000 Hz (Microwave resonance)</span>
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">Emitter Altitude / Distance</span>
                <span className="text-white font-bold">{distance} m</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className={`w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer ${colors.sliderThumb}`}
              />
              <div className="flex justify-between text-[9px] text-gray-600">
                <span>1 m (Surface lock)</span>
                <span>50 m (Deep altitude)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Auto tune and status banner */}
        <div className="mt-8 border-t border-gray-900 pt-4 space-y-3">
          <div className={`p-3 rounded border text-[11px] leading-relaxed font-sans ${
            levitationStatus === 'STABLE'
              ? 'bg-cyber-green/5 text-cyber-green border-cyber-green/30'
              : levitationStatus === 'UNSTABLE'
              ? 'bg-cyber-amber/5 text-cyber-amber border-cyber-amber/30'
              : 'bg-cyber-red/5 text-cyber-red border-cyber-red/30'
          }`}>
            {levitationStatus === 'STABLE' ? (
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span><strong>Quantum Stable Trapping achieved!</strong> The gravity manipulation index is balanced by frequency resonance at this distance. Core draw is steady.</span>
              </div>
            ) : levitationStatus === 'UNSTABLE' ? (
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span><strong>Field Coherence Divergence!</strong> Frequency is out of sync with mass/distance vectors. Adjust frequency to <strong>{targetFrequency} Hz</strong> to stabilize.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span><strong>Gravitational Core Collapse!</strong> Low negative energy or highly unbalanced oscillations resulted in reactor capsule impact. Auto-tuning frequency or increasing energy required.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAutoTune}
            disabled={levitationStatus === 'STABLE'}
            className={`w-full py-2.5 rounded font-orbitron font-bold text-xs tracking-widest transition-all duration-200 ${
              levitationStatus === 'STABLE'
                ? 'bg-gray-950 text-gray-700 border border-gray-900 cursor-not-allowed'
                : themeMode === 'classified'
                ? 'bg-cyber-amber text-black hover:bg-cyber-amber/90 shadow-[0_0_8px_rgba(255,170,0,0.3)]'
                : themeMode === 'academic'
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-cyber-blue text-black hover:bg-cyber-blue/90 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
            }`}
          >
            AUTO-TUNE RESONANT FREQUENCY ({targetFrequency} Hz)
          </button>
        </div>

      </div>

    </div>
  );
};

export default Sandbox;
