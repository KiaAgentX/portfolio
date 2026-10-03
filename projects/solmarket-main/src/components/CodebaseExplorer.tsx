import React, { useState } from 'react';
import { GQR_CODE_FILES } from '../data/codebase';
import { CodeFile } from '../types';
import { 
  Folder, 
  FileCode, 
  Cpu, 
  Terminal, 
  BookOpen, 
  Info, 
  Award, 
  Search,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

export default function CodebaseExplorer() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(GQR_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]" id="codebase-explorer">
      
      {/* Sidebar files navigation outline */}
      <div className="lg:col-span-4 bg-panel-dark border border-border-dark rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-medium text-xs font-mono font-bold uppercase tracking-wider text-zinc-455">
          <Folder className="h-4.5 w-4.5 text-brand-orange" />
          <span>System File Outline</span>
        </div>

        <div className="flex-grow space-y-1.5 overflow-y-auto max-h-[480px] lg:max-h-[600px] pr-1">
          {GQR_CODE_FILES.map(file => (
            <button
              key={file.path}
              onClick={() => {
                setSelectedFile(file);
                setCopied(false);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                selectedFile.path === file.path
                  ? 'bg-brand-orange/5 border-brand-orange/20 text-zinc-100 shadow-md shadow-brand-orange/10'
                  : 'bg-card-dark border-border-dark text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileCode className={`h-4.5 w-4.5 shrink-0 ${
                  selectedFile.path === file.path ? 'text-brand-orange animate-pulse' : 'text-zinc-650'
                }`} />
                <div className="truncate flex flex-col gap-0.5">
                  <span className="font-semibold text-xs font-mono">{file.name}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{file.path}</span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#121212] border border-border-dark rounded text-zinc-500 shrink-0">
                {file.language}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3.5 bg-[#050505]/45 rounded-xl border border-border-dark leading-relaxed text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 mt-auto">
          <Info className="h-3.5 w-3.5 text-brand-orange shrink-0" />
          <span>Select any module file to view code implementations and variables.</span>
        </div>
      </div>

      {/* Code syntax viewer and explanation layout */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Code display file */}
        <div className="bg-panel-dark border border-border-dark rounded-2xl p-6 flex flex-col gap-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-medium">
            <div>
              <span className="font-mono text-xs text-zinc-500 block mb-1">{selectedFile.path}</span>
              <h3 className="text-lg font-bold font-mono text-zinc-200 flex items-center gap-2">
                {selectedFile.name}
              </h3>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-250 border border-border-medium hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>COPIED MODULE</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>COPY MODULE CODE</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Left side column: detailed notes on how it operates */}
            <div className="md:col-span-4 bg-[#050505]/45 border border-border-dark rounded-xl p-4.5 flex flex-col gap-3.5">
              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-brand-orange" />
                  Functional Role
                </h4>
                <p className="text-xs text-zinc-355 leading-relaxed font-sans">
                  {selectedFile.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Award className="h-3 w-3 text-brand-orange" />
                  High Points
                </h4>
                <div className="space-y-1.5">
                  {selectedFile.highlights.map((hl, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-xs text-zinc-400">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-sans text-zinc-400">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side column: syntactic code scroll body */}
            <div className="md:col-span-8 flex flex-col rounded-xl overflow-hidden border border-border-dark">
              <div className="bg-card-dark px-3.5 py-2 flex items-center justify-between border-b border-border-dark select-none">
                <span className="text-[10px] font-mono text-zinc-500">{selectedFile.name} — Read-Only</span>
                <span className="text-[10px] uppercase font-mono px-1.5 bg-zinc-950 border border-border-medium rounded text-zinc-400 py-0.5">{selectedFile.language}</span>
              </div>
              <div className="bg-[#050505] p-4.5 overflow-x-auto max-h-[380px] overflow-y-auto font-mono text-xs">
                <table className="w-full border-collapse">
                  <tbody>
                    {selectedFile.code.split('\n').map((line, idx) => {
                      let styleClass = 'text-zinc-305';
                      if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('"""') || line.trim().startsWith('"""')) {
                        styleClass = 'text-zinc-550 italic';
                      } else if (line.trim().startsWith('def ') || line.trim().startsWith('class ') || line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
                        styleClass = 'text-brand-orange font-semibold';
                      } else if (line.trim().startsWith('return ')) {
                        styleClass = 'text-[#f27d26]/90';
                      }

                      return (
                        <tr key={idx} className="hover:bg-zinc-900/40">
                          <td className="w-8 pr-2.5 text-right text-zinc-650 font-mono text-[9px] border-r border-[#151515] select-none">
                            {idx + 1}
                          </td>
                          <td className={`pl-3.5 font-mono break-all whitespace-pre ${styleClass}`}>
                            {line}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
