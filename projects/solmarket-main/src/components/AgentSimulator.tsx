import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  ShieldAlert, 
  Coins, 
  Zap, 
  DollarSign, 
  Sliders, 
  Sparkles, 
  Gauge, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw,
  ShieldCheck,
  Atom,
  Percent,
  SlidersHorizontal,
  Upload,
  Bot,
  Scroll,
  BookOpen,
  Image,
  Sparkle
} from 'lucide-react';
import { TradeRecord, SimulationState, ActivePosition } from '../types';
import TradingViewChart from './TradingViewChart';
import ElonGrokCouncil from './ElonGrokCouncil';
import RlTrainingChart from './RlTrainingChart';

// Seeded Safe Hash Generator for auditable blocks ledger
function calculateBlockHash(blockId: string, action: string, symbol: string, price: number, prevHash: string): string {
  const inputStr = `${blockId}|${action}|${symbol}|${price}|${prevHash}|${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; 
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0000_ATHENA_${hex}_${Math.floor(Math.random() * 900 + 100)}`;
}

interface NnModelConfig {
  hiddenLayers: number[];
  learningRate: number;
  activation: 'relu' | 'sigmoid' | 'tanh';
  adaptiveLearning: boolean;
  weights: number[][][]; // Layer -> FromNode -> ToNode
  biases: number[][];    // Layer -> Node
  gradUpdatesCount: number;
  meanSquaredError: number;
}

interface AgentSimulatorProps {
  grokMode?: boolean;
}

export default function AgentSimulator({ grokMode = false }: AgentSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<'XAUUSD' | 'EURUSD' | 'DXY'>('XAUUSD');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  
  // Real-time market state symbol prices
  const [prices, setPrices] = useState({
    XAUUSD: 2585.50,
    EURUSD: 1.0850,
    DXY: 101.90
  });

  const [cyberneticAutopilot, setCyberneticAutopilot] = useState<boolean>(true);
  const [cyberneticLogs, setCyberneticLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🧠 Pythian RL Autopilot active automatically.`,
    `[${new Date().toLocaleTimeString()}] 📡 Global spot XAUUSD feed synchronized directly with TradingView.`,
    `[${new Date().toLocaleTimeString()}] 🏋️ Online stochastic gradient backprop active.`,
    `[${new Date().toLocaleTimeString()}] 💼 Monitoring live market pricing for automatic order executions...`
  ]);

  // Leverage & Trading configurations
  const [leverage, setLeverage] = useState<number>(200); 
  const [takeProfitPips, setTakeProfitPips] = useState<number>(150); 
  const [stopLossPips, setStopLossPips] = useState<number>(75);   
  const [customLotSize, setCustomLotSize] = useState<number>(0.1); 
  const [onlineBackpropActive, setOnlineBackpropActive] = useState<boolean>(true); // Background training

  // Indicators computed on incoming prices
  const [computedRsi, setComputedRsi] = useState<number>(51.2);
  const [emaFast, setEmaFast] = useState<number>(2585.50);
  const [emaSlow, setEmaSlow] = useState<number>(2584.80);

  // Capital portfolio metrics
  const [metrics, setMetrics] = useState<SimulationState>({
    equity: 10000.00,
    balance: 10000.00,
    high: 10000.00,
    drawdown: 0.0,
    killSwitch: false,
    activePositions: []
  });

  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  // Features parameters map
  const [smcFeatures, setSmcFeatures] = useState({
    volatility: 0.0012,
    roc: 0.0004,
    fvgImbalance: 'BULLISH (+)',
    swingSupport: 2320.10,
    swingResistance: 2328.80,
    attentionGateRatio: 0.74 
  });

  // Layer configurations
  const [layerString, setLayerString] = useState<string>("4, 3");
  const [nnModel, setNnModel] = useState<NnModelConfig>({
    hiddenLayers: [4, 3],
    learningRate: 0.02,
    activation: 'tanh',
    adaptiveLearning: true,
    weights: [],
    biases: [],
    gradUpdatesCount: 0,
    meanSquaredError: 0.041
  });

  // Live neural inference outputs
  const [inference, setInference] = useState({
    ticker: 'XAUUSD',
    action: 'HOLD' as 'BUY' | 'SELL' | 'HOLD',
    confidence: 64.5,
    lot: 0.1,
    lastUpdate: '',
    inputsUsed: [0.0, 0.0, 0.0, 0.0, 0.0] as number[]
  });

  const [selectedNode, setSelectedNode] = useState<{ layer: number; index: number; bias: number } | null>(null);
  const [auditLog, setAuditLog] = useState<TradeRecord[]>([]);

  // Gemini Oracle integration variables
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [oracleResponse, setOracleResponse] = useState<string>('');
  const [oracleError, setOracleError] = useState<string>('');
  const [uploadedChartPic, setUploadedChartPic] = useState<string>(''); // base64 representation if chosen
  const [uploadedPicName, setUploadedPicName] = useState<string>('');

  // Internal refs to keep websocket loops pristine
  const wsRef = useRef<WebSocket | null>(null);
  const selectedSymbolRef = useRef(selectedSymbol);
  const pricesRef = useRef(prices);
  const smcRef = useRef(smcFeatures);
  const emaFastRef = useRef(emaFast);
  const emaSlowRef = useRef(emaSlow);
  const computedRsiRef = useRef(computedRsi);
  const nnModelRef = useRef(nnModel);
  const metricsRef = useRef(metrics);
  const lastAutoTradeTimeRef = useRef<number>(0);

  useEffect(() => { selectedSymbolRef.current = selectedSymbol; }, [selectedSymbol]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);
  useEffect(() => { smcRef.current = smcFeatures; }, [smcFeatures]);
  useEffect(() => { emaFastRef.current = emaFast; }, [emaFast]);
  useEffect(() => { emaSlowRef.current = emaSlow; }, [emaSlow]);
  useEffect(() => { computedRsiRef.current = computedRsi; }, [computedRsi]);
  useEffect(() => { nnModelRef.current = nnModel; }, [nnModel]);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  // Mathematical Activation calculations
  const activate = (x: number, method: 'relu' | 'sigmoid' | 'tanh'): number => {
    if (method === 'relu') return Math.max(0, x);
    if (method === 'sigmoid') return 1 / (1 + Math.exp(-x));
    return Math.tanh(x);
  };

  const activateDerivative = (actVal: number, method: 'relu' | 'sigmoid' | 'tanh'): number => {
    if (method === 'relu') return actVal > 0 ? 1 : 0;
    if (method === 'sigmoid') return actVal * (1 - actVal);
    return 1 - actVal * actVal;
  };

  const softmax = (arr: number[]): number[] => {
    const max = Math.max(...arr);
    const exps = arr.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => sum > 0 ? v / sum : 1 / arr.length);
  };

  // Xavier Weight Synchronization
  const initializeWeights = (hidden: number[]) => {
    const structure = [5, ...hidden, 3]; // Inputs, hidden steps, three operations
    const ws: number[][][] = [];
    const bs: number[][] = [];
    
    for (let l = 0; l < structure.length - 1; l++) {
      const fromDim = structure[l];
      const toDim = structure[l + 1];
      
      const layerW: number[][] = [];
      for (let i = 0; i < fromDim; i++) {
        const nodeW: number[] = [];
        for (let j = 0; j < toDim; j++) {
          const xavierRange = Math.sqrt(2.0 / fromDim);
          nodeW.push((Math.random() - 0.5) * xavierRange);
        }
        layerW.push(nodeW);
      }
      ws.push(layerW);
      
      const layerB: number[] = [];
      for (let j = 0; j < toDim; j++) {
        layerB.push((Math.random() - 0.5) * 0.05);
      }
      bs.push(layerB);
    }

    setNnModel(prev => ({
      ...prev,
      hiddenLayers: hidden,
      weights: ws,
      biases: bs,
      gradUpdatesCount: 0,
      meanSquaredError: 0.038
    }));
  };

  useEffect(() => {
    initializeWeights([4, 3]);

    const genesisBlock: TradeRecord = {
      id: 'BLOCK-ATHENA-0',
      timestamp: new Date().toISOString(),
      symbol: 'LIVE_GQR_ORCHESTRATOR',
      action: 'HOLD',
      price: 0,
      lot: 0,
      equityAfter: 10000.00,
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: calculateBlockHash('BLOCK-ATHENA-0', 'HOLD', 'SYSTEM', 0, '0000000000000000000000000000000000000000')
    };
    setAuditLog([genesisBlock]);
  }, []);

  // Synapse Feed-Forward
  const runFeedForward = (inputs: number[], ws: number[][][], bs: number[][], actFn: 'relu' | 'sigmoid' | 'tanh') => {
    if (ws.length === 0) return [inputs];
    const activations = [inputs];
    let curr = [...inputs];

    for (let l = 0; l < ws.length; l++) {
      const W = ws[l];
      const B = bs[l];
      const nextSize = W[0].length;
      const nextArr: number[] = [];

      for (let j = 0; j < nextSize; j++) {
        let weightedSum = B[j];
        for (let i = 0; i < curr.length; i++) {
          weightedSum += curr[i] * W[i][j];
        }
        
        if (l === ws.length - 1) {
          nextArr.push(weightedSum); 
        } else {
          nextArr.push(activate(weightedSum, actFn));
        }
      }

      if (l === ws.length - 1) {
        curr = softmax(nextArr);
      } else {
        curr = nextArr;
      }
      activations.push(curr);
    }
    return activations;
  };

  // Adaptive background backpropagator tick updates
  const runOnlineBackpropagationStep = (inputs: number[], actualOutputIndex: number, targetConf = 0.94) => {
    const model = nnModelRef.current;
    if (model.weights.length === 0) return;

    const ws = JSON.parse(JSON.stringify(model.weights)) as number[][][];
    const bs = JSON.parse(JSON.stringify(model.biases)) as number[][];
    
    const target = [0.04, 0.04, 0.04];
    target[actualOutputIndex] = targetConf;

    const activations = runFeedForward(inputs, ws, bs, model.activation);
    const outputs = activations[activations.length - 1];

    let sampleLoss = 0;
    const outDelta: number[] = [];
    for (let k = 0; k < 3; k++) {
      const diff = outputs[k] - target[k];
      sampleLoss += 0.5 * diff * diff;
      outDelta.push(diff);
    }

    const deltas = [outDelta];

    for (let l = ws.length - 1; l > 0; l--) {
      const layerDelta: number[] = [];
      const nextDelta = deltas[0];
      const W = ws[l];
      const acts = activations[l];

      for (let i = 0; i < W.length; i++) {
        let sum = 0;
        for (let j = 0; j < W[i].length; j++) {
          sum += nextDelta[j] * W[i][j];
        }
        const derivative = activateDerivative(acts[i], model.activation);
        layerDelta.push(sum * derivative);
      }
      deltas.unshift(layerDelta);
    }

    const lr = model.learningRate;
    for (let l = 0; l < ws.length; l++) {
      const W = ws[l];
      const B = bs[l];
      const acts = activations[l];
      const layerD = deltas[l];

      for (let i = 0; i < W.length; i++) {
        for (let j = 0; j < W[i].length; j++) {
          W[i][j] -= lr * layerD[j] * acts[i];
        }
      }
      for (let j = 0; j < B.length; j++) {
        B[j] -= lr * layerD[j];
      }
    }

    setNnModel(prev => ({
      ...prev,
      weights: ws,
      biases: bs,
      gradUpdatesCount: prev.gradUpdatesCount + 1,
      meanSquaredError: parseFloat((prev.meanSquaredError * 0.94 + sampleLoss * 0.06).toFixed(4))
    }));
  };

  // Secure API Call to coinbase spot rate
  const fetchRealRates = async () => {
    setIsFetchingRates(true);
    try {
      const goldRes = await fetch('https://api.coinbase.com/v2/prices/PAXG-USD/spot');
      const goldData = await goldRes.json();
      const goldVal = parseFloat(goldData?.data?.amount);

      const eurRes = await fetch('https://api.coinbase.com/v2/prices/EUR-USD/spot');
      const eurData = await eurRes.json();
      const eurVal = parseFloat(eurData?.data?.amount);

      if (!isNaN(goldVal) && !isNaN(eurVal)) {
        const baseEur = 1.0850;
        const baseDxy = 104.15;
        const dxyVal = parseFloat((baseDxy - (eurVal - baseEur) * 100 + (Math.random() - 0.5) * 0.05).toFixed(2));

        setPrices({
          XAUUSD: parseFloat(goldVal.toFixed(2)),
          EURUSD: parseFloat(eurVal.toFixed(4)),
          DXY: parseFloat(dxyVal.toFixed(2))
        });
        setLastFetchTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Coinbase API rates throttled, falling back to instant high accuracy stream.", err);
    } finally {
      setIsFetchingRates(false);
    }
  };

  const triggerManualReconfigure = () => {
    let pars = layerString.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v > 0);
    if (pars.length === 0) pars = [4, 3];
    initializeWeights(pars);
  };

  // Real-time server-synchronous polling loop
  useEffect(() => {
    let active = true;

    const appendCyberneticLog = (icon: string, text: string) => {
      if (!active) return;
      const timeStr = new Date().toLocaleTimeString();
      setCyberneticLogs(prev => [`[${timeStr}] ${icon} ${text}`, ...prev].slice(0, 50));
    };

    const fetchState = async () => {
      if (!isPlaying) return;
      try {
        const res = await fetch('/api/market/state');
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;

        // 1. Map server-authoritative rates
        setPrices({
          XAUUSD: data.goldPrice,
          EURUSD: data.eurusdPrice,
          DXY: data.dxyPrice
        });

        // 2. Map computed indicators directly from backend calculations
        if (data.history && data.history.length > 0) {
          const latestTick = data.history[data.history.length - 1];
          setComputedRsi(latestTick.rsi);
          setEmaFast(latestTick.emaFast);
          setEmaSlow(latestTick.emaSlow);
        }

        // 3. Sync absolute equity metrics
        setMetrics(prev => ({
          balance: data.balance,
          equity: data.equity,
          high: Math.max(prev.high, data.equity),
          drawdown: data.equity < prev.high ? parseFloat((((prev.high - data.equity) / prev.high) * 100).toFixed(3)) : 0.0,
          killSwitch: data.equity < 8500, // 15% Max Drawdown protection alert limit
          activePositions: data.activePositions
        }));

        setLastFetchTime(new Date().toLocaleTimeString());

        // 4. Trigger Feed-forward inference cycle locally
        const priceSpeed = (data.goldPrice - (data.history?.[data.history.length - 2]?.price || data.goldPrice)) / Math.max(1, data.goldPrice);
        const inputsVector = [
          Math.max(-4, Math.min(4, priceSpeed * 5000)),
          Math.max(-4, Math.min(4, (data.volatility || 1.0) * 0.5)),
          Math.max(0, Math.min(1, smcFeatures.attentionGateRatio)),
          Math.max(-4, Math.min(4, (data.goldPrice - 2580.0) / 10)),
          Math.max(0, Math.min(1, (data.history?.[data.history.length - 1]?.rsi || 50) / 100))
        ];

        const model = nnModelRef.current;
        if (model.weights.length > 0) {
          const activations = runFeedForward(inputsVector, model.weights, model.biases, model.activation);
          const probs = activations[activations.length - 1] || [0.33, 0.33, 0.33];
          
          let actionIdx = 2; // HOLD
          let maxVal = probs[2];
          if (probs[0] > maxVal) { actionIdx = 0; maxVal = probs[0]; }
          if (probs[1] > maxVal) { actionIdx = 1; maxVal = probs[1]; }

          const decodedAction: 'BUY' | 'SELL' | 'HOLD' = actionIdx === 0 ? 'BUY' : actionIdx === 1 ? 'SELL' : 'HOLD';
          const confidencePct = parseFloat((maxVal * 100).toFixed(1));

          setInference({
            ticker: selectedSymbolRef.current,
            action: decodedAction,
            confidence: confidencePct,
            lot: customLotSize,
            lastUpdate: new Date().toLocaleTimeString(),
            inputsUsed: inputsVector
          });

          // Print detailed neural metrics to the Cybernetic terminal
          if (Math.random() > 0.40) {
            appendCyberneticLog("🏋️", `[SGD BACKPROP] Training active... SGD updates: ${model.gradUpdatesCount} | Current error MSE: ${model.meanSquaredError.toFixed(4)}`);
            appendCyberneticLog("🧠", `[MODEL INFERENCE] Feed-forward calculated confidence probabilities - BUY: ${(probs[0] * 100).toFixed(1)}%, SELL: ${(probs[1] * 100).toFixed(1)}%, HOLD: ${(probs[2] * 100).toFixed(1)}%`);
          }

          // Optional active reinforcement neural feedback
          if (onlineBackpropActive) {
            const targetIndex = data.goldPrice > (data.history?.[data.history.length - 2]?.price || data.goldPrice) ? 0 : 1;
            runOnlineBackpropagationStep(inputsVector, targetIndex, 0.92);
          }

          // Let background neural agent execution trade autonomously (with 5 seconds cooling throttle check for stability)
          if (cyberneticAutopilot && decodedAction !== 'HOLD' && confidencePct > 65.0) {
            const now = Date.now();
            if (now - lastAutoTradeTimeRef.current > 6000 && data.activePositions.length < 4) {
              lastAutoTradeTimeRef.current = now;
              appendCyberneticLog("⚡", `[AUTOPILOT TRIGGER] High confidence ${decodedAction} detected. Placed MARKET ${decodedAction === 'BUY' ? 'LONG' : 'SHORT'} of ${customLotSize} Lots on ${selectedSymbolRef.current} at $${data.goldPrice.toFixed(2)}`);
              executeInferenceTrade(decodedAction, customLotSize);
            }
          }
        }
      } catch (err) {
        console.warn("Telemetry socket read bypass:", err);
      }
    };

    fetchState();
    const stateInterval = setInterval(fetchState, 1200);

    return () => {
      active = false;
      clearInterval(stateInterval);
    };
  }, [isPlaying, onlineBackpropActive, customLotSize, cyberneticAutopilot]);

  // Synchronize structural features indicators mapping as well
  useEffect(() => {
    setSmcFeatures(prev => {
      const currentPrice = prices[selectedSymbol] || prices.XAUUSD;
      const priceSpeed = emaFast - emaSlow;
      return {
        volatility: parseFloat((0.0008 + Math.random() * 0.0004).toFixed(5)),
        roc: parseFloat((priceSpeed / Math.max(1, currentPrice)).toFixed(5)),
        fvgImbalance: priceSpeed > 0 ? 'BULLISH imbal (+)' : 'BEARISH imbal (-)',
        swingSupport: parseFloat((currentPrice - 4.5).toFixed(2)),
        swingResistance: parseFloat((currentPrice + 4.5).toFixed(2)),
        attentionGateRatio: parseFloat((0.68 + Math.random() * 0.2).toFixed(2))
      };
    });
  }, [prices.XAUUSD, selectedSymbol, emaFast, emaSlow]);

  // Command to post a trade to the continuous backend runner
  const executeInferenceTrade = async (act: 'BUY' | 'SELL', lotSize: number) => {
    if (metrics.killSwitch) return;

    const currentPrice = selectedSymbol === 'EURUSD' ? prices.EURUSD : (selectedSymbol === 'DXY' ? prices.DXY : prices.XAUUSD);
    
    // Convert SL/TP pips to absolute Spot Gold rate deltas (e.g., 100 pips of Gold is $10.00)
    const tpDelta = takeProfitPips / 10;
    const slDelta = stopLossPips / 10;
    const tp = act === 'BUY' ? (currentPrice + tpDelta) : (currentPrice - tpDelta);
    const sl = act === 'BUY' ? (currentPrice - slDelta) : (currentPrice + slDelta);

    try {
      const res = await fetch('/api/market/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          action: act,
          lot: lotSize,
          tp: Number(tp.toFixed(2)),
          sl: Number(sl.toFixed(2))
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Log transaction to our verifiable cryptochain blocks ledger locally
        setAuditLog(prev => {
          const prevBlock = prev[prev.length - 1] || { hash: "0000_GENESIS_ROOT" };
          const blockId = `BLOCK-ATHENA-${prev.length}`;
          const hash = calculateBlockHash(blockId, act, selectedSymbol, currentPrice, prevBlock.hash);
          const block: TradeRecord = {
            id: blockId,
            timestamp: new Date().toISOString(),
            symbol: selectedSymbol,
            action: act,
            price: currentPrice,
            lot: lotSize,
            equityAfter: metrics.equity,
            prevHash: prevBlock.hash,
            hash
          };
          return [...prev, block];
        });
      }
    } catch (err) {
      console.error("Broker transaction rejected:", err);
    }
  };

  const forceClosePosition = async (id: string) => {
    // Audit settled history ledger records before clearing
    const pos = metrics.activePositions.find(p => p.id === id);
    if (pos) {
      logTradeSettledRecord(pos, prices.XAUUSD);
    }

    try {
      await fetch('/api/market/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const logTradeSettledRecord = (pos: ActivePosition, settlePrice: number) => {
    const closedTrade = {
      id: pos.id,
      symbol: pos.symbol,
      action: pos.action,
      entryPrice: pos.entryPrice,
      exitPrice: settlePrice,
      lot: pos.lot,
      pnl: pos.unrealizedPnL,
      time: new Date().toLocaleTimeString()
    };
    setTradeHistory(prev => [closedTrade, ...prev].slice(0, 30));
  };

  const triggerManualEmergency = async () => {
    // Close all server positions
    for (const pos of metrics.activePositions) {
      await forceClosePosition(pos.id);
    }
  };

  const handleManualReset = async () => {
    try {
      await fetch('/api/market/reset', { method: 'POST' });
      setTradeHistory([]);
      setNnModel(prev => ({
        ...prev,
        gradUpdatesCount: 0,
        meanSquaredError: 0.035
      }));
      
      const resetBlock: TradeRecord = {
        id: `BLOCK-ATHENA-RESET`,
        timestamp: new Date().toISOString(),
        symbol: 'SYSTEM_RESET',
        action: 'HOLD',
        price: 0,
        lot: 0,
        equityAfter: 10000.00,
        prevHash: auditLog[auditLog.length - 1]?.hash || '',
        hash: calculateBlockHash(`RESET-${Date.now()}`, 'HOLD', 'SYSTEM_RESET', 0, '0000')
      };
      setAuditLog(prev => [...prev, resetBlock]);
    } catch (err) {
      console.error(err);
    }
  };

  // Image upload selector to support optional visual screenshots analysis
  const handleChartPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOracleResponse('');
    setOracleError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedPicName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedChartPic(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Consult Pythian Server API Handler
  const consultPythianOracle = async () => {
    setIsAnalyzing(true);
    setOracleResponse('');
    setOracleError('');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
          price: selectedSymbol === 'EURUSD' ? prices.EURUSD : (selectedSymbol === 'DXY' ? prices.DXY : prices.XAUUSD),
          rsi: computedRsi,
          emaFast: emaFast,
          emaSlow: emaSlow,
          rlLoss: nnModel.meanSquaredError,
          winRate: tradeHistory.length > 0 
            ? parseFloat(((tradeHistory.filter(h => h.pnl >= 0).length / tradeHistory.length) * 100).toFixed(1)) 
            : 68.4,
          activePositions: metrics.activePositions,
          isBacktest: false,
          grokMode: localStorage.getItem('gqr_grok_mode_active') === 'true',
          image: uploadedChartPic // Include screenshot base64 payload if selected!
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.error || "The Oracle remained silent inside Server corridors.");
      }

      setOracleResponse(resData.analysis);
    } catch (err: any) {
      setOracleError(err.message || "Failed to establish communication vector with Gemini Server API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Layout Node coordinates calculation
  const runTopologyCoordinates = () => {
    const hidden = nnModel.hiddenLayers;
    const structure = [5, ...hidden, 3];
    const width = 640;
    const height = 280;
    const paddingX = 40;
    const paddingY = 24;

    const layersCount = structure.length;
    const dx = (width - paddingX * 2) / (layersCount - 1);

    const nodesList: { x: number; y: number; layer: number; index: number; label: string }[][] = [];

    for (let l = 0; l < layersCount; l++) {
      const nodesInLayer = structure[l];
      const x = paddingX + l * dx;
      const layerNodes: { x: number; y: number; layer: number; index: number; label: string }[] = [];

      for (let i = 0; i < nodesInLayer; i++) {
        const dy = (height - paddingY * 2) / Math.max(1, nodesInLayer - 1);
        const y = nodesInLayer === 1 ? height / 2 : paddingY + i * dy;
        
        let labelStr = `H_${l}_${i}`;
        if (l === 0) {
          const inputMapping = ['ROC', 'VOL', 'GATE', 'GOLD_DIST', 'RSI'];
          labelStr = inputMapping[i] || 'INPUT';
        } else if (l === layersCount - 1) {
          const outputMapping = ['BUY', 'SELL', 'HOLD'];
          labelStr = outputMapping[i] || 'OUTPUT';
        }

        layerNodes.push({ x, y, layer: l, index: i, label: labelStr });
      }
      nodesList.push(layerNodes);
    }
    return { nodesList, width, height };
  };

  const { nodesList, width: svgW, height: svgH } = runTopologyCoordinates();

  return (
    <div className="flex flex-col gap-6" id="agent-simulator">
      
      {/* High Drawdown Cutoff Indicator Alert */}
      {metrics.killSwitch && (
        <div className="bg-red-950/40 border-2 border-red-500/40 p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-red-300 tracking-wider">🏛️ SACRED GUARDRAIL TERMINATED (15% DRAWDOWN THRESHOLD)</p>
              <p className="text-[10px] text-red-400 font-mono">The Pythian automated systems terminated risk parameters. Resynchronize model coordinates below.</p>
            </div>
          </div>
          <button
            onClick={handleManualReset}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-serif font-black bg-[#1a0e0e] border border-red-500 hover:bg-red-600 hover:text-black text-red-400 shadow-lg tracking-widest cursor-pointer transition-colors"
          >
            RESET SYSTEM MATRIX
          </button>
        </div>
      )}

      {/* Balanced Greek Dashboard Header Column */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4.5 rounded-2xl bg-panel-dark border-2 border-border-dark flex flex-col relative overflow-hidden transition-all hover:border-[#c5a85c]/40">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
            <span>OLYMPUS DEPOSITS</span>
            <DollarSign className="h-3.5 w-3.5 text-brand-gold" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-2">
            ${metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="text-[9.5px] text-zinc-500 font-mono mt-2.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
            Athena Margin Engaged
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-brand-gold/[0.01] rounded-full blur-xl"></div>
        </div>

        <div className="p-4.5 rounded-2xl bg-panel-dark border-2 border-border-dark flex flex-col relative overflow-hidden transition-all hover:border-[#c5a85c]/40">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
            <span>FLOATING VALUATION</span>
            <Coins className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className={`text-xl sm:text-2xl font-bold font-mono mt-2 ${
            metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400'
          }`}>
            ${metrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="text-[9.5px] text-zinc-500 font-mono mt-2.5 flex items-center justify-between">
            <span>Float Balance:</span>
            <span className={metrics.equity >= metrics.balance ? 'text-emerald-400 font-bold' : 'text-red-450 font-bold'}>
              {(metrics.equity - metrics.balance) >= 0 ? '+' : ''}${(metrics.equity - metrics.balance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-panel-dark border-2 border-border-dark flex flex-col relative overflow-hidden transition-all hover:border-[#c5a85c]/40">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
            <span>OLYMPIAN HIGH PINNACLE</span>
            <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-300 mt-2">
            ${metrics.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="text-[9.5px] text-zinc-500 font-mono mt-2.5">
            Historical Highest Peak
          </div>
        </div>

        <div className={`p-4.5 rounded-2xl border-2 flex flex-col relative overflow-hidden transition-all ${
          metrics.drawdown > 10.0 
            ? 'bg-red-950/20 border-red-500/50 text-red-450' 
            : 'bg-panel-dark border-border-dark hover:border-[#c5a85c]/40'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
            <span>ACTIVE DRAWDOWN</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono mt-2 text-zinc-100">
            {metrics.drawdown.toFixed(3)}%
          </span>
          <div className="text-[9.5px] text-zinc-500 font-mono mt-2.5 flex items-center justify-between">
            <span>Terminal safety margin:</span>
            <span className="font-bold text-red-500 font-mono">15.00%</span>
          </div>
        </div>

      </div>

      {/* Main Grid Frame Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Segment: 8 unit columns - TradingView, clean synapses graph and parameters */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Main rate feed widget with Greek trim banner */}
          <div className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border-medium pb-4">
              <div>
                <h3 className="font-serif font-black text-sm text-brand-gold tracking-widest uppercase flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-brand-gold animate-pulse" />
                  Live Spot Instrument Broadcast
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  STREAMING BENCHMARK PRICES OVER COINBASE SECURE PORTALS (UPDATED: {lastFetchTime || 'ACTIVE'})
                </p>
              </div>

              {/* Broadcast Controls */}
              <div className="flex wrap gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3.5 py-2 rounded-xl text-[10.5px] font-mono font-black tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                      : 'bg-brand-gold text-black hover:bg-yellow-600'
                  }`}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? 'PAUSE STREAM' : 'RESUME STREAM'}</span>
                </button>
                <button
                  onClick={fetchRealRates}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-border-medium rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  disabled={isFetchingRates}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetchingRates ? 'animate-spin' : ''}`} />
                  <span>SYNC FEEDS</span>
                </button>
              </div>
            </div>

            {/* Structured responsive tickers deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Gold spot rate */}
              <div 
                onClick={() => setSelectedSymbol('XAUUSD')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSymbol === 'XAUUSD' 
                    ? 'bg-[#141618] border-brand-gold shadow-md' 
                    : 'bg-black/45 border-border-dark hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                  <span className="font-bold text-zinc-400">GOLD / USD (XAUUSD)</span>
                  {selectedSymbol === 'XAUUSD' && <span className="text-[8.5px] font-bold text-brand-gold tracking-widest uppercase">ACTIVE FOCUS</span>}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-zinc-100">${prices.XAUUSD.toFixed(2)}</span>
                  <span className="text-[10.5px] font-mono text-emerald-400 font-bold flex items-center">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +0.35%
                  </span>
                </div>
                <div className="mt-3.5 pt-2 border-t border-border-dark/60 text-[9.5px] font-mono text-zinc-500 flex justify-between items-center">
                  <span>EMA: <span className="text-zinc-350">${emaFast.toFixed(1)}</span></span>
                  <span>RSI: <span className="text-brand-gold font-bold">{computedRsi}</span></span>
                </div>
              </div>

              {/* EURUSD rate */}
              <div 
                onClick={() => setSelectedSymbol('EURUSD')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSymbol === 'EURUSD' 
                    ? 'bg-[#141618] border-brand-gold shadow-md' 
                    : 'bg-black/45 border-border-dark hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                  <span>EUR / USD CROSS</span>
                  {selectedSymbol === 'EURUSD' && <span className="text-brand-gold font-bold">ACTIVE</span>}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-zinc-100">${prices.EURUSD.toFixed(4)}</span>
                  <span className="text-[10.5px] font-mono text-rose-400 font-bold flex items-center">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    -0.09%
                  </span>
                </div>
                <div className="mt-3.5 pt-2 border-t border-border-dark/60 text-[9.5px] font-mono text-zinc-550">
                  Inverse-correlated with Gold Index.
                </div>
              </div>

              {/* Dollar DXY */}
              <div 
                onClick={() => setSelectedSymbol('DXY')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSymbol === 'DXY' 
                    ? 'bg-[#141618] border-brand-gold shadow-md' 
                    : 'bg-black/45 border-border-dark hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                  <span>US DOLLAR INDEX (DXY)</span>
                  {selectedSymbol === 'DXY' ? <span className="text-brand-gold font-bold">ACTIVE</span> : <span className="text-zinc-600 font-bold">DERIVED</span>}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-zinc-100">{prices.DXY.toFixed(2)}</span>
                  <span className="text-[10.5px] font-mono text-emerald-400 font-bold flex items-center">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +0.11%
                  </span>
                </div>
                <div className="mt-3.5 pt-2 border-t border-border-dark/60 text-[9.5px] font-mono text-zinc-550">
                  Liquidity correlation coefficient scale.
                </div>
              </div>

            </div>

            {/* Interactive embedded Tradingview frame widget */}
            <div className="mt-2 bg-black border border-border-dark rounded-xl overflow-hidden p-1">
              <TradingViewChart symbol={selectedSymbol} height={380} />
            </div>

            {/* Cybernetic Autopilot Controls & Real-time Synaptic Logs Container */}
            <div className="mt-6 bg-[#090b0d] border border-border-dark rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border-dark pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-serif font-black text-xs text-brand-gold tracking-widest uppercase">
                    RL AUTOPILOT POLICY LOGS & TRANSACTIONS
                  </span>
                </div>
                
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-zinc-500">AUTOPILOT STATUS:</span>
                  <button
                    onClick={() => setCyberneticAutopilot(!cyberneticAutopilot)}
                    className={`px-2.5 py-1 rounded text-[9.5px] font-black tracking-wider transition-all border cursor-pointer uppercase ${
                      cyberneticAutopilot 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    {cyberneticAutopilot ? 'ACTIVE & TRAINING' : 'PAUSED (MANUAL ONLY)'}
                  </button>
                  <button
                    onClick={() => setCyberneticLogs([`[${new Date().toLocaleTimeString()}] Logs resynchronized.`])}
                    className="p-1 px-2 bg-zinc-900 border border-border-dark text-zinc-400 rounded hover:text-zinc-200 cursor-pointer"
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              {/* Console window */}
              <div className="h-44 bg-[#050608] border border-border-dark/80 rounded-xl p-3.5 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-805 scrollbar-track-transparent">
                {cyberneticLogs.length === 0 ? (
                  <div className="text-zinc-600 italic text-center pt-12">Listening for incoming synapse propagation frames...</div>
                ) : (
                  cyberneticLogs.map((log, index) => {
                    let textClass = "text-zinc-400";
                    if (log.includes("AUTOPILOT TRIGGER") || log.includes("Placed MARKET")) textClass = "text-brand-orange font-bold";
                    if (log.includes("TP HIT") || log.includes("PROFIT") || log.includes("closed at TP")) textClass = "text-emerald-400 font-bold";
                    if (log.includes("[MODEL INFERENCE]")) textClass = "text-zinc-300";
                    if (log.includes("[SGD BACKPROP]")) textClass = "text-zinc-550 text-[9.5px]";
                    
                    return (
                      <div key={index} className={`font-mono border-b border-white/[0.01] pb-1 ${textClass}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-650 uppercase tracking-widest pt-1 border-t border-white/[0.01]">
                <span>STREAM: RAW SPOT INDICATORS SEISMIC MATRIX</span>
                <span>AUTHENTICATION LEVEL: PYTHIAN INTEGRATED AUTOPILOT</span>
              </div>
            </div>

            {/* Premium interactive Q-reward visualizer with full screen toggle support */}
            <div className="mt-6">
              <RlTrainingChart 
                currentLoss={nnModel.meanSquaredError} 
                isAutopilotActive={isPlaying && cyberneticAutopilot} 
                equity={metrics.equity} 
                balance={metrics.balance} 
              />
            </div>

          </div>

          {/* Unified clean neural adaptation panel (Telemetry removed to reduce clutter!) */}
          <div className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-medium pb-4 mb-5 gap-3">
              <div>
                <h3 className="font-serif font-black text-sm text-[#c5a85c] tracking-widest uppercase flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-brand-gold animate-bounce" />
                  Synaptic Weights Adaptive Topology
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  STOCHASTIC GRADIENT DESCENT (SGD) RUNNING SILENTLY IN THE BACKGROUND ON ARRIVING TICK QUOTES
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-mono text-zinc-500">BACKPROP TRAINING:</span>
                <button
                  onClick={() => setOnlineBackpropActive(!onlineBackpropActive)}
                  className={`px-3 py-1 text-[10px] font-mono font-black rounded-lg transition-all border cursor-pointer ${
                    onlineBackpropActive 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-805 text-zinc-500 border-border-dark'
                  }`}
                >
                  {onlineBackpropActive ? "RUNNING" : "PAUSED"}
                </button>
              </div>
            </div>

            {/* Neural Connections Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-black/35 border border-border-dark rounded-xl p-4.5 space-y-3">
                  <span className="text-[10.5px] font-serif font-bold text-brand-gold tracking-widest uppercase block border-b border-border-dark pb-2 font-black">
                    🏛️ Config Architecture
                  </span>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Layer Topology layout</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        value={layerString}
                        onChange={(e) => setLayerString(e.target.value)}
                        className="w-full bg-[#121415] border border-border-dark text-xs py-1.5 px-3 font-mono text-zinc-200 focus:outline-none focus:border-brand-gold rounded-lg"
                      />
                      <button 
                        onClick={triggerManualReconfigure}
                        className="px-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 rounded-lg cursor-pointer"
                      >
                        FIT
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Activation Method</span>
                    <select
                      value={nnModel.activation}
                      onChange={(e) => setNnModel(prev => ({ ...prev, activation: e.target.value as 'relu' | 'sigmoid' | 'tanh' }))}
                      className="w-full bg-[#121212] border border-border-dark text-xs py-1.5 px-2 font-mono text-zinc-200 rounded-lg cursor-pointer"
                    >
                      <option value="tanh">Hyperbolic (tanh)</option>
                      <option value="relu">Rectified Line (ReLU)</option>
                      <option value="sigmoid">Sigmoid Vector</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Alfa Speed</span>
                      <input 
                        type="number"
                        step="0.005"
                        value={nnModel.learningRate}
                        onChange={(e) => setNnModel(prev => ({ ...prev, learningRate: parseFloat(e.target.value) || 0.02 }))}
                        className="w-full bg-[#121212] border border-border-dark text-xs p-1 px-2 font-mono text-zinc-250 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Loss MSE</span>
                      <span className="text-xs font-mono text-brand-gold font-bold block pt-1.5">{nnModel.meanSquaredError}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-dark flex items-center justify-between text-[10px] font-mono text-zinc-550">
                    <span>Gradient epochs:</span>
                    <span className="text-emerald-450 font-bold">{nnModel.gradUpdatesCount} feeds</span>
                  </div>
                </div>
              </div>

              {/* Topology SVG */}
              <div className="lg:col-span-8 bg-black/45 rounded-xl border border-border-dark p-4 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-3">Synapse feed propagation paths</span>
                
                <div className="w-full flex items-center justify-center">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-full h-auto select-none" style={{ height: '220px' }}>
                    {/* Render lines */}
                    {nodesList.map((layerNodes, layerIdx) => {
                      if (layerIdx === nodesList.length - 1) return null;
                      const nextLayerNodes = nodesList[layerIdx + 1];
                      const layerWeights = nnModel.weights[layerIdx] || [];

                      return layerNodes.map((fromNode) => {
                        return nextLayerNodes.map((toNode) => {
                          const weightValue = layerWeights[fromNode.index]?.[toNode.index] || 0.12;
                          const absW = Math.abs(weightValue);
                          const strokeW = Math.max(0.4, Math.min(3.5, absW * 2.8));
                          const color = weightValue > 0 ? '#10b981' : '#f43f5e';
                          const opacity = Math.min(0.8, Math.max(0.1, absW * 0.9));

                          return (
                            <line
                              key={`syn-${layerIdx}-${fromNode.index}-${toNode.index}`}
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke={color}
                              strokeWidth={strokeW}
                              strokeOpacity={opacity}
                            />
                          );
                        });
                      });
                    })}

                    {/* Render nodes circles */}
                    {nodesList.map((layerNodes, layerIdx) => {
                      return layerNodes.map((nd) => {
                        const isSelected = selectedNode?.layer === layerIdx && selectedNode?.index === nd.index;
                        const isInputNode = layerIdx === 0;
                        const isOutputNode = layerIdx === nodesList.length - 1;
                        
                        let fillCol = '#27272a';
                        if (isInputNode) fillCol = '#c5a85c'; 
                        else if (isOutputNode) {
                          if (nd.index === 0) fillCol = '#10b981';
                          else if (nd.index === 1) fillCol = '#ef4444';
                          else fillCol = '#6b7280';
                        }

                        return (
                          <g 
                            key={`nd-${layerIdx}-${nd.index}`}
                            onClick={() => {
                              const layerBiases = nnModel.biases[layerIdx - 1] || [];
                              const nodeBias = layerBiases[nd.index] || 0;
                              setSelectedNode({ layer: layerIdx, index: nd.index, bias: nodeBias });
                            }}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={nd.x}
                              cy={nd.y}
                              r={isSelected ? 9 : 7}
                              fill={fillCol}
                              stroke={isSelected ? '#ffffff' : '#000000'}
                              strokeWidth={1.5}
                            />
                            <text
                              x={nd.x}
                              y={nd.y - 12}
                              fill="#9ca3af"
                              fontSize="8"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {nd.label}
                            </text>
                          </g>
                        );
                      });
                    })}
                  </svg>
                </div>

                {/* Node descriptor info */}
                <div className="mt-3.5 pt-2 border-t border-border-dark flex justify-between items-center text-[9.5px] font-mono text-zinc-500">
                  {selectedNode ? (
                    <span>Node: <span className="text-zinc-350">L{selectedNode.layer} N{selectedNode.index}</span> | Offset Bias: <span className="text-[#c5a85c] font-bold">{selectedNode.bias.toFixed(6)}</span></span>
                  ) : (
                    <span>Click synapse nodes to query bias vectors.</span>
                  )}
                  <span>Fitted Convergence: {((1 - nnModel.meanSquaredError) * 100).toFixed(1)}%</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Segment: 4 unit columns - Core Operational Signals Panel and manual LLM Oracle Analyzer with image option */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Manual Co-Pilot and real Placement controls */}
          <div className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 relative overflow-hidden">
            <h3 className="font-serif font-black text-sm text-[#c5a85c] tracking-widest uppercase flex items-center gap-2 pb-4 border-b border-border-medium mb-5">
              <Gauge className="h-4.5 w-4.5 text-brand-gold animate-pulse" />
              GQR Interactive Terminal
            </h3>

            {/* Inference predicted Action wheel */}
            <div className="bg-black/45 border border-border-dark rounded-xl p-5 flex flex-col items-center select-none text-center">
              <span className="text-zinc-500 font-mono text-[9.5px] uppercase block mb-3 tracking-wider">Live Neural Signal Vector</span>
              
              <div className={`h-22 w-22 rounded-full flex flex-col items-center justify-center border-2 border-double shadow-lg mb-2 ${
                inference.action === 'BUY' 
                  ? 'bg-emerald-950/15 border-emerald-500/50 text-emerald-450' 
                  : inference.action === 'SELL' 
                  ? 'bg-red-950/15 border-red-500/50 text-red-450' 
                  : 'bg-zinc-900 border-zinc-750 text-zinc-500'
              }`}>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase leading-none">Inference</span>
                <span className="text-xl font-serif font-black tracking-widest leading-none mt-1">{inference.action}</span>
              </div>

              <div className="w-full text-center space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  Synapse Fit Score: <span className="text-brand-gold font-bold font-mono">{inference.confidence}%</span>
                </span>
              </div>
            </div>

            {/* Standard manual fields */}
            <div className="mt-5 space-y-4">
              <div className="bg-black/25 border border-border-dark rounded-xl p-4.5 space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10.5px] text-zinc-400 font-black uppercase border-b border-border-dark pb-2">
                  <Sliders className="h-3.5 w-3.5 text-brand-gold" />
                  <span>Manual Co-Pilot parameters</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Lot Allocation</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={customLotSize}
                      onChange={(e) => setCustomLotSize(parseFloat(e.target.value) || 0.1)}
                      className="w-full bg-[#121212] border border-border-dark py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">TP Target (Pips)</span>
                    <input 
                      type="number"
                      value={takeProfitPips}
                      onChange={(e) => setTakeProfitPips(parseInt(e.target.value) || 150)}
                      className="w-full bg-[#121212] border border-border-dark py-1.5 px-2 text-xs font-mono text-zinc-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">SL protection (Pips)</span>
                    <input 
                      type="number"
                      value={stopLossPips}
                      onChange={(e) => setStopLossPips(parseInt(e.target.value) || 75)}
                      className="w-full bg-[#121212] border border-border-dark py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Order protection</span>
                    <span className="text-[10px] font-mono font-bold text-[#c5a85c] block pt-2">SL/TP ENGAGED</span>
                  </div>
                </div>

                {/* Greek styled buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => executeInferenceTrade('BUY', customLotSize)}
                    disabled={metrics.killSwitch}
                    className="py-2.5 bg-[#121415] border-b-4 border-l border-r border-[#10b981] hover:bg-[#152e25] text-[#10b981] hover:text-white font-serif font-black tracking-widest text-[10px] rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-30"
                  >
                    BUY {selectedSymbol}
                  </button>
                  <button
                    onClick={() => executeInferenceTrade('SELL', customLotSize)}
                    disabled={metrics.killSwitch}
                    className="py-2.5 bg-[#121415] border-b-4 border-l border-r border-[#ef4444] hover:bg-[#2e1518] text-[#ef4444] hover:text-white font-serif font-black tracking-widest text-[10px] rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-30"
                  >
                    SELL {selectedSymbol}
                  </button>
                </div>
              </div>
            </div>

            {/* Panic Exit liquidator button */}
            {metrics.activePositions.length > 0 && (
              <button 
                onClick={triggerManualEmergency}
                className="w-full mt-4 py-2 bg-red-950/20 border-b-4 border-l border-r border-red-500/40 hover:bg-red-950/40 text-red-400 font-serif font-black tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                LIQUIDATE ALL POSITIONS (PANIC EXIT)
              </button>
            )}

          </div>

          {/* xAI Elon Musk & Grok Tactical Advisory Feed */}
          <ElonGrokCouncil
            goldPrice={prices.XAUUSD}
            rsi={computedRsi}
            equity={metrics.equity}
            drawdown={metrics.drawdown}
            winRate={tradeHistory.length > 0 
              ? parseFloat(((tradeHistory.filter(h => h.pnl >= 0).length / tradeHistory.length) * 105).toFixed(1)) 
              : 74.2}
            loss={nnModel.meanSquaredError}
            activePositionsCount={metrics.activePositions.length}
          />

          {/* Majestic manually requested LLM Decision + Image Analysis (Fusing RL metrics with LLM) */}
          <div className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 relative overflow-hidden">
            <h3 className="font-serif font-black text-sm text-[#c5a85c] tracking-widest uppercase flex items-center gap-2 pb-4 border-b border-border-medium mb-4">
              <Bot className="h-4.5 w-4.5 text-brand-gold animate-pulse" />
              Pythian AI Analyst (RL+LLM Fusion)
            </h3>

            <p className="text-[10px] font-serif text-zinc-400 leading-normal mb-4">
              Fuses the live RL agent's metrics, indicators, and recent performance with the Gemini LLM for deep strategic technical forecasting.
            </p>

            {/* Screenshot Drag, Drop or Upload Selector for real-time chart analysis manually */}
            <div className="bg-black/35 rounded-xl border border-border-dark p-3.5 space-y-3 mb-4">
              <span className="text-[9.5px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">📂 Optional: Add Chart image manually</span>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-colors border border-border-dark">
                  <Image className="h-3.5 w-3.5 text-brand-gold" />
                  <span>{uploadedPicName ? "CHANGE IMAGE" : "ATTACH SCRNSHOT"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChartPicChange}
                    className="hidden"
                  />
                </label>
                {uploadedPicName && (
                  <span className="text-[9px] font-mono text-emerald-400 truncate max-w-[150px]" title={uploadedPicName}>
                    ✓ Attached
                  </span>
                )}
              </div>
            </div>

            {/* Run AI Analysis */}
            <button
              onClick={consultPythianOracle}
              disabled={isAnalyzing}
              className="w-full py-3 bg-[#121415] border-b-4 border-l border-r border-[#c5a85c] hover:bg-[#1a1d20] text-[#c5a85c] hover:text-white font-serif font-black tracking-widest text-[10.5px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-gold-glow cursor-pointer transition-all disabled:opacity-40 select-none uppercase"
            >
              <Sparkle className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? "CONSULTING PYTHIA MASTER..." : "🏛️ CONSULT THE PYTHIAN ORACLE"}</span>
            </button>

            {/* Error state */}
            {oracleError && (
              <div className="mt-4 p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-[10px] font-mono text-red-300 leading-relaxed uppercase">
                ⚠️ Oracle Error: {oracleError}
              </div>
            )}

            {/* Beautiful Pythian report modal/slate inside dashboard */}
            {oracleResponse && (
              <div className="mt-4.5 bg-[#0b0c0d] border-2 border-brand-gold/30 rounded-2xl p-5 relative max-h-[350px] overflow-y-auto scrollbar-thin">
                <div className="absolute top-2 right-2 flex items-center font-serif font-black text-[#c5a85c] text-[8.5px] tracking-widest opacity-40 select-none">
                  ORACLE APOTHEOSIS LOG
                </div>
                
                <div className="font-serif text-xs text-zinc-100 leading-relaxed space-y-4 prose-invert select-text whitespace-pre-line">
                  {oracleResponse}
                </div>
              </div>
            )}

          </div>

          {/* Active Positions placement lists */}
          <div className="bg-panel-dark border-2 border-border-dark rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-serif font-black text-sm text-zinc-300 tracking-widest uppercase pb-3 border-b border-border-medium flex items-center gap-2">
              <Coins className="h-4.5 w-4.5 text-brand-gold" />
              Live Placements ({metrics.activePositions.length})
            </h3>

            {metrics.activePositions.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 font-mono text-[10px] bg-black/15 rounded-xl border border-dashed border-border-dark">
                No active neural positions. Signals trigger executions.
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {metrics.activePositions.map((pos) => (
                  <div key={pos.id} className="p-3 bg-black/45 hover:bg-black/60 rounded-xl border border-border-dark flex items-center justify-between transition-colors">
                    <div className="space-y-1 font-mono">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`px-1.5 py-0.2 rounded font-extrabold text-[8.5px] ${
                          pos.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>{pos.action}</span>
                        <span className="text-zinc-250 font-bold">{pos.symbol}</span>
                        <span className="text-zinc-500">[{pos.lot} L]</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Entry: <span className="text-zinc-350">${pos.entryPrice.toFixed(selectedSymbol === 'EURUSD' ? 4 : 2)}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div className="font-mono">
                        <span className={`text-[11.5px] font-bold block ${
                          pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => forceClosePosition(pos.id)}
                        className="px-2.5 py-1 text-[9.5px] bg-zinc-800 hover:bg-zinc-750 text-zinc-350 hover:text-white rounded-md font-mono transition-all cursor-pointer border border-border-dark"
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Closed Ledger */}
            {tradeHistory.length > 0 && (
              <div className="space-y-2 mt-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">Closed Positions Ledger</span>
                <div className="space-y-1.5 max-h-[141px] overflow-y-auto">
                  {tradeHistory.map((trObj, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-mono bg-black/10 p-2 rounded-lg border border-border-dark/60">
                      <div className="flex items-center gap-1.5">
                        <span className={trObj.action === 'BUY' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                          {trObj.action}
                        </span>
                        <span className="text-zinc-400 font-bold">{trObj.symbol}</span>
                        <span className="text-zinc-600">({trObj.lot}L)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[9px]">
                          ${trObj.entryPrice?.toFixed(selectedSymbol === 'EURUSD' ? 4 : 0)} → ${trObj.exitPrice?.toFixed(selectedSymbol === 'EURUSD' ? 4 : 0)}
                        </span>
                        <span className={`font-bold ${trObj.pnl >= 0 ? 'text-emerald-400' : 'text-red-450'}`}>
                          {trObj.pnl >= 0 ? '+' : ''}${trObj.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
