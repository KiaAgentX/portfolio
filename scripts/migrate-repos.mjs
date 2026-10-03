import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const ROOT = path.resolve(PORT, '..');
const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'KiaAgentX';
const LOG = path.join(PORT, 'migrate.log');

if (!TOKEN) { console.error('GITHUB_TOKEN not set'); process.exit(1); }

const projects = JSON.parse(fs.readFileSync(path.join(PORT, 'src', 'projects.json'), 'utf8'));

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + '\n');
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

let rateLimitedStreak = 0;
let createdThisRun = 0;
const MAX_CREATES_PER_RUN = 8;

function createRepo(p) {
  for (let i = 0; i < 5; i++) {
    const create = api('POST', 'https://api.github.com/user/repos', {
      name: p.repo,
      description: p.tagline.slice(0, 300),
      private: false,
      auto_init: false,
    });
    if (create.code === 201) { rateLimitedStreak = 0; createdThisRun++; return { ok: true }; }
    if (create.code === 422 && /already exists/i.test(create.out)) return { ok: true };
    if (create.code === 403 || create.code === 429) {
      rateLimitedStreak++;
      const wait = 180000 + (rateLimitedStreak - 1) * 60000;
      log(`rate limited creating ${p.repo} — waiting ${Math.round(wait / 1000)}s (${rateLimitedStreak}/5)`);
      if (rateLimitedStreak >= 5) {
        log('RATE LIMIT PERSISTENT — stopping run; re-run in ~30-60 min to resume');
        process.exit(3);
      }
      sleepSync(wait);
      continue;
    }
    return { ok: false, err: `${create.code} ${create.out.slice(0, 200)}` };
  }
  return { ok: false, err: 'rate limit retries exhausted' };
}

function api(method, url, body) {
  const args = ['-sS', '-X', method, '-w', '\n%{http_code}', '-H', 'Authorization: Bearer ' + TOKEN, '-H', 'Accept: application/vnd.github+json', '-H', 'Content-Type: application/json'];
  if (body) args.push('-d', JSON.stringify(body));
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8', timeout: 60000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const nl = out.lastIndexOf('\n');
  const code = nl >= 0 ? parseInt(out.slice(nl + 1), 10) : 0;
  return { code, out: nl >= 0 ? out.slice(0, nl) : out };
}

function sh(cmd, args, cwd) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    timeout: 30 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '' },
  });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

function folderSize(dir) {
  let sum = 0;
  (function walk(d) {
    let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else try { sum += fs.statSync(p).size; } catch { }
    }
  })(dir);
  return sum;
}

const GITIGNORE = `node_modules/
dist/
build/
.next/
.turbo/
venv/
__pycache__/
*.log
`;

const list = projects
  .map(p => ({ ...p, dir: path.join(ROOT, p.folder), sizeMB: Math.round(folderSize(path.join(ROOT, p.folder)) / 1048576 * 10) / 10 }))
  .filter(p => fs.existsSync(p.dir))
  .sort((a, b) => a.sizeMB - b.sizeMB);

log(`migrate start: ${list.length} projects`);

let done = 0, failed = [];
for (const p of list) {
  /* create repo if missing (API, no git prompts; paced + rate-limit aware) */
  const get = api('GET', `https://api.github.com/repos/${OWNER}/${p.repo}`);
  if (get.code === 404) {
    if (createdThisRun >= MAX_CREATES_PER_RUN) {
      log(`BATCH LIMIT ${MAX_CREATES_PER_RUN} repos created this run — stopping politely; resume in ~15-30 min`);
      process.exit(4);
    }
    sleepSync(60000);
    const cr = createRepo(p);
    if (!cr.ok) {
      log(`CREATE FAILED ${p.repo}: ${cr.err}`);
      failed.push(p.repo);
      continue;
    }
    log(`created repo ${p.repo}`);
  } else if (get.code !== 200) {
    log(`GET repo ${p.repo} -> ${get.code}, skip`);
    failed.push(p.repo);
    continue;
  }

  /* skip if main already exists remotely */
  const br = api('GET', `https://api.github.com/repos/${OWNER}/${p.repo}/branches/main`);
  if (br.code === 200) { log(`SKIP ${p.repo} (already pushed)`); done++; continue; }

  /* local repo */
  if (!fs.existsSync(path.join(p.dir, '.git'))) {
    sh('git', ['init', '-b', 'main'], p.dir);
    sh('git', ['config', 'user.name', OWNER], p.dir);
    sh('git', ['config', 'user.email', 'kiaagentx@users.noreply.github.com'], p.dir);
    if (!fs.existsSync(path.join(p.dir, '.gitignore'))) fs.writeFileSync(path.join(p.dir, '.gitignore'), GITIGNORE);
    sh('git', ['add', '-A'], p.dir);
    const cm = sh('git', ['commit', '-q', '-m', `${p.name} — initial import to GitHub`], p.dir);
    if (cm.code !== 0) { log(`COMMIT FAILED ${p.repo}: ${cm.out.slice(0, 300)}`); failed.push(p.repo); continue; }
  }

  sh('git', ['remote', 'remove', 'origin'], p.dir);
  sh('git', ['remote', 'add', 'origin', `https://github.com/${OWNER}/${p.repo}.git`], p.dir);
  sh('git', ['remote', 'set-url', '--push', 'origin', `https://x-access-token:${TOKEN}@github.com/${OWNER}/${p.repo}.git`], p.dir);

  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    log(`push ${p.repo} (${p.sizeMB} MB, attempt ${attempt})…`);
    const push = sh('git', ['push', '-u', 'origin', 'main'], p.dir);
    if (push.code === 0) { ok = true; }
    else log(`  push error: ${push.out.split('\n').filter(l => l.includes('error') || l.includes('RPC') || l.includes('408')).slice(0, 2).join(' | ')}`);
    if (!ok && attempt < 3) spawnSync('ping', ['-n', '8', '127.0.0.1'], { stdio: 'ignore' });
  }
  if (ok) { done++; log(`OK ${p.repo}`); }
  else { failed.push(p.repo); log(`FAILED ${p.repo} — re-run to retry`); }

  /* sanitize token from this repo's config right away */
  sh('git', ['remote', 'set-url', '--push', 'origin', `https://github.com/${OWNER}/${p.repo}.git`], p.dir);
}

log(`DONE: ${done}/${list.length} pushed${failed.length ? ', failed: ' + failed.join(', ') : ''}`);
process.exit(failed.length ? 2 : 0);
