'use client';

import { useEffect, useState } from 'react';
import { Card } from '@fishkal/design-system';
import { FishkalApi } from '@fishkal/api-client';
import type { LeaderboardRow } from '@fishkal/api-client';

export default function MiniAppLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    const api = new FishkalApi(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000');
    api
      .getLeaderboard('global', 25)
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  return (
    <main style={{ minHeight: '100dvh', padding: 24 }}>
      <h1 className="fk-headline" style={{ fontSize: 30 }}>
        LEADERBOARD
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows?.length === 0 && <p className="fk-sub">No scores yet — be the first to dive.</p>}
        {rows?.map((r) => (
          <Card key={r.playerId} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              #{r.rank} {r.displayName ?? 'Anonymous Angler'}
            </span>
            <strong>{r.score}</strong>
          </Card>
        ))}
      </div>
    </main>
  );
}
