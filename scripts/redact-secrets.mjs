import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(HERE, '..', 'dist');
const APPLY = process.argv.includes('--apply');
const NUL = String.fromCharCode(0);

const TEXT_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.css', '.json', '.md', '.txt', '.yml', '.yaml', '.xml', '.svg', '.csv', '.py', '.sh', '.env', '.toml']);

const PATTERNS = [
  ['Groq-API-Key', /gsk_[A-Za-z0-9]{30,}/g],
  ['OpenAI-Key', /sk-(?!ant-|or-)[A-Za-z0-9_-]{35,}/g],
  ['Anthropic-Key', /sk-ant-[A-Za-z0-9_-]{35,}/g],
  ['OpenRouter-Key', /sk-or-[A-Za-z0-9-]{20,}/g],
  ['GitHub-PAT', /gh[pousr]_[A-Za-z0-9]{36}/g],
  ['GitHub-FinePAT', /github_pat_[A-Za-z0-9_]{40,}/g],
  ['Google-API-Key', /AIza[0-9A-Za-z_-]{35}/g],
  ['AWS-Access-Key', /AKIA[0-9A-Z]{16}/g],
  ['Telegram-Bot-Token', /\b\d{8,11}:[A-Za-z0-9_-]{35}\b/g],
  ['HuggingFace-Token', /hf_[A-Za-z0-9]{30,}/g],
  ['npm-Token', /npm_[A-Za-z0-9]{36}/g],
  ['Stripe-Live-Key', /sk_live_[0-9a-zA-Z]{24,}/g],
  ['Slack-Token', /xox[baprs]-[A-Za-z0-9-]{10,}/g],
  ['DeepSeek-Key', /sk-[a-f0-9]{48,}/g],
];

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

let hits = 0, changedFiles = 0;
for (const f of walk(DIST)) {
  const ext = path.extname(f).toLowerCase();
  if (!TEXT_EXT.has(ext)) continue;
  let st; try { st = fs.statSync(f); } catch { continue; }
  if (st.size > 20 * 1024 * 1024) continue;
  let content;
  try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
  if (content.includes(NUL)) continue;
  let modified = false;
  for (const [name, re] of PATTERNS) {
    const matches = content.match(re);
    if (matches) {
      for (const m of matches) {
        hits++;
        console.log(path.relative(DIST, f).replace(/\\/g, '/') + '  ->  ' + name + '  (' + m.slice(0, 8) + '...)');
      }
      content = content.replace(re, 'REDACTED-' + name);
      modified = true;
    }
  }
  if (modified && APPLY) { fs.writeFileSync(f, content); changedFiles++; }
}
console.log(APPLY
  ? '\nAPPLIED: ' + hits + ' secrets redacted in ' + changedFiles + ' files'
  : '\nSCAN ONLY: ' + hits + ' secrets found (run with --apply to redact)');
