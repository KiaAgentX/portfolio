// File: src/types.ts

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface DebugLog {
  id: string;
  message: string;
  type: 'TP' | 'SL' | 'Chat' | 'Debug';
  timestamp: string;
  nodeId?: string;
}

export interface FeedItem {
  url: string;
  title: string;
  active: boolean;
}
