/**
 * Telegram WebApp initData verification (spec §35).
 * When TELEGRAM_BOT_TOKEN is not configured, the API runs in dev mode and
 * issues guest sessions instead of failing closed — never trusting client identity.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  /** Deep-link payload from a startapp link (e.g. `ref_<playerId>`). */
  start_param?: string;
}

export function verifyInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // Auth freshness: reject initData older than 24h (replay protection, spec §58).
  const authDate = Number(params.get('auth_date') ?? 0) * 1000;
  if (!authDate || Date.now() - authDate > 24 * 3600 * 1000) return null;

  try {
    const userRaw = params.get('user');
    if (!userRaw) return null;
    return JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
}
