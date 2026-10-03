'use client';

import { useEffect, useRef } from 'react';
import { GameView } from '@fishkal/game-renderer';
import type { PerfMode } from '@fishkal/game-renderer';
import type { GameConfig } from '@fishkal/config';
import type { FishkalApi, SubmitRunResponse } from '@fishkal/api-client';

export interface MiniHud {
  score: number;
  depth: number;
  catches: number;
  tension: number;
  state: string;
}

export function GameHost({
  config,
  perfMode,
  api,
  onServerResult,
  onHud,
}: {
  config: GameConfig;
  perfMode?: PerfMode;
  api?: FishkalApi | null;
  onServerResult?: (res: SubmitRunResponse) => void;
  onHud?: (hud: MiniHud) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const view = new GameView({
      container: ref.current,
      config,
      onResults: (stats) => {
        view.sfx.play('record');
        if (!api) return;
        // Server-authoritative scoring (spec §60) — same flow as the website.
        api
          .submitRun({
            maxDepth: stats.maxDepth,
            durationMs: Math.max(1000, Math.round(stats.elapsedMs)),
            catches: view.getEngine().getCatches(),
            clientSeed: Date.now(),
          })
          .then((res) => onServerResult?.(res))
          .catch(() => {
            /* offline: local provisional results remain */
          });
      },
    });
    if (perfMode) view.setPerfMode(perfMode);
    view.startGame();

    const hudTimer = window.setInterval(() => {
      const eng = view.getEngine();
      const hook = eng.getHook();
      const stats = eng.getStats();
      onHud?.({
        score: stats.score,
        depth: Math.round(hook.depth),
        catches: stats.catches,
        tension: hook.tensionRatio,
        state: eng.getState(),
      });
    }, 250);

    return () => {
      window.clearInterval(hudTimer);
      view.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, perfMode, api]);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', inset: 0, background: '#04121F' }}
      aria-label="FISHKAL Deep Catch game"
    />
  );
}
