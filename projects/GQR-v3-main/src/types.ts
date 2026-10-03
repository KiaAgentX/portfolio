export interface PineIndicator {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  inputs: { name: string; type: string; defaultVal: string }[];
  alerts: string[];
}

export interface CodeFile {
  path: string;
  name: string;
  language: string;
  description: string;
  code: string;
  highlights: string[];
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  lot: number;
  equityAfter: number;
  prevHash: string;
  hash: string;
}

export interface SimulationState {
  equity: number;
  balance: number;
  high: number;
  drawdown: number;
  killSwitch: boolean;
  activePositions: ActivePosition[];
}

export interface ActivePosition {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  lot: number;
  unrealizedPnL: number;
}
