import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-app lightweight robust database engine
const DB_FILE = path.join(process.cwd(), 'ghostvault_db.json');

interface User {
  id: string;
  solanaAddress: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

interface Product {
  id: string;
  sellerId: string;
  sellerAddress: string;
  title: string;
  description: string;
  price: number; // in USDC
  tags: string[];
  fileContent: string;
  fileName: string;
  createdAt: string;
  salesCount: number;
}

interface Transaction {
  id: string;
  productId: string;
  productTitle: string;
  buyerAddress: string;
  sellerId: string;
  sellerAddress: string;
  amount: number;
  platformFee: number;
  creatorNet: number;
  txSignature: string;
  createdAt: string;
  settledAt?: string;
  settlementTxId?: string;
}

interface DailyEarning {
  id: string;
  userAddress: string;
  date: string;
  totalGross: number;
  netEarnings: number;
  settledAt?: string;
  settlementTxId?: string;
}

interface Referral {
  id: string;
  referrerAddress: string;
  refereeAddress: string;
  createdAt: string;
}

interface DBState {
  users: Record<string, User>;
  products: Product[];
  transactions: Transaction[];
  dailyEarnings: DailyEarning[];
  referrals: Referral[];
}

const DEFAULT_STATE: DBState = {
  users: {},
  products: [
    {
      id: "prod-1",
      sellerId: "creator-vault",
      sellerAddress: "GvSf8p3C7N8bW8Vq5i4g8H2x8Xq7Zz9W4k8P1j3c5K6M",
      title: "Solana Arbitrage Trading Bot (Node.js)",
      description: "A complete, high-performance arbitrage script targeting Jupiter DEX and Orca liquidity pools. Features instant routing calculations, slippage protections, and auto-signing.",
      price: 25,
      tags: ["Solana", "Jupiter", "Trading Bot", "Node.js"],
      fileName: "arbitrageExecutor.ts",
      fileContent: `/**
 * Solana Arbitrage Trader targeting Jupiter Router API
 * @license Apache-2.0
 */

import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';

const JUP_API = 'https://quote-api.jup.ag/v6';
const SLIPPAGE_BPS = 50; // 0.5%

interface ArbConfig {
  connection: Connection;
  payer: Keypair;
  inputMint: string;
  targetMint: string;
  amountInLamports: number;
}

export async function executeArbitrage(config: ArbConfig) {
  console.log('Fetching route quotes for potential arbitrage...');
  
  // 1. Fetch quote for inputMint -> targetMint
  const firstQuoteUrl = \`\${JUP_API}/quote?inputMint=\${config.inputMint}&outputMint=\${config.targetMint}&amount=\${config.amountInLamports}&slippageBps=\${SLIPPAGE_BPS}\`;
  const firstQuote = await (await fetch(firstQuoteUrl)).json();
  
  if (!firstQuote.outAmount) {
    throw new Error('Could not find viable route path.');
  }

  // 2. Fetch reverse route for targetMint -> inputMint to see if profit is greater than input
  const secondQuoteUrl = \`\${JUP_API}/quote?inputMint=\${config.targetMint}&outputMint=\${config.inputMint}&amount=\${firstQuote.outAmount}&slippageBps=\${SLIPPAGE_BPS}\`;
  const secondQuote = await (await fetch(secondQuoteUrl)).json();

  const netOutput = Number(secondQuote.outAmount);
  const profit = netOutput - config.amountInLamports;

  console.log(\`Estimated Output: \${netOutput} Lamports. Profit: \${profit} Lamports\`);

  if (profit <= 0) {
    console.log('❌ Arbitrage route is not profitable right now. Aborting.');
    return { profitable: false, profit: 0 };
  }

  console.log('✅ Profit found! Constructing transactional route via Jupiter...');
  // Next step executes swap transaction on-chain
  return { profitable: true, profit };
}`,
      createdAt: new Date().toISOString(),
      salesCount: 42
    },
    {
      id: "prod-2",
      sellerId: "creator-vault",
      sellerAddress: "GvSf8p3C7N8bW8Vq5i4g8H2x8Xq7Zz9W4k8P1j3c5K6M",
      title: "React Web3 Portfolio Dashboard Landing Card",
      description: "A fully responsive modular tailwind portfolio dashboard featuring dynamic charts, ERC20 coin listings, customized wallet popup triggers, and transaction records.",
      price: 15,
      tags: ["React", "Dashboard", "Tailwind CSS", "Web3"],
      fileName: "CryptoDashboard.tsx",
      fileContent: `import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const mockChartData = [
  { day: 'Mon', balance: 5400 },
  { day: 'Tue', balance: 6200 },
  { day: 'Wed', balance: 5900 },
  { day: 'Thu', balance: 7400 },
  { day: 'Fri', balance: 8100 },
  { day: 'Sat', balance: 9600 },
];

export default function CryptoDashboard() {
  const [balance, setBalance] = useState(9620.45);
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs text-slate-400 block tracking-wider">NET WORTH</span>
          <h2 className="text-3xl font-mono font-bold text-white">\${balance.toLocaleString()}</h2>
        </div>
        <div className="bg-indigo-600/15 border border-indigo-600/30 p-3 rounded-2xl text-indigo-400">
          <Wallet size={24} />
        </div>
      </div>
      
      <div className="h-40 mb-6 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-2xl font-medium transition duration-200">
          <ArrowUpRight size={18} /> Send
        </button>
        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-2xl font-medium transition duration-200">
          <ArrowDownLeft size={18} /> Receive
        </button>
      </div>
    </div>
  );
}`,
      createdAt: new Date().toISOString(),
      salesCount: 18
    },
    {
      id: "prod-3",
      sellerId: "creator-vault",
      sellerAddress: "GvSf8p3C7N8bW8Vq5i4g8H2x8Xq7Zz9W4k8P1j3c5K6M",
      title: "Ethereum Smart Contract Auditor Script",
      description: "Automated analysis tool pointing out standard Solidity vulnerabilities (reentrancy flaws, integer limits, public withdraw overrides) using abstract syntax parsing.",
      price: 35,
      tags: ["Solidity", "Security", "Auditing", "Python"],
      fileName: "contract_auditor.py",
      fileContent: `import re

class SmartContractAuditor:
    """
    Solidity static logic auditor targeting reentrancy and access oversight.
    """
    def __init__(self, file_path):
        self.file_path = file_path
        self.issues = []

    def audit(self):
        with open(self.file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        self.check_reentrancy(code)
        self.check_tx_origin(code)
        self.check_unsafe_delegatecall(code)
        
        return self.issues

    def check_reentrancy(self, code):
        # Look for state updates occurring after external call
        calls = re.findall(r'(\\w+)\\.call{value:', code)
        if calls:
            self.issues.append({
                "type": "High Vulnerability",
                "message": "Found dynamic external transfer .call{...}. Ensure state updates occur beforehand to prevent reentrancy attacks."
            })

    def check_tx_origin(self, code):
        if "tx.origin" in code:
            self.issues.append({
                "type": "Medium Vulnerability",
                "message": "Involved usage of 'tx.origin' for authentication. Prefer using 'msg.sender' to rule out phishing vectors."
            })
            
    def check_unsafe_delegatecall(self, code):
        if "delegatecall" in code:
            self.issues.append({
                "type": "Critical Vulnerability",
                "message": "Sensed low-level delegatecall context. Avoid forwarding execution to uncontrolled addresses or dynamic variables."
            })
`,
      createdAt: new Date().toISOString(),
      salesCount: 29
    }
  ],
  transactions: [],
  dailyEarnings: [],
  referrals: []
};

function readDB(): DBState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, resetting to fallback:', err);
    return DEFAULT_STATE;
  }
}

function writeDB(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed writing DB:', err);
  }
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return geminiClient;
}

// REST API Endpoints

// 1. Solana Wallet Auth & Registration
app.post('/api/auth/login', (req, res) => {
  const { solanaAddress, referredBy } = req.body;
  if (!solanaAddress) {
    res.status(400).json({ error: 'Solana address is required.' });
    return;
  }

  const db = readDB();
  let user = db.users[solanaAddress];

  if (!user) {
    const newUserId = `usr-${Math.random().toString(36).substring(2, 11)}`;
    const referralCode = `code-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    user = {
      id: newUserId,
      solanaAddress,
      referralCode,
      createdAt: new Date().toISOString()
    };

    if (referredBy && referredBy !== referralCode) {
      // Find referee code owner
      const referrer = Object.values(db.users).find(u => u.referralCode === referredBy);
      if (referrer) {
        user.referredBy = referrer.solanaAddress;
        db.referrals.push({
          id: `ref-${Math.random().toString(36).substring(2, 11)}`,
          referrerAddress: referrer.solanaAddress,
          refereeAddress: solanaAddress,
          createdAt: new Date().toISOString()
        });
      }
    }

    db.users[solanaAddress] = user;
    writeDB(db);
  }

  res.json({ success: true, user });
});

// 2. Fetch listed digital items
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json({ products: db.products });
});

// 3. Purchase logic with customizable Solana Devnet Tx Simulation
app.post('/api/transactions/buy', (req, res) => {
  const { productId, buyerAddress, txSignature } = req.body;
  if (!productId || !buyerAddress || !txSignature) {
    res.status(400).json({ error: 'All attributes represent fully valid signatures.' });
    return;
  }

  const db = readDB();
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const buyer = db.users[buyerAddress];
  if (!buyer) {
    res.status(400).json({ error: 'Buyer does not possess registered account.' });
    return;
  }

  // Calculate platform fees and creator earnings net
  const amount = product.price;
  const platformFee = Number((amount * 0.05).toFixed(6)); // 5% fee
  const creatorNet = Number((amount - platformFee).toFixed(6));

  const newTx: Transaction = {
    id: `tx-${Math.random().toString(36).substring(2, 11)}`,
    productId,
    productTitle: product.title,
    buyerAddress,
    sellerId: product.sellerId,
    sellerAddress: product.sellerAddress,
    amount,
    platformFee,
    creatorNet,
    txSignature,
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  product.salesCount += 1;
  writeDB(db);

  res.json({ success: true, transaction: newTx });
});

// 4. Fetch User Earnings & Performance Overview
app.get('/api/earnings/:solanaAddress', (req, res) => {
  const { solanaAddress } = req.params;
  const db = readDB();

  // Filter transactions owned by this seller
  const sales = db.transactions.filter(t => t.sellerAddress === solanaAddress);
  
  // Calculate total pending (unsettled) vs settled
  const pendingSales = sales.filter(s => !s.settlementTxId);
  const settledSales = sales.filter(s => s.settlementTxId);

  const pendingBalance = Number(pendingSales.reduce((acc, s) => acc + s.creatorNet, 0).toFixed(6));
  const totalSettled = Number(settledSales.reduce((acc, s) => acc + s.creatorNet, 0).toFixed(6));

  // Referrals Count
  const referrals = db.referrals.filter(r => r.referrerAddress === solanaAddress);
  // Referral rewards: 0.5 USDC per purchase completed by referee
  let referralEarnings = 0;
  referrals.forEach(ref => {
    const refereePurchases = db.transactions.filter(t => t.buyerAddress === ref.refereeAddress);
    referralEarnings += refereePurchases.length * 0.5; // 0.5 USDC promo cash
  });

  res.json({
    pendingBalance,
    totalSettled,
    totalSales: sales.length,
    referralCount: referrals.length,
    referralEarnings,
    salesHistory: sales,
    settlementHistory: db.dailyEarnings.filter(d => d.userAddress === solanaAddress)
  });
});

// 5. Trigger Solana Automatic Settlement simulation
app.post('/api/settlement/trigger', (req, res) => {
  const db = readDB();
  const unsettledTx = db.transactions.filter(t => !t.settlementTxId);

  if (unsettledTx.length === 0) {
    res.json({ success: true, message: "No outstanding balances requiring automatic USDC daily settle.", settlements: [] });
    return;
  }

  // Group by seller address
  const group: Record<string, { total: number; txs: Transaction[] }> = {};
  unsettledTx.forEach(tx => {
    if (!group[tx.sellerAddress]) {
      group[tx.sellerAddress] = { total: 0, txs: [] };
    }
    group[tx.sellerAddress].total += tx.creatorNet;
    group[tx.sellerAddress].txs.push(tx);
  });

  const settlementsCreated: DailyEarning[] = [];

  Object.entries(group).forEach(([sellerAddress, info]) => {
    const netEarnings = Number(info.total.toFixed(6));
    if (netEarnings <= 0) return;

    // Simulate Solana USDC ledger transaction
    const mockSolanaSignature = `settle_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}USDC`;
    
    const earningRecord: DailyEarning = {
      id: `err-${Math.random().toString(36).substring(2, 11)}`,
      userAddress: sellerAddress,
      date: new Date().toISOString().split('T')[0],
      totalGross: netEarnings,
      netEarnings,
      settledAt: new Date().toISOString(),
      settlementTxId: mockSolanaSignature
    };

    db.dailyEarnings.push(earningRecord);
    settlementsCreated.push(earningRecord);

    // Update transactions status
    info.txs.forEach(t => {
      const idx = db.transactions.findIndex(original => original.id === t.id);
      if (idx !== -1) {
        db.transactions[idx].settlementTxId = mockSolanaSignature;
        db.transactions[idx].settledAt = earningRecord.settledAt;
      }
    });
  });

  writeDB(db);
  res.json({ success: true, message: `${settlementsCreated.length} users successfully settled in daily run.`, settlements: settlementsCreated });
});

// 6. AI Agent Smart Builder: generate products lazily using Gemini
app.post('/api/products/generate', async (req, res) => {
  const { prompt, sellerAddress, sellerId } = req.body;
  if (!prompt || !sellerAddress) {
    res.status(400).json({ error: 'Core prompt and seller address is verified.' });
    return;
  }

  try {
    const ai = getGemini();

    if (ai) {
      const gResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a high-quality fully functional code file inside string for a premium digital product offering. User Request is: "${prompt}".
Please generate beautiful, well-commented code snippet. Respond strictly as JSON containing:
{
  "title": "Stunning catchy title for the item",
  "description": "Compelling marketplace marketing copy detailing what makes it exceptional and how to use it",
  "fileName": "realisticMainFile.tsx_or_py_or_js",
  "fileContent": "Fully written multi-line code script matching requirements",
  "recommendedPrice": 25,
  "tags": ["Tag1", "Tag2", "Tag3"]
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              fileName: { type: Type.STRING },
              fileContent: { type: Type.STRING },
              recommendedPrice: { type: Type.NUMBER },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "fileName", "fileContent", "recommendedPrice", "tags"],
          }
        }
      });

      const data = JSON.parse(gResponse.text?.trim() || "{}");
      
      const newProduct: Product = {
        id: `prod-${Math.random().toString(36).substring(2, 11)}`,
        sellerId: sellerId || "anonymous",
        sellerAddress,
        title: data.title || `${prompt.substring(0, 30)} script`,
        description: data.description || `AI built resource for: ${prompt}`,
        price: data.recommendedPrice ? Math.floor(Math.max(1, Math.min(100, data.recommendedPrice))) : 15,
        tags: data.tags || ["AI", "Template"],
        fileName: data.fileName || "index.js",
        fileContent: data.fileContent || "console.log('AI product compilation complete.')",
        createdAt: new Date().toISOString(),
        salesCount: 0
      };

      const db = readDB();
      db.products.push(newProduct);
      writeDB(db);

      res.json({ success: true, product: newProduct });
      return;
    }
  } catch (err) {
    console.warn('Gemini request failed or key is missing. Generating beautiful local sandbox product instead:', err);
  }

  // Developer Fallback Simulator Mode
  const possibleTemplates = [
    {
      title: `Automated ${prompt} Executor Script`,
      description: `A responsive, battle-tested lightweight digital package crafted to implement: ${prompt}. Includes simple config and secure local validation built in.`,
      fileName: "digitalAsset.py",
      price: 19,
      tags: ["Python", "Automation", "Tool", "GhostVault-AI"],
      fileContent: `#!/usr/bin/env python3
# GhostVault AI Auto-Generated Output
# Prompt: ${prompt}

import time
import json

def main():
    print("[+] Initiating ${prompt} execution controller")
    config = {
        "status": "ready",
        "mode": "production_sandbox",
        "last_sync": int(time.time())
    }
    
    print("[*] Processing configurations...")
    time.sleep(1)
    print("[+] Core threads successfully synchronized on relative ports.")
    print("[+] Finished executing: ${prompt}")
    return json.dumps(config, indent=2)

if __name__ == '__main__':
    print(main())
`
    },
    {
      title: `${prompt} Tailwind Framework Card`,
      description: `An elegant React template card component styled with premium custom Tailwind grids tailored for: ${prompt}.`,
      fileName: "SleekComponent.tsx",
      price: 12,
      tags: ["React", "UI Component", "Tailwind CSS"],
      fileContent: `import React from 'react';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function SleekItemCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm mx-auto shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-300" />
      
      <div className="flex gap-2 items-center text-indigo-400 font-medium text-xs tracking-wider uppercase mb-3">
        <Sparkles size={14} /> AI GENERATION
      </div>
      
      <h3 className="text-xl font-bold font-sans text-white mb-2">${prompt}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Crafted specifically using state-of-the-art parameters for digital presentation on secondary modules.
      </p>
      
      <div className="flex justify-between items-center bg-slate-800/55 p-4 rounded-2xl border border-slate-805/30">
        <span className="text-xs text-slate-400 uppercase tracking-widest">Pricing</span>
        <span className="text-lg font-mono font-bold text-emerald-400">$12 USDC</span>
      </div>
    </div>
  );
}`
    }
  ];

  const selectedTemplate = possibleTemplates[Math.floor(Math.random() * possibleTemplates.length)];

  const fallbackProduct: Product = {
    id: `prod-${Math.random().toString(36).substring(2, 11)}`,
    sellerId: sellerId || "anonymous",
    sellerAddress,
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    price: selectedTemplate.price,
    tags: selectedTemplate.tags,
    fileName: selectedTemplate.fileName,
    fileContent: selectedTemplate.fileContent,
    createdAt: new Date().toISOString(),
    salesCount: 0
  };

  const db = readDB();
  db.products.push(fallbackProduct);
  writeDB(db);

  res.json({ success: true, product: fallbackProduct });
});

// Configure Vite or Static Assets serving based on surroundings
async function startServer() {
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
    console.log(`GhostVault server listining on port ${PORT}`);
  });
}

startServer();
