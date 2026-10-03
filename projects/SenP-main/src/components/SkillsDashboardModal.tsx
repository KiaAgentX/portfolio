import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AgentSkill } from "../types";
import {
  Zap,
  Cpu,
  FileText,
  Code,
  Share2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Eye,
  Play,
  Copy,
  Check,
  Activity,
  Layers,
  Box,
  Network,
  ChevronRight,
  Maximize2,
  Minimize2,
  Terminal,
  ShieldCheck,
  Dna,
  Database,
  Globe,
  GitBranch
} from "lucide-react";

interface SkillsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentSkills?: AgentSkill[];
  onToggleSkill?: (skillId: string) => void;
  onSelectSkillForChat?: (skill: AgentSkill) => void;
  onTriggerNeuralBurst?: () => void;
  soundFxEnabled?: boolean;
}

// Comprehensive Default Fallback Skills with real SKILL.md content
const FALLBACK_SKILLS: AgentSkill[] = [
  {
    id: "skill-cot",
    name: "chain-of-thought",
    description: "Emits <thought> cognitive reasoning blocks before neural transmission.",
    enabled: true,
    category: "Core",
    usageCount: 142,
    content: `---
name: chain-of-thought
description: Emits <thought> cognitive reasoning blocks before neural transmission
version: 3.5.0
archetype: Cognitive
category: Core
tags: reasoning, cognitive, logic
author: Elon Mind LLM
---

# Chain of Thought Workflow
1. Analyze user prompt intent and decompose architectural complexity.
2. Emit step-by-step cognitive reasoning inside syntax blocks.
3. Validate output against safety, accuracy, and performance thresholds.
4. Execute final response synthesis with unified code deliverables.

# Functions
- \`initiateReasoning(prompt: string): ThoughtStream\`
- \`validateCoTSteps(steps: Step[]): boolean\`
- \`emitThoughtBlock(content: string, latencyMs: number): void\`

# Custom Logic Definitions
\`\`\`ts
if (prompt.complexity > 0.7 || prompt.includes("architecture")) {
  cortex.enableCoT({ depth: "deep", emitSteps: true });
} else {
  cortex.enableCoT({ depth: "standard" });
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-web",
    name: "web-grounding",
    description: "Grounds answers using real-time search queries and web citations.",
    enabled: true,
    category: "Utility",
    usageCount: 89,
    content: `---
name: web-grounding
description: Searches live web sources for factual grounding and citation extraction
version: 2.1.0
archetype: Tool
category: Utility
tags: search, live-web, citations
author: SenPai Core
---

# Web Grounding Protocol
1. Identify temporal or factual claims requiring live internet verification.
2. Formulate concise, targeted search queries using Google/DuckDuckGo engines.
3. Synthesize findings with clear numeric citations and source links.

# Functions
- \`executeSearchQuery(query: string, maxResults?: number): SearchResult[]\`
- \`extractCitations(html: string): Citation[]\`
- \`verifyFactualClaims(claim: string, sources: Source[]): VerificationScore\`

# Custom Logic Definitions
\`\`\`ts
const needsGrounding = /latest|today|2026|current price|news/i.test(userMessage);
if (needsGrounding && !webSearchActive) {
  system.triggerTool("search_web", { query: extractMainKeywords(userMessage) });
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-sandbox",
    name: "js-sandbox-exec",
    description: "Executes mathematical calculations and simulation code in live sandbox VM.",
    enabled: true,
    category: "Analytical",
    usageCount: 64,
    content: `---
name: js-sandbox-exec
description: Safe client-side javascript sandbox execution in isolated VM
version: 4.0.0
archetype: Logic
category: Analytical
tags: javascript, math, algorithm, sandbox
author: Neural Sandbox
---

# Sandbox Execution Protocol
1. When complex math, algorithms, or visual data processing is needed, write standard JavaScript.
2. Execute within the neural sandbox VM with custom console hooks.
3. Present output logs directly in the interactive UI terminal.

# Functions
- \`runInSandbox(codeString: string, timeoutMs?: number): SandboxExecutionResult\`
- \`interceptConsoleLogs(sandbox: VM): LogStream\`
- \`validateMemoryLimits(allocBytes: number): boolean\`

# Custom Logic Definitions
\`\`\`ts
try {
  const result = new Function("console", userCode)(customConsole);
  emitSuccessToast("Sandbox code execution completed without memory leaks.");
} catch (err) {
  emitErrorLog(\`Sandbox Runtime Exception: \${err.message}\`);
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-d3-viz",
    name: "data-visualization",
    description: "Generates interactive D3 and Recharts data visualizations and charts.",
    enabled: true,
    category: "Analytical",
    usageCount: 115,
    content: `---
name: data-visualization
description: Generates interactive D3 and Recharts data graphics from unstructured data
version: 1.8.5
archetype: Creativity
category: Analytical
tags: d3, recharts, graphics, charts
author: Viz Engine
---

# Visualization Generation Protocol
1. Parse raw data sets, JSON tables, or financial time series.
2. Select optimal chart topology: Force-directed graph, Treemap, Scatter, or Area chart.
3. Apply Tailwind CSS colors and responsive container sizing.

# Functions
- \`parseRawDataToGraph(rawJson: string): GraphTopology\`
- \`renderRechartsLine(series: TimeSeries, theme: string): JSX.Element\`
- \`calculateForceLayout(nodes: Node[], links: Link[]): Simulation\`

# Custom Logic Definitions
\`\`\`ts
if (data.length > 50 && data[0].hasOwnProperty("source")) {
  renderMode = "D3_FORCE_DIRECTED";
} else {
  renderMode = "RECHARTS_RESPONSIVE";
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-multimodal",
    name: "gemini-multimodal",
    description: "Image analysis, audio parsing, vision processing, and document OCR.",
    enabled: true,
    category: "Analytical",
    usageCount: 93,
    content: `---
name: gemini-multimodal
description: Processes images, audio clips, and PDF documents using Gemini 2.0 Flash vision
version: 3.2.0
archetype: Sensory
category: Analytical
tags: vision, audio, ocr, multimodal
author: Google DeepMind
---

# Multimodal Processing Workflow
1. Accept base64 encoded images, audio spectra, or document attachments.
2. Extract spatial bounding boxes, OCR typography, and semantic visual descriptions.
3. Merge sensory tokens into the conversation context window.

# Functions
- \`analyzeImageBase64(dataUrl: string, prompt?: string): VisionAnalysis\`
- \`transcribeAudioStream(audioBlob: Blob): Promise<string>\`
- \`detectObjectsAndFaces(canvasRef: HTMLCanvasElement): BoundingBox[]\`

# Custom Logic Definitions
\`\`\`ts
if (message.attachments.some(a => a.type.startsWith("image/"))) {
  model = "gemini-2.5-flash";
  maxTokens = 8192;
  enableVisionAttention = true;
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-sql",
    name: "sql-query-builder",
    description: "PostgreSQL and Cloud SQL relational DQL/DML execution engine.",
    enabled: true,
    category: "Core",
    usageCount: 210,
    content: `---
name: sql-query-builder
description: Constructs and executes optimized PostgreSQL queries with schema validation
version: 2.0.4
archetype: Memory
category: Core
tags: postgresql, cloud-sql, database, sql
author: Cloud SQL Skill
---

# Relational Database Protocol
1. Inspect database schema definitions (Drizzle ORM / Prisma / Raw SQL).
2. Generate parameterized DQL (SELECT) or safe DML (INSERT/UPDATE/DELETE).
3. Prevent SQL injection via strict AST parameter binding.

# Functions
- \`validateQuerySyntax(sqlText: string): AstValidationResult\`
- \`executeCloudSqlQuery(statement: string, params: any[]): Promise<QueryResult>\`
- \`generateSchemaMigration(oldSchema: string, newSchema: string): MigrationScript\`

# Custom Logic Definitions
\`\`\`ts
if (sqlText.trim().toUpperCase().startsWith("DROP ") && !userConfirmed) {
  throw new Error("Destructive DDL operations require explicit user UI confirmation.");
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-firebase",
    name: "firebase-sync",
    description: "Real-time Firestore cloud data persistence and Auth security hardening.",
    enabled: true,
    category: "Core",
    usageCount: 78,
    content: `---
name: firebase-sync
description: Synchronizes state to Firebase Firestore with custom security rule generation
version: 3.1.0
archetype: Memory
category: Core
tags: firestore, realtime, auth, firebase
author: Firebase Integration
---

# Cloud Persistence Workflow
1. Establish real-time WebSocket snapshot listeners for user collections.
2. Ensure offline persistence with optimistic client-side caching.
3. Validate firestore.rules against unauthorized document reads/writes.

# Functions
- \`syncCollectionRealtime(path: string, callback: (docs: any[]) => void): Unsubscribe\`
- \`deploySecurityRules(rulesContent: string): Promise<DeployStatus>\`
- \`authenticateAnonymously(): Promise<UserCredential>\`

# Custom Logic Definitions
\`\`\`ts
const docRef = doc(db, "users", userId, "conversations", activeTabId);
await setDoc(docRef, { messages: activeMessages, updatedAt: serverTimestamp() }, { merge: true });
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-mission",
    name: "autonomous-mission",
    description: "Decomposes high-level objectives into 4 sequential autonomous sub-tasks.",
    enabled: true,
    category: "Utility",
    usageCount: 45,
    content: `---
name: autonomous-mission
description: Decomposes complex goals into sequential sub-tasks with 3D camera sweeps
version: 5.0.0
archetype: Action
category: Utility
tags: auto-pilot, task-decomposition, mission
author: Autonomous Agent
---

# Mission Decomposition Protocol
1. Receive high-level user objective string.
2. Break objective down into 4 sequential logical steps: Scope, Architecture, Code, Verification.
3. Execute each sub-task while triggering cinematic 3D camera transitions and neural bursts.

# Functions
- \`decomposeGoal(goalString: string): MissionTask[]\`
- \`executeSubTask(task: MissionTask): Promise<TaskResult>\`
- \`emitProgressUpdate(index: number, total: number): void\`

# Custom Logic Definitions
\`\`\`ts
for (let i = 0; i < tasks.length; i++) {
  cortex.triggerCameraShot(i % 2 === 0 ? "pushIn" : "orbitSweep");
  await executeSubTask(tasks[i]);
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-github",
    name: "github-repo-import",
    description: "Cross-framework repository triage and codebase structure migration.",
    enabled: false,
    category: "Utility",
    usageCount: 32,
    content: `---
name: github-repo-import
description: Triages imported GitHub repositories and rewrites frameworks safely
version: 1.5.0
archetype: Tool
category: Utility
tags: git, migration, triage, repo
author: Code Migration Engine
---

# GitHub Migration Protocol
1. Scan repository file tree and package.json dependency manifests.
2. Identify source framework (React/Next/Vue/Angular) and target environment.
3. Rewrite imports and JSX structures while preserving business logic.

# Functions
- \`scanFileTree(rootPath: string): FileNode[]\`
- \`rewriteComponentSyntax(code: string, targetFramework: string): string\`
- \`resolvePackageDependencies(packageJson: string): DependencyList\`

# Custom Logic Definitions
\`\`\`ts
if (packageJson.dependencies["next"] && targetRuntime === "vite") {
  applyNextToViteMigrationTransform(projectFiles);
}
\`\`\``,
    updatedAt: "2026-07-03"
  },
  {
    id: "skill-sec",
    name: "cyber-security-audit",
    description: "Vulnerability scanning, AST linting, and prompt injection defense.",
    enabled: true,
    category: "Security",
    usageCount: 167,
    content: `---
name: cyber-security-audit
description: Scans code for security vulnerabilities and defends against prompt injection
version: 4.2.1
archetype: Security
category: Security
tags: audit, defense, sandbox, security
author: Neuro-Shield
---

# Security Audit Protocol
1. Inspect incoming prompt tokens for jailbreak attempts or system prompt overrides.
2. Scan generated TypeScript code for XSS, eval injection, or exposed API secrets.
3. Enforce strict sandboxing and CORS boundaries.

# Functions
- \`detectPromptInjection(tokens: string[]): ThreatAssessment\`
- \`lintCodeSecurity(tsCode: string): SecurityIssue[]\`
- \`sanitizeHtmlOutput(rawHtml: string): string\`

# Custom Logic Definitions
\`\`\`ts
if (threatScore > 0.85) {
  emitSecurityAlert("Blocked potential adversarial injection attack.");
  return "Access Denied: Neural firewall triggered.";
}
\`\`\``,
    updatedAt: "2026-07-03"
  }
];

// Helper to parse markdown YAML frontmatter and functions
interface ParsedSkillMetadata {
  name: string;
  description: string;
  version: string;
  archetype: string;
  category: string;
  tags: string[];
  usageCount: number;
  author: string;
  functions: string[];
  customLogic: string;
  rawContent: string;
}

const skillParseCache = new Map<string, ParsedSkillMetadata>();

let parseQueue: Array<{
  content: string;
  fallbackName: string;
  fallbackDesc: string;
  fallbackCat?: string;
  fallbackUsage?: number;
  resolve: (res: ParsedSkillMetadata) => void;
}> = [];
let isProcessingQueue = false;

// Throttled asynchronous processing to prevent blocking the UI thread during rapid updates
function processParseQueueThrottled() {
  if (parseQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  isProcessingQueue = true;

  const start = performance.now();
  // Process tasks within a strict 6ms non-blocking frame budget
  while (parseQueue.length > 0 && performance.now() - start < 6) {
    const task = parseQueue.shift();
    if (task) {
      const res = executeParseSkillMd(task.content, task.fallbackName, task.fallbackDesc, task.fallbackCat, task.fallbackUsage);
      task.resolve(res);
    }
  }

  if (parseQueue.length > 0) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => processParseQueueThrottled(), { timeout: 30 });
    } else {
      setTimeout(() => processParseQueueThrottled(), 0);
    }
  } else {
    isProcessingQueue = false;
  }
}

export function parseSkillMdAsync(
  content: string,
  fallbackName: string,
  fallbackDesc: string,
  fallbackCat?: string,
  fallbackUsage?: number
): Promise<ParsedSkillMetadata> {
  const cacheKey = `${fallbackName}|${fallbackUsage}|${content ? content.length : 0}|${content ? content.slice(0, 100) : ""}`;
  if (skillParseCache.has(cacheKey)) {
    return Promise.resolve(skillParseCache.get(cacheKey)!);
  }

  return new Promise((resolve) => {
    parseQueue.push({ content, fallbackName, fallbackDesc, fallbackCat, fallbackUsage, resolve });
    if (!isProcessingQueue) {
      processParseQueueThrottled();
    }
  });
}

function parseSkillMd(content: string, fallbackName: string, fallbackDesc: string, fallbackCat?: string, fallbackUsage?: number): ParsedSkillMetadata {
  const cacheKey = `${fallbackName}|${fallbackUsage}|${content ? content.length : 0}|${content ? content.slice(0, 100) : ""}`;
  if (skillParseCache.has(cacheKey)) {
    return skillParseCache.get(cacheKey)!;
  }
  const result = executeParseSkillMd(content, fallbackName, fallbackDesc, fallbackCat, fallbackUsage);
  skillParseCache.set(cacheKey, result);
  return result;
}

function executeParseSkillMd(content: string, fallbackName: string, fallbackDesc: string, fallbackCat?: string, fallbackUsage?: number): ParsedSkillMetadata {
  let name = fallbackName;
  let description = fallbackDesc;
  let version = "1.0.0";
  let archetype = "Logic";
  let author = "SenPai Core";
  let category = fallbackCat || "";
  let usageCount = typeof fallbackUsage === "number" ? fallbackUsage : 12;
  const tags: string[] = [];
  const functions: string[] = [];
  let customLogic = "";

  if (!content) {
    if (!category) category = "Core";
    return { name, description, version, archetype, category, tags, usageCount, author, functions, customLogic, rawContent: "" };
  }

  // Parse frontmatter
  const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (fmMatch && fmMatch[1]) {
    const fmLines = fmMatch[1].split(/\r?\n/);
    fmLines.forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(":").trim();
        if (key === "name") name = val;
        if (key === "description") description = val;
        if (key === "version") version = val;
        if (key === "archetype") archetype = val;
        if (key === "category") category = val;
        if (key === "author") author = val;
        if (key === "tags") {
          val.split(/,\s*/).forEach((t) => {
            const cleanT = t.trim().replace(/^['"]|['"]$/g, "");
            if (cleanT && !tags.includes(cleanT)) tags.push(cleanT);
          });
        }
        if (key === "usagecount" || key === "usage_count" || key === "usage") {
          const num = parseInt(val, 10);
          if (!isNaN(num)) usageCount = num;
        }
      }
    });
  }

  // Also parse section headers like # Category: Analytical or # Tags: search, web
  const lines = content.split(/\r?\n/);
  let inFuncSection = false;
  let inLogicSection = false;
  const logicLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^#+\s*Category\s*:\s*(.+)$/i)) {
      const m = trimmed.match(/^#+\s*Category\s*:\s*(.+)$/i);
      if (m && m[1]) category = m[1].trim();
      continue;
    }
    if (trimmed.match(/^#+\s*Tags\s*:\s*(.+)$/i)) {
      const m = trimmed.match(/^#+\s*Tags\s*:\s*(.+)$/i);
      if (m && m[1]) {
        m[1].split(/,\s*/).forEach((t) => {
          const cleanT = t.trim();
          if (cleanT && !tags.includes(cleanT)) tags.push(cleanT);
        });
      }
      continue;
    }
    if (trimmed.match(/^#+\s*Functions/i)) {
      inFuncSection = true;
      inLogicSection = false;
      continue;
    } else if (trimmed.match(/^#+\s*(Custom Logic|Rules|Protocol|Workflow)/i)) {
      inFuncSection = false;
      inLogicSection = true;
      continue;
    } else if (trimmed.startsWith("#")) {
      inFuncSection = false;
      inLogicSection = false;
    }

    if (inFuncSection) {
      if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.includes("(")) {
        const clean = trimmed.replace(/^[-*]\s*/, "").replace(/`/g, "");
        if (clean && !functions.includes(clean)) {
          functions.push(clean);
        }
      }
    }

    if (inLogicSection) {
      logicLines.push(line);
    }
  }

  // If functions empty, regex find function signatures
  if (functions.length === 0) {
    const funcMatches = content.match(/\b([a-zA-Z0-9_]+\([a-zA-Z0-9_:\s,]*\)(?:\s*:\s*[a-zA-Z0-9_<>[\]]+)?)/g);
    if (funcMatches) {
      funcMatches.slice(0, 5).forEach((m) => {
        const clean = m.replace(/`/g, "").trim();
        if (clean.length > 3 && !functions.includes(clean)) functions.push(clean);
      });
    }
  }

  customLogic = logicLines.join("\n").trim();
  if (!customLogic) {
    // Extract first code block
    const cbMatch = content.match(/```(?:ts|js|javascript|typescript)?\s*[\r\n]+([\s\S]*?)```/);
    if (cbMatch && cbMatch[1]) {
      customLogic = cbMatch[1].trim();
    }
  }

  if (!category) {
    const archLow = archetype.toLowerCase();
    if (archLow === "cognitive" || archLow === "logic") category = "Analytical";
    else if (archLow === "tool" || archLow === "action") category = "Utility";
    else if (archLow === "creativity" || archLow === "sensory") category = "Analytical";
    else if (archLow === "security") category = "Security";
    else if (archLow === "memory") category = "Core";
    else category = "Core";
  }

  return { name, description, version, archetype, category, tags, usageCount, author, functions, customLogic, rawContent: content };
}

// 3D Skill Tree Visualization Component
const SkillTree3D: React.FC<{
  skills: AgentSkill[];
  selectedSkill: AgentSkill | null;
  onSelectSkill: (skill: AgentSkill) => void;
  soundFxEnabled?: boolean;
}> = ({ skills, selectedSkill, onSelectSkill, soundFxEnabled }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.maxDistance = 45;
    controls.minDistance = 8;

    // Ambient lighting & Point lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const pLight1 = new THREE.PointLight(0x00ffff, 2.5, 50);
    pLight1.position.set(10, 15, 10);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0xff007f, 2.0, 50);
    pLight2.position.set(-10, -15, -10);
    scene.add(pLight2);

    // Group for entire tree
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // 1. Central Core OS Node
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088aa,
      emissiveIntensity: 0.8,
      wireframe: false,
      roughness: 0.2,
      metalness: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    treeGroup.add(coreMesh);

    // Glowing wireframe ring around core
    const ringGeo = new THREE.TorusGeometry(2.4, 0.06, 16, 60);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.6 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    treeGroup.add(ringMesh);

    // Map skills to 3D sphere nodes arranged in branching galaxy spheres around core
    const nodeMeshes: { mesh: THREE.Mesh; ring: THREE.Mesh; skill: AgentSkill; archetype: string }[] = [];
    const archetypeColors: Record<string, number> = {
      Cognitive: 0x00d4ff,
      Tool: 0x3b82f6,
      Logic: 0xa855f7,
      Creativity: 0xec4899,
      Sensory: 0xf59e0b,
      Memory: 0x10b981,
      Action: 0xff3366,
      Security: 0xeab308,
      Default: 0x6366f1
    };

    const count = skills.length;
    skills.forEach((skill, i) => {
      const parsed = parseSkillMd(skill.content, skill.name, skill.description);
      const arch = parsed.archetype || "Default";
      const colHex = archetypeColors[arch] || archetypeColors.Default;

      // Calculate spherical coordinates with golden spiral distribution
      const phi = Math.acos(-1 + (2 * (i + 1)) / (count + 1));
      const theta = Math.sqrt((count + 1) * Math.PI) * phi;
      const radius = 6.5 + (i % 3) * 2.2;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const isSelected = selectedSkill?.id === skill.id;
      const size = isSelected ? 1.0 : skill.enabled ? 0.75 : 0.55;

      const nodeGeo = new THREE.SphereGeometry(size, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: colHex,
        emissive: colHex,
        emissiveIntensity: isSelected ? 1.0 : skill.enabled ? 0.5 : 0.15,
        roughness: 0.3,
        metalness: 0.6,
        transparent: !skill.enabled,
        opacity: skill.enabled ? 1.0 : 0.5
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { skill };
      treeGroup.add(nodeMesh);

      // Node ring
      const nRingGeo = new THREE.TorusGeometry(size * 1.5, 0.03, 8, 32);
      const nRingMat = new THREE.MeshBasicMaterial({
        color: colHex,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.3
      });
      const nRingMesh = new THREE.Mesh(nRingGeo, nRingMat);
      nRingMesh.position.set(x, y, z);
      treeGroup.add(nRingMesh);

      nodeMeshes.push({ mesh: nodeMesh, ring: nRingMesh, skill, archetype: arch });

      // Create connecting synapse line from Core (0,0,0) to Skill Node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x00ffff : colHex,
        transparent: true,
        opacity: isSelected ? 0.8 : skill.enabled ? 0.35 : 0.15
      });
      const line = new THREE.Line(lineGeo, lineMat);
      treeGroup.add(line);
    });

    // Particle Cloud
    const partCount = 400;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) {
      partPos[i] = (Math.random() - 0.5) * 35;
    }
    partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData && hit.userData.skill) {
          if (soundFxEnabled) {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(660, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
            } catch (_) {}
          }
          onSelectSkill(hit.userData.skill);
          // Gently rotate tree toward clicked node
          controls.autoRotate = false;
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("click", handleClick);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      treeGroup.rotation.y += 0.003;
      ringMesh.rotation.y -= 0.01;
      ringMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.3;

      nodeMeshes.forEach(({ mesh, ring, skill }) => {
        if (selectedSkill?.id === skill.id) {
          const scale = 1.0 + Math.sin(elapsed * 5) * 0.15;
          mesh.scale.set(scale, scale, scale);
          ring.rotation.x += 0.04;
          ring.rotation.y += 0.05;
        } else {
          ring.rotation.z += 0.01;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [skills, selectedSkill]);

  return (
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px] bg-slate-950/80 rounded-2xl border border-cyan-500/20 overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[11px] text-cyan-400 flex items-center gap-2 backdrop-blur-md">
        <Network className="w-3.5 h-3.5 animate-pulse" />
        <span>3D CONNECTED SKILL TREE // Click nodes to inspect</span>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none text-[10px] font-mono text-slate-400">
        • Drag to orbit • Scroll to zoom • Click glowing sphere nodes
      </div>
    </div>
  );
};

export const SkillsDashboardModal: React.FC<SkillsDashboardModalProps> = ({
  isOpen,
  onClose,
  agentSkills,
  onToggleSkill,
  onSelectSkillForChat,
  onTriggerNeuralBurst,
  soundFxEnabled
}) => {
  const [activeTab, setActiveTab] = useState<"tree" | "grid">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState<string>("ALL");
  const [selectedSkill, setSelectedSkill] = useState<AgentSkill | null>(null);
  const [detailTab, setDetailTab] = useState<"docs" | "source">("docs");
  const [copied, setCopied] = useState(false);

  const skillsList = useMemo(() => {
    const list = agentSkills && agentSkills.length > 0 ? agentSkills : FALLBACK_SKILLS;
    return list;
  }, [agentSkills]);

  // Asynchronously pre-warm and parse skills in background chunks via throttled queue without blocking UI thread
  useEffect(() => {
    skillsList.forEach((s) => {
      parseSkillMdAsync(s.content, s.name, s.description, s.category, s.usageCount).catch(() => {});
    });
  }, [skillsList]);

  // Set first skill selected by default
  useEffect(() => {
    if (skillsList.length > 0 && !selectedSkill) {
      setSelectedSkill(skillsList[0]);
    }
  }, [skillsList, selectedSkill]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skillsList.filter((s) => {
      const parsed = parseSkillMd(s.content, s.name, s.description, s.category, s.usageCount);
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parsed.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parsed.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchQuery) return false;

      if (selectedArchetype !== "ALL") {
        return parsed.category.toLowerCase() === selectedArchetype.toLowerCase() || parsed.archetype.toLowerCase() === selectedArchetype.toLowerCase();
      }
      return true;
    });
  }, [skillsList, searchQuery, selectedArchetype]);

  const parsedSelected = useMemo(() => {
    if (!selectedSkill) return null;
    return parseSkillMd(selectedSkill.content, selectedSkill.name, selectedSkill.description, selectedSkill.category, selectedSkill.usageCount);
  }, [selectedSkill]);

  const categories = useMemo(() => {
    const cats = new Set<string>(["ALL", "Core", "Analytical", "Utility", "Security"]);
    skillsList.forEach((s) => {
      const p = parseSkillMd(s.content, s.name, s.description, s.category, s.usageCount);
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [skillsList]);

  const { totalActivations, maxActivations } = useMemo(() => {
    let tot = 0;
    let max = 1;
    skillsList.forEach((s) => {
      const p = parseSkillMd(s.content, s.name, s.description, s.category, s.usageCount);
      const count = p.usageCount || 0;
      tot += count;
      if (count > max) max = count;
    });
    return { totalActivations: Math.max(1, tot), maxActivations: max };
  }, [skillsList]);

  if (!isOpen) return null;

  const handleCopySource = () => {
    if (!selectedSkill) return;
    navigator.clipboard.writeText(selectedSkill.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[95vh] sm:h-[90vh] bg-slate-900/90 border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-950/90 border-b border-white/10 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Cpu className="w-6 h-6 text-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg 2xl:text-xl font-bold font-mono tracking-wider text-white uppercase">
                  ⚡ AGENT SKILLS DASHBOARD // SKILLS.MD
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                  {skillsList.length} CONNECTED
                </span>
              </div>
              <p className="text-xs sm:text-sm 2xl:text-base text-slate-400 hidden sm:block">
                Parses SKILLS.md frontmatter, status, and custom logic definitions into an interactive neural tree & card grid.
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => setActiveTab("tree")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "tree"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D SKILL TREE</span>
              </button>
              <button
                onClick={() => setActiveTab("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "grid"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GRID CARDS</span>
              </button>
            </div>

            {onTriggerNeuralBurst && (
              <button
                onClick={onTriggerNeuralBurst}
                title="Simulate Neural Burst Transmission"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-mono text-xs font-bold uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
              >
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>BURST</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
              title="Close Dashboard"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filter Archetypes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-white/5 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills, definitions, functions, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 focus:border-cyan-400 text-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm font-mono outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedArchetype(cat)}
                className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
                  selectedArchetype === cat
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Split Body: Left/Top View (3D Tree or Grid) vs Right/Bottom Detail Panel */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* Left Panel: 3D Tree or Grid Cards */}
          <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
            {activeTab === "tree" ? (
              <div className="flex-1 flex flex-col min-h-[350px]">
                <SkillTree3D
                  skills={filteredSkills}
                  selectedSkill={selectedSkill}
                  onSelectSkill={(skill) => {
                    setSelectedSkill(skill);
                  }}
                  soundFxEnabled={soundFxEnabled}
                />
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">TOTAL SKILLS</span>
                    <span className="text-cyan-400 font-bold text-sm sm:text-base">{skillsList.length}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">ACTIVE SYNAPSES</span>
                    <span className="text-emerald-400 font-bold text-sm sm:text-base">{skillsList.filter(s => s.enabled).length}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">ARCHETYPES</span>
                    <span className="text-purple-400 font-bold text-sm sm:text-base">{new Set(skillsList.map(s => parseSkillMd(s.content, s.name, s.description).archetype)).size}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <span className="text-cyan-300 font-bold text-sm sm:text-base">ONLINE</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                {filteredSkills.map((skill) => {
                  const parsed = parseSkillMd(skill.content, skill.name, skill.description);
                  const isSelected = selectedSkill?.id === skill.id;

                  return (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-950/60 to-indigo-950/60 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.02]"
                          : "bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-900/90"
                      }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-transform">
                              <Dna className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-mono font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                                {skill.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-full inline-block">
                                  {parsed.category}
                                </span>
                                <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.5 rounded-full inline-block">
                                  {parsed.archetype}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleSkill) onToggleSkill(skill.id);
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all ${
                              skill.enabled
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                : "bg-slate-800 text-slate-400 border border-white/10 hover:border-white/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${skill.enabled ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                            <span>{skill.enabled ? "ENABLED" : "DISABLED"}</span>
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 my-2 font-sans">
                          {skill.description}
                        </p>

                        {/* Usage Tracking Progress Bar */}
                        <div className="mt-2 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                              <span>LLM EXECUTION ({Math.round((parsed.usageCount / totalActivations) * 100)}%)</span>
                            </span>
                            <span className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm">
                              {parsed.usageCount} CALLS
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                              style={{ width: `${Math.min(100, Math.max(6, Math.round((parsed.usageCount / maxActivations) * 100)))}%` }}
                            />
                          </div>
                        </div>

                        {/* Functions Preview */}
                        {parsed.functions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <span className="text-[10px] font-mono text-slate-400 block mb-1">FUNCTIONS ({parsed.functions.length}):</span>
                            <div className="flex flex-wrap gap-1">
                              {parsed.functions.slice(0, 2).map((fn, idx) => (
                                <span key={idx} className="text-[10px] font-mono bg-black/40 text-cyan-300 px-2 py-0.5 rounded border border-white/5 truncate max-w-[180px]">
                                  {fn}
                                </span>
                              ))}
                              {parsed.functions.length > 2 && (
                                <span className="text-[10px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                                  +{parsed.functions.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Action */}
                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Code className="w-3.5 h-3.5 text-indigo-400" />
                          v{parsed.version}
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                          Inspect Node <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Detailed Inspection & Custom Logic View */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col min-h-0 bg-slate-950/80 overflow-y-auto">
            {selectedSkill && parsedSelected ? (
              <div className="flex-1 flex flex-col p-4 sm:p-6">
                
                {/* Detail Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
                      <h3 className="text-base sm:text-lg 2xl:text-xl font-bold font-mono text-white tracking-wide uppercase">
                        {selectedSkill.name}
                      </h3>
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        {parsedSelected.archetype}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      {selectedSkill.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onToggleSkill) onToggleSkill(selectedSkill.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 border ${
                      selectedSkill.enabled
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "bg-slate-800 text-slate-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedSkill.enabled ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                    <span>{selectedSkill.enabled ? "ENABLED" : "DISABLED"}</span>
                  </button>
                </div>

                {/* Detail Sub-Tabs (Documentation vs Source Code) */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 font-mono text-xs">
                  <button
                    onClick={() => setDetailTab("docs")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                      detailTab === "docs"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>DOCUMENTATION & FUNCTIONS</span>
                  </button>
                  <button
                    onClick={() => setDetailTab("source")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                      detailTab === "source"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>SKILL.MD SOURCE</span>
                  </button>
                  <button
                    onClick={handleCopySource}
                    className="ml-auto p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1 text-[11px]"
                    title="Copy raw SKILL.md Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "COPIED!" : "COPY"}</span>
                  </button>
                </div>

                {/* Tab 1: Docs & Functions */}
                {detailTab === "docs" ? (
                  <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                    
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">VERSION</span>
                        <span className="text-white font-bold">{parsedSelected.version}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                        <span className="text-cyan-400 font-bold">{parsedSelected.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ARCHETYPE</span>
                        <span className="text-indigo-400 font-bold">{parsedSelected.archetype}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">EXEC COUNT</span>
                        <span className="text-emerald-400 font-bold">{parsedSelected.usageCount} CALLS</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">AUTHOR</span>
                        <span className="text-cyan-300 font-bold truncate block">{parsedSelected.author}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">UPDATED</span>
                        <span className="text-slate-300 font-bold">{selectedSkill.updatedAt || "2026-07-03"}</span>
                      </div>
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 font-mono">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>NEURAL LLM EXECUTION FREQUENCY ({Math.round((parsedSelected.usageCount / totalActivations) * 100)}% OF TOTAL)</span>
                        </span>
                        <span className="text-cyan-400 font-bold">{parsedSelected.usageCount} total executions</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                          style={{ width: `${Math.min(100, Math.max(6, Math.round((parsedSelected.usageCount / maxActivations) * 100)))}%` }}
                        />
                      </div>
                    </div>

                    {/* Extracted Functions List */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>AVAILABLE AGENT FUNCTIONS ({parsedSelected.functions.length})</span>
                      </h4>
                      {parsedSelected.functions.length > 0 ? (
                        <div className="space-y-2">
                          {parsedSelected.functions.map((fn, idx) => (
                            <div key={idx} className="bg-slate-900/90 border border-white/10 p-3 rounded-xl font-mono text-xs text-slate-200 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                <code className="text-cyan-300 font-semibold truncate">{fn}</code>
                              </div>
                              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded shrink-0 ml-2">FUNCTION</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 font-mono italic">
                          No explicit function signatures detected in frontmatter. Agent uses natural language instructions.
                        </div>
                      )}
                    </div>

                    {/* Custom Logic Definitions Preview */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>CUSTOM LOGIC & EXECUTION RULES</span>
                      </h4>
                      <div className="bg-slate-950 border border-indigo-500/30 p-4 rounded-2xl font-mono text-xs text-indigo-200 overflow-x-auto shadow-inner">
                        <pre className="whitespace-pre-wrap leading-relaxed">
                          {parsedSelected.customLogic || "# Standard neural activation protocol applied.\n# Refer to SKILL.md source tab for complete instructions."}
                        </pre>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          if (onSelectSkillForChat) {
                            onSelectSkillForChat(selectedSkill);
                            onClose();
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>SEND SKILL TO ACTIVE CORTEX CHAT</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Tab 2: Raw SKILL.md Source */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl flex-1 overflow-auto font-mono text-xs sm:text-sm text-slate-300 leading-relaxed shadow-inner">
                      <pre className="whitespace-pre-wrap">{selectedSkill.content}</pre>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono">
                <Cpu className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <p>Select a skill from the 3D tree or grid to inspect its functions and custom logic.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI STUDIO BUILD // UNIVERSAL FORM FACTOR OPTIMIZED (MOBILE · TABLET · DESKTOP · TV 4K)</span>
          </div>
          <div>
            <span>SYSTEM SKILLS ENGINE v3.5 // READY</span>
          </div>
        </div>

      </div>
    </div>
  );
};
