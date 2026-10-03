'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReferralInfo } from '@fishkal/api-client';
import { Button, Card } from '@fishkal/design-system';
import { useFishkalSession } from '../hooks/useFishkalSession';

export default function MiniAppHome() {
  const { api, profile, setProfile, via } = useFishkalSession();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [claimedMsg, setClaimedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    api
      .getReferralInfo()
      .then(setReferral)
      .catch(() => {});
    // Self-referral guard makes this a no-op when opening your own link.
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) api.attachReferral(ref).catch(() => {});
  }, [api, profile]);

  const claim = useCallback(async () => {
    setBusy(true);
    try {
      const res = await api.claimReferralReward();
      setProfile((p) => (p ? { ...p, credits: res.credits } : p));
      setReferral((r) => (r ? { ...r, claimed: true, claimable: false } : r));
      setClaimedMsg(`+${res.reward} credits claimed!`);
    } catch {
      setClaimedMsg('Claim failed — try again.');
    } finally {
      setBusy(false);
    }
  }, [api, setProfile]);

  const shareLink = profile ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile.playerId}` : '';

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'stretch',
      }}
    >
      <h1 className="fk-headline" style={{ fontSize: 34 }}>
        FISHKAL
      </h1>
      <Card>
        {profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <strong style={{ fontSize: 16 }}>{profile.displayName ?? 'Player'}</strong>
            <span className="fk-sub">⭐ {profile.totalScore} pts · 🐟 deepest {profile.deepestDepth}m</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#3ED8CB' }}>💰 {profile.credits} credits</span>
            <span className="fk-sub" style={{ fontSize: 11, opacity: 0.6 }}>
              {via === 'telegram' ? 'Telegram session' : 'Preview mode (guest)'}
            </span>
          </div>
        ) : (
          <p className="fk-sub" style={{ margin: 0 }}>
            Connecting…
          </p>
        )}
      </Card>

      {referral && (
        <Card>
          <strong>Invite friends — both earn credits</strong>
          <p className="fk-sub" style={{ margin: '4px 0 8px' }}>
            Your link: <code style={{ fontSize: 11 }}>{shareLink}</code>
          </p>
          <p className="fk-sub" style={{ margin: '0 0 8px' }}>
            Invited: {referral.invited.length} · Reward: {referral.rewardCredits} credits
          </p>
          <Button size="md" disabled={!referral.claimable || busy} onClick={claim}>
            {referral.claimed ? 'REWARD CLAIMED' : referral.claimable ? 'CLAIM REWARD' : 'NO REWARD YET'}
          </Button>
          {claimedMsg && <p className="fk-sub" style={{ margin: '6px 0 0', color: '#3ED8CB' }}>{claimedMsg}</p>}
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a href="/game" style={{ textDecoration: 'none' }}>
          <Button size="lg" style={{ width: '100%' }}>▶ PLAY DEEP CATCH</Button>
        </a>
        <a href="/leaderboard" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" style={{ width: '100%' }}>🏆 LEADERBOARD</Button>
        </a>
      </div>

      <p className="fk-sub" style={{ fontSize: 12, textAlign: 'center', opacity: 0.7 }}>
        Profile · Referral rewards live · Shop & missions inside the game.
      </p>
    </main>
  );
}
