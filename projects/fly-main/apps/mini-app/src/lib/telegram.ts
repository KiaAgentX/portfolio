/**
 * Telegram Mini App auth helper (spec §35, roadmap Block E).
 * Reads real initData inside Telegram; falls back to guest auth in a plain
 * browser so the mini-app is testable outside Telegram during development.
 */
import type { FishkalApi, PlayerProfile } from '@fishkal/api-client';

interface TgWebApp {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
}

export function tgWebApp(): TgWebApp | null {
  const w = window as unknown as { Telegram?: { WebApp?: TgWebApp } };
  return w.Telegram?.WebApp ?? null;
}

/** Authenticate against the API: Telegram initData when present, else guest. */
export async function authenticate(api: FishkalApi): Promise<{ token: string; profile: PlayerProfile; via: 'telegram' | 'guest' }> {
  const tg = tgWebApp();
  tg?.ready?.();
  tg?.expand?.();
  if (tg?.initData) {
    const res = await api.authenticateTelegram(tg.initData);
    return { ...res, via: 'telegram' };
  }
  const res = await api.authenticateGuest('Mini App Player');
  return { ...res, via: 'guest' };
}

/** Parse a /start deep link referral payload (blocked on token, table ready). */
export function referralCodeFromStart(startParam: string | null): string | null {
  if (!startParam) return null;
  const m = /^ref_([A-Za-z0-9-]{6,64})$/.exec(startParam);
  return m?.[1] ?? null;
}
