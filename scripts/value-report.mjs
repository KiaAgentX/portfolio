import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');

function countLines(file) {
  try {
    const s = fs.readFileSync(file, 'utf8');
    return s.split('\n').filter(l => l.trim().length).length;
  } catch { return 0; }
}
function walk(dir, filter, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'builds', '.tmp-build', '.publish'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}

const VENDORED = ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js', 'highlight.min.js', 'highlight.min.css'];

const groups = {
  'Build pipeline (scripts/*.mjs)': walk(path.join(PORT, 'scripts'), f => f.endsWith('.mjs')),
  'View layer (css + js)': [
    ...walk(path.join(PORT, 'src', 'assets'), f =>
      /\.(css|js)$/.test(f) && !VENDORED.includes(path.basename(f))),
  ],
  'Data & curation (json)': walk(path.join(PORT, 'src'), f => f.endsWith('.json')),
};

const report = {};
for (const [name, files] of Object.entries(groups)) {
  const lines = files.reduce((a, f) => a + countLines(f), 0);
  report[name] = { files: files.length, lines, list: files.map(f => path.relative(PORT, f).replace(/\\/g, '/')) };
}

const testFile = path.join(PORT, 'scripts', 'test-site.mjs');
const testLines = countLines(testFile);
const testChecks = (fs.readFileSync(testFile, 'utf8').match(/check\(/g) || []).length;

let distFiles = 0, distMB = 0;
(function walkDist(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkDist(p);
    else { distFiles++; try { distMB += fs.statSync(p).size; } catch { } }
  }
})(path.join(PORT, 'dist'));

const vendoredKB = VENDORED.reduce((a, n) => {
  try { return a + Math.round(fs.statSync(path.join(PORT, 'src', 'assets', n)).size / 1024); } catch { return a; }
}, 0);

console.log('=== PORTFOLIO VALUE REPORT ===\n');
for (const [name, g] of Object.entries(report)) {
  console.log(`${name}: ${g.files} files, ${g.lines.toLocaleString('en-US')} lines`);
  g.list.forEach(f => console.log('   - ' + f));
  console.log('');
}
console.log(`Test suite: ${testLines} lines, ${testChecks} checks`);
console.log(`Vendored libs: ${VENDORED.join(', ')} = ${vendoredKB} KB`);
console.log(`Generated dist: ${distFiles} files, ${(distMB / 1048576).toFixed(1)} MB`);
