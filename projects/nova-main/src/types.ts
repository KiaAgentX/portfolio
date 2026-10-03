export enum Role {
  SuperAdmin = "SuperAdmin",
  OrgAdmin = "OrgAdmin",
  WorkspaceAdmin = "WorkspaceAdmin",
  Member = "Member",
  Guest = "Guest"
}

export enum Provider {
  OPENAI = "OPENAI",
  ANTHROPIC = "ANTHROPIC",
  GEMINI = "GEMINI",
  GROQ = "GROQ"
}

export interface Workspace {
  id: string;
  name: string;
  type: "personal" | "team" | "enterprise";
  role: Role;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: Provider;
  isThinking?: boolean;
  thinkingProcess?: string;
  googleSearchGrounding?: boolean;
  searchResults?: SearchResultItem[];
}

export interface Conversation {
  id: string;
  title: string;
  provider: Provider;
  modelId: string;
  messages: Message[];
  createdAt: string;
}

export interface ProviderHealth {
  provider: Provider;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latency: number; // in ms
  circuitBreaker: "CLOSED" | "OPEN" | "HALF-OPEN";
  failureCount: number;
}

export interface DocumentChunk {
  id: string;
  documentName: string;
  content: string;
  similarity: number;
  rrfScore?: number;
}
