# Changelog

All notable changes to FISHKAL are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.1.0] — 2026

### Enhanced

- 4 new species: Sultan Ibrahim, Faskar, Queenfish, Barracuda (10 total)
- Bioluminescent plankton in the deep (below mid-depth)
- Living sky: drifting cloud veils + procedural birds on tall portrait frames
- Result card dismisses instantly on touch and via the Escape key
- Full 5-language `i18n.json` data file (AR/EN/FR/ES/TR)
- Service worker also precaches `hero.avif` and `favicon.svg`
- Deeper dark water grade and dimmer deep shafts

### Fixed

- Experience re-arms correctly after the "Discover the catch" restart
  (scroll lock is re-engaged via `lockScroll()`)
- Language menu could double-initialise — init is now idempotent
- AVIF support detection wrapped in try/catch

---

## [1.0.0] — 2026

### Initial Release

#### Added

- Multi-file modular architecture (12 JS modules)
- Extracted hero image from base64 (saves ~5 MB)
- `config.js` for client-editable settings
- Preload hints for hero image (AVIF + WebP)
- Gradient caching
- Sine lookup table for `fastSin()`
- OffscreenCanvas for grain layer
- Adaptive quality (0 / 1 / 2 levels)
- Pooled particles (no per-frame allocation)
- CSS transform for SVG hook / sonar / halo
- Lazy init for particles and spray
- PWA manifest
- `robots.txt` and `sitemap.xml`
- 5-language i18n (EN / AR / FR / ES / TR)
- RTL support for Arabic
- 10 fish species with distinct silhouettes
- Analytics hooks (Plausible + GA4)
- `.htaccess` with compression, caching and HTTPS redirect
- Complete cPanel install guide

#### Performance

- HTML size: ~6 MB → ~110 KB
- LCP: ~5 s → ~1.8 s
- FPS on low-end mobile: ~22 → ~48
- Time to interactive: ~9 s → ~2.2 s

#### Preserved

- All original visual features (no removal)
- All original species and mechanics
- All original audio (fully synthesised)
- All original languages
- All original easter eggs

---

## [0.9.0] — Previous

Single-file prototype. See git history.
