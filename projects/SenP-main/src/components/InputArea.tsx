import React, { useRef, useEffect } from "react";
import { AttachedFile } from "../types";
import { Mic, Paperclip, X, Send, StopCircle, Image as ImageIcon, FileText } from "lucide-react";

interface InputAreaProps {
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isStreaming: boolean;
  isRecording: boolean;
  onToggleRecord: () => void;
  attachedFiles: AttachedFile[];
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  onInputChange,
  onSend,
  onCancel,
  isStreaming,
  isRecording,
  onToggleRecord,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachedFiles.length > 0) && !isStreaming) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 border-t border-white/10 bg-slate-950/60 backdrop-blur-xl shrink-0 select-none">
      {/* Attached Files Previews */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-1">
          {attachedFiles.map((file, idx) => {
            const isImg = file.mimeType.startsWith("image/");
            return (
              <div
                key={idx}
                className="relative flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-xl p-1.5 pr-3 max-w-[190px] shadow-sm font-mono text-[11px] text-slate-200 backdrop-blur-md"
              >
                {isImg ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                    <img src={`data:${file.mimeType};base64,${file.base64Data}`} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                <div className="truncate flex-1">
                  <div className="truncate font-semibold text-[10px] font-mono">{file.name}</div>
                  <div className="text-[8px] text-cyan-400 font-mono tracking-widest uppercase">{isImg ? "IMAGE" : "TEXT/DATA"}</div>
                </div>
                <button
                  onClick={() => onRemoveFile(idx)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center text-[10px] font-bold hover:bg-rose-400 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input Row: Unified sleek grey box containing Mic, Paperclip, Textarea, and Send */}
      <div className="flex items-end gap-1.5 bg-slate-900/90 border border-white/15 rounded-2xl p-1.5 pl-2.5 sm:pl-3 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/30 focus-within:bg-slate-900 transition-all duration-200 shadow-xl backdrop-blur-xl">
        {/* Voice Input Button (Inside Input Box) */}
        <button
          onClick={onToggleRecord}
          disabled={isStreaming}
          className={`p-2 rounded-xl transition-all duration-150 shrink-0 ${
            isRecording
              ? "bg-rose-500/20 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              : "text-slate-400 hover:text-cyan-400 hover:bg-white/10"
          }`}
          title={isRecording ? "Stop voice recording" : "Start voice recording (Web Speech API)"}
        >
          {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* File Attachment Button (Inside Input Box) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all duration-150 shrink-0"
          title="Attach files or images"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.pdf,.json,.csv,.xml,.md,.py,.js,.html,.css,.log,.sh,.yaml,.yml,.toml"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Cancel Stream Button */}
        {isStreaming && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-300 hover:bg-rose-500/30 font-mono font-bold uppercase tracking-wider text-xs shrink-0 animate-in fade-in"
            title="Cancel request"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        )}

        {/* Textarea */}
        <div className="flex-1 relative min-w-0 py-0.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
            placeholder={isRecording ? "Listening to your voice..." : "Type your message or attach code/data..."}
            className="w-full bg-transparent border-0 px-2 py-1.5 text-slate-200 font-sans text-xs sm:text-sm outline-none resize-none max-h-32 placeholder:text-slate-500 leading-relaxed"
            dir="auto"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={(!input.trim() && attachedFiles.length === 0) || isStreaming}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold flex items-center justify-center transition-all duration-150 shrink-0 ${
            (!input.trim() && attachedFiles.length === 0) || isStreaming
              ? "bg-white/5 text-slate-600 cursor-not-allowed"
              : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 font-extrabold"
          }`}
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
