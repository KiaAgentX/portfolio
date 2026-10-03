import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  History, 
  FileText, 
  FolderClosed, 
  FolderOpen,
  Eye, 
  Lock,
  Compass
} from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    year: "1900",
    title: "Nikola Tesla's Ether Resonance",
    description: "Nikola Tesla proposed his 'Dynamic Theory of Gravity', describing gravity not as space-time curvature, but as electromagnetic resonance in the high-frequency ether field. He claimed to have completed theories on electromagnetic flight using electro-vibrations.",
    details: "Tesla conceptualized an electrostatic propulsion system where a ship, surrounded by high-potential electrical charge, could create vacuum repulsion currents in the surrounding medium. This concept bypasses Newtonian inertia by acting directly on the atomic structure."
  },
  {
    year: "1928",
    title: "The Biefeld-Brown Effect",
    description: "Thomas Townsend Brown discovered that asymmetric capacitors experience an electrogravitic force pushing towards the positive electrode when charged with high voltage (50kV+).",
    details: "Together with Dr. Paul Alfred Biefeld, Brown formulated the hypothesis that electric charge could affect gravitational mass. Modern physics explains this partially through ion wind thrust, but the electrogravitic component remains a subject of classified aerospace testing."
  },
  {
    year: "1952",
    title: "Project Winterhaven",
    description: "A military feasibility study submitted by Townsend Brown outlining a design for an electrogravitic combat saucer reaching supersonic speeds using high-voltage hulls.",
    details: "The project proposed saucer-shaped interceptors that ionization-charged the atmosphere around the leading edge, removing aerodynamic resistance and creating a vacuum well directly in front of the vehicle. Documents remain partially redacted."
  },
  {
    year: "1992",
    title: "Podkletnov's Gravity Shield",
    description: "Russian scientist Eugene Podkletnov reported that rotating superconducting discs exposed to high frequency magnetic fields reduced the weight of objects above them by up to 2%.",
    details: "The 'gravity shielding' experiment used a 15cm yttrium barium copper oxide (YBCO) disc levitating in a helium bath. NASA and Boeing launched internal research programs (Project GRASP) to replicate the anomalous gravity shielding, yielding inconclusive public results."
  },
  {
    year: "1994",
    title: "Alcubierre Warp Metric",
    description: "Physicist Miguel Alcubierre solved Einstein's field equations to prove that a warp bubble could compress space in front of a spacecraft and expand it behind, allowing superluminal travel.",
    details: "The Alcubierre Metric respects relativity by warping the spacetime manifold rather than moving the craft through space. The configuration requires large quantities of exotic 'negative energy' density, mathematically linking negative mass to antigravity."
  },
  {
    year: "2011",
    title: "Quantum Superconductor Locking",
    description: "Demonstration of three-dimensional magnetic flux pinning, where a superconductor is locked in space above a permanent magnet array.",
    details: "At cryogenic temperatures, magnetic field lines are pinned into microscopic defects within the superconductor, freezing it in place. This provides the most concrete physical analog to inertial gravity locking currently observable."
  }
];

const CLASSIFIED_DOCS = [
  {
    id: "DOC-281-B",
    title: "Winterhaven Electro-Kinetic Schematics",
    date: "12 OCT 1956",
    classification: "SECRET / EYES ONLY",
    summary: "Theoretical blueprint for an asymmetric saucer-hull layout. Core capacitor plates operate at high-tension potentials to achieve aerodynamic vacuum warping.",
    blueprintType: "biefeld",
    content: "WARNING: UNAUTHORIZED HOVER REVEALS SECRETS. Hulls configured with <span class='redacted'>asymmetrical barium titanate insulation</span> to maintain electrostatic potential. Initial trials showed a <span class='redacted'>1.4G lift coefficient</span> at sea level. Ionizing discharge on leading edge reduces air friction by <span class='redacted'>92%</span>, resulting in vacuum vector drag coefficients approaching <span class='redacted'>zero</span>. Superconducting coupling coils are synchronized with the <span class='redacted'>420 Hz resonance oscillator</span>."
  },
  {
    id: "DOC-994-A",
    title: "Alcubierre Negative Mass Tensor Analysis",
    date: "24 JUN 1999",
    classification: "TOP SECRET / COSMIC",
    summary: "Relativity metric verification of positive/negative stress tensors. Calculating Casimir cavity threshold limits for warp bubble generation.",
    blueprintType: "alcubierre",
    content: "Tensors verify that <span class='redacted'>negative energy density</span> is localized in a toroidal boundary ring. Toroid radius required: <span class='redacted'>15 meters</span>. Total negative mass required: equivalent to <span class='redacted'>-700 kg (Jupiter scale attenuation avoided)</span>. High frequency EM oscillator coils must drive current at <span class='redacted'>82.4 GHz</span> to prevent vacuum collapse. Shield stability must hold at <span class='redacted'>98.4%</span> to prevent thermal micro-singularity creation."
  }
];

const Archives = () => {
  const { themeMode, playClick } = useSimulation();
  
  const [selectedEvent, setSelectedEvent] = useState(TIMELINE_EVENTS[0]);
  const [activeDoc, setActiveDoc] = useState(CLASSIFIED_DOCS[0]);
  const [declassifiedTexts, setDeclassifiedTexts] = useState({});

  const getThemeStyles = () => {
    switch (themeMode) {
      case 'academic':
        return {
          border: 'border-slate-800',
          bgActive: 'bg-emerald-950/20 text-emerald-400 border-emerald-800',
          bgHover: 'hover:bg-slate-850 hover:text-emerald-300',
          textActive: 'text-emerald-400',
          badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-850',
          line: 'bg-slate-800',
          timelineDot: 'border-emerald-500 bg-slate-900'
        };
      case 'classified':
        return {
          border: 'border-cyber-amber/20',
          bgActive: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/60',
          bgHover: 'hover:bg-cyber-amber/5 hover:text-cyber-amber/80',
          textActive: 'text-cyber-amber',
          badge: 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30',
          line: 'bg-cyber-amber/10',
          timelineDot: 'border-cyber-amber bg-cyber-obsidian'
        };
      case 'sci-fi':
      default:
        return {
          border: 'border-cyber-blue/15',
          bgActive: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/50',
          bgHover: 'hover:bg-cyber-blue/5 hover:text-cyber-blue/80',
          textActive: 'text-cyber-blue',
          badge: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/25',
          line: 'bg-cyber-blue/10',
          timelineDot: 'border-cyber-blue bg-cyber-obsidian'
        };
    }
  };

  const theme = getThemeStyles();

  const handleRevealAll = (docId) => {
    setDeclassifiedTexts(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
    playClick();
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto h-full max-h-screen select-none">
      
      {/* Column 1: Documentary Timeline */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-dark/40 p-5 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-5">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyber-blue" />
              Documentary Chronology Timeline
            </h2>
            <span className="text-[9px] text-gray-500 font-mono">1900 - PRESENT</span>
          </div>

          <div className="relative pl-6 border-l-2 border-dashed border-gray-800 space-y-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
            {TIMELINE_EVENTS.map((event, idx) => {
              const isSelected = selectedEvent.year === event.year;
              return (
                <div 
                  key={idx} 
                  onClick={() => { setSelectedEvent(event); playClick(); }}
                  className="relative cursor-pointer group"
                >
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                    isSelected ? theme.timelineDot : 'border-gray-700 bg-gray-950 group-hover:border-white'
                  }`} />
                  
                  <div className={`p-2 rounded border transition-all duration-150 ${
                    isSelected ? theme.bgActive : `bg-gray-950/60 border-transparent ${theme.bgHover}`
                  }`}>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="font-orbitron tracking-widest">{event.year}</span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Details Display */}
        <div className="mt-6 border-t border-gray-900 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className={`font-orbitron font-extrabold text-sm ${theme.textActive}`}>{selectedEvent.year} EVENT RECORD</span>
            <span className="text-[10px] text-gray-500 font-mono">CATALOGED #REF-{selectedEvent.year}</span>
          </div>
          <h3 className="font-orbitron font-bold text-xs text-white uppercase">{selectedEvent.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">{selectedEvent.description}</p>
          <div className="p-3 bg-gray-950/80 rounded border border-gray-900 text-[11px] text-gray-500 leading-relaxed font-mono">
            <strong>TECHNICAL DATA:</strong> {selectedEvent.details}
          </div>
        </div>
      </div>

      {/* Column 2: Classified Archives & Blueprints */}
      <div className={`cyber-panel border ${theme.border} bg-cyber-obsidian/70 p-5 flex flex-col justify-between`}>
        
        {/* Document Folders Picker */}
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4">
            <h2 className="font-orbitron text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyber-blue" />
              Classified Document Vault
            </h2>
            <span className="text-[9px] text-cyber-red animate-pulse font-bold">● CLASSIFIED</span>
          </div>

          <div className="flex gap-4">
            {CLASSIFIED_DOCS.map((doc, idx) => {
              const isSelected = activeDoc.id === doc.id;
              return (
                <button
                  key={idx}
                  onClick={() => { setActiveDoc(doc); playClick(); }}
                  className={`flex-1 p-3 rounded border text-left transition-all ${
                    isSelected ? theme.bgActive : 'bg-gray-950/40 border-gray-900 hover:border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {isSelected ? <FolderOpen className="w-5 h-5" /> : <FolderClosed className="w-5 h-5 text-gray-500" />}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-900/50 bg-red-950/20 text-red-500">
                      {doc.classification}
                    </span>
                  </div>
                  <div className="font-orbitron text-[10px] font-bold text-white truncate">{doc.title}</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-1">{doc.id} | {doc.date}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Classified Doc Reader */}
        <div className="mt-4 border-t border-gray-900 pt-4 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-900 pb-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase">FILE: {activeDoc.title}</span>
              <button
                onClick={() => handleRevealAll(activeDoc.id)}
                className={`text-[9px] px-2 py-0.5 border rounded flex items-center gap-1 font-mono hover:text-white transition-colors ${theme.badge}`}
              >
                {declassifiedTexts[activeDoc.id] ? <Lock className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                {declassifiedTexts[activeDoc.id] ? "RE-REDACT TEXT" : "DECLASSIFY TEXT"}
              </button>
            </div>

            {/* Redacted Content Box */}
            <div className="p-3 bg-[#020204] border border-gray-900/80 rounded font-mono text-xs leading-relaxed text-gray-400 select-text max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: declassifiedTexts[activeDoc.id] 
                    ? activeDoc.content.replace(/class='redacted'/g, "class='redacted redacted-revealed'") 
                    : activeDoc.content 
                }} 
              />
            </div>
            <p className="text-[10px] text-gray-500 italic text-center">💡 Hover individual black boxes above to reveal classified metrics, or declassify the entire log.</p>
          </div>

          {/* Technical Blueprint Drawings in SVG */}
          <div className="mt-4 p-2 bg-[#020306] border border-gray-900/60 rounded flex flex-col items-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5 self-start font-bold">
              CAD SCHEMATIC DETECTOR
            </span>

            {activeDoc.blueprintType === 'biefeld' ? (
              /* Townsend Brown Asymmetric Capacitor Blueprint */
              <svg className="w-full h-28" viewBox="0 0 400 110">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Electrodes */}
                <ellipse cx="200" cy="50" rx="90" ry="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Thick dome saucer top */}
                <path d="M 110 50 Q 200 -10 290 50 Z" fill="none" stroke={themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#10b981' : '#00f0ff'} strokeWidth="1.5" />
                
                {/* Lower Electrode Pin */}
                <line x1="200" y1="50" x2="200" y2="85" stroke="#ff0055" strokeWidth="1.5" strokeDasharray="2" />
                <circle cx="200" cy="85" r="3" fill="#ff0055" />

                {/* Force Vectors */}
                <path d="M 200 10 L 200 -2" stroke="#00ff87" strokeWidth="1.5" marker-end="url(#arrow)" />
                <line x1="200" y1="-2" x2="195" y2="3" stroke="#00ff87" strokeWidth="1.5" />
                <line x1="200" y1="-2" x2="205" y2="3" stroke="#00ff87" strokeWidth="1.5" />

                {/* Texts & Labels */}
                <text x="208" y="10" fill="#00ff87" fontSize="8" fontFamily="monospace">F_electrogravitic</text>
                <text x="208" y="88" fill="#ff0055" fontSize="8" fontFamily="monospace">- Cathode Pin (50kV)</text>
                <text x="75" y="45" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">Anode Saucer Shell</text>
                <text x="10" y="15" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">PROJECT WINTERHAVEN FIG.4</text>
              </svg>
            ) : (
              /* Alcubierre Warp Field Metric Blueprint */
              <svg className="w-full h-28" viewBox="0 0 400 110">
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Central Capsule */}
                <circle cx="200" cy="50" r="8" fill="#111827" stroke="#00f0ff" strokeWidth="1.5" />
                
                {/* Warp Ring */}
                <ellipse cx="200" cy="50" rx="30" ry="12" fill="none" stroke={themeMode === 'classified' ? '#ffaa00' : themeMode === 'academic' ? '#10b981' : '#00f0ff'} strokeWidth="1.5" strokeDasharray="3 1" />
                
                {/* Spacetime deformation waves (contraction in front, expansion behind) */}
                {/* Contraction (front - right) */}
                <path d="M 235 50 Q 255 10 275 50 T 315 50" fill="none" stroke="#00ff87" strokeWidth="1.5" />
                
                {/* Expansion (behind - left) */}
                <path d="M 165 50 Q 145 90 125 50 T 85 50" fill="none" stroke="#ff0055" strokeWidth="1.5" />

                {/* Travel direction arrow */}
                <path d="M 330 50 L 370 50" fill="none" stroke="#fff" strokeWidth="1" />
                <line x1="370" y1="50" x2="365" y2="46" stroke="#fff" strokeWidth="1" />
                <line x1="370" y1="50" x2="365" y2="54" stroke="#fff" strokeWidth="1" />

                {/* Texts & Labels */}
                <text x="330" y="42" fill="#fff" fontSize="8" fontFamily="monospace">VELOCITY &gt; C</text>
                <text x="70" y="32" fill="#ff0055" fontSize="8" fontFamily="monospace">Space Expansion</text>
                <text x="245" y="32" fill="#00ff87" fontSize="8" fontFamily="monospace">Space Contraction</text>
                <text x="180" y="78" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">Negative Mass Toroid Ring</text>
              </svg>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Archives;
