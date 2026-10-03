'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@fishkal/design-system';
import { STRINGS, t, dir, LANGS } from '@fishkal/shared';
import type { Lang } from '@fishkal/shared';
import type { StringKey } from '@fishkal/shared';
import { CinematicIntro } from '@fishkal/game-renderer';

const DeepCatchGame = dynamic(() => import('./DeepCatchGame').then((m) => m.default), {
  ssr: false,
  loading: () => <GameLoading label={STRINGS.en['loading.tagline'] ?? ''} />,
});

const SECTIONS: { id: string; headline: StringKey | ''; sub: StringKey | ''; cta: StringKey | ''; href: string; bg: string }[] = [
  {
    id: 'dubai',
    headline: 'hero.headline',
    sub: 'hero.sub',
    cta: 'hero.cta',
    href: '#boat',
    bg: 'linear-gradient(180deg, #F4A261 0%, #E76F51 30%, #0D3B66 100%)',
  },
  {
    id: 'boat',
    headline: 'boat.headline',
    sub: 'boat.sub',
    cta: 'boat.cta',
    href: '#dive',
    bg: 'linear-gradient(180deg, #0D3B66 0%, #14607F 100%)',
  },
  {
    id: 'dive',
    headline: '',
    sub: '',
    cta: '',
    href: '#underwater',
    bg: 'linear-gradient(180deg, #14607F 0%, #1B7A8C 45%, #0B3550 100%)',
  },
  {
    id: 'underwater',
    headline: 'game.invite',
    sub: 'underwater.sub',
    cta: 'game.cta',
    href: '#game',
    bg: 'linear-gradient(180deg, #0B3550 0%, #071C30 100%)',
  },
  {
    id: 'game',
    headline: 'game.invite',
    sub: 'game.sub',
    cta: 'game.cta',
    href: '#play',
    bg: 'linear-gradient(180deg, #071C30 0%, #04121F 100%)',
  },
  {
    id: 'shop',
    headline: 'shop.headline',
    sub: 'shop.sub',
    cta: 'shop.cta',
    href: '#',
    bg: 'linear-gradient(180deg, #04121F 0%, #0D3B66 100%)',
  },
];

function GameLoading({ label }: { label: string }) {
  return (
    <div className="fk-overlay">
      <div className="fk-overlay-card">
        <p className="fk-sub">{label}</p>
      </div>
    </div>
  );
}

export function Experience() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tr = (key: StringKey): string => t(lang, key);

  // WebGL cinematic behind the hero (only when the device can render it).
  useEffect(() => {
    if (!webgl || !heroCanvasRef.current) return;
    let cine: CinematicIntro | null = null;
    try {
      cine = new CinematicIntro(heroCanvasRef.current);
    } catch {
      cine = null; // context lost / GPU blocklisted: hero gradient stays
    }
    return () => {
      cine?.dispose();
      cine = null;
    };
  }, [webgl]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebgl(Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl')));
    } catch {
      setWebgl(false);
    }

    // Scroll → "depth" narrative meter (0m surface → 500m abyss).
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setScrollDepth(Math.round(p * 500));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main style={{ background: '#04121F' }} dir={dir(lang)}>
      <div
        style={{ position: 'fixed', top: 14, insetInlineEnd: 14, zIndex: 60, display: 'flex', gap: 6 }}
        aria-label="Language"
      >
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            className="fk-lang-btn"
            aria-pressed={lang === l.id}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="fk-depth-meter" aria-hidden>
        DEPTH −{scrollDepth}m
      </div>

      {SECTIONS.map((s) => {
        const headline = s.headline ? tr(s.headline) : '';
        const sub = s.sub ? tr(s.sub) : '';
        const cta = s.cta ? tr(s.cta) : '';
        return (
        <section
          key={s.id}
          id={s.id}
          className="fk-section"
          style={{ background: s.bg }}
          aria-label={headline || s.id}
        >
          {s.id === 'dubai' && (
            <>
              <SkylineSilhouette />
              <canvas
                ref={heroCanvasRef}
                aria-hidden
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: webgl ? 0.55 : 0 }}
              />
            </>
          )}
          {s.id === 'boat' && <BoatSilhouette />}
          {s.id === 'underwater' && <FishSchoil />}

          {headline && <h1 className="fk-headline">{headline}</h1>}
          {sub && <p className="fk-sub">{sub}</p>}
          {s.cta && (
            <div>
              {s.id === 'game' ? (
                <Button
                  size="lg"
                  onClick={() => {
                    document.getElementById('play')?.scrollIntoView({ behavior: 'smooth' });
                    setShowGame(true);
                  }}
                >
                  {cta}
                </Button>
              ) : (
                <a href={s.href} style={{ textDecoration: 'none' }}>
                  <Button variant={s.id === 'dubai' ? 'primary' : 'ghost'}>{cta}</Button>
                </a>
              )}
            </div>
          )}
          {s.id === 'dive' && <BubbleTrail />}
        </section>
        );
      })}

      {/* Play section: hosts the actual game (client-only, lazy) */}
      <section id="play" className="fk-section" style={{ background: '#04121F', padding: 0 }}>
        {showGame ? (
          <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <DeepCatchGame lang={lang} />
          </div>
        ) : (
          <div className="fk-overlay-card">
            <h2 className="fk-headline" style={{ fontSize: 'clamp(28px,4vw,52px)' }}>
              {tr('game.invite')}
            </h2>
            <p className="fk-sub">{tr('hero.sub')}</p>
            <Button size="lg" onClick={() => setShowGame(true)}>
              {tr('game.cta')}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

/* ---- Pure-CSS/SVG cinematic silhouettes (WebGL scene slots arrive in Phase 2) ---- */

function SkylineSilhouette() {
  return (
    <svg
      viewBox="0 0 1200 260"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '42%', opacity: 0.9 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4A261" stopOpacity="0.0" />
          <stop offset="1" stopColor="#072540" />
        </linearGradient>
      </defs>
      <g fill="url(#sky)">
        <rect x="0" y="200" width="1200" height="60" />
        <rect x="60" y="150" width="40" height="110" />
        <rect x="120" y="170" width="30" height="90" />
        <rect x="180" y="120" width="46" height="140" />
        <rect x="250" y="160" width="34" height="100" />
        {/* Burj Khalifa motif */}
        <polygon points="540,10 555,260 525,260" />
        <rect x="500" y="180" width="36" height="80" />
        <rect x="560" y="190" width="34" height="70" />
        <rect x="640" y="130" width="42" height="130" />
        <rect x="700" y="165" width="30" height="95" />
        <rect x="760" y="145" width="44" height="115" />
        <rect x="840" y="175" width="28" height="85" />
        <rect x="900" y="155" width="38" height="105" />
        <rect x="980" y="185" width="30" height="75" />
        <rect x="1060" y="160" width="42" height="100" />
      </g>
      <g fill="#10B6A8" opacity="0.7">
        <circle cx="70" cy="160" r="1.4" />
        <circle cx="200" cy="132" r="1.4" />
        <circle cx="655" cy="142" r="1.4" />
        <circle cx="775" cy="158" r="1.4" />
        <circle cx="915" cy="168" r="1.4" />
        <circle cx="1075" cy="172" r="1.4" />
      </g>
    </svg>
  );
}

function BoatSilhouette() {
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: 'absolute', bottom: '18%', left: 0, width: '100%', height: '30%' }}
      aria-hidden
    >
      <g fill="#072540">
        <path d="M420 120 L780 120 L740 165 L470 165 Z" />
        <rect x="580" y="80" width="46" height="40" rx="4" />
        <rect x="588" y="52" width="8" height="30" />
        <circle cx="592" cy="48" r="5" fill="#E8B84B" />
      </g>
      <g stroke="#10B6A8" strokeWidth="2" opacity="0.5">
        <path d="M300 178 q20 -8 40 0 t40 0" fill="none" />
        <path d="M560 190 q20 -8 40 0 t40 0" fill="none" />
        <path d="M820 180 q20 -8 40 0 t40 0" fill="none" />
      </g>
    </svg>
  );
}

function BubbleTrail() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${8 + i * 6.4}%`,
            bottom: '-30px',
            width: 6 + (i % 4) * 3,
            height: 6 + (i % 4) * 3,
            borderRadius: '50%',
            background: 'rgba(234,246,244,0.28)',
            animation: `rise ${5 + (i % 5)}s linear ${i * 0.4}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes rise { to { transform: translateY(-110vh); opacity: 0; } }`}</style>
    </div>
  );
}

function FishSchoil() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(7)].map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `${12 + i * 11}%`,
            fontSize: 18 + (i % 3) * 8,
            opacity: 0.5,
            animation: `swim ${9 + (i % 4) * 3}s linear ${i * 1.1}s infinite`,
          }}
        >
          🐟
        </span>
      ))}
      <style>{`@keyframes swim { from { transform: translateX(-8vw); } to { transform: translateX(108vw); } }`}</style>
    </div>
  );
}
