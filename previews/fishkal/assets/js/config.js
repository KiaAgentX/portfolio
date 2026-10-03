/* ============================================================
   FISHKAL — Configuration
   ------------------------------------------------------------
   ⭐ THIS IS THE FILE THE CLIENT EDITS.

   All client-editable settings live here:
     • WhatsApp number
     • Contact email and phone
     • Launch countdown date
     • Hero image paths
     • Default language
     • Analytics IDs

   No coding knowledge required. Change the strings between
   quotes, save the file, refresh the website.
   ============================================================ */

window.FK = {

  /* ----------------------------------------------------------
     CONTACT
     ---------------------------------------------------------- */

  /* WhatsApp number — digits only, no +, no spaces, no dashes.
     Example: '971500000000'  (for +971 50 000 0000) */
  wa:    '971500000000',

  /* Contact email — shown in the brand section */
  email: 'hello@fishkal.ae',

  /* Display phone — shown to humans, can contain spaces and + */
  phone: '+971 50 000 0000',

  /* ----------------------------------------------------------
     LAUNCH COUNTDOWN
     ---------------------------------------------------------- */

  /* Target date for the countdown chip.
     Format: ISO 8601 with timezone offset.
     Example: '2026-10-18T10:00:00+04:00' */
  launch: '2026-10-18T10:00:00+04:00',

  /* ----------------------------------------------------------
     HERO IMAGE PATHS
     ---------------------------------------------------------- */

  /* Path to the primary WebP image */
  heroWebp: '/assets/img/hero.webp',

  /* Path to the lighter AVIF image (used when supported) */
  heroAvif: '/assets/img/hero.avif',

  /* ----------------------------------------------------------
     LANGUAGE
     ---------------------------------------------------------- */

  /* Default language on first load.
     Supported: 'en' | 'ar' | 'fr' | 'es' | 'tr' */
  defaultLang: 'en',

  /* ----------------------------------------------------------
     ANALYTICS (OPTIONAL)
     ---------------------------------------------------------- */

  /* Plausible domain — leave empty to disable.
     Example: 'fishkal.ae' */
  plausibleDomain: '',

  /* Google Analytics 4 Measurement ID — leave empty to disable.
     Example: 'G-XXXXXXXXXX' */
  gaId: '',

  /* ----------------------------------------------------------
     ADVANCED (DO NOT EDIT UNLESS YOU KNOW WHAT YOU ARE DOING)
     ---------------------------------------------------------- */

  /* Scroll length in viewport heights */
  screens: 13,

  /* Enable service worker (requires sw.js at root) */
  enableSW: true,

  /* Enable WebGL-accelerated particles if available */
  enableGPU: true
};

/* ============================================================
   TIMELINE
   ------------------------------------------------------------
   The scroll timeline is divided into named ranges. Values are
   normalized scroll positions (0..1). Adjust with caution.
   ============================================================ */
window.TL = {
  DUBAI:   [0.00, 0.08],
  COAST:   [0.08, 0.18],
  BOAT:    [0.18, 0.32],
  SURFACE: [0.32, 0.45],
  DESCENT: [0.45, 0.58],
  HOOK:    [0.58, 0.60],
  LOCK:    0.60,
  ASCENT:  [0.62, 0.90],
  BRAND:   [0.90, 1.00]
};

/* ============================================================
   GAME PARAMETERS
   ------------------------------------------------------------
   Timing values in milliseconds.
   ============================================================ */
window.GAME = {
  strikeWindow: 550,   /* Total window for a valid strike */
  perfect:      150,   /* Perfect-strike threshold (centered) */
  grace:        100,   /* Extra grace after the window closes */
  castMs:       950,   /* Cast animation duration */
  settleMs:     650,   /* Hook settle duration */
  freezeMs:     150    /* Freeze frame on catch */
};

/* ============================================================
   SPECIES CATALOG
   ------------------------------------------------------------
   Each species has:
     id          — display name (translated via i18n)
     weight      — relative probability (higher = more common)
     approach    — time in ms for the fish to approach the hook
     type        — body silhouette ('A' | 'B' | 'C' | 'D')
     scale       — size multiplier
     pat         — pattern overlay ('bars' | 'spots' | 'stripe' | 'fork')
     latin       — binomial name (Latin, not translated)
     tint        — base color
     line        — flavour text (translated via i18n)
   ============================================================ */
window.SPECIES = [
  {
    id:       "HAMMOUR",
    weight:   34,
    approach: 7000,
    type:     "A",
    scale:    1.00,
    pat:      "bars",
    latin:    "Epinephelus coioides",
    tint:     "#3c5a52",
    line:     "Heavy, deliberate, close to the bottom. Dubai's most asked-for fish."
  },
  {
    id:       "KINGFISH",
    weight:   16,
    approach: 4000,
    type:     "B",
    scale:    1.06,
    pat:      "fork",
    latin:    "Scomberomorus commerson",
    tint:     "#3a5568",
    line:     "Straight, fast, and gone before you decide. This one you earned."
  },
  {
    id:       "EMPEROR RED SNAPPER",
    weight:   10,
    approach: 5500,
    type:     "A",
    scale:    0.92,
    pat:      "spots",
    latin:    "Lutjanus sebae",
    tint:     "#6a3a34",
    line:     "Rare on the line and unmistakable in the light. A fish worth the wait."
  },
  {
    id:       "SAFI",
    weight:   26,
    approach: 4600,
    type:     "C",
    scale:    0.88,
    pat:      "stripe",
    latin:    "Siganus canaliculatus",
    tint:     "#4a6a52",
    line:     "Small, quick and sweet-fleshed. The people’s fish of the Dubai coast."
  },
  {
    id:       "SHERI",
    weight:   22,
    approach: 5200,
    type:     "D",
    scale:    0.96,
    pat:      "fork",
    latin:    "Lethrinus nebulosus",
    tint:     "#7a4a44",
    line:     "A fighter in the current, silver-pink in the light. A local favourite."
  },
  {
    id:       "BALOOL",
    weight:   12,
    approach: 3800,
    type:     "B",
    scale:    0.80,
    pat:      "spots",
    latin:    "Scomberomorus guttatus",
    tint:     "#3d5a68",
    line:     "Spotted mackerel — a flash of silver gone in one pull."
  },
  {
    id:       "SULTAN IBRAHIM",
    weight:   16,
    approach: 5200,
    type:     "D",
    scale:    0.62,
    pat:      "stripe",
    latin:    "Upeneus sulphureus",
    tint:     "#8a6a33",
    line:     "Walks the bottom on two small whiskers, wearing one line of gold."
  },
  {
    id:       "FASKAR",
    weight:   14,
    approach: 5400,
    type:     "C",
    scale:    0.80,
    pat:      "bars",
    latin:    "Acanthopagrus bifasciatus",
    tint:     "#5f7076",
    line:     "Two dark bars at parade rest. Silver that never hurries."
  },
  {
    id:       "QUEENFISH",
    weight:   10,
    approach: 4600,
    type:     "B",
    scale:    0.96,
    pat:      "spots",
    latin:    "Scomberoides commersonnianus",
    tint:     "#5c7890",
    line:     "A silver dart with a dotted signature. It strikes fast and forgives nothing."
  },
  {
    id:       "BARRACUDA",
    weight:   5,
    approach: 3800,
    type:     "D",
    scale:    1.15,
    pat:      "bars",
    latin:    "Sphyraena jello",
    tint:     "#54687a",
    line:     "All teeth and patience. The long shadow that crosses the sand without a sound."
  }
];

/* ============================================================
   IMAGE PLATE COORDINATES
   ------------------------------------------------------------
   These values describe fixed positions in the original hero
   photograph (1672 × 940 px). They are used to anchor camera
   motion, flag rebuild and hull continuity.

   ⚠️ DO NOT EDIT unless you replace hero.webp with a new
   photograph of the same composition.
   ============================================================ */
window.IW = 1672;
window.IH = 940;

window.IMG = {
  horizon:    528,
  hullBottom: 728,
  hullL:      138,
  hullR:      1042,
  sunX:       1582,
  sunY:       410,
  flagX:      320,
  flagY:      194,
  flagW:      165,
  flagH:      123,
  flagAng:    158.5 * Math.PI / 180,
  rodX:       1004,
  rodY:       572,
  bowX:       1018,
  bowY:       702,
  hullCx:     592
};
