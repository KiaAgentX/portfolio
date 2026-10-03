/** Typed API client (spec §63–64). Frontends never talk to Prisma directly. */

export interface ApiErrorShape {
  code:
    | 'AUTH_ERROR'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMIT'
    | 'INTERNAL_ERROR'
    | 'GAME_VALIDATION_ERROR';
  message: string;
}

export class ApiError extends Error {
  readonly code: ApiErrorShape['code'];
  readonly status: number;

  constructor(status: number, body: ApiErrorShape) {
    super(body.message);
    this.code = body.code;
    this.status = status;
  }
}

export interface SubmitRunResponse {
  runId: string;
  score: number;
  credits: number;
  maxCombo: number;
  flags: string[];
  record: boolean;
}

export interface LeaderboardRow {
  playerId: string;
  displayName: string | null;
  score: number;
  rank: number;
}

export interface PlayerProfile {
  playerId: string;
  displayName: string | null;
  credits: number;
  level: number;
  totalScore: number;
  deepestDepth: number;
  largestFish: string | null;
}

// ---- Economy (roadmap 3.2/3.3) ------------------------------------------------

export interface WalletView {
  credits: number;
  ledger: { delta: number; reason: string; refId: string | null; createdAt: string }[];
}

export interface UpgradeView {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  nextCost: number | null;
}

export interface PurchaseResult {
  ok: true;
  credits: number;
  level: number;
  loadout: {
    hookStrength: number;
    lineStrength: number;
    lineLength: number;
    reelSpeed: number;
    magnetRadius: number;
  };
}

export interface MissionView {
  id: string;
  titleKey: string;
  descriptionKey: string;
  kind: string;
  target: number;
  progress: number;
  rewardCredits: number;
  claimable: boolean;
  claimed: boolean;
}

export interface CollectionEntry {
  fishId: string;
  bestScore: number;
  bestDepth: number;
  caughtAt: string;
}

export type PlayerLoadout = PurchaseResult['loadout'];

// ---- Referrals (spec §52) ------------------------------------------------------

export interface ReferralInfo {
  referrerId: string | null;
  invited: { playerId: string; displayName: string | null; rewarded: boolean }[];
  rewardCredits: number;
  claimed: boolean;
  claimable: boolean;
}

// ---- Analytics (spec §30, §61) --------------------------------------------------

export interface AnalyticsEventInput {
  name: string;
  props?: Record<string, unknown>;
}

// ---- Admin (spec §29; token-gated, ops-only) ------------------------------------

export interface AdminStats {
  db: boolean;
  players: number;
  runs: number;
  referralsRewarded: number;
  dailyActive: { day: string; players: number; runs: number }[];
  topFish: { fishId: string; catches: number }[];
  events24h: { name: string; count: number }[];
}

export interface ConfigOverrideEntry {
  path: string;
  value: unknown;
  updatedBy: string | null;
  updatedAt: string;
}

export class FishkalApi {
  private baseUrl: string;
  private sessionToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setSessionToken(token: string | null): void {
    this.sessionToken = token;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (this.sessionToken) headers.authorization = `Bearer ${this.sessionToken}`;

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const text = await res.text();
    const body = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const shaped = body as ApiErrorShape | null;
      throw new ApiError(res.status, {
        code: shaped?.code ?? 'INTERNAL_ERROR',
        message: shaped?.message ?? `Request failed (${res.status})`,
      });
    }
    return body as T;
  }

  /** Exchange Telegram initData for a session token (spec §35). Dev fallback: guest. */
  async authenticateTelegram(initData: string): Promise<{ token: string; profile: PlayerProfile }> {
    return this.request('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
  }

  async authenticateGuest(displayName?: string, referredBy?: string | null): Promise<{ token: string; profile: PlayerProfile }> {
    return this.request('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ displayName, referredBy: referredBy ?? undefined }),
    });
  }

  /** Submit a finished run. The server recomputes score/credits (spec §60). */
  async submitRun(payload: {
    maxDepth: number;
    durationMs: number;
    catches: { fishId: string; depth: number; atMs: number }[];
    clientSeed: number;
  }): Promise<SubmitRunResponse> {
    return this.request('/game/runs', { method: 'POST', body: JSON.stringify(payload) });
  }

  async getLeaderboard(board: 'global' | 'weekly' = 'global', limit = 20): Promise<LeaderboardRow[]> {
    return this.request(`/leaderboard?board=${board}&limit=${limit}`);
  }

  async getProfile(): Promise<PlayerProfile> {
    return this.request('/players/me');
  }

  async getWallet(): Promise<WalletView> {
    return this.request('/economy/wallet');
  }

  async getUpgrades(): Promise<UpgradeView[]> {
    return this.request('/upgrades');
  }

  /** `refId` makes purchases idempotent — generate a fresh UUID per click. */
  async purchaseUpgrade(upgradeId: string, refId: string): Promise<PurchaseResult> {
    return this.request('/upgrades/purchase', {
      method: 'POST',
      body: JSON.stringify({ upgradeId, refId }),
    });
  }

  async getLoadout(): Promise<PlayerLoadout> {
    return this.request('/players/me/loadout');
  }

  async getMissions(): Promise<MissionView[]> {
    return this.request('/missions');
  }

  async claimMission(missionId: string): Promise<{ ok: true; credits: number; reward: number }> {
    return this.request('/missions/claim', {
      method: 'POST',
      body: JSON.stringify({ missionId }),
    });
  }

  async getCollection(): Promise<CollectionEntry[]> {
    return this.request('/collection');
  }

  async getGameConfig(): Promise<unknown> {
    return this.request('/game/config');
  }

  // ---- Referrals ----------------------------------------------------------------

  async getReferralInfo(): Promise<ReferralInfo> {
    return this.request('/referrals/me');
  }

  /** One-time reward when at least one invitee exists and it is unclaimed. */
  async claimReferralReward(): Promise<{ ok: true; credits: number; reward: number }> {
    return this.request('/referrals/claim', { method: 'POST', body: JSON.stringify({}) });
  }

  /** Attach the current player as invitee of `referrerId` (idempotent). */
  async attachReferral(referrerId: string): Promise<{ ok: true }> {
    return this.request('/referrals/attach', {
      method: 'POST',
      body: JSON.stringify({ referrerId }),
    });
  }

  // ---- Analytics (fire-and-forget; errors are swallowed by the caller) -----------

  async trackEvent(event: AnalyticsEventInput): Promise<{ ok: true }> {
    return this.request('/analytics/events', { method: 'POST', body: JSON.stringify(event) });
  }

  // ---- Admin --------------------------------------------------------------------

  async adminStats(token: string): Promise<AdminStats> {
    const prev = this.sessionToken;
    this.setSessionToken(token);
    try {
      return await this.request<AdminStats>('/admin/stats');
    } finally {
      this.setSessionToken(prev);
    }
  }

  async adminSetConfigOverride(token: string, path: string, value: unknown): Promise<ConfigOverrideEntry[]> {
    const prev = this.sessionToken;
    this.setSessionToken(token);
    try {
      return await this.request<ConfigOverrideEntry[]>('/admin/config', {
        method: 'PUT',
        body: JSON.stringify({ path, value }),
      });
    } finally {
      this.setSessionToken(prev);
    }
  }
}
