import React, { useState } from "react";
import { Message } from "../types";
import { Copy, Volume2, VolumeX, Pin, RotateCcw, ArrowRight, ThumbsUp, ThumbsDown, Edit3, Trash2, Check, Play, Terminal, Zap } from "lucide-react";

interface MessageItemProps {
  message: Message;
  onCopyText: (text: string) => void;
  onSpeak: (text: string) => void;
  onTogglePin: (id: string) => void;
  onRegenerate: (id: string) => void;
  onContinue: (id: string) => void;
  onFeedback: (id: string, type: "up" | "down") => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onRunCode?: (code: string) => void;
  onOpenFrontEnd?: (code: string, lang: string) => void;
  isSpeaking: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyText,
  onSpeak,
  onTogglePin,
  onRegenerate,
  onContinue,
  onFeedback,
  onEdit,
  onDelete,
  onRunCode,
  onOpenFrontEnd,
  isSpeaking,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [copied, setCopied] = useState(false);
  const [codeCopiedIdx, setCodeCopiedIdx] = useState<number | null>(null);

  const isUser = message.role === "user";

  const handleCopy = () => {
    onCopyText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  // Custom Markdown & Code block renderer
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by fenced code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).split("\n");
        const lang = lines[0].trim().toLowerCase() || "code";
        const codeText = (lines[0].trim() ? lines.slice(1) : lines).join("\n");
        const isJs = lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript";
        const isFrontEnd = lang === "html" || lang === "jsx" || lang === "tsx" || lang === "react" || lang === "css" || lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript" || lang === "frontend" || lang === "front-end" || lang === "vue" || lang === "svelte" || lang === "ui";

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-xl font-mono text-[11px] backdrop-blur-md">
            {/* Code header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-slate-400 text-[10px]">
              <span className="font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">{lang}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isFrontEnd && onOpenFrontEnd && (
                  <button
                    onClick={() => onOpenFrontEnd(codeText, lang)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/80 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/30 transition-all font-mono text-[9px] uppercase tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.2)] animate-pulse"
                    title="Open in Front-End Workspace & Live Sandbox"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>⚡ Live Preview</span>
                  </button>
                )}
                {isJs && onRunCode && (
                  <button
                    onClick={() => onRunCode(codeText)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/80 text-emerald-300 hover:bg-emerald-500/30 transition-colors uppercase tracking-wider font-mono text-[9px]"
                    title="Run code block in console"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run JS</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    setCodeCopiedIdx(index);
                    setTimeout(() => setCodeCopiedIdx(null), 2000);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors uppercase tracking-wider font-mono text-[9px]"
                >
                  {codeCopiedIdx === index ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{codeCopiedIdx === index ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            {/* Code body */}
            <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono whitespace-pre text-xs">{codeText}</pre>
          </div>
        );
      }

      // Standard text formatting (bold, headers, lists, inline code)
      const paragraphs = part.split("\n\n");
      return (
        <div key={index} className="space-y-2 leading-relaxed">
          {paragraphs.map((p, pIdx) => {
            const trimmed = p.trim();
            if (!trimmed) return null;

            // Headers
            if (trimmed.startsWith("### ")) {
              return <h4 key={pIdx} className="text-sm font-bold text-cyan-400 mt-2">{trimmed.slice(4)}</h4>;
            }
            if (trimmed.startsWith("## ")) {
              return <h3 key={pIdx} className="text-base font-bold text-cyan-400 mt-3 border-b border-gray-800 pb-1">{trimmed.slice(3)}</h3>;
            }
            if (trimmed.startsWith("# ")) {
              return <h2 key={pIdx} className="text-lg font-black text-white mt-4 border-b border-gray-700 pb-1">{trimmed.slice(2)}</h2>;
            }

            // Blockquote
            if (trimmed.startsWith("> ")) {
              return (
                <blockquote key={pIdx} className="border-l-2 border-purple-500 pl-3 py-0.5 my-1 italic text-gray-400 bg-purple-950/10 rounded-r">
                  {trimmed.slice(2)}
                </blockquote>
              );
            }

            // Bullet list
            if (trimmed.includes("\n- ") || trimmed.startsWith("- ") || trimmed.includes("\n* ") || trimmed.startsWith("* ")) {
              const items = trimmed.split(/\n[-*] /).filter(Boolean);
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1 text-gray-300">
                  {items.map((item, iIdx) => (
                    <li key={iIdx}>{item.replace(/^[-*]\s+/, "")}</li>
                  ))}
                </ul>
              );
            }

            // Paragraph with bold/inline code parsing
            const formatInline = (text: string) => {
              const tokens = text.split(/(`.*?`|\*\*.*?\*\*|\*.*?\*)/g);
              return tokens.map((token, tIdx) => {
                if (token.startsWith("`") && token.endsWith("`")) {
                  return <code key={tIdx} className="bg-[#0f1318] border border-gray-800 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{token.slice(1, -1)}</code>;
                }
                if (token.startsWith("**") && token.endsWith("**")) {
                  return <strong key={tIdx} className="font-bold text-white">{token.slice(2, -2)}</strong>;
                }
                if (token.startsWith("*") && token.endsWith("*")) {
                  return <em key={tIdx} className="italic text-gray-300">{token.slice(1, -1)}</em>;
                }
                return token;
              });
            };

            return <p key={pIdx} className="text-gray-200">{formatInline(trimmed)}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div
      data-msg-id={message.id}
      className={`group flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-200 select-text ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      {/* Pinned Badge */}
      {message.pinned && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/50 px-2 py-0.5 rounded-full mb-0.5">
          <Pin className="w-3 h-3" />
          <span>Pinned Concept</span>
        </div>
      )}

      {/* Message Box */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-2xl text-xs sm:text-[13px] relative transition-all duration-200 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col ${
          isUser
            ? "bg-gradient-to-br from-cyan-950/60 to-slate-900/80 border border-cyan-400/40 text-slate-100 shadow-[0_4px_25px_rgba(34,211,238,0.15)] rounded-br-sm"
            : "bg-slate-900/80 border border-white/10 text-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.3)] rounded-bl-sm"
        }`}
      >
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          {/* Attached Images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.images.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-black max-w-[150px] max-h-[120px] shadow-sm">
                  <img src={`data:${img.mimeType};base64,${img.base64Data}`} alt={img.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Text / Edit form */}
          {isEditing ? (
            <div className="space-y-2.5 w-full min-w-[280px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-slate-950/90 border border-cyan-400/80 rounded-xl p-3 text-slate-200 font-mono text-xs outline-none min-h-[80px] resize-y shadow-inner"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 text-[11px] font-mono tracking-wider uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="font-sans break-words leading-relaxed">{isUser ? <div className="whitespace-pre-wrap">{message.content}</div> : renderFormattedContent(message.content)}</div>
          )}
        </div>

        {/* Sleek Semi-Transparent Docked Action Bar & Metadata Inside Message Box */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/70 border-t border-white/10 text-[10px] font-mono text-slate-400 flex-wrap backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity">
          {/* Metadata */}
          {message.meta ? (
            <div className="flex items-center gap-2.5 uppercase tracking-wider font-semibold">
              <span className="text-cyan-400">{message.meta.tokens} tok</span>
              <span className="text-indigo-400">${message.meta.cost.toFixed(5)}</span>
              <span className="text-slate-300">{message.meta.latency} ms</span>
            </div>
          ) : (
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{isUser ? "USER COGNITION" : "NEURAL CORE RESPONSE"}</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto flex-wrap justify-end">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors uppercase tracking-wider font-mono text-[9px]"
              title="Copy text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* Speak */}
            <button
              onClick={() => onSpeak(message.content)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors uppercase tracking-wider font-mono text-[9px] ${
                isSpeaking
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50"
              }`}
              title="Speak message with TTS"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{isSpeaking ? "Stop" : "Speak"}</span>
            </button>

            {/* Pin */}
            <button
              onClick={() => onTogglePin(message.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors uppercase tracking-wider font-mono text-[9px] ${
                message.pinned
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50"
              }`}
              title="Pin concept to neural memory"
            >
              <Pin className="w-3 h-3" />
              <span>{message.pinned ? "Pinned" : "Pin"}</span>
            </button>

            {/* AI only actions */}
            {!isUser && (
              <>
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors uppercase tracking-wider font-mono text-[9px]"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={() => onContinue(message.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors uppercase tracking-wider font-mono text-[9px]"
                  title="Continue generating from here"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Continue</span>
                </button>

                <button
                  onClick={() => onFeedback(message.id, "up")}
                  className={`p-1 rounded-md border transition-colors ${
                    message.feedback === "up"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50"
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onFeedback(message.id, "down")}
                  className={`p-1 rounded-md border transition-colors ${
                    message.feedback === "down"
                      ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50"
                  }`}
                  title="Unhelpful response"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </>
            )}

            {/* User edit */}
            {isUser && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors uppercase tracking-wider font-mono text-[9px]"
                title="Edit message"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
