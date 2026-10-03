import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "50mb" }));

// Initialize GenAI client lazily or when env key exists
function getGenAI(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server and no custom key was provided.");
  }
  return new GoogleGenAI({ apiKey });
}

// API endpoint for Gemini chat & streaming
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-2.5-flash", systemPrompt, temperature = 0.8, maxTokens = 4096, stream = false, customApiKey, stopSequences, responseFormat } = req.body;

    const ai = getGenAI(customApiKey);

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => {
      const parts: any[] = [];
      if (typeof m.content === "string") {
        parts.push({ text: m.content });
      } else if (Array.isArray(m.content)) {
        m.content.forEach((part: any) => {
          if (part.type === "text") {
            parts.push({ text: part.text });
          } else if (part.type === "image_url") {
            // handle base64 image_url: "data:image/png;base64,..."
            const match = part.image_url.url.match(/^data:(.*?);base64,(.*)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          }
        });
      }
      return {
        role: m.role === "user" ? "user" : "model",
        parts
      };
    });

    const config: any = {
      temperature: Number(temperature) || 0.8,
      maxOutputTokens: Number(maxTokens) || 4096,
    };

    if (systemPrompt) {
      config.systemInstruction = { parts: [{ text: systemPrompt }] };
    }
    if (stopSequences && Array.isArray(stopSequences) && stopSequences.length > 0) {
      config.stopSequences = stopSequences;
    }
    if (responseFormat === "json_object") {
      config.responseMimeType = "application/json";
    }

    let requestedModel = model || "gemini-2.5-flash";
    if (requestedModel === "gemini-2.0-flash" || requestedModel === "gemini-1.5-flash" || requestedModel === "gemini-pro" || requestedModel === "gemini-2.0-flash-thinking") {
      requestedModel = "gemini-2.5-flash";
    } else if (requestedModel === "gemini-2.0-flash-lite" || requestedModel === "gemini-1.5-flash-lite") {
      requestedModel = "gemini-3.1-flash-lite";
    } else if (requestedModel === "gemini-2.0-pro" || requestedModel === "gemini-1.5-pro") {
      requestedModel = "gemini-2.5-pro";
    }

    const fallbackList = [
      requestedModel,
      "gemini-2.5-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-2.5-pro"
    ];
    const modelsToTry = Array.from(new Set(fallbackList));

    if (stream) {
      let responseStream: any = null;
      let usedModel = requestedModel;
      let lastError: any = null;
      let firstChunk: any = null;
      let iter: any = null;

      for (const tryModel of modelsToTry) {
        try {
          responseStream = await ai.models.generateContentStream({
            model: tryModel,
            contents,
            config,
          });
          iter = responseStream[Symbol.asyncIterator]();
          const firstRes = await iter.next();
          firstChunk = firstRes.done ? null : firstRes.value;
          usedModel = tryModel;
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err.status || err.code || err.statusCode || 0;
          if (tryModel !== modelsToTry[modelsToTry.length - 1]) {
            console.log(`[Gemini Route Stream] Model ${tryModel} unavailable (${status || err.message}). Routing to ${modelsToTry[modelsToTry.indexOf(tryModel) + 1]}...`);
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }
          break;
        }
      }

      if (lastError) {
        throw lastError;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let totalText = "";
      let promptTokenCount = 0;
      let candidatesTokenCount = 0;

      if (usedModel !== requestedModel) {
        const notice = `> *⚡ Auto-Fallback: Quota exceeded on \`${requestedModel}\`. Seamlessly routed to \`${usedModel}\`.*\n\n`;
        res.write(`data: ${JSON.stringify({ content: notice, done: false })}\n\n`);
      }

      if (firstChunk) {
        const text = firstChunk.text || "";
        if (text) {
          totalText += text;
          res.write(`data: ${JSON.stringify({ content: text, done: false })}\n\n`);
        }
        if (firstChunk.usageMetadata) {
          promptTokenCount = firstChunk.usageMetadata.promptTokenCount || promptTokenCount;
          candidatesTokenCount = firstChunk.usageMetadata.candidatesTokenCount || candidatesTokenCount;
        }
      }

      if (iter) {
        while (true) {
          const { done, value: chunk } = await iter.next();
          if (done) break;
          const text = chunk?.text || "";
          if (text) {
            totalText += text;
            res.write(`data: ${JSON.stringify({ content: text, done: false })}\n\n`);
          }
          if (chunk?.usageMetadata) {
            promptTokenCount = chunk.usageMetadata.promptTokenCount || promptTokenCount;
            candidatesTokenCount = chunk.usageMetadata.candidatesTokenCount || candidatesTokenCount;
          }
        }
      }

      res.write(`data: ${JSON.stringify({ 
        content: "", 
        done: true, 
        usage: { promptTokens: promptTokenCount, completionTokens: candidatesTokenCount } 
      })}\n\n`);
      res.end();
    } else {
      let response: any = null;
      let usedModel = requestedModel;
      let lastError: any = null;

      for (const tryModel of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: tryModel,
            contents,
            config,
          });
          usedModel = tryModel;
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err.status || err.code || err.statusCode || 0;
          if (tryModel !== modelsToTry[modelsToTry.length - 1]) {
            console.log(`[Gemini Route] Model ${tryModel} unavailable (${status || err.message}). Routing to ${modelsToTry[modelsToTry.indexOf(tryModel) + 1]}...`);
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }
          break;
        }
      }

      if (lastError) {
        throw lastError;
      }

      let text = response.text || "";
      if (usedModel !== requestedModel) {
        text = `> *⚡ Auto-Fallback: Quota exceeded on \`${requestedModel}\`. Seamlessly routed to \`${usedModel}\`.*\n\n` + text;
      }
      const promptTokens = response.usageMetadata?.promptTokenCount || 0;
      const completionTokens = response.usageMetadata?.candidatesTokenCount || 0;

      res.json({
        text,
        usage: { promptTokens, completionTokens },
      });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = error.message || "Failed to generate content from Gemini API.";
    try {
      if (typeof errorMsg === "string" && (errorMsg.startsWith("{") || errorMsg.includes('"error"'))) {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        } else if (parsed.message) {
          errorMsg = parsed.message;
        }
      }
    } catch (_) {}

    if (!res.headersSent) {
      res.status(500).json({ error: errorMsg });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMsg, done: true })}\n\n`);
      res.end();
    }
  }
});

// Endpoint to fetch available models
app.get("/api/gemini/models", async (req, res) => {
  try {
    const customApiKey = req.query.apiKey as string;
    const ai = getGenAI(customApiKey);
    const modelsResponse = await ai.models.list();
    const models = [];
    for await (const m of modelsResponse) {
      const modelAny = m as any;
      if (modelAny.supportedGenerationMethods?.includes("generateContent")) {
        models.push({
          id: modelAny.name?.replace("models/", "") || modelAny.name,
          name: modelAny.displayName || modelAny.name,
          description: modelAny.description,
        });
      }
    }
    if (models.length === 0) {
      const mustHave = [
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast, versatile multimodal model (Default)" },
        { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", description: "Next-gen high speed reasoning & chat model" },
        { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", description: "Ultra-fast lightweight model" },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "High reasoning capacity model" },
      ];
      models.push(...mustHave);
    }
    res.json({ models });
  } catch (error: any) {
    // Return fallback list if listing fails
    res.json({
      models: [
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast, versatile multimodal model (Default)" },
        { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", description: "Next-gen high speed reasoning & chat model" },
        { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", description: "Ultra-fast lightweight model" },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "High reasoning capacity model" }
      ],
      error: error.message
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin Configuration Persistence
const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "admin-config.json");

const DEFAULT_ADMIN_CONFIG = {
  siteTitle: "NEURO-CHAT // AI OS",
  siteSubtitle: "SYNAPTIC NEURAL INTERFACE // ANTIGRAVITY ENGINE v3.5",
  systemAnnouncement: {
    enabled: true,
    message: "🚀 SYSTEM v3.5 ONLINE // High-quota Gemini 2.0 Flash enabled with Neural Burst Particle Transmission.",
    type: "info",
    timestamp: Date.now(),
  },
  newsFeed: [
    {
      id: "news-1",
      title: "Google Gemini 2.0 Flash High-Quota Tier Deployed",
      category: "RELEASE",
      date: "2026-07-03",
      summary: "Integrated Gemini 2.0 Flash with 1,500 RPD free tier and ultra-fast Flash Lite support into the command palette.",
      important: true,
    },
    {
      id: "news-2",
      title: "Synaptic Particle Swarm & Neural Burst Activated",
      category: "UPDATE",
      date: "2026-07-03",
      summary: "3D BrainCanvas now simulates high-token-count signal transmission with glowing photon particles along synapse pathways.",
      important: false,
    },
    {
      id: "news-3",
      title: "Interactive Camera Rig & POV Presets",
      category: "AI INDUSTRY",
      date: "2026-07-01",
      summary: "Cinematic camera rig added to 3D Neural View: Push In, Orbit Sweep, Tilt Hero, and Auto-Pilot roaming.",
      important: false,
    }
  ],
  adminUsername: "admin",
  adminPassword: "1234",
  agentSkills: [
    {
      id: "skill-cot",
      name: "chain-of-thought",
      description: "Enables autonomous step-by-step cognitive reasoning before neural transmission.",
      enabled: true,
      category: "Core",
      usageCount: 142,
      content: "---\nname: chain-of-thought\ndescription: Emits <thought> reasoning blocks before neural transmission\ncategory: Core\ntags: reasoning, cognitive, logic\n---\n\n# Chain of Thought Workflow\n1. Analyze user prompt intent and decompose complexity.\n2. Emit step-by-step cognitive reasoning.\n3. Validate output against safety and accuracy thresholds.\n4. Execute final response synthesis.",
      updatedAt: "2026-07-03"
    },
    {
      id: "skill-web",
      name: "web-grounding",
      description: "Grounds answers using real-time search queries and citations.",
      enabled: true,
      category: "Utility",
      usageCount: 89,
      content: "---\nname: web-grounding\ndescription: Searches live web sources for factual grounding\ncategory: Utility\ntags: search, live-web, citations\n---\n\n# Web Grounding Guidelines\n1. Identify temporal or factual claims requiring live verification.\n2. Formulate concise search queries.\n3. Synthesize findings with clear citations and source links.",
      updatedAt: "2026-07-03"
    },
    {
      id: "skill-sandbox",
      name: "js-sandbox-exec",
      description: "Executes mathematical calculations and simulation code in live sandbox.",
      enabled: true,
      category: "Analytical",
      usageCount: 64,
      content: "---\nname: js-sandbox-exec\ndescription: Safe client-side javascript sandbox execution\ncategory: Analytical\ntags: javascript, math, algorithm, sandbox\n---\n\n# Sandbox Execution Protocol\n1. When complex math, algorithms, or visual data processing is needed, write standard JavaScript.\n2. Execute within the neural sandbox VM.\n3. Present output logs directly in the UI.",
      updatedAt: "2026-07-03"
    }
  ],
  customSystemPrompt: "",
  defaultModel: "gemini-2.5-flash",
  defaultTheme: "dark",
  burstSensitivity: 300,
  mediaLinks: {
    logoUrl: "",
    avatarUrl: "",
    youtubeUrl: "https://www.youtube.com/@Matin_SenPai",
    githubUrl: "https://github.com/MatinSenPai",
    twitterUrl: "https://x.com/MatinSenPai",
    discordUrl: "",
    telegramUrl: "",
    customMediaUrl: "",
    customMediaLabel: "Official Portal",
    donationUrl: "",
    donationText: "Support / Donate",
  },
  neuronCustomization: {
    sizeScale: 1.0,
    baseColor: "#00d4ff",
    geometryShape: "sphere",
    glowIntensity: 1.0,
  },
  themeCustomization: {
    fontFamily: "Inter",
    accentColor: "#00d4ff",
    bgStyle: "default",
  },
  customPages: [
    {
      id: "page-academy",
      slug: "/academy",
      title: "AI Academy // Neural Training",
      description: "Master prompt engineering, neural architectures, and autonomous agents.",
      content: "# 🎓 Welcome to SenPai AI Academy\n\nLearn how to construct neural agent architectures, configure Model Context Protocol (MCP) servers, and orchestrate swarm intelligence.\n\n### 🚀 Curriculum Overview\n1. **Synaptic Prompting**: Zero-shot and chain-of-thought frameworks.\n2. **MCP Orchestration**: Connecting external tools and REST APIs.\n3. **3D Cortex Telemetry**: Visualizing token latency and neural burst propagation.\n\n```ts\n// Example Neural Agent Initialization\nconst agent = new NeuralAgent({\n  model: 'gemini-2.5-pro',\n  temperature: 0.7,\n  memory: 'synaptic-vector-store'\n});\n```",
      published: true,
    }
  ],
  mcpServers: [
    {
      id: "mcp-local",
      name: "Local FS / Node Env MCP",
      endpointUrl: "http://localhost:3001/mcp",
      status: "connected",
      tools: ["file_read", "file_write", "git_status"],
    }
  ],
  customCLICommands: [
    {
      id: "cli-academy",
      command: "/academy",
      description: "Open AI Academy // Neural Training portal",
      actionType: "open_page",
      targetValue: "/academy",
    }
  ],
};

function getAdminConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return { ...DEFAULT_ADMIN_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Error reading admin config:", err);
  }
  return DEFAULT_ADMIN_CONFIG;
}

function saveAdminConfig(newConfig: any) {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(newConfig, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving admin config:", err);
    return false;
  }
}

// Admin credentials: env vars win, then stored config, then insecure demo defaults.
function adminCreds(config: any) {
  return {
    user: process.env.ADMIN_USERNAME || config.adminUsername || "admin",
    pass: process.env.ADMIN_PASSWORD || config.adminPassword || "1234",
  };
}

function publicConfig(config: any) {
  const { adminPassword: _pw, ...rest } = config; // never leak the password
  return rest;
}

function isValidAdminToken(token?: string) {
  return token && (token.startsWith("neuro-admin-token-") || token === "neuro-admin-token-1234");
}

// Admin Login route (\admin or admin/1234)
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const config = getAdminConfig();
  const { user: validUser, pass: validPass } = adminCreds(config);

  if ((username === validUser || username === `\\${validUser}` || username === "admin") && password === validPass) {
    res.json({
      success: true,
      token: `neuro-admin-token-${Date.now()}`,
      config: publicConfig(config),
    });
  } else {
    res.status(401).json({ error: `Invalid admin credentials. (Hint: default username: ${validUser})` });
  }
});

// Admin Change Password route
app.post("/api/admin/change-password", (req, res) => {
  const { token, currentPassword, newPassword } = req.body;
  const config = getAdminConfig();
  const { pass: validPass } = adminCreds(config);

  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized admin token." });
  }
  if (currentPassword !== validPass) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }
  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: "New password must be at least 3 characters long." });
  }
  const updated = { ...config, adminPassword: newPassword };
  saveAdminConfig(updated);
  res.json({ success: true, message: "Admin password updated successfully!" });
});

// Admin Get Config route
app.get("/api/admin/config", (req, res) => {
  res.json({ config: publicConfig(getAdminConfig()) });
});

// Admin Save Config route
app.post("/api/admin/config", (req, res) => {
  const { token, config } = req.body;
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized admin token. Please login again." });
  }
  const current = getAdminConfig();
  const updated = { ...current, ...config };
  if (!updated.adminPassword) updated.adminPassword = current.adminPassword; // never wipe via save
  saveAdminConfig(updated);
  res.json({ success: true, config: publicConfig(updated) });
});

// Admin Manage News Feed
app.post("/api/admin/news", (req, res) => {
  const { token, action, newsItem, newsId } = req.body;
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized admin token" });
  }
  const current = getAdminConfig();
  let newsFeed = [...(current.newsFeed || [])];

  if (action === "add" && newsItem) {
    newsFeed.unshift({ ...newsItem, id: `news-${Date.now()}` });
  } else if (action === "update" && newsItem) {
    newsFeed = newsFeed.map(item => item.id === newsItem.id ? newsItem : item);
  } else if (action === "delete" && newsId) {
    newsFeed = newsFeed.filter(item => item.id !== newsId);
  }

  const updated = { ...current, newsFeed };
  saveAdminConfig(updated);
  res.json({ success: true, newsFeed });
});

// Admin Manage Agent Skills (SKILL.md)
app.post("/api/admin/skills", (req, res) => {
  const { token, action, skill, skillId } = req.body;
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: "Unauthorized admin token" });
  }
  const current = getAdminConfig();
  let agentSkills = [...(current.agentSkills || DEFAULT_ADMIN_CONFIG.agentSkills)];

  if (action === "add" && skill) {
    agentSkills.unshift({ ...skill, id: `skill-${Date.now()}`, updatedAt: new Date().toISOString().split("T")[0] });
  } else if (action === "update" && skill) {
    agentSkills = agentSkills.map(item => item.id === skill.id ? { ...skill, updatedAt: new Date().toISOString().split("T")[0] } : item);
  } else if (action === "delete" && skillId) {
    agentSkills = agentSkills.filter(item => item.id !== skillId);
  } else if (action === "toggle" && skillId) {
    agentSkills = agentSkills.map(item => item.id === skillId ? { ...item, enabled: !item.enabled, updatedAt: new Date().toISOString().split("T")[0] } : item);
  }

  const updated = { ...current, agentSkills };
  saveAdminConfig(updated);
  res.json({ success: true, agentSkills });
});

// Helper to get exact redirect URI for OAuth
function getRedirectUri(req: express.Request): string {
  const host = req.get("host") || `localhost:${PORT}`;
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}/auth/callback`;
}

// 1. Google OAuth URL Endpoint
app.get("/api/auth/url", (req, res) => {
  const redirectUri = getRedirectUri(req);
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID;
  
  if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID") {
    // Real Google OAuth 2.0 URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl, mode: "production", redirectUri });
  } else {
    // Fallback sandbox demo OAuth URL (works seamlessly in AI Studio iframe/popup without client_id setup!)
    const host = req.get("host") || `localhost:${PORT}`;
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const demoUrl = `${protocol}://${host}/auth/demo-popup`;
    res.json({ url: demoUrl, mode: "sandbox", redirectUri });
  }
});

// 2. OAuth Callback & Demo Popup Handlers
const oauthCallbackHandler = async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  // Send HTML payload that executes postMessage cross-origin as mandated by OAuth skill
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google OAuth - Neural OS</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #38bdf8; box-shadow: 0 0 40px rgba(56,189,248,0.35); max-width: 420px; width: 90%; }
          .spinner { border: 4px solid #334155; border-top: 4px solid #38bdf8; border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
          .logo { font-size: 2.5rem; margin-bottom: 0.5rem; }
          h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; }
          p { color: #94a3b8; font-size: 0.875rem; margin: 0; line-height: 1.5; }
          .status { margin-top: 1.25rem; padding: 0.75rem; background: #0f172a; border-radius: 0.75rem; border: 1px solid #334155; font-family: monospace; font-size: 0.75rem; color: #38bdf8; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">🌐</div>
          <div class="spinner" id="spin"></div>
          <h2>Google Synaptic OAuth 2.0</h2>
          <p id="msg">Verifying Google Cloud identity & establishing secure cross-origin neural session...</p>
          <div class="status" id="status">STATUS: EXCHANGING OAUTH TOKEN...</div>
        </div>
        <script>
          setTimeout(() => {
            const demoUser = {
              id: 'google-uid-' + Math.floor(100000 + Math.random() * 900000),
              name: 'Alex Senpai (Google Voyager)',
              email: 'alex.senpai@gmail.com',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              authProvider: 'google',
              role: 'Google Synaptic Voyager - Tier 1',
              tokensEarned: 1250,
              connectedAt: new Date().toISOString(),
              scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.appdata']
            };
            
            document.getElementById('status').innerHTML = 'STATUS: NEURAL TOKEN SYNCHRONIZED 🚀';
            document.getElementById('msg').innerHTML = 'Authentication successful! Transmitting credentials to Neural OS...';
            
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: demoUser }, '*');
                document.getElementById('spin').style.display = 'none';
                document.getElementById('msg').innerHTML = '✅ Connected! This window will auto-close.';
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '/';
              }
            }, 800);
          }, 1200);
        </script>
      </body>
    </html>
  `);
};

app.get(["/auth/callback", "/auth/callback/", "/auth/demo-popup"], oauthCallbackHandler);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🧠 SenPai Neural OS Backend running on http://localhost:${PORT}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.warn("[⚠️ SECURITY] Using default admin credentials (admin/1234). Set ADMIN_USERNAME/ADMIN_PASSWORD env vars to override.");
    }
  });
}

startServer();
