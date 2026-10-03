import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const SimulationContext = createContext();

const DOCUMENTARY_PRESETS = {
  electrogravitics: {
    name: "Electrogravitics (Biefeld-Brown)",
    mass: 180,
    energy: 380,
    frequency: 150,
    distance: 12,
    description: "Thomas Townsend Brown's asymmetric capacitor propulsion. Requires high electromagnetic voltage."
  },
  quantum_levitation: {
    name: "Quantum Superconducting Levitation",
    mass: 50,
    energy: 650,
    frequency: 820,
    distance: 3,
    description: "Flux pinning in YBCO superconductors. Extreme magnetic trapping, stable at close distances."
  },
  alcubierre: {
    name: "Alcubierre Warp Metric",
    mass: 1500,
    energy: 980,
    frequency: 45,
    distance: 40,
    description: "General Relativity warping. Requires extreme negative mass energy density to compress space-time."
  },
  tesla_ether: {
    name: "Tesla Resonance Oscillator",
    mass: 120,
    energy: 290,
    frequency: 480,
    distance: 22,
    description: "Nikola Tesla's electro-dynamic ether resonance. High frequency harmonics counteract local gravity fields."
  }
};

const RANDOM_LOGS = [
  "Quantum grid alignment within 0.04% tolerance.",
  "Warning: Tectonic resonance detected. Counter-phase waves engaged.",
  "Ether density fluctuate: Δρ = -0.15 kg/m³.",
  "Biefeld-Brown capacitor coil temperature stabilized at 72°C.",
  "Gravitational wave anomaly registered: amplitude = +1.18 Hz.",
  "Negative energy feed rate constant at 84.6 TeV.",
  "Sub-atomic Casimir cavity vacuum pressure at nominal depth.",
  "Propulsion cell telemetry: normal feedback loop.",
  "Alcubierre tensor geometry: stability holding.",
  "Warning: High frequency harmonic divergence detected."
];

export const SimulationProvider = ({ children }) => {
  // Global View States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [themeMode, setThemeMode] = useState('sci-fi'); // 'academic' | 'sci-fi' | 'classified'
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Simulation Sliders / Parameters
  const [mass, setMass] = useState(150);      // kg
  const [energy, setEnergy] = useState(400);    // eV or relative Negative Energy
  const [frequency, setFrequency] = useState(250); // Hz
  const [distance, setDistance] = useState(15);    // meters

  // System States
  const [preset, setPreset] = useState('electrogravitics');
  const [notifications, setNotifications] = useState([
    { id: 1, time: "15:45:00", text: "Antigravity Simulation Core initialized." },
    { id: 2, time: "15:45:02", text: "Quantum Propulsion Network connected." }
  ]);
  const [history, setHistory] = useState([]);

  // Synthesize Web Audio (Futuristic Sound effects)
  const synthAudio = (freq, type = 'sine', duration = 0.1, volume = 0.03) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      // Resume if suspended (browser security policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not allowed yet or unsupported.", e);
    }
  };

  const playClick = () => synthAudio(880, 'sine', 0.04, 0.02);
  const playTabChange = () => {
    synthAudio(600, 'sine', 0.05, 0.02);
    setTimeout(() => synthAudio(900, 'sine', 0.06, 0.02), 40);
  };
  const playPresetLoaded = () => {
    synthAudio(500, 'triangle', 0.1, 0.03);
    setTimeout(() => synthAudio(700, 'sine', 0.08, 0.03), 80);
    setTimeout(() => synthAudio(1100, 'sine', 0.12, 0.02), 160);
  };
  const playWarning = () => {
    synthAudio(180, 'sawtooth', 0.25, 0.04);
    setTimeout(() => synthAudio(150, 'sawtooth', 0.25, 0.04), 100);
  };
  const playSuccess = () => {
    synthAudio(440, 'triangle', 0.15, 0.03);
    setTimeout(() => synthAudio(660, 'triangle', 0.15, 0.03), 100);
    setTimeout(() => synthAudio(880, 'sine', 0.3, 0.02), 200);
  };

  // Trigger telemetry sound and click when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    playTabChange();
  };

  // Load preset helper
  const loadPreset = (presetKey) => {
    const data = DOCUMENTARY_PRESETS[presetKey];
    if (data) {
      setPreset(presetKey);
      setMass(data.mass);
      setEnergy(data.energy);
      setFrequency(data.frequency);
      setDistance(data.distance);
      playPresetLoaded();
      addNotification(`Preset loaded: ${data.name}`);
    }
  };

  // Helper to add system log notifications
  const addNotification = (text) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setNotifications(prev => [
      { id: Date.now(), time: timeStr, text },
      ...prev.slice(0, 19) // Keep last 20 logs
    ]);
  };

  // Physics Calculations
  // Gravity Manipulation Index (GMI) -> ranges 0 to 5.0
  const computedGMI = parseFloat(
    Math.min(
      5.0,
      ((energy * 12) / (mass + 20) * (20 / (distance + 5))).toFixed(2)
    )
  );

  // Field Stability (%)
  // Resonance criteria: Frequency should be roughly (mass * 4) + (distance * 15)
  // Let's create a sweet spot where users must tune.
  const targetFrequency = Math.round((mass * 3.5) + (distance * 14));
  const frequencyDeviation = Math.abs(frequency - targetFrequency);
  
  // Base stability starts at 100 and drops as deviation, mass weight, and insufficient energy affect it.
  const rawStability = Math.round(
    100 - 
    (frequencyDeviation * 0.22) - 
    (Math.max(0, mass - 400) * 0.05) - 
    (Math.max(0, 50 - distance) * 0.1) +
    (energy > 100 ? 5 : -15)
  );
  const computedStability = Math.max(5, Math.min(100, rawStability));

  // Negative Mass Density (g/cm³)
  const computedNegMassDensity = parseFloat(
    ((energy * 0.015) - (mass * 0.0005) - (distance * 0.02)).toFixed(4)
  );

  // Power Consumption (GW)
  const computedPower = parseFloat(
    ((energy * 1.8) + (frequency * 0.95) + (mass * 0.15) - (distance * 2)).toFixed(1)
  );

  // Levitating Status: Object floats if GMI > 1.2 and Stability > 65% and negative energy is high enough
  const levitationStatus = 
    computedGMI >= 1.3 && computedStability >= 70
      ? 'STABLE'
      : computedGMI >= 0.8 && computedStability >= 45
      ? 'UNSTABLE'
      : 'CRASHED';

  // Seed initial chart data
  useEffect(() => {
    const initialHistory = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeOffset = now - i * 3000;
      const timeStr = new Date(timeOffset).toTimeString().split(' ')[0];
      
      // Seed values with minor noise
      const noise = (Math.random() - 0.5) * 1.5;
      const noiseStability = (Math.random() - 0.5) * 4;
      
      initialHistory.push({
        time: timeStr,
        gmi: Math.max(0.1, computedGMI + noise),
        stability: Math.max(10, Math.min(100, computedStability + noiseStability)),
        power: Math.max(10, computedPower + noise * 5),
        anomaly: Math.max(0, (100 - computedStability) + Math.random() * 8)
      });
    }
    setHistory(initialHistory);
  }, []);

  // Telemetry loop for real-time charts & warnings
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toTimeString().split(' ')[0];
      
      // Randomly inject warnings if critical values
      if (levitationStatus === 'CRASHED' && Math.random() > 0.8) {
        addNotification("ALERT: Levitation failed. Critical field collapse.");
        playWarning();
      } else if (levitationStatus === 'UNSTABLE' && Math.random() > 0.8) {
        addNotification("CAUTION: Anomaly resonance spike in gravity core.");
        synthAudio(280, 'triangle', 0.2, 0.03);
      }

      // 10% chance of inserting a random background telemetry message
      if (Math.random() > 0.88) {
        const msg = RANDOM_LOGS[Math.floor(Math.random() * RANDOM_LOGS.length)];
        addNotification(msg);
      }

      // Add to historical database
      setHistory(prev => {
        const noise = (Math.random() - 0.5) * 0.15;
        const noiseStability = (Math.random() - 0.5) * 1.5;
        const next = [
          ...prev.slice(1),
          {
            time: timeStr,
            gmi: Math.max(0.01, parseFloat((computedGMI + noise).toFixed(2))),
            stability: Math.max(5, Math.min(100, Math.round(computedStability + noiseStability))),
            power: Math.max(5, parseFloat((computedPower + noise * 10).toFixed(1))),
            anomaly: Math.max(0, Math.round((100 - computedStability) + Math.random() * 5))
          }
        ];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [computedGMI, computedStability, computedPower, levitationStatus]);

  return (
    <SimulationContext.Provider
      value={{
        activeTab,
        handleTabChange,
        themeMode,
        setThemeMode,
        isMuted,
        setIsMuted,
        mass,
        setMass,
        energy,
        setEnergy,
        frequency,
        setFrequency,
        distance,
        setDistance,
        preset,
        loadPreset,
        presets: DOCUMENTARY_PRESETS,
        notifications,
        addNotification,
        history,
        gmi: computedGMI,
        stability: computedStability,
        negMassDensity: computedNegMassDensity,
        power: computedPower,
        levitationStatus,
        targetFrequency,
        synthAudio,
        playClick,
        playWarning,
        playSuccess
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
