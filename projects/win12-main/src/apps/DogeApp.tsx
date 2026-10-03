import { useState, useEffect } from 'react';

const generatePrice = (base: number) => base + (Math.random() - 0.48) * 0.015;

export default function DogeApp() {
  const [price, setPrice] = useState(1.0);
  const [priceHistory, setPriceHistory] = useState<number[]>([0.95, 0.97, 0.96, 0.98, 0.99, 1.0, 1.01, 0.99, 1.02, 1.0, 1.03, 1.01, 1.0, 1.02, 1.0]);
  const [balance] = useState(11_000_000_000);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPrice(p => {
        const np = Math.max(0.98, Math.min(1.02, generatePrice(p)));
        setPriceHistory(h => [...h.slice(-20), np]);
        return np;
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  const maxH = Math.max(...priceHistory);
  const minH = Math.min(...priceHistory);
  const range = maxH - minH || 0.01;

  const transactions = [
    { type: 'RECEIVED', amount: '+1,000,000,000', from: '@elonmusk (self)', time: '1h ago', color: '#00ff88' },
    { type: 'SENT', amount: '-420,069', to: '@karpathy', time: '3h ago', color: '#ff4444' },
    { type: 'RECEIVED', amount: '+69,420,000', from: 'Mining Reward', time: '6h ago', color: '#00ff88' },
    { type: 'STAKING', amount: '+100,000', from: 'Staking Yield', time: '12h ago', color: '#ffd700' },
    { type: 'SENT', amount: '-1,337', to: 'Tesla Supercharger', time: '1d ago', color: '#ff4444' },
  ];

  return (
    <div className="h-full flex flex-col overflow-auto" style={{ background: '#08060a' }}>
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,215,0,0.3)', background: 'rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px #ffd700)' }}>🐕</div>
          <div>
            <div className="orbitron text-lg font-black neon-text-gold">DOGECOIN WALLET</div>
            <div className="share-tech text-xs" style={{ color: 'rgba(255,215,0,0.5)' }}>Such wow. Very blockchain. 🚀</div>
          </div>
        </div>
        <div className="text-right">
          <div className="orbitron text-2xl font-black neon-text-gold">${price.toFixed(4)}</div>
          <div className="share-tech text-xs" style={{ color: '#00ff88' }}>+420.69% ↑ 24h</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Balance */}
        <div
          className="relative p-5 rounded-2xl overflow-hidden text-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0.9) 70%)',
            border: '1px solid rgba(255,215,0,0.4)',
            boxShadow: '0 0 40px rgba(255,215,0,0.1)',
          }}
        >
          <div className="text-5xl mb-3" style={{ filter: 'drop-shadow(0 0 20px #ffd700)', animation: 'floatUp 3s ease-in-out infinite' }}>🐕</div>
          <div className="share-tech text-sm" style={{ color: 'rgba(255,215,0,0.6)' }}>Total Balance</div>
          <div className="orbitron text-3xl font-black neon-text-gold my-1">
            {balance.toLocaleString()} DOGE
          </div>
          <div className="orbitron text-xl" style={{ color: '#00ff88' }}>
            ≈ ${(balance * price).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
          <div className="share-tech text-xs mt-2" style={{ color: 'rgba(255,215,0,0.4)' }}>
            Wallet: DEM1on...musk42 · Starlink Node
          </div>
        </div>

        {/* Price chart */}
        <div
          className="p-4 rounded-2xl"
          style={{ border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="orbitron text-xs neon-text-gold" style={{ letterSpacing: '2px' }}>DOGE/USD LIVE</div>
            <div className="orbitron text-sm font-bold neon-text-gold">${price.toFixed(4)}</div>
          </div>
          
          {/* Chart */}
          <div className="relative" style={{ height: '80px' }}>
            <svg width="100%" height="80" viewBox={`0 0 ${priceHistory.length * 20} 80`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Fill */}
              <path
                d={`M0,80 ${priceHistory.map((p, i) => `L${i * 20},${80 - ((p - minH) / range) * 70}`).join(' ')} L${(priceHistory.length-1)*20},80 Z`}
                fill="url(#chartGrad)"
              />
              {/* Line */}
              <polyline
                points={priceHistory.map((p, i) => `${i * 20},${80 - ((p - minH) / range) * 70}`).join(' ')}
                fill="none"
                stroke="#ffd700"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 4px #ffd700)' }}
              />
              {/* Current dot */}
              <circle
                cx={(priceHistory.length - 1) * 20}
                cy={80 - ((priceHistory[priceHistory.length-1] - minH) / range) * 70}
                r="4"
                fill="#ffd700"
                style={{ filter: 'drop-shadow(0 0 6px #ffd700)' }}
              />
            </svg>
          </div>

          <div className="flex justify-between share-tech mt-1" style={{ fontSize: '10px', color: 'rgba(255,215,0,0.4)' }}>
            <span>Min: ${minH.toFixed(4)}</span>
            <span>Max: ${maxH.toFixed(4)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'SEND', icon: '↑', color: '#ff4444' },
            { label: 'RECEIVE', icon: '↓', color: '#00ff88' },
            { label: 'STAKE', icon: '⚡', color: '#ffd700' },
          ].map((a, i) => (
            <button
              key={i}
              className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all hover:scale-105"
              style={{
                background: `${a.color}11`,
                border: `1px solid ${a.color}44`,
                color: a.color,
              }}
              onClick={() => { if (a.label === 'SEND') setSending(!sending); }}
            >
              <div className="text-xl">{a.icon}</div>
              <div className="orbitron text-xs font-bold">{a.label}</div>
            </button>
          ))}
        </div>

        {/* Send form */}
        {sending && (
          <div
            className="p-4 rounded-xl"
            style={{ border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.05)' }}
          >
            <div className="orbitron text-xs mb-3" style={{ color: '#ff4444', letterSpacing: '2px' }}>SEND DOGE</div>
            <input
              className="w-full px-3 py-2 rounded-lg share-tech text-sm mb-2 outline-none"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.3)', color: '#fff', caretColor: '#ffd700' }}
              placeholder="Recipient address…"
            />
            <input
              className="w-full px-3 py-2 rounded-lg share-tech text-sm mb-3 outline-none"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,215,0,0.3)', color: '#fff', caretColor: '#ffd700' }}
              placeholder="Amount in DOGE…"
            />
            <button
              className="w-full py-2 rounded-lg orbitron text-xs font-bold"
              style={{ background: 'linear-gradient(90deg, #ff4444, #ff8800)', color: '#fff' }}
            >
              SEND DOGE 🐕
            </button>
          </div>
        )}

        {/* Transactions */}
        <div>
          <div className="orbitron text-xs neon-text-gold mb-3" style={{ letterSpacing: '2px' }}>TRANSACTIONS</div>
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ border: '1px solid rgba(255,215,0,0.1)', background: 'rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">{tx.type === 'RECEIVED' || tx.type === 'STAKING' ? '↓' : '↑'}</div>
                  <div>
                    <div className="share-tech text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                    </div>
                    <div className="share-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{tx.time}</div>
                  </div>
                </div>
                <div className="orbitron text-xs font-bold" style={{ color: tx.color }}>{tx.amount} DOGE</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
