'use client';

import { useEffect, useRef, useState } from 'react';
import { GameView } from '@fishkal/game-renderer';
import type { PerfMode } from '@fishkal/game-renderer';
import { DEFAULT_GAME_CONFIG } from '@fishkal/config';
import { FishkalApi } from '@fishkal/api-client';
import type { SubmitRunResponse, UpgradeView, MissionView, CollectionEntry, PlayerLoadout } from '@fishkal/api-client';
import { Button } from '@fishkal/design-system';
import { STRINGS, t } from '@fishkal/shared';
import type { Lang, StringKey } from '@fishkal/shared';

interface HudState {
  score: number;
  combo: number;
  comboMultiplier: number;
  depth: number;
  tension: number;
  catches: number;
  state: string;
}

interface ResultsStats {
  score: number;
  catches: number;
  maxCombo: number;
  maxDepth: number;
  elapsedMs: number;
  provisionalCredits: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function DeepCatchGame({ lang = 'en' as Lang }: { lang?: Lang } = {}) {
  const tr = (key: StringKey): string => t(lang, key);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<GameView | null>(null);
  const apiRef = useRef<FishkalApi | null>(null);
  const [hud, setHud] = useState<HudState>({
    score: 0, combo: 0, comboMultiplier: 1, depth: 0, tension: 0, catches: 0, state: 'READY',
  });
  const [muted, setMuted] = useState(false);
  const [results, setResults] = useState<{ stats: ResultsStats; server?: SubmitRunResponse } | null>(null);
  const [credits, setCredits] = useState(0);
  const [upgrades, setUpgrades] = useState<UpgradeView[]>([]);
  const [missions, setMissions] = useState<MissionView[]>([]);
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [panel, setPanel] = useState<'none' | 'shop' | 'missions' | 'collection'>('none');

  useEffect(() => {
    if (!containerRef.current) return;

    const api = new FishkalApi(API_URL);
    apiRef.current = api;

    const view = new GameView({
      container: containerRef.current,
      config: DEFAULT_GAME_CONFIG,
      onStateChange: (s) => setHud((h) => ({ ...h, state: s })),
      onResults: (stats) => {
        setResults({ stats });
        view.sfx.play('record');
        // Server-authoritative scoring (spec §60): submit the event log only.
        api
          .authenticateGuest('Guest Angler')
          .then((auth) => {
            api.setSessionToken(auth.token);
            return api.submitRun({
              maxDepth: stats.maxDepth,
              durationMs: Math.max(1000, Math.round(stats.elapsedMs)),
              catches: view.getEngine().getCatches(),
              clientSeed: Date.now(),
            });
          })
          .then((res) => {
            setResults((r) => (r ? { ...r, server: res } : r));
            void refreshEconomy(); // credits + mission progress changed
          })
          .catch(() => {
            /* Offline / API down: show local provisional results. */
          });
      },
    });
    viewRef.current = view;
    view.setPerfMode('AUTO' as PerfMode);

    // Authenticate up front so the shop/missions/collection work pre-run.
    api
      .authenticateGuest('Guest Angler')
      .then((auth) => {
        api.setSessionToken(auth.token);
        return refreshEconomy();
      })
      .catch(() => {
        /* offline — economy panels stay disabled, game still playable */
      });

    const hudTimer = window.setInterval(() => {
      const eng = view.getEngine();
      const hook = eng.getHook();
      const stats = eng.getStats();
      setHud({
        score: stats.score,
        combo: 0, // combo shown via multiplier below
        comboMultiplier: eng.getSnapshot().comboMultiplier,
        depth: Math.round(hook.depth),
        tension: hook.tensionRatio,
        catches: stats.catches,
        state: eng.getState(),
      });
    }, 120);

    return () => {
      window.clearInterval(hudTimer);
      view.dispose();
      viewRef.current = null;
    };
  }, []);

  /** Load credits/upgrades/missions/collection and apply the owned loadout. */
  const refreshEconomy = async (): Promise<void> => {
    const api = apiRef.current;
    if (!api) return;
    try {
      const profile = await api.getProfile();
      setCredits(profile.credits);
      const [ups, miss, coll, loadout] = await Promise.all([
        api.getUpgrades(),
        api.getMissions(),
        api.getCollection(),
        api.getLoadout() as Promise<PlayerLoadout>,
      ]);
      setUpgrades(ups);
      setMissions(miss);
      setCollection(coll);
      viewRef.current?.applyLoadout(loadout);
    } catch {
      /* economy endpoints unavailable — keep playing without shop */
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <div className="fk-hud">
        <div className="fk-hud-row">
          <span className="fk-hud-chip">SCORE {hud.score}</span>
          <span className="fk-hud-chip">DEPTH −{hud.depth}m</span>
          <span className="fk-hud-chip">FISH {hud.catches}</span>
          <span className="fk-hud-chip" data-testid="credits">🪙 {credits}</span>
          <button
            type="button"
            className="fk-hud-chip fk-mute-btn"
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              viewRef.current?.sfx.setMuted(next);
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="fk-hud-row" style={{ alignItems: 'flex-end' }}>
          <span className="fk-hud-chip">
            COMBO ×{hud.comboMultiplier}
          </span>
          <span className={`fk-hud-chip fk-hud-chip--tension`}>
            LINE
            <span className="fk-tension-bar" style={{ marginLeft: 8 }}>
              <div style={{ width: `${Math.round(hud.tension * 100)}%` }} />
            </span>
          </span>
        </div>
      </div>

      {hud.state === 'READY' && (
        <div className="fk-overlay">
          <div className="fk-overlay-card">
            <h2 className="fk-headline" style={{ fontSize: 'clamp(26px,4vw,48px)' }}>
              FISHKAL: DEEP CATCH
            </h2>
            <p className="fk-sub">Drag / A-D / ← → to steer. The hook sinks on its own. When a fish bites: hold mouse / Space to reel, release to rest — drain its stamina before the line snaps.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button size="lg" onClick={() => viewRef.current?.startGame()}>
                {tr('game.cta')}
              </Button>
              <Button variant="ghost" onClick={() => { setPanel('shop'); void refreshEconomy(); }}>🛠 {tr('shop.title')}</Button>
              <Button variant="ghost" onClick={() => { setPanel('missions'); void refreshEconomy(); }}>🎯 {tr('missions.title')}</Button>
              <Button variant="ghost" onClick={() => { setPanel('collection'); void refreshEconomy(); }}>📖 {tr('collection.title')}</Button>
            </div>
          </div>
        </div>
      )}

      {panel !== 'none' && (
        <div className="fk-overlay">
          <div className="fk-overlay-card fk-card" style={{ maxWidth: 560, maxHeight: '80vh', overflow: 'auto' }}>
            {panel === 'shop' && (
              <>
                <h2 className="fk-headline" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>🛠 {tr('shop.title')}</h2>
                <p className="fk-sub">🪙 {credits} credits — upgrades apply from your next dive.</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {upgrades.map((u) => (
                    <div key={u.id} className="fk-stat-grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                      <div>
                        <div className="fk-stat-value" style={{ fontSize: 16 }}>{u.name} <span style={{ opacity: 0.6 }}>Lv {u.level}/{u.maxLevel}</span></div>
                        <div className="fk-stat-label">{u.description}</div>
                      </div>
                      <Button
                        size="sm"
                        disabled={u.nextCost === null || credits < u.nextCost}
                        onClick={async () => {
                          const api = apiRef.current;
                          if (!api || u.nextCost === null) return;
                          try {
                            const res = await api.purchaseUpgrade(u.id, crypto.randomUUID());
                            setCredits(res.credits);
                            await refreshEconomy();
                          } catch { /* purchase failed — shown on refresh */ }
                        }}
                      >
                        {u.nextCost === null ? 'MAX' : `BUY 🪙${u.nextCost}`}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {panel === 'missions' && (
              <>
                <h2 className="fk-headline" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>🎯 {tr('missions.title')}</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {missions.map((m) => (
                    <div key={m.id} className="fk-stat-grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                      <div>
                        <div className="fk-stat-value" style={{ fontSize: 16 }}>{tr(m.titleKey as StringKey)}</div>
                        <div className="fk-stat-label">{tr(m.descriptionKey as StringKey)} — {Math.min(m.progress, m.target)}/{m.target} · 🪙{m.rewardCredits}{m.claimed ? ' · ' + tr('missions.claimed') : ''}</div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!m.claimable}
                        onClick={async () => {
                          const api = apiRef.current;
                          if (!api) return;
                          try {
                            await api.claimMission(m.id);
                            await refreshEconomy();
                          } catch { /* claim failed */ }
                        }}
                      >
                        {m.claimed ? '✓' : 'CLAIM'}
                      </Button>
                    </div>
                  ))}
                  {missions.length === 0 && <p className="fk-sub">Missions load after your first dive.</p>}
                </div>
              </>
            )}
            {panel === 'collection' && (
              <>
                <h2 className="fk-headline" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>📖 {tr('collection.title')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
                  {DEFAULT_GAME_CONFIG.fish.map((sp) => {
                    const caught = collection.find((c) => c.fishId === sp.id);
                    return (
                      <div key={sp.id} className="fk-stat-grid" style={{ opacity: caught ? 1 : 0.35, textAlign: 'center' }}>
                        <div className="fk-stat-value" style={{ fontSize: 14 }}>{caught ? sp.name : '???'}</div>
                        <div className="fk-stat-label">{sp.rarity}{caught ? ` · best ${Math.round(caught.bestDepth)}m` : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div style={{ marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setPanel('none')}>{tr('panel.close')}</Button>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="fk-overlay">
          <div className="fk-overlay-card fk-card">
            <h2 className="fk-headline" style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
              {results.server?.record ? tr('results.record') : tr('results.complete')}
            </h2>
            <div className="fk-stat-grid">
              <div><div className="fk-stat-label">Score</div><div className="fk-stat-value">{results.stats.score}</div></div>
              <div><div className="fk-stat-label">{tr('results.serverScore')}</div><div className="fk-stat-value">{results.server?.score ?? '—'}</div></div>
              <div><div className="fk-stat-label">{tr('results.maxDepth')}</div><div className="fk-stat-value">−{Math.round(results.stats.maxDepth)}m</div></div>
              <div><div className="fk-stat-label">Fish</div><div className="fk-stat-value">{results.stats.catches}</div></div>
              <div><div className="fk-stat-label">{tr('results.combo')}</div><div className="fk-stat-value">×{results.stats.maxCombo || 1}</div></div>
              <div><div className="fk-stat-label">{tr('results.credits')}</div><div className="fk-stat-value">+{results.server?.credits ?? results.stats.provisionalCredits}</div></div>
            </div>
            {results.server && results.server.flags.length > 0 && (
              <p className="fk-sub" style={{ fontSize: 12 }}>
                Validation flags: {results.server.flags.join(', ')}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button
                onClick={() => {
                  setResults(null);
                  viewRef.current?.startGame();
                }}
              >
                {STRINGS.en['results.playAgain']}
              </Button>
              <Button variant="ghost" onClick={() => setResults(null)}>
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
