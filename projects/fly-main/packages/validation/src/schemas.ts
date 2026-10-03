import { z } from 'zod';

export const raritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export const runFishCatchSchema = z.object({
  fishId: z.string().min(1).max(64),
  /** Depth in metres when the catch happened. */
  depth: z.number().finite().min(0).max(500),
  /** Milliseconds since run start. */
  atMs: z.number().int().min(0).max(30 * 60_000),
});

/** Client-submitted run. Everything is re-validated server-side (spec §58–60). */
export const gameRunSubmitSchema = z.object({
  maxDepth: z.number().finite().min(0).max(500),
  durationMs: z.number().int().min(1_000).max(30 * 60_000),
  catches: z.array(runFishCatchSchema).max(500),
  clientSeed: z.number().int(),
});

/** Telegram WebApp initData authentication (spec §35). */
export const telegramAuthSchema = z.object({
  initData: z.string().min(1).max(4_096),
});

export const playerIdParamsSchema = z.object({
  playerId: z.string().uuid(),
});

export type GameRunSubmitDto = z.infer<typeof gameRunSubmitSchema>;
export type TelegramAuthDto = z.infer<typeof telegramAuthSchema>;
