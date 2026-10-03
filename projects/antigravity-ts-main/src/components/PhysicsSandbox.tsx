import React, { useRef, useEffect, useState } from 'react';
import { 
  Atom, 
  HelpCircle, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Compass, 
  MoveUp, 
  MoveDown,
  Sparkles
} from 'lucide-react';
import { SimulationVariables, SimulationMode } from '../types';

interface PhysicsSandboxProps {
  simulationMode: SimulationMode;
  variables: SimulationVariables;
  setVariables: (vars: SimulationVariables) => void;
  powerOnline: boolean;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export default function PhysicsSandbox({
  simulationMode,
  variables,
  setVariables,
  powerOnline,
}: PhysicsSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Physics states rendered on canvas
  const [objectY, setObjectY] = useState(250); // 100 to 320 where 320 is bottom floor
  const [liftForce, setLiftForce] = useState(0);
  const [gravitationalForce, setGravitationalForce] = useState(0);
  const [balanceState, setBalanceState] = useState<'CRASHED' | 'LEVITATING' | 'STABLIZING' | 'OFFLINE'>('OFFLINE');

  // Spark and particle buffers
  const sparksRef = useRef<SparkParticle[]>([]);
  const fieldAngleRef = useRef(0);

  // Math variables
  const { mass, negativeEnergy, frequency, distance } = variables;

  // Compute calculated physics on slide
  useEffect(() => {
    if (!powerOnline) {
      setLiftForce(0);
      setGravitationalForce(0);
      setBalanceState('OFFLINE');
      return;
    }

    // Mathematical formula for balance
    // gravity pull
    const F_g = mass * 0.098; // simulated gravity scalar
    // lift vector
    const logFreq = Math.log10(frequency || 1000);
    const F_lift = (negativeEnergy * logFreq) / (Math.max(0.1, distance) * 2.5);

    setLiftForce(F_lift);
    setGravitationalForce(F_g);

    const diff = F_lift - F_g;
    if (F_lift < 0.1) {
      setBalanceState('CRASHED');
    } else if (Math.abs(diff) < F_g * 0.12) {
      setBalanceState('STABLIZING');
    } else if (diff > 0) {
      setBalanceState('LEVITATING');
    } else {
      setBalanceState('CRASHED');
    }
  }, [mass, negativeEnergy, frequency, distance, powerOnline]);

  // Main canvas animation logic loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let localY = objectY;
    let velocityY = 0;

    const render = () => {
      // Clear viewport
      ctx.fillStyle = '#080809';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(24, 24, 27, 0.55)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw active telemetry chambers
      const floorY = 320;
      const ceilingY = 70;
      const emitterX = canvas.width / 2;

      // Draw emitter plate at bottom
      const emitterGrad = ctx.createLinearGradient(emitterX - 100, floorY, emitterX + 100, floorY + 15);
      emitterGrad.addColorStop(0, '#0c0c0e');
      emitterGrad.addColorStop(0.5, powerOnline ? '#00ff88' : '#18181b');
      emitterGrad.addColorStop(1, '#0c0c0e');
      ctx.fillStyle = emitterGrad;
      ctx.fillRect(emitterX - 120, floorY, 240, 15);

      // Emitter details
      ctx.strokeStyle = powerOnline ? 'rgba(0, 255, 136, 0.4)' : '#18181b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(emitterX - 120, floorY, 240, 15);

      // Draw vacuum containment chamber border rails
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.strokeRect(emitterX - 130, ceilingY - 10, 260, floorY - ceilingY + 30);

      // Update vector field flow angle
      fieldAngleRef.current += 1.8 * (Math.log10(frequency || 1000) / 4);

      // Draw EM fields / Quantum flux if power is online
      if (powerOnline) {
        const streamCount = Math.round(Math.min(18, (negativeEnergy / 200) + 2));
        ctx.strokeStyle = `rgba(0, 212, 255, ${Math.min(0.4, negativeEnergy / 800)})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < streamCount; i++) {
          const relativeX = emitterX - 100 + (18 * i) + (Math.sin(fieldAngleRef.current * 0.05 + i) * 6);
          const speedFactor = 1.5 + (frequency / 2e6);
          const fluxOffset = (fieldAngleRef.current * speedFactor + i * 20) % (floorY - ceilingY);

          ctx.beginPath();
          ctx.arc(relativeX, floorY - fluxOffset, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#00d4ff';
          ctx.fill();
        }
      }

      // Physics logic for current frame
      if (powerOnline) {
        // gravity pushes down
        const simulatedG = mass * 0.00045;
        // lift pulls up
        const logFreq = Math.log10(frequency || 1000);
        const forceMultiplier = (negativeEnergy * logFreq) / 500000;
        const simulatedLift = Math.min(2.5, forceMultiplier * (6 / Math.sqrt(Math.max(0.01, distance))));

        // Update velocity
        velocityY += simulatedG; // gravity pull
        velocityY -= simulatedLift; // lift pull

        // Damping factors inside vacuum chamber
        velocityY *= 0.96; 

        // Update position
        localY += velocityY;

        // Boundary checks
        if (localY >= floorY - 25) { // crashes on floor
          localY = floorY - 25;
          if (velocityY > 0.6) {
            // Create impact sparkles!
            for (let k = 0; k < 12; k++) {
              sparksRef.current.push({
                x: emitterX + (Math.random() - 0.5) * 45,
                y: floorY - 5,
                vx: (Math.random() - 0.5) * 7,
                vy: -Math.random() * 5 - 2,
                color: '#00d4ff',
                alpha: 1.0,
                size: Math.random() * 3 + 1
              });
            }
          }
          velocityY = 0;
        } else if (localY <= ceilingY + 25) { // hits reactor ceiling shield
          localY = ceilingY + 25;
          velocityY = 0.5; // bounce down
        }
      } else {
        // power is offline, object falls directly due to lack of gravity manipulation
        velocityY += 0.85; // free fall
        velocityY *= 0.98;
        localY += velocityY;
        if (localY >= floorY - 25) {
          localY = floorY - 25;
          velocityY = 0;
        }
      }

      setObjectY(localY);

      // Draw levitating physics sphere core
      const objectColor = powerOnline 
        ? (balanceState === 'STABLIZING' ? '#00ff88' : balanceState === 'LEVITATING' ? '#00d4ff' : '#ff4444') 
        : '#71717a';

      const pulseFactor = 1 + (powerOnline ? Math.sin(fieldAngleRef.current * 0.1) * 0.05 : 0);
      const radius = 22 * pulseFactor;

      // Outer glow matrix
      if (powerOnline) {
        ctx.beginPath();
        const glowRad = ctx.createRadialGradient(emitterX, localY, 5, emitterX, localY, radius * 2.2);
        glowRad.addColorStop(0, objectColor);
        glowRad.addColorStop(0.5, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowRad;
        ctx.arc(emitterX, localY, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main core sphere
      ctx.beginPath();
      ctx.arc(emitterX, localY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0c0c0e';
      ctx.fill();

      // Core border outline
      ctx.strokeStyle = objectColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw internal core diagnostic orbital ring
      if (powerOnline) {
        ctx.beginPath();
        ctx.ellipse(emitterX, localY, radius * 0.8, radius * 0.25, fieldAngleRef.current * 0.03, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw spark rendering
      sparksRef.current = sparksRef.current.map(spark => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.12; // spark gravity
        spark.alpha -= 0.024;
        
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${spark.color === '#ef4444' || spark.color === '#f87171' || spark.color === '#ff4444' ? '255, 68, 68' : '0, 212, 255'}, ${spark.alpha})`;
        ctx.fill();

        return spark;
      }).filter(s => s.alpha > 0);

      // Diagnostic visual stats written directly on sandbox
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(113, 113, 122, 0.8)';
      ctx.fillText(`FIELD COHESION STABILITY: ${powerOnline ? (balanceState === 'STABLIZING' ? '98.9%' : '84.2%') : '0.00%'}`, 24, 30);
      ctx.fillText(`VECTOR ELEVATION: ${Math.round(floorY - localY - 25)}px`, 24, 45);
      
      const accelerationLabel = powerOnline ? (velocityY * -10).toFixed(2) : '0.00';
      ctx.fillText(`ACCEL V-DELTA: ${accelerationLabel} m/s²`, 24, 60);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [powerOnline, variables, balanceState, simulationMode]);
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-transparent text-slate-100 flex flex-col space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-[#18181b] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-widest text-[#00ff88] uppercase">
            THEORETICAL QUANTUM SANDBOX
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Module Type: <span className="text-[#00d4ff]">2D Inertial Displacement Chamber</span> | High Accuracy Spacial Mesh
          </p>
        </div>
      </div>

      {/* Primary Simulator Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Configuration Column */}
        <div className="lg:col-span-4 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#18181b] pb-4 mb-4">
              <Zap size={14} className="text-[#fbbf24]" />
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#71717a]">
                Variables Tweaker
              </span>
            </div>

            {/* Slider 1: Mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Mass (<span className="italic font-serif">M</span>)
                  <span className="text-[10px] text-zinc-600 font-normal">in kg</span>
                </span>
                <span className="text-[#00d4ff] font-bold">{mass.toLocaleString()} kg</span>
              </div>
              <input 
                type="range"
                min="5"
                max="100000"
                step="5"
                value={mass}
                onChange={(e) => setVariables({ ...variables, mass: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-[#00d4ff] focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                <span>5 kg</span>
                <span>50,000 kg</span>
                <span>100k kg</span>
              </div>
            </div>

            {/* Slider 2: Negative Energy */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Negative Energy (<span className="italic font-serif">E</span>)
                  <span className="text-[10px] text-zinc-600 font-normal">in MJ</span>
                </span>
                <span className="text-purple-400 font-bold">{negativeEnergy.toLocaleString()} MJ</span>
              </div>
              <input 
                type="range"
                min="0"
                max="10000"
                step="10"
                value={negativeEnergy}
                onChange={(e) => setVariables({ ...variables, negativeEnergy: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                <span>0 MJ (None)</span>
                <span>5,000 MJ</span>
                <span>10k MJ</span>
              </div>
            </div>

            {/* Slider 3: EM Frequency */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Coherence Frequency (<span className="text-[10px] text-zinc-600">Hz</span>)
                </span>
                <span className="text-amber-400 font-bold">{(frequency / 1000).toFixed(1)} kHz</span>
              </div>
              <input 
                type="range"
                min="1000"
                max="50000000"
                step="5000"
                value={frequency}
                onChange={(e) => setVariables({ ...variables, frequency: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                <span>1.0 kHz</span>
                <span>25,000 kHz</span>
                <span>50,000 kHz</span>
              </div>
            </div>

            {/* Slider 4: Distance from emitter */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Emitter Proximity (<span className="italic font-serif">d</span>)
                  <span className="text-[10px] text-zinc-600 font-normal">in m</span>
                </span>
                <span className="text-[#00ff88] font-bold">{distance.toFixed(2)} m</span>
              </div>
              <input 
                type="range"
                min="0.05"
                max="50"
                step="0.05"
                value={distance}
                onChange={(e) => setVariables({ ...variables, distance: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-[#00ff88] focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                <span>0.05 m</span>
                <span>25.0 m</span>
                <span>50.0 m</span>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-[#18181b] text-[10px] font-mono space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>SYSTEM STABILITY INDEX:</span>
              <span className={`font-bold ${balanceState === 'STABLIZING' ? 'text-[#00ff88]' : 'text-slate-500'}`}>
                {balanceState === 'STABLIZING' ? 'OPTIMAL' : 'PERTURBED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ACCELERATION TENSOR:</span>
              <span className="text-[#71717a]">{(gravitationalForce - liftForce).toFixed(3)} kN</span>
            </div>
          </div>
        </div>

        {/* Large Physics Interactive Canvas Canvas Column */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* Main Chamber Display */}
          <div className="relative rounded-sm border border-[#18181b] overflow-hidden bg-[#080809] shadow-2xl">
            
            {/* Real-time Status Overlay Badge */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-[#0c0c0e]/95 border border-[#18181b] px-3 py-1.5 rounded-sm backdrop-blur">
              <span className={`w-2 h-2 rounded-full 
                ${balanceState === 'STABLIZING' 
                  ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' 
                  : balanceState === 'LEVITATING' 
                  ? 'bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]' 
                  : balanceState === 'CRASHED' 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-zinc-600'}`} 
              />
              <span className="font-mono text-[10px] font-bold leading-none select-none tracking-widest text-slate-300">
                STATUS: {balanceState}
              </span>
            </div>

            {/* Quick Physics Summary Banner at Bottom Left */}
            <div className="absolute bottom-4 left-4 p-3 bg-[#0c0c0e]/95 border border-[#18181b] rounded-sm font-mono text-[10px] text-[#71717a] space-y-1 backdrop-blur max-w-xs">
              <div className="flex justify-between gap-6">
                <span>GRAVITY FORCE:</span>
                <span className="text-rose-500 font-bold">{gravitationalForce.toFixed(2)} kN</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>SIMULATED LIFT:</span>
                <span className="text-[#00d4ff] font-bold">{liftForce.toFixed(2)} kN</span>
              </div>
            </div>

            <canvas 
              ref={canvasRef} 
              width={700} 
              height={360} 
              className="w-full block"
            />
          </div>

          {/* User Guide panel */}
          <div className="rounded-sm border border-[#18181b] bg-[#0c0c0e]/40 p-5 grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-[11px] leading-relaxed">
            
            <div className="space-y-1">
              <span className="text-[#00d4ff] font-bold flex items-center gap-1.5 uppercase">
                <MoveUp size={12} /> LEVITATE COILS:
              </span>
              <p className="text-[10px] text-[#71717a]">
                Adjust Mass down or scale up Negative Energy. Required Lift Force must strictly exceed Gravity Force.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[#00ff88] font-bold flex items-center gap-1.5 uppercase">
                <Activity size={12} /> SECURE HOVERING:
              </span>
              <p className="text-[10px] text-[#71717a]">
                Achieve "STABILIZING" mode by matching variables closely. Coherence fields hold the weight locked in space.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-amber-500 font-bold flex items-center gap-1.5 uppercase">
                <Sparkles size={12} /> SYSTEM POWER:
              </span>
              <p className="text-[10px] text-[#71717a]">
                Cranking up the EM frequency allows for high-altitude stabilization but increases simulated system power load.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
