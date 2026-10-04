import fs from 'fs';

const files = [
  'scripts/build.mjs', 'scripts/test-site.mjs', 'scripts/publish.mjs', 'scripts/scan.mjs',
  'src/assets/index.js', 'src/assets/motion.js', 'src/assets/cosmos.js',
  'src/assets/style.css', 'src/assets/nav.js', 'src/assets/project.js',
];

/* legit intended glyphs (kept from design) */
const INTENDED = new Set(['·', '—', '…', '»', '«', '⟡', '→', '‹', '›', '▸', '🎲', '🔊', '🔇', '⌃', '✓', '⚙', '—']);

function decodeLatin1(seq) {
  try {
    const s = Buffer.from(seq, 'latin1').toString('utf8');
    if (s.includes('�')) return null;
    return s;
  } catch { return null; }
}

for (const f of files) {
  let s;
  try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  const lines = s.split('\n');
  lines.forEach((ln, i) => {
    const seqs = ln.match(/[^\x00-\x7F]+/g) || [];
    for (const seq of seqs) {
      const onlyIntended = [...seq].every(ch => INTENDED.has(ch));
      const decoded = decodeLatin1(seq);
      const isDouble = decoded && [...decoded].every(ch => INTENDED.has(ch) || /[A-Za-z0-9 —·…'.,:;()?!]/.test(ch));
      let tag = 'ok';
      if (!onlyIntended && isDouble) tag = 'DOUBLE-> "' + decoded + '"';
      else if (!onlyIntended) tag = 'UNKNOWN';
      if (tag !== 'ok') console.log(`${tag}  ${f}:${i + 1}  seq=[${seq}]  ${ln.trim().slice(0, 100)}`);
    }
  });
}
console.log('scan done');
