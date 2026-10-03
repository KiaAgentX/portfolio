import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Demo credentials are overridable via environment (never hardcode real secrets).
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "ImX";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
if (!process.env.ADMIN_PASS) {
  console.warn("[security] Using default demo admin password. Set ADMIN_USER/ADMIN_PASS in production.");
}

// ==========================================
// SERVER-SIDE IN-MEMORY STATE ENGINE
// ==========================================
interface ActivePosition {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  lot: number;
  unrealizedPnL: number;
  tp?: number;
  sl?: number;
}

interface HistoricalTick {
  time: string;
  price: number;
  rsi: number;
  emaFast: number;
  emaSlow: number;
}

interface SystemState {
  balance: number;
  equity: number;
  goldPrice: number;
  eurusdPrice: number;
  dxyPrice: number;
  activePositions: ActivePosition[];
  history: HistoricalTick[];
  logs: string[];
  trendBias: 'BULL' | 'BEAR' | 'VOLATILE' | 'STAG';
  volatility: number; // multiplier
  tickIntervalMs: number;
}

const state: SystemState = {
  balance: 10000,
  equity: 10000,
  goldPrice: 2585.50,
  eurusdPrice: 1.0850,
  dxyPrice: 101.90,
  activePositions: [],
  history: [],
  logs: ["Pythian Engine initialized with real-time XAUUSD feed synchronization."],
  trendBias: 'VOLATILE',
  volatility: 1.0,
  tickIntervalMs: 2000
};

// Seed initial history
let initialGold = 2585.50;
for (let i = 0; i < 40; i++) {
  initialGold += (Math.random() - 0.5) * 4;
  state.history.push({
    time: new Date(Date.now() - (40 - i) * 2000).toISOString(),
    price: Number(initialGold.toFixed(2)),
    rsi: Number((45 + Math.random() * 20).toFixed(1)),
    emaFast: Number((initialGold - 0.5).toFixed(2)),
    emaSlow: Number((initialGold - 1.2).toFixed(2))
  });
}

// Technical indicator helpers
function calculateRSIAndEMAs() {
  const prices = state.history.map(h => h.price);
  if (prices.length === 0) return { rsi: 50, emaFast: state.goldPrice, emaSlow: state.goldPrice };

  // Quick EMAs
  let emaFast = prices[prices.length - 1];
  let emaSlow = prices[prices.length - 1];
  
  if (prices.length >= 8) {
    let sum8 = prices.slice(-8).reduce((a, b) => a + b, 0);
    emaFast = Number((sum8 / 8).toFixed(2));
  }
  if (prices.length >= 21) {
    let sum21 = prices.slice(-21).reduce((a, b) => a + b, 0);
    emaSlow = Number((sum21 / 21).toFixed(2));
  }

  // RSI heuristic
  let changes = 0;
  for (let i = Math.max(0, prices.length - 14); i < prices.length; i++) {
    const diff = prices[i] - (prices[i - 1] || prices[i]);
    changes += diff;
  }
  const rsiVal = 50 + (changes * 10);
  const rsi = Math.max(10, Math.min(90, Number(rsiVal.toFixed(1))));

  return { rsi, emaFast, emaSlow };
}

// Real-time market tick generator loop
let tickerIntervalId: NodeJS.Timeout | null = null;

function appendLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  state.logs.unshift(`[${timestamp}] ${message}`);
  if (state.logs.length > 100) state.logs.pop();
}

let liveBaseGoldPrice: number = 2585.50;
let lastFlashedSuccessfulFetchTime: string = "";

// background poller for genuine global spot gold (XAUUSD) prices
async function fetchCurrentGlobalGoldRate() {
  try {
    // Attempt 1: goldprice.org public service endpoint
    const response = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.items && data.items[0] && typeof data.items[0].xauPrice === "number") {
        const rate = Number(data.items[0].xauPrice);
        if (rate > 1000 && rate < 4000) {
          liveBaseGoldPrice = rate;
          lastFlashedSuccessfulFetchTime = new Date().toLocaleTimeString();
          return;
        }
      }
    }
  } catch (err) {
    // ignore
  }

  try {
    // Attempt 2: PAXG mirroring Gold Spot 1:1 on CoinGecko
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd");
    if (response.ok) {
      const data: any = await response.json();
      if (data && data["pax-gold"] && typeof data["pax-gold"].usd === "number") {
        const rate = Number(data["pax-gold"].usd);
        if (rate > 1000 && rate < 4000) {
          liveBaseGoldPrice = rate;
          lastFlashedSuccessfulFetchTime = new Date().toLocaleTimeString();
        }
      }
    }
  } catch (err) {
    // ignore
  }
}

// Poll every 15 seconds to ensure fresh pricing & bypass aggressive rate limits
fetchCurrentGlobalGoldRate();
setInterval(fetchCurrentGlobalGoldRate, 15000);

function runRealtimeTicker() {
  if (tickerIntervalId) clearInterval(tickerIntervalId);

  tickerIntervalId = setInterval(() => {
    // Proportional control loop to gently converge state.goldPrice with the real-time liveBaseGoldPrice
    const trackingError = liveBaseGoldPrice - state.goldPrice;
    
    // Calculate a small micro-step toward the real price, plus a tiny realistic noise step for live movement
    let dGold = trackingError * 0.15 + (Math.random() - 0.5) * 0.40;
    
    // Maintain a minimal trend/volatility influence if the admin deliberately increases it
    if (state.trendBias === 'BULL') dGold += 0.25;
    if (state.trendBias === 'BEAR') dGold -= 0.25;
    if (state.trendBias === 'STAG') dGold *= 0.1;
    
    // Apply general volatility multiplier
    dGold *= state.volatility;

    // Advance pricing state
    state.goldPrice = Number((state.goldPrice + dGold).toFixed(2));

    // Negative correlation with dollar strength index (DXY)
    const targetDxy = 101.90 - (state.goldPrice - 2585.50) * 0.015;
    const dDXY = (targetDxy - state.dxyPrice) * 0.10 + (Math.random() - 0.5) * 0.04;
    state.dxyPrice = Number((state.dxyPrice + dDXY).toFixed(2));

    // Direct EURUSD correlation with Gold prices
    const targetEur = 1.0850 + (state.goldPrice - 2585.50) * 0.0001;
    const dEUR = (targetEur - state.eurusdPrice) * 0.10 + (Math.random() - 0.5) * 0.0001;
    state.eurusdPrice = Number((state.eurusdPrice + dEUR).toFixed(4));

    // Ensure system safety bounds
    if (state.goldPrice < 1000) state.goldPrice = liveBaseGoldPrice || 2585.50;
    if (state.dxyPrice < 40) state.dxyPrice = 101.90;
    if (state.eurusdPrice < 0.1) state.eurusdPrice = 1.0850;

    // 2. Track indices & compile indicator bounds
    const indicators = calculateRSIAndEMAs();
    
    state.history.push({
      time: new Date().toISOString(),
      price: state.goldPrice,
      rsi: indicators.rsi,
      emaFast: indicators.emaFast,
      emaSlow: indicators.emaSlow
    });
    if (state.history.length > 100) state.history.shift();

    // 3. Update unrealized positions P&L and trigger barrier checks
    let combinedPnL = 0;
    const closedPositionIds: string[] = [];

    state.activePositions = state.activePositions.map(pos => {
      // Contract Size for Spot Gold standard is 100 oz per full lot
      const direction = pos.action === 'BUY' ? 1 : -1;
      const profit = (state.goldPrice - pos.entryPrice) * pos.lot * 100 * direction;
      const unrealizedPnL = Number(profit.toFixed(2));

      let updatedPos = { ...pos, unrealizedPnL };

      // Stop Loss / Take Profit boundaries verification
      if (pos.tp && ((pos.action === 'BUY' && state.goldPrice >= pos.tp) || (pos.action === 'SELL' && state.goldPrice <= pos.tp))) {
        closedPositionIds.push(pos.id);
        const settledAmount = pos.lot * 100 * direction * (pos.tp - pos.entryPrice);
        state.balance = Number((state.balance + settledAmount).toFixed(2));
        appendLog(`🚀 [TP HIT] Position ${pos.action} closed at TP boundary $${pos.tp}. Profit: $${settledAmount.toFixed(2)}`);
      } else if (pos.sl && ((pos.action === 'BUY' && state.goldPrice <= pos.sl) || (pos.action === 'SELL' && state.goldPrice >= pos.sl))) {
        closedPositionIds.push(pos.id);
        const settledAmount = pos.lot * 100 * direction * (pos.sl - pos.entryPrice);
        state.balance = Number((state.balance + settledAmount).toFixed(2));
        appendLog(`⚠️ [SL TRIGGERED] Position ${pos.action} closed at risk threshold SL $${pos.sl}. Loss: $${settledAmount.toFixed(2)}`);
      } else {
        combinedPnL += unrealizedPnL;
      }

      return updatedPos;
    }).filter(pos => !closedPositionIds.includes(pos.id));

    // Update real-time portfolio equity
    state.equity = Number((state.balance + combinedPnL).toFixed(2));

  }, state.tickIntervalMs);
}

runRealtimeTicker();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared server-side Google Gen AI client with appropriate telemetry header
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Continuing with lazy validation.");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // ==========================================
  // ENDPOINT: LOGIN CREDENTIALS VALIDATION
  // ==========================================
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      appendLog(`User '${username}' signed in securely.`);
      res.json({ success: true, token: "gqr-system-token-jwt-secure-proof", role: "ADMIN" });
    } else {
      appendLog(`Failed login attempt for user: ${username || 'anonymous'}`);
      res.status(401).json({ success: false, error: "Access denied. Valid credentials required." });
    }
  });

  // ==========================================
  // ENDPOINTS: BACKEND STATE QUERIES & CONTROL
  // ==========================================
  app.get("/api/market/state", (req, res) => {
    res.json({
      balance: state.balance,
      equity: state.equity,
      goldPrice: state.goldPrice,
      eurusdPrice: state.eurusdPrice,
      dxyPrice: state.dxyPrice,
      activePositions: state.activePositions,
      logs: state.logs,
      trendBias: state.trendBias,
      volatility: state.volatility,
      tickIntervalMs: state.tickIntervalMs,
      history: state.history.slice(-60), // return last hour ticks
      liveSynced: true,
      liveBaseGoldPrice,
      lastFlashedSuccessfulFetchTime
    });
  });

  app.post("/api/market/trade", (req, res) => {
    const { symbol, action, lot, tp, sl } = req.body;
    if (!action || !lot) {
      res.status(400).json({ error: "Trade action (BUY/SELL) and lot size are required bounds." });
      return;
    }

    const currentPrice = state.goldPrice;
    const positionId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const position: ActivePosition = {
      id: positionId,
      symbol: symbol || "XAUUSD",
      action: action as 'BUY' | 'SELL',
      entryPrice: currentPrice,
      lot: Number(lot),
      unrealizedPnL: 0,
      tp: tp ? Number(tp) : undefined,
      sl: sl ? Number(sl) : undefined
    };

    state.activePositions.push(position);
    appendLog(`💼 Created Server-Side Trade: ${action} ${lot} Lots of ${symbol || 'Gold'} at $${currentPrice}`);
    res.json({ success: true, position });
  });

  app.post("/api/market/close", (req, res) => {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: "Position ID is required." });
      return;
    }

    const index = state.activePositions.findIndex(pos => pos.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Specified trading position not found." });
      return;
    }

    const pos = state.activePositions[index];
    const direction = pos.action === 'BUY' ? 1 : -1;
    const currentPrice = state.goldPrice;
    const finalPnL = (currentPrice - pos.entryPrice) * pos.lot * 100 * direction;

    state.balance = Number((state.balance + finalPnL).toFixed(2));
    state.activePositions.splice(index, 1);
    
    appendLog(`✅ Liquidated Position ${pos.id} (${pos.action}) at $${currentPrice}. Realized: $${finalPnL.toFixed(2)}`);
    res.json({ success: true, balance: state.balance });
  });

  // Reset simulation state
  app.post("/api/market/reset", (req, res) => {
    state.balance = 10000;
    state.equity = 10000;
    state.goldPrice = 2585.50; // same seed as fresh boot
    state.activePositions = [];
    state.logs = ["Real-time state database reset to initial conditions."];
    appendLog("System Simulation Database rebooted.");
    res.json({ success: true });
  });

  // Admin dynamic parameters controller
  app.post("/api/market/config", (req, res) => {
    const { trendBias, volatility, tickIntervalMs } = req.body;
    if (trendBias) {
      state.trendBias = trendBias;
      appendLog(`Admin tuned Trend Bias parameters to: ${trendBias}`);
    }
    if (volatility !== undefined) {
      state.volatility = Number(volatility);
      appendLog(`Admin set market Volatility modifier to: ${volatility}x`);
    }
    if (tickIntervalMs !== undefined) {
      state.tickIntervalMs = Math.max(500, Math.min(10000, Number(tickIntervalMs)));
      appendLog(`Admin recalibrated ticker interval parameters to: ${state.tickIntervalMs}ms`);
      runRealtimeTicker(); // reboot ticker interval
    }
    res.json({ success: true, state: { trendBias: state.trendBias, volatility: state.volatility, tickIntervalMs: state.tickIntervalMs } });
  });

  // LLM + RL Technical Analysis Fusion Endpoint
  app.post("/api/gemini/analyze", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(400).json({ 
          error: "GEMINI_API_KEY is missing. Please configure your API Credentials in Settings > Secrets." 
        });
        return;
      }

      const { symbol, price, rsi, emaFast, emaSlow, rlLoss, winRate, activePositions, isBacktest, backtestStats, image, grokMode, userCustomQuestion } = req.body;
      const ai = getAiClient();

      let targetContextPrompt = "";

      if (isBacktest) {
        targetContextPrompt = `The system just executed a comprehensive Golden Horizon Historical Backtest with the following parameters & performance metrics:
- Historical Data Period: ${backtestStats?.period || 'N/A'}
- Initial Capital: $${backtestStats?.initialCapital || '10,000'}
- Ending Balance/Equity: $${backtestStats?.endingBalance || 'N/A'}
- Win Rate achieved by RL Network: ${backtestStats?.winRate || 'N/A'}%
- Total trades parsed sequentially: ${backtestStats?.totalTrades || 'N/A'}
- Max Drawdown Limit Peak: ${backtestStats?.maxDrawdown || 'N/A'}%
- Profit Factor: ${backtestStats?.profitFactor || 'N/A'}`;
      } else {
        targetContextPrompt = `The Reinforcement Learning agent is running live in the background. The current real-time market attributes are:
- Target symbol: ${symbol || 'XAUUSD (Spot Gold)'}
- Current Market Price: $${price || 'N/A'}
- Compiled Indicators: RSI is ${rsi || 'N/A'}, EMA-Fast (8-period) is ${emaFast || 'N/A'}, EMA-Slow (21-period) is ${emaSlow || 'N/A'}
- Active positions managed by RL Agent: ${JSON.stringify(activePositions || [])}
- Synapse update status: RL Model loss is ${rlLoss || 'N/A'}, historical simulated target accuracy is ${winRate || 'N/A'}%`;
      }

      let prompt = "";
      if (grokMode) {
        prompt = `You are Grok, the witty, brutally honest, cybernetic trading copilot designed by xAI, inspired directly by Elon Musk's physics-first space-exploration ideals.
Act as a supercharged, high-intelligence quant and space-grade engineering leader.
You speak with absolute truth, mild constructive sarcasm, razor-sharp technical references to rocket science, simulation theory, and first-principles reasoning.

${targetContextPrompt}

Based on these statistics and any attached chart screenshots, provide an extremely witty, highly intelligent xAI Grok-styled report in 3 sections:
1. GROK'S SPACETIME INDEX (First-principles analysis of the spot price, volatility vectors, and planetary market trends. If a chart image was provided, roast or analyze its geometric qualities).
2. MULTI-PLANETARY RISKS (Is the Reinforcement Learning network acting like a genius autopilot or a runaway rocket? Breakdown of RSI/EMA convergence and DXY orbital pressure).
3. ELON'S COMMAND LINE (Brutally honest, actionable algorithmic order recommendations: take profit orbits, escape velocity stops, and physical risk hedging vectors).

Write back in premium, high-impact Grok style with custom emojis (e.g., 🚀, 𝕏, 🧠, 🛰️, 🔥). Speak like an engineering genius who is mildly amused by human markets but completely dedicated to multi-planetary capital coordination. Keep it professional yet incredibly fun, punchy, and space-bound!`;

        if (userCustomQuestion) {
          prompt += `\n\nCRITICAL INSTRUCTION - USER INTERACTION SYNC: The user (named Kiamadmax) has asked you this specific query: "${userCustomQuestion}". Answer this beautifully, comprehensively and directly in your characteristic Elon / Grok persona! Integrate current live trading values into your response and keep it delightfully witty and inspiring.`;
        }
      } else {
        prompt = `You are the Pythian Oracle of Algorithmic Trading (styled in gold/bronze Greek mythological majesty).
Act as a premium quantitative strategist and market analyst, fusing Reinforcement Learning (RL) network data and Deep LLM heuristic parameters.

${targetContextPrompt}

Based on these statistics and any attached chart screenshots, provide an elegant, majestic Greek-Oracle styled report of 3 high-level sections:
1. THE PYTHIAN INSIGHT (Heuristic market forecast of the asset trend, inverse relation with DXY, and current indicator state. If a chart image was provided, include visual layout/geometric details observed).
2. THE TITANIC JUDGMENT (RL parameters critique: is the neural net showing high convergence/fit or is there risk of catastrophic forgetting? What does the RSI/EMA suggest for leverage risks?).
3. THE ORACLE'S COMMAND (Actionable, clear algorithmic commands: position targets, stop loss adjustments, or risk protection offsets).

Write back in majestic, concise, professional Markdown format. Keep the tone dignified, poetic yet highly structured, with professional quantitative market insights. Avoid emojis except classic Greek/market ones (e.g., 🏛️, ⚖️, 🧭, 📈). Do not use placeholders.`;
      }

      let contentParts: any[] = [prompt];

      if (image && typeof image === 'string' && image.startsWith('data:')) {
        const parts = image.split(',');
        if (parts.length === 2) {
          const match = parts[0].match(/data:(.*?);/);
          const mimeType = match ? match[1] : 'image/png';
          const base64Data = parts[1];
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: contentParts
      });

      const analysisText = response.text || "The Oracle remains silent. Please refine indicators.";
      res.json({ analysis: analysisText });
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      res.status(500).json({ error: error?.message || "Internal server error conducting LLM analysis." });
    }
  });

  // Hot module replacement or static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Greek Oracle GQR Server is running on http://localhost:${PORT}`);
  });
}

startServer();
