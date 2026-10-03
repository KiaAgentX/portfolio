'use client';

import { useEffect, useState } from 'react';
import { FishkalApi } from '@fishkal/api-client';
import type { PlayerProfile } from '@fishkal/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useFishkalSession() {
  const [api] = useState(() => new FishkalApi(API_URL));
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [via, setVia] = useState<'telegram' | 'guest'>('guest');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string; ready?: () => void; expand?: () => void } } }).Telegram?.WebApp;
      tg?.ready?.();
      tg?.expand?.();
      try {
        const res = tg?.initData
          ? await api.authenticateTelegram(tg.initData)
          : await api.authenticateGuest('Mini App Player');
        if (!cancelled) {
          setProfile(res.profile);
          setVia(tg?.initData ? 'telegram' : 'guest');
        }
      } catch {
        /* preview mode: stay unauthenticated */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  return { api, profile, setProfile, via };
}

