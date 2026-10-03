// File: server.ts

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini API client on the server as fallback
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API 1: RSS Feed CORS-bypass Proxy with If-Modified-Since support
  app.get('/api/rss/fetch', async (req, res) => {
    const feedUrl = req.query.url as string;
    if (!feedUrl) {
      return res.status(400).json({ error: 'Missing feed URL query parameter' });
    }

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince) {
        headers['If-Modified-Since'] = ifModifiedSince as string;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(feedUrl, {
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 304) {
        return res.status(304).end();
      }

      const responseHeaders: Record<string, string> = {};
      const lm = response.headers.get('last-modified') || response.headers.get('Last-Modified');
      if (lm) {
        responseHeaders['last-modified'] = lm;
      }

      const body = await response.text();
      res.json({
        status: response.status,
        headers: responseHeaders,
        body
      });
    } catch (err: any) {
      console.error(`CORS Proxy failed for url ${feedUrl}:`, err);
      res.status(500).json({ error: `Proxy fetch failed: ${err.message || err}` });
    }
  });

  // API 2: DeepSeek V4 Streaming proxy with Gemini Fallback
  app.post('/api/chat/deepseek', async (req, res) => {
    const { model, messages, stream } = req.body;
    const clientApiKey = req.headers['x-api-key'] || '';

    // Choose key: Client key, then env DeepSeek key
    const deepseekKey = clientApiKey || process.env.DEEPSEEK_API_KEY;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (deepseekKey) {
      // 1. If we have a DeepSeek key, use real DeepSeek API stream!
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: model || 'deepseek-v4-flash',
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
          throw new Error('Could not open DeepSeek stream reader');
        }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          res.write(chunk);
        }
        res.end();
      } catch (err: any) {
        console.error('DeepSeek connection failed, attempting Gemini Fallback:', err);
        // Fall back to Gemini API gracefully to keep client fully operational!
        await runGeminiFallbackStream(ai, messages, res);
      }
    } else {
      // 2. If no DeepSeek key is found, seamlessly fall back to server-side Gemini!
      console.log('No DeepSeek API key provided. Falling back to Gemini API...');
      await runGeminiFallbackStream(ai, messages, res);
    }
  });

  // API 3: Create & Edit Images using gemini-3.1-flash-image
  app.post('/api/images/process', async (req, res) => {
    const { prompt, image, aspectRatio, imageSize, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    try {
      const selectedModelName = model || 'gemini-3.1-flash-image';
      
      let base64Data = '';
      let detectedMimeType = '';
      if (image && typeof image === 'string' && image.includes(',')) {
        const parts = image.split(',');
        base64Data = parts[1] || parts[0];
        const match = image.match(/^data:([^;]+);/);
        detectedMimeType = match ? match[1] : 'image/png';
      }

      const contentsParts: any[] = [];
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

      const config: any = {};
      if (selectedModelName.includes('image')) {
        config.imageConfig = {
          aspectRatio: aspectRatio || "1:1",
          imageSize: imageSize || "1K"
        };
      }

      console.log(`[🎨 Image Process] Querying model ${selectedModelName} for prompt: "${prompt}"`);
      const response = await ai.models.generateContent({
        model: selectedModelName,
        contents: {
          parts: contentsParts
        },
        config
      });

      let base64Image = null;
      let textResponse = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
          } else if (part.text) {
            textResponse += part.text + '\n';
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
          error: 'The model completed successfully but did not return any image data.',
          details: textResponse.trim()
        });
      }
    } catch (err: any) {
      console.error('Image generation/editing failed:', err);
      res.status(500).json({
        error: `Image generation failed: ${err.message || err}`,
        details: err.stack
      });
    }
  });

  // Support health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for assets rendering & hot-module updates in Dev Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[🚀 SERVER ACTIVE] Running on http://localhost:${PORT}`);
  });
}

// Seamless Gemini fallback streaming
async function runGeminiFallbackStream(ai: GoogleGenAI, messages: any[], res: express.Response) {
  try {
    // Translate standard OpenAI format to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Start Gemini streaming call
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: 'You are an advanced cosmic artificial intelligence. Express yourself with scientific elegance, and explain complex threads inside markdown paragraphs.'
      }
    });

    for await (const chunk of stream) {
      const text = chunk.text || '';
      if (text) {
        // Construct the SSE chunk in standard OpenAI structure
        const payload = {
          choices: [
            {
              delta: {
                content: text
              }
            }
          ]
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Gemini fallback stream error:', err);
    res.write(`data: ${JSON.stringify({ error: `Fallback failed: ${err.message || err}` })}\n\n`);
    res.end();
  }
}

startServer();
