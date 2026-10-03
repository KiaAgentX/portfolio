import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ShieldAlert, 
  Clock, 
  FileCheck2, 
  UserCheck, 
  Database,
  Globe,
  Binary,
  HelpCircle
} from 'lucide-react';
import { SimulationMode, TimelineItem, ClassifiedDoc } from '../types';
import { HISTORICAL_TIMELINE, CLASSIFIED_DOCUMENTS } from '../constants';

interface ClassifiedArchivesProps {
  simulationMode: SimulationMode;
}

export default function ClassifiedArchives({ simulationMode }: ClassifiedArchivesProps) {
  const [activeTimeline, setActiveTimeline] = useState<string>('t3'); // Project Winterhaven preselected
  const [activeDocId, setActiveDocId] = useState<string>('doc-bb-01');
  const [declassifyHover, setDeclassifyHover] = useState<string | null>(null);

  const selectedDoc = CLASSIFIED_DOCUMENTS.find(d => d.id === activeDocId) || CLASSIFIED_DOCUMENTS[0];
  const selectedTimelineItem = HISTORICAL_TIMELINE.find(t => t.id === activeTimeline) || HISTORICAL_TIMELINE[2];

  // Helper function to render customized vector blueprints based on document type
  const renderBlueprint = (type: 'biefeld' | 'tesla' | 'alcubierre') => {
    switch (type) {
      case 'biefeld':
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full bg-[#080809] border border-[#18181b] rounded-sm">
            {/* Grid references */}
            <defs>
              <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(24, 24, 27, 0.45)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
            
            {/* Outline */}
            <text x="15" y="25" fill="#00d4ff" fontSize="10" fontFamily="monospace" fontWeight="bold">DWG: CODENAME WINTERHAVEN v1.4</text>
            <text x="15" y="40" fill="#71717a" fontSize="8" fontFamily="monospace">REF: ASYMMETRIC DIELECTRIC CAPACITOR</text>

            {/* Ground / Emitter */}
            <line x1="80" y1="180" x2="320" y2="180" stroke="#00ff88" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="80" y1="100" x2="320" y2="100" stroke="#00d4ff" strokeWidth="1" />

            {/* Asymmetric Plate Spacer */}
            <rect x="140" y="100" width="120" height="80" fill="rgba(0, 212, 255, 0.03)" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="200" cy="140" r="15" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Voltage Spark Vector lines */}
            <path d="M 140 100 Q 110 140 140 180" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M 260 100 Q 290 140 260 180" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* High Voltage Source */}
            <path d="M 50 140 L 140 140" fill="none" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="50" cy="140" r="3" fill="#fbbf24" />
            <text x="45" y="132" fill="#fbbf24" fontSize="8" fontFamily="monospace">150 kV DC (+)</text>

            {/* Thrust Output arrow */}
            <path d="M 200 65 L 200 35 M 195 45 L 200 35 L 205 45" fill="none" stroke="#00ff88" strokeWidth="2" />
            <text x="215" y="50" fill="#00ff88" fontSize="9" fontFamily="monospace" fontWeight="bold">FORCE (NET LIFT VECTOR)</text>

            <circle cx="200" cy="140" r="3" fill="#00ff88" stroke="#080809" strokeWidth="1" />
            <text x="210" y="143" fill="#ff4444" fontSize="8" fontFamily="monospace">DIELECTRIC (K=12,200)</text>
          </svg>
        );
      case 'tesla':
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full bg-[#080809] border border-[#18181b] rounded-sm">
            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
            <text x="15" y="25" fill="#00d4ff" fontSize="10" fontFamily="monospace" fontWeight="bold">DWG: TESLA RESONATOR CORE v8.8</text>
            <text x="15" y="40" fill="#71717a" fontSize="8" fontFamily="monospace">REF: ELECTROMAGNETIC TOROIDAL RES</text>

            {/* Torus liquid mercury rings */}
            <ellipse cx="200" cy="135" rx="90" ry="35" fill="none" stroke="#ff4444" strokeWidth="2.5" />
            <ellipse cx="200" cy="135" rx="80" ry="30" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeDasharray="6 3" />
            <ellipse cx="200" cy="135" rx="100" ry="40" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 3" />

            {/* Primary magnetic coil turns */}
            <rect x="180" y="115" width="40" height="40" fill="rgba(245, 158, 11, 0.05)" stroke="#fbbf24" strokeWidth="1" />
            <line x1="200" y1="115" x2="200" y2="70" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="200" cy="70" r="4" fill="#fbbf24" />

            {/* Scalar Waves radiation */}
            <path d="M 200 70 Q 150 40 100 70" fill="none" stroke="#00ff88" strokeWidth="1" strokeDasharray="5 5" />
            <path d="M 200 70 Q 250 40 300 70" fill="none" stroke="#00ff88" strokeWidth="1" strokeDasharray="5 5" />
            <path d="M 200 70 Q 200 20 200 5" fill="none" stroke="#00ff88" strokeWidth="1.2" strokeDasharray="4 2" />

            {/* Labels */}
            <text x="210" y="125" fill="#fbbf24" fontSize="8" fontFamily="monospace">COIL EXCITER</text>
            <text x="260" y="165" fill="#ff4444" fontSize="8" fontFamily="monospace">LIQUID MERCURY LOOP</text>
            <text x="25" y="215" fill="#71717a" fontSize="8" fontFamily="monospace">RESONANCE FREQ: 11.8 Hz</text>
          </svg>
        );
      case 'alcubierre':
        return (
          <svg viewBox="0 0 400 240" className="w-full h-full bg-[#080809] border border-[#18181b] rounded-sm">
            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
            <text x="15" y="25" fill="#00d4ff" fontSize="10" fontFamily="monospace" fontWeight="bold">DWG: SPACETIME TENSOR SCHEMATIC v0.9</text>
            <text x="15" y="40" fill="#71717a" fontSize="8" fontFamily="monospace">REF: ALCUBIERRE WARP FIELD GEOMETRY</text>

            {/* Gravitational space warp curves */}
            {/* Left contraction curve */}
            <path d="M 50 120 C 100 120 120 40 160 40 C 200 40 200 120 200 120" fill="none" stroke="#ff4444" strokeWidth="2" />
            <text x="75" y="70" fill="#ff4444" fontSize="8" fontFamily="monospace">ST SPACE CONTRACTION</text>

            {/* Right expansion curve */}
            <path d="M 200 120 C 200 120 200 200 240 200 C 280 200 300 120 350 120" fill="none" stroke="#00ff88" strokeWidth="2" />
            <text x="250" y="175" fill="#00ff88" fontSize="8" fontFamily="monospace">ST SPACE EXPANSION</text>

            {/* Spacecraft capsule bubble */}
            <circle cx="200" cy="120" r="18" fill="#0c0c0e" stroke="#00d4ff" strokeWidth="1.5" />
            <rect x="194" y="112" width="12" height="15" fill="none" stroke="#00d4ff" strokeWidth="1" />
            <text x="180" y="100" fill="#00d4ff" fontSize="8" fontFamily="monospace">CAPSULE</text>

            {/* Outer ring boundary */}
            <ellipse cx="200" cy="120" rx="30" ry="28" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 3" />

            {/* Tensor directions */}
            <line x1="165" y1="120" x2="135" y2="120" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon points="135,120 142,116 142,124" fill="#fbbf24" />
            <text x="110" y="132" fill="#fbbf24" fontSize="8" fontFamily="monospace">FORWARD SHIFT</text>
          </svg>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent text-slate-100 flex flex-col space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-[#18181b] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-widest text-[#00ff88] uppercase">
            CLASSIFIED DOCUMENTARIES & ARCHIVES
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Clearance Authority: <span className="text-[#ff4444]">TOP SECRET US-RESTRICTED</span> | Chronology Hub
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Chronological Documentary Timeline (5 cols / 12) */}
        <div className="lg:col-span-5 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#18181b] pb-4 mb-4">
              <Clock size={14} className="text-[#00d4ff]" />
              <h2 className="text-xs font-sans tracking-widest font-bold uppercase text-slate-300">
                CHRONOLOGICAL INVESTIGATIVE TIMELINE
              </h2>
            </div>
            
            <p className="text-xs text-[#71717a] font-mono leading-relaxed mb-6">
              Investigate the milestones of high-vacuum gravitational repulsion research spanning multiple scientific, military, and corporate anomalies.
            </p>

            {/* Vertical timeline stepper */}
            <div className="relative border-l-2 border-[#18181b] pl-5 space-y-7">
              {HISTORICAL_TIMELINE.map((item) => {
                const isActive = activeTimeline === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTimeline(item.id)}
                    className="group block w-full text-left relative focus:outline-none cursor-pointer"
                  >
                    {/* Stepper Bullet Node */}
                    <div className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border transition-all duration-300
                      ${isActive 
                        ? 'bg-[#00d4ff] border-[#00d4ff] ring-4 ring-[#111113]' 
                        : 'bg-[#0c0c0e] border-[#18181b] group-hover:border-zinc-500'}`} 
                    />

                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-sm font-bold tracking-wider
                        ${isActive ? 'text-[#00d4ff]' : 'text-[#71717a] group-hover:text-slate-300'}
                      `}>
                        {item.year}
                      </span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-sm font-bold
                        ${item.category === 'military' 
                          ? 'bg-red-950/20 text-[#ff4444] border border-red-500/10' 
                          : item.category === 'classified' 
                          ? 'bg-amber-950/20 text-amber-500 border border-amber-500/10' 
                          : item.category === 'modern'
                          ? 'bg-[#111113] text-[#00ff88] border border-[#00ff88]/20'
                          : 'bg-[#111113] text-[#71717a] border border-[#18181b]'}
                      `}>
                        {item.category}
                      </span>
                    </div>

                    <h3 className={`font-sans text-xs font-semibold mt-1.5 tracking-wider uppercase transition-colors
                      ${isActive ? 'text-slate-100' : 'text-[#71717a] group-hover:text-slate-200'}
                    `}>
                      {item.title}
                    </h3>

                    {isActive && (
                      <div className="mt-3.5 bg-[#080809]/90 p-4 rounded-sm border border-[#18181b] font-mono text-[11px] text-[#71717a] leading-relaxed animate-fade-in">
                        <span className="text-zinc-600 font-bold block text-[9px] mb-1 uppercase tracking-widest">
                          PRIMARY AUTHORITY: {item.subtitle}
                        </span>
                        {item.description}
                        <div className="mt-3 text-[#ff4444] font-bold text-[9px] border-t border-[#18181b] pt-2 uppercase flex items-center gap-1.5 tracking-wider">
                          <ShieldAlert size={10} /> {item.milestone}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Classified Documents & Blueprints Drawer (7 cols / 12) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Quick folder directory drawer layout */}
          <div className="grid grid-cols-3 gap-3">
            {CLASSIFIED_DOCUMENTS.map((doc) => {
              const isSelected = activeDocId === doc.id;
              const FolderIcon = isSelected ? FolderOpen : Folder;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-4 rounded-sm border font-mono text-left transition-all relative overflow-hidden group cursor-pointer
                    ${isSelected 
                      ? 'bg-[#111113] border-[#ff4444]/40 shadow-[0_4px_16px_rgba(255,68,68,0.04)]' 
                      : 'bg-[#0c0c0e]/90 border-[#18181b] hover:border-zinc-700/60 hover:bg-[#111113]'
                    }
                  `}
                >
                  {/* Security Clearance level band */}
                  <div className={`absolute top-0 right-0 h-1 w-1/2 rounded-bl-sm
                    ${doc.level === 'TOP SECRET' ? 'bg-[#ff4444]' : 'bg-[#eab308]'}
                  `} />

                  <FolderIcon size={16} className={`mb-2 ${isSelected ? 'text-[#ff4444]' : 'text-[#71717a] group-hover:text-slate-400'}`} />
                  <span className="text-[9px] text-[#52525b] block leading-none tracking-widest">{doc.codeName}</span>
                  <span className="text-xs font-bold block truncate text-slate-300 mt-1 uppercase group-hover:text-slate-100">
                    {doc.title.split(' ')[0]} {doc.title.split(' ')[1] || 'Core'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Classified File content display card */}
          <div className="flex-1 rounded-sm border border-[#18181b] bg-[#0c0c0e] p-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-[#18181b] gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[#52525b] block uppercase tracking-wider">
                    ISSUED BY: {selectedDoc.origin}
                  </span>
                  <h3 className="font-sans text-sm font-bold text-slate-200 uppercase tracking-widest mt-1">
                    {selectedDoc.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="bg-[#111113] border border-[#18181b] text-[#ff4444] px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest">
                    {selectedDoc.level}
                  </span>
                </div>
              </div>

              {/* Technical Blueprint Display directly on folder */}
              <div className="my-4 aspect-video sm:h-48 w-full">
                {renderBlueprint(selectedDoc.blueprintType)}
              </div>

              {/* Redacted Excerpt section with decrypt animation on hover */}
              <div className="space-y-2 mt-4 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-[#52525b] border-b border-[#18181b] pb-1.5 mb-2 tracking-wider">
                  <span>TRANSCRIPT RECORD EXCERPT IN REVERSE TENSOR:</span>
                  <span className="text-[10px] font-bold text-[#ff4444] uppercase tracking-widest">RESTRICTED ACC</span>
                </div>
                
                <p 
                  onMouseEnter={() => setDeclassifyHover(selectedDoc.id)}
                  onMouseLeave={() => setDeclassifyHover(null)}
                  className="text-[#71717a] leading-relaxed bg-[#080809] p-4 rounded-sm border border-[#18181b] select-all cursor-help relative group"
                >
                  {/* Floating tooltip hover indicator */}
                  <span className="absolute top-1 right-2 text-[8px] text-[#ff4444]/40 group-hover:text-[#ff4444] transition-colors uppercase tracking-widest">
                    [Hover to Declassify]
                  </span>

                  {declassifyHover === selectedDoc.id ? (
                    // Declassified decrypted version!
                    <span>
                      {selectedDoc.redactedExcerpt
                        .replaceAll('[REDACTED] potential', 'electro-magnetic mass excitation potential')
                        .replaceAll('[REDACTED]% reduction', '65.8% inertial weight contraction')
                        .replaceAll('[REDACTED] resonance', 'high-frequency magnetosphere terrestrial resonance')
                        .replaceAll('[REDACTED]', 'supercooled vacuum plasma field')
                      }
                    </span>
                  ) : (
                    // Regular Redacted version!
                    <span>
                      {selectedDoc.redactedExcerpt.split('[REDACTED]').map((part, index, arr) => (
                        <React.Fragment key={index}>
                          {part}
                          {index < arr.length - 1 && (
                            <span className="mx-1 px-1.5 py-0.5 bg-[#111113] border border-[#18181b] text-transparent select-none font-bold rounded-sm cursor-not-allowed">
                              ■■■■■■■
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Bullet Point Directives under folder */}
            <div className="pt-4 border-t border-[#18181b]">
              <span className="text-[10px] font-mono text-[#52525b] block mb-2 uppercase tracking-widest">
                CORE MILITARY ENGINEERING SPECIFICATIONS:
              </span>
              <ul className="space-y-1.5 pl-4 list-disc font-mono text-[11px] text-[#71717a]">
                {selectedDoc.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
