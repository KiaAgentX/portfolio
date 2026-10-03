'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import type { PerfMode } from '@fishkal/game-renderer';
import { useFishkalSession } from '../../hooks/useFishkalSession';
import type { SubmitRunResponse } from '@fishkal/api-client';
import type { MiniHud } from '@/components/GameHost';

const GameViewHost = dynamic(() => import('@/components/GameHost').then((m) => m.GameHost), {
  ssr: false,
});

export default function MiniAppGame() {
  const { api, profile, setProfile } = useFishkalSession();
  const [hud, setHud] = useState<MiniHud>({ score: 0, depth: 0, catches: 0, tension: 0, state: 'READY' });
  const [server, setServer] = useState<SubmitRunResponse | null>(null);

  return (
    <>
      <GameViewHost
        config={DEFAULT_GAME_CONFIG}
        perfMode={'AUTO' as PerfMode}
        api={api}
        onHud={setHud}
        onServerResult={(res) => {
          setServer(res);
          if (res.record) window.alert(`NEW RECORD! +${res.credits} credits`);
          // Keep the mini-app profile in sync with server-authoritative credits.
          setProfile((p) => (p ? { ...p, credits: p.credits + res.credits, totalScore: Math.max(p.totalScore, res.score) } : p));
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          color: '#EAF6F4',
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 1px 4px rgba(0,0,0,.6)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>
          {hud.score} pts · {hud.depth}m · 🐟 {hud.catches}
        </span>
        <span>💰 {profile?.credits ?? '—'}</span>
      </div>
      {server && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 12,
            right: 12,
            textAlign: 'center',
            color: '#3ED8CB',
            fontWeight: 700,
            textShadow: '0 1px 4px rgba(0,0,0,.6)',
          }}
        >
          Run scored: {server.score} pts · +{server.credits} credits
        </div>
      )}
    </>
  );
}
