export type Role = "user" | "assistant" | "system";

export interface AttachedFile {
  name: string;
  mimeType: string;
  base64Data: string;
  size?: number;
}

export interface MessageMeta {
  tokens: number;
  cost: number;
  latency: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  images?: AttachedFile[];
  meta?: MessageMeta;
  timestamp: number;
  pinned?: boolean;
  feedback?: "up" | "down" | null;
}

export interface ConversationTab {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export interface SavedConversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export interface DNAArchetype {
  id: string;
  name: string;
  colorHex: string;
  colorNum: number;
  description: string;
  shape: string;
}

export interface NeuronNodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  role: "user" | "ai" | "seed";
  dnaType: string;
  keyword: string;
  birthTime: number;
  colorNum: number;
  messageId?: string;
  strength: number;
  pinned?: boolean;
  tabId?: string;
}

export interface SynapseLink {
  sourceId: string;
  targetId: string;
  strength: number;
  active?: boolean;
}

export type ProviderType = 
  | "gemini" 
  | "openrouter" 
  | "groq" 
  | "cloudflare" 
  | "ollama" 
  | "9router" 
  | "nvidia" 
  | "antigravity" 
  | "deepseek" 
  | "zhipu" 
  | "claude" 
  | "codex" 
  | "hermes" 
  | "cursor" 
  | "xai" 
  | "gemini-cli" 
  | "anthropic" 
  | "moonshot" 
  | "mistral" 
  | "openai" 
  | "lmstudio" 
  | "custom";

export interface ProviderConfig {
  baseUrl: string;
  needsKey: boolean;
  label: string;
  hint: string;
  chatStyle: string;
  supportsStream: boolean;
  setupUrl?: string;
}

export interface SavedPrompt {
  name: string;
  text: string;
}

export interface Settings {
  provider: ProviderType;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number | null;
  freqPenalty: number | null;
  presPenalty: number | null;
  voiceLang: string;
  ttsEnabled: boolean;
  soundFxEnabled: boolean;
  priceIn: number;
  priceOut: number;
  tokenBudget: number;
  contextWindow: number;
  estimateTokens: boolean;
  slidingWindow: number;
  theme: string;
  promptLibrary: SavedPrompt[];
  stopSequences: string[];
  seed: number | null;
  responseFormat: string;
  useWebSocket: boolean;
  isSupporter?: boolean;
  renderQuality?: "low" | "medium" | "high" | "ultra";
  uiDensity?: "compact" | "normal" | "spacious";
  networkTimeout?: number;
}

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  lastReqTokens: number;
  lastReqMs: number;
}

export interface MissionTask {
  id: string;
  text: string;
  status: "pending" | "active" | "done" | "error";
  output?: string;
}

export type ConsciousnessState = "idle" | "thinking" | "speaking" | "agent-processing";

export type CameraShotType = 
  | "pushIn" 
  | "orbitSweep" 
  | "tiltHero" 
  | "pullReveal" 
  | "driftWide" 
  | "quickPunch" 
  | "neuralBurstPOV" 
  | "synapseGlide" 
  | "coreDive" 
  | "autoPilot"
  | "orbitShift"
  | "zenOrbit";

export interface NeuralBurstEvent {
  active: boolean;
  tokenCount: number;
  sourceNodeId?: string;
  timestamp: number;
  intensity?: number;
}

export interface SynapticPathfindingEvent {
  active: boolean;
  sourceId: string;
  targetId: string;
  keyword?: string;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  title: string;
  category: "UPDATE" | "ALERT" | "AI INDUSTRY" | "SYSTEM" | "RELEASE";
  date: string;
  summary: string;
  content?: string; // Full markdown news content
  url?: string;
  important?: boolean;
}

export interface SystemAnnouncement {
  enabled: boolean;
  message: string;
  type: "info" | "warning" | "alert" | "news";
  timestamp: number;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  content: string; // The SKILL.md markdown content
  updatedAt?: string;
  category?: string;
  usageCount?: number;
}

export interface NeuralMetricPoint {
  id: string;
  timestamp: number;
  timeLabel: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  model: string;
  cost: number;
}

export interface MediaLinks {
  logoUrl?: string;
  avatarUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
  customMediaUrl?: string;
  customMediaLabel?: string;
  donationUrl?: string;
  donationText?: string;
}

export interface NeuronCustomization {
  sizeScale?: number; // 0.5 to 3.0
  baseColor?: string; // hex
  geometryShape?: "sphere" | "dodecahedron" | "octahedron" | "icosahedron" | "torus" | "starburst" | "adaptive" | "torusKnot" | "cone" | "cylinder" | "cube" | string;
  glowIntensity?: number; // 0.5 to 3.0
  adaptiveGeometry?: boolean;
}

export interface ThemeCustomization {
  fontFamily?: "Inter" | "Space Grotesk" | "JetBrains Mono" | "Fira Code" | "Outfit";
  accentColor?: string; // hex
  bgStyle?: "default" | "cosmic" | "cyberpunk" | "emerald" | "amber" | "crimson";
}

export interface CustomPage {
  id: string;
  slug: string; // e.g. "/academy", "docs", "community"
  title: string;
  description?: string;
  content: string; // Markdown or HTML content
  icon?: string;
  published?: boolean;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  endpointUrl: string;
  apiKey?: string;
  status: "connected" | "disconnected" | "error";
  tools: string[];
}

export interface NeuralPresetNode {
  id: string;
  x: number;
  y: number;
  z: number;
  strength: number;
  group?: number;
  label?: string;
  role: string;
  keyword: string;
  dnaType?: string;
  colorNum?: number;
}

export interface NeuralPreset {
  id: string;
  name: string;
  timestamp: number;
  nodeCount: number;
  nodes: NeuralPresetNode[];
  customization?: NeuronCustomization;
  isDefault?: boolean;
}

export interface CustomCLICommand {
  id: string;
  command: string; // e.g. "/deploy", "/academy"
  description: string;
  actionType: "open_page" | "send_prompt" | "run_script" | "switch_mode" | "system_message" | "run_command" | string;
  targetValue: string; // slug or prompt
}

export interface AdminConfig {
  siteTitle: string;
  siteSubtitle: string;
  systemAnnouncement: SystemAnnouncement;
  newsFeed: NewsItem[];
  agentSkills?: AgentSkill[];
  customSystemPrompt?: string;
  defaultModel?: string;
  defaultTheme?: string;
  burstSensitivity?: number;
  adminUsername?: string;
  adminPassword?: string;
  mediaLinks?: MediaLinks;
  neuronCustomization?: NeuronCustomization;
  themeCustomization?: ThemeCustomization;
  customPages?: CustomPage[];
  mcpServers?: MCPServerConfig[];
  customCLICommands?: CustomCLICommand[];
  neuralPresets?: NeuralPreset[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: "google" | "admin" | "guest" | string;
  role: string;
  tokensEarned?: number;
  connectedAt: string;
  scopes?: string[];
  syncSettings?: {
    googleDriveBackup: boolean;
    gmailRelay: boolean;
    calendarMissions: boolean;
  };
}

