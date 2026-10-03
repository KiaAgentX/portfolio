import fs from 'fs';
import path from 'path';

const DIR = 'C:/Users/azarakhsh/Downloads/Full/Full/Private';

/* 1) password context in 9router guide */
{
  const c = fs.readFileSync(path.join(DIR, 'totarial-9router.html'), 'utf8');
  const m = c.match(/password\s*[:=]\s*["'][^"']{6,}["']/i);
  if (m) {
    const i = m.index;
    console.log('PASSWORD MATCH CONTEXT:');
    console.log(JSON.stringify(c.slice(Math.max(0, i - 150), i + 180)));
  } else {
    console.log('password match: gone/none');
  }
  console.log('');
}

/* 2) kit per file */
const LIBS = [
  ['three.js', /three(\.module)?(\.min)?\.js|three@/i],
  ['GSAP', /gsap/i],
  ['Tailwind', /tailwindcss|cdn\.tailwindcss/i],
  ['Chart.js', /chart\.js|cdn\.chart/i],
  ['Highlight.js', /highlight(\.min)?\.js/i],
  ['KaTeX', /katex/i],
  ['jQuery', /jquery/i],
  ['Vue', /vue\.(min\.)?js/i],
  ['React', /react(-dom)?(\.production)?\.min\.js/i],
  ['Markdown-it', /markdown-it/i],
  ['Font Awesome', /font-?awesome/i],
  ['Google Fonts', /fonts\.googleapis/i],
  ['Alpine', /alpinejs/i],
  ['Ace/CodeMirror', /ace\.js|codemirror/i],
  ['Pyodide', /pyodide/i],
];
console.log('KIT PER FILE:');
for (const f of fs.readdirSync(DIR).filter(n => n.endsWith('.html')).sort()) {
  const c = fs.readFileSync(path.join(DIR, f), 'utf8');
  const found = [];
  for (const [n, re] of LIBS) if (re.test(c)) found.push(n);
  const external = /src=["']https?:/i.test(c);
  const persian = /[\u0600-\u06FF]/.test(c);
  console.log('  ' + f.padEnd(36) + ' kit: ' + (found.join(', ') || 'vanilla')
    + (external ? '' : ' (fully-inline)')
    + (persian ? ' [FA]' : ' [EN]'));
}
