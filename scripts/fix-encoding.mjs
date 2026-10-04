import fs from 'fs';

/* Reverse map: character -> CP1252 byte (identity for ASCII & 0xA0-0xFF) */
const CP = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
  'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e,
  '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
  '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};
function charByte(c) {
  const cp = c.codePointAt(0);
  if (cp <= 0x7f || (cp >= 0xa0 && cp <= 0xff)) return cp;
  if (cp >= 0x81 && cp <= 0x9f) return cp; /* undefined CP1252 slots round-trip as C1 */
  if (CP[c] !== undefined) return CP[c];
  return null;
}
const CTRL = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]');
const FFFD = '\uFFFD';
function decodeOnce(seq) {
  const bytes = [];
  for (const ch of seq) {
    const b = charByte(ch);
    if (b === null) return null;
    bytes.push(b);
  }
  const s = Buffer.from(bytes).toString('utf8');
  if (s.indexOf(FFFD) !== -1) return null;
  if (CTRL.test(s)) return null;
  return s;
}
const INTENDED = new Set(['·', '—', '…', '»', '«', '⟡', '→', '‹', '›', '▸', '🎲', '🔊', '🔇', '★', '✓', '©', '◆', '↑', '↓', '←', '“', '”', '⌁', '†']);

function repair(seq) {
  let cur = seq;
  for (let i = 0; i < 3; i++) {
    const dec = decodeOnce(cur);
    if (!dec || dec === cur) break;
    cur = dec;
    if ([...cur].every(ch => ch.codePointAt(0) < 128 || INTENDED.has(ch))) break;
  }
  return cur === seq ? null : cur;
}

const files = [
  'scripts/build.mjs', 'src/assets/index.js', 'src/assets/motion.js', 'src/assets/style.css',
  'scripts/test-site.mjs', 'scripts/publish.mjs', 'scripts/scan.mjs', 'src/assets/nav.js', 'src/assets/project.js', 'src/assets/cosmos.js',
];

let totalFixes = 0;
for (const f of files) {
  let s;
  try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  let fixes = 0;
  const out = s.replace(/[^\x00-\x7F]+/g, (seq) => {
    const fixed = repair(seq);
    if (fixed) {
      fixes++;
      if (fixes <= 8) console.log(`${f}: [${seq}] -> [${fixed}]`);
    }
    return fixed === null ? seq : fixed;
  });
  if (fixes) {
    fs.writeFileSync(f, out, 'utf8');
    console.log(`${f}: ${fixes} sequence(s) repaired`);
    totalFixes += fixes;
  }
}

/* style.css double-level glyphs: one-shot literals (chain breaks on these) */
const cssPath = 'src/assets/style.css';
let css = fs.readFileSync(cssPath, 'utf8');
const literals = [
  ['Ã¢Å’â€¢', '⌕'],
  ['Ã¢â‚¬Âº', '›'],
  ['Ã¢â‚¬â€¹', '‹'],
];
for (const [bad, good] of literals) {
  if (css.includes(bad)) {
    css = css.split(bad).join(good);
    console.log(`style.css literal: [${bad}] -> [${good}]`);
    totalFixes++;
  }
}
fs.writeFileSync(cssPath, css, 'utf8');

console.log(`TOTAL repaired: ${totalFixes}`);
