import fs from 'fs';
import path from 'path';

const DIR = 'C:/Users/azarakhsh/Downloads/Full/Full/Private';

const PATTERNS = [
  ['Groq', /gsk_[A-Za-z0-9]{20,}/g],
  ['OpenAI', /sk-(?!ant-|or-)[A-Za-z0-9_-]{35,}/g],
  ['Anthropic', /sk-ant-[A-Za-z0-9_-]{35,}/g],
  ['OpenRouter', /sk-or-[A-Za-z0-9-]{20,}/g],
  ['GitHubPAT', /gh[pousr]_[A-Za-z0-9]{36}/g],
  ['Google', /AIza[0-9A-Za-z_-]{35}/g],
  ['AWS', /AKIA[0-9A-Z]{16}/g],
  ['Telegram', /\b\d{8,11}:[A-Za-z0-9_-]{35}\b/g],
  ['HF', /hf_[A-Za-z0-9]{30,}/g],
  ['npm', /npm_[A-Za-z0-9]{36}/g],
  ['Stripe', /sk_live_[0-9a-zA-Z]{24,}/g],
  ['Slack', /xox[baprs]-[A-Za-z0-9-]{10,}/g],
  ['JWT', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g],
  ['Password', /password\s*[:=]\s*["'][^"']{6,}["']/gi],
];

for (const f of fs.readdirSync(DIR).filter(n => n.endsWith('.html')).sort()) {
  const c = fs.readFileSync(path.join(DIR, f), 'utf8');
  const title = (c.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, '(no title)'])[1].trim().slice(0, 60);
  const h1 = (c.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1].replace(/<[^>]+>/g, '').trim().slice(0, 70);
  const desc = (c.match(/name="description"\s+content="([^"]*)"/i) || [, ''])[1].slice(0, 110);
  const words = c.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const kb = Math.round(c.length / 1024);

  const hits = [];
  for (const [n, re] of PATTERNS) {
    const m = c.match(re);
    if (m) hits.push(n + '(' + m.length + ')');
  }

  console.log('--- ' + f + '  [' + kb + 'KB, ~' + words + ' words]');
  console.log('    title: ' + title);
  if (h1) console.log('    h1:    ' + h1);
  if (desc) console.log('    desc:  ' + desc);
  console.log('    secrets: ' + (hits.length ? 'FOUND ' + hits.join(', ') : 'clean'));
}
