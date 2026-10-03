// File: src/components/ChatPanel.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquareCode, Eraser, AlertTriangle } from 'lucide-react';
import { sendMessage, Message } from '../engine/deepseekClient';
import TokenGauge from './TokenGauge';
import { eventBus } from '../engine/eventBus';
import { useMindDataStore } from '../store/mindDataStore';

interface ChatPanelProps {
  apiKey: string;
  tokenLimit: number;
  selectedModel: string;
}

export default function ChatPanel({ apiKey, tokenLimit, selectedModel }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Cosmic transmission established. I am connected to the DeepSeek cognitive cloud. Ask me anything, or refresh your feeds to observe stellar data flow.'
    }
  ]);
  const [input, setInput] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStore = useMindDataStore();

  // Scroll to bottom when messages or stream text changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  // Handle Token count updates from EventBus
  useEffect(() => {
    const unsub = eventBus.on('token-update', (data: any) => {
      setTokenCount(data.tokens);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userText }
    ];

    setMessages(updatedMessages);
    setStreamingResponse('');

    try {
      // Send chat message with active settings options
      const fullText = await sendMessage(updatedMessages, (partialText, currentTokens) => {
        setStreamingResponse(partialText);
        setTokenCount(currentTokens);
      }, {
        apiKey,
        model: selectedModel,
        tokenLimit
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullText }
      ]);
      setStreamingResponse('');
    } catch (err: any) {
      console.error('Failed to get streaming response:', err);
      // Log event
      eventBus.emit('debug-log', {
        message: `Transmission Error: failed to sync chat streams.`,
        type: 'SL',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation thread refreshed. Canvas ready for cognitive mapping.'
      }
    ]);
    setTokenCount(0);
    setStreamingResponse('');
  };

  return (
    <div className="flex flex-col bg-[#08080E] h-full overflow-hidden border border-white/10 rounded">
      {/* Header */}
      <div className="panel-header text-white/70 select-none shrink-0">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <MessageSquareCode className="w-3.5 h-3.5 text-blue-400" />
          <span>DeepSeek Cognitive Cloud</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-blue-400 text-[9px] font-mono uppercase tracking-wider bg-blue-950/40 border border-blue-900/40 px-1.5 py-0.2 rounded shrink-0">
            {selectedModel}
          </span>
          <button
            onClick={handleClearChat}
            className="p-1 text-white/40 hover:text-white transition-colors"
            title="Clear session"
          >
            <Eraser className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 max-h-[440px] min-h-[160px] scrollbar-thin select-text">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-0.5 p-2 border text-[11px] leading-snug max-w-[85%] font-mono ${
              msg.role === 'user'
                ? 'self-end bg-[#0088FF]/10 border-[#0088FF]/30 text-blue-100 rounded-l rounded-tr'
                : 'self-start bg-white/5 border-white/5 text-white/90 rounded-r rounded-tl'
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 mb-0.5 select-none">
              {msg.role === 'user' ? '🛰️ PILOT' : '🪐 COGNITIVE AGENT'}
            </span>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {/* Live response streaming bubble */}
        {streamingResponse && (
          <div className="self-start bg-white/5 border border-white/5 p-2 rounded-r rounded-tl text-[11px] leading-snug max-w-[85%] font-mono animate-pulse">
            <span className="text-[8px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 animate-spin" /> DOWNLOADING TELEMETRY...
            </span>
            <p className="whitespace-pre-wrap text-white/90 mt-0.5">{streamingResponse}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input panel Form */}
      <div className="p-2 shrink-0 border-t border-white/5 bg-black/20">
        <form onSubmit={handleSend} className="flex gap-1.5 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? 'Streaming response...' : 'Query space cloud...'}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded pl-2.5 pr-8 py-1 text-[11px] text-white focus:outline-none focus:border-[#0088FF] font-mono transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-[#0088FF] text-black font-bold transition-colors disabled:opacity-40 disabled:hover:bg-[#0088FF] hover:bg-blue-400 cursor-pointer flex items-center justify-center"
          >
            <Send className="w-3 h-3 text-black" strokeWidth={3} />
          </button>
        </form>

        {/* Warn message if limit exceeded */}
        {tokenCount >= tokenLimit && (
          <div className="flex items-center gap-1 text-[9px] text-red-400 font-mono bg-red-950/20 border border-red-900/30 p-1.5 rounded mt-1.5 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>CEILING HIT! Clear chat or increase safety slider.</span>
          </div>
        )}
      </div>
    </div>
  );
}
