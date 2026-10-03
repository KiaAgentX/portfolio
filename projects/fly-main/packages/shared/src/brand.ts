/**
 * FISHKAL brand tokens — single source of truth.
 * Spec §2: Navy #0D3B66, Turquoise #10B6A8.
 */
export const BRAND = {
  name: 'FISHKAL',
  gameName: 'FISHKAL: DEEP CATCH',
  market: 'Dubai / UAE',
  colors: {
    navy: '#0D3B66',
    navyDeep: '#072540',
    turquoise: '#10B6A8',
    turquoiseLight: '#3ED8CB',
    sand: '#F4EFE6',
    foam: '#EAF6F4',
    ink: '#0B1B26',
    white: '#FFFFFF',
    danger: '#E25555',
    gold: '#E8B84B',
  },
  fonts: {
    // ASSET_REQUIRED: brand typeface files. Inter is the development fallback.
    display: 'var(--font-display, "Inter", system-ui, sans-serif)',
    body: 'var(--font-body, "Inter", system-ui, sans-serif)',
  },
  motifs: [
    'fish',
    'waves',
    'ocean',
    'underwater light',
    'dubai skyline',
    'fishing boat',
    'hook',
    'depth',
    'freshness',
    'marine life',
  ] as const,
} as const;

/** i18n keys (spec §85) — proxied access into the shared dictionary (i18n.ts). */
import { t as translate } from './i18n.js';

export const STRINGS = {
  en: new Proxy({} as Record<string, string>, {
    get(_target, key: string) {
      return translate('en', key as Parameters<typeof translate>[1]);
    },
  }),
  fa: new Proxy({} as Record<string, string>, {
    get(_target, key: string) {
      return translate('fa', key as Parameters<typeof translate>[1]);
    },
  }),
} as const;

export type StringKey = Parameters<typeof translate>[1];
