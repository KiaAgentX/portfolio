var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var PORT = Number(process.env.PORT) || 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.get("/api/rss/fetch", async (req, res) => {
    const feedUrl = req.query.url;
    if (!feedUrl) {
      return res.status(400).json({ error: "Missing feed URL query parameter" });
    }
    try {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      const ifModifiedSince = req.headers["if-modified-since"];
      if (ifModifiedSince) {
        headers["If-Modified-Since"] = ifModifiedSince;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e4);
      const response = await fetch(feedUrl, {
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.status === 304) {
        return res.status(304).end();
      }
      const responseHeaders = {};
      const lm = response.headers.get("last-modified") || response.headers.get("Last-Modified");
      if (lm) {
        responseHeaders["last-modified"] = lm;
      }
      const body = await response.text();
      res.json({
        status: response.status,
        headers: responseHeaders,
        body
      });
    } catch (err) {
      console.error(`CORS Proxy failed for url ${feedUrl}:`, err);
      res.status(500).json({ error: `Proxy fetch failed: ${err.message || err}` });
    }
  });
  app.post("/api/chat/deepseek", async (req, res) => {
    const { model, messages, stream } = req.body;
    const clientApiKey = req.headers["x-api-key"] || "";
    const deepseekKey = clientApiKey || process.env.DEEPSEEK_API_KEY;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (deepseekKey) {
      try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: model || "deepseek-v4-flash",
            messages,
            stream: stream !== false
          })
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(`DeepSeek API returned HTTP ${response.status}: ${errMsg}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Could not open DeepSeek stream reader");
        }
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          res.write(chunk);
        }
        res.end();
      } catch (err) {
        console.error("DeepSeek connection failed, attempting Gemini Fallback:", err);
        await runGeminiFallbackStream(ai, messages, res);
      }
    } else {
      console.log("No DeepSeek API key provided. Falling back to Gemini API...");
      await runGeminiFallbackStream(ai, messages, res);
    }
  });
  app.post("/api/images/process", async (req, res) => {
    const { prompt, image, aspectRatio, imageSize, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt parameter" });
    }
    try {
      const selectedModelName = model || "gemini-3.1-flash-image";
      let base64Data = "";
      let detectedMimeType = "";
      if (image && typeof image === "string" && image.includes(",")) {
        const parts = image.split(",");
        base64Data = parts[1] || parts[0];
        const match = image.match(/^data:([^;]+);/);
        detectedMimeType = match ? match[1] : "image/png";
      }
      const contentsParts = [];
      if (base64Data) {
        contentsParts.push({
          inlineData: {
            data: base64Data,
            mimeType: detectedMimeType
          }
        });
      }
      contentsParts.push({
        text: prompt
      });
      const config = {};
      if (selectedModelName.includes("image")) {
        config.imageConfig = {
          aspectRatio: aspectRatio || "1:1",
          imageSize: imageSize || "1K"
        };
      }
      console.log(`[\u{1F3A8} Image Process] Querying model ${selectedModelName} for prompt: "${prompt}"`);
      const response = await ai.models.generateContent({
        model: selectedModelName,
        contents: {
          parts: contentsParts
        },
        config
      });
      let base64Image = null;
      let textResponse = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
          } else if (part.text) {
            textResponse += part.text + "\n";
          }
        }
      }
      if (base64Image) {
        return res.json({
          success: true,
          image: `data:image/png;base64,${base64Image}`,
          text: textResponse.trim()
        });
      } else {
        return res.status(500).json({
          error: "The model completed successfully but did not return any image data.",
          details: textResponse.trim()
        });
      }
    } catch (err) {
      console.error("Image generation/editing failed:", err);
      res.status(500).json({
        error: `Image generation failed: ${err.message || err}`,
        details: err.stack
      });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[\u{1F680} SERVER ACTIVE] Running on http://localhost:${PORT}`);
  });
}
async function runGeminiFallbackStream(ai, messages, res) {
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: "You are an advanced cosmic artificial intelligence. Express yourself with scientific elegance, and explain complex threads inside markdown paragraphs."
      }
    });
    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (text) {
        const payload = {
          choices: [
            {
              delta: {
                content: text
              }
            }
          ]
        };
        res.write(`data: ${JSON.stringify(payload)}

`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Gemini fallback stream error:", err);
    res.write(`data: ${JSON.stringify({ error: `Fallback failed: ${err.message || err}` })}

`);
    res.end();
  }
}
startServer();
//# sourceMappingURL=server.cjs.map
