export interface User {
  id: string;
  solanaAddress: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface Product {
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

export interface Transaction {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerAddress: string;
  sellerId: string;
  sellerAddress: string;
  amount: number; // gross amount
  platformFee: number;
  creatorNet: number;
  txSignature: string;
  createdAt: string;
  settledAt?: string;
  settlementTxId?: string;
}

export interface DailyEarning {
  id: string;
  userAddress: string;
  date: string; // YYYY-MM-DD
  totalGross: number;
  netEarnings: number;
  settledAt?: string;
  settlementTxId?: string;
}

export interface Referral {
  id: string;
  referrerAddress: string;
  refereeAddress: string;
  createdAt: string;
}

export interface CreatorStats {
  pendingBalance: number; // unsettled balance
  totalSettled: number; // already paid out
  totalSales: number; // all-time sales count
  referralCount: number;
  referralEarnings: number; // bonus USDC earned
}
