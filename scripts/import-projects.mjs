import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const CHUNK = 9 * 1024 * 1024;
const NUL = String.fromCharCode(0);

function sh(cmd, args, cwd = PORT, input = undefined) {
  const r = spawnSync(cmd, args, {
    cwd, encoding: 'utf8', input,
    timeout: 30 * 60 * 1000, maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '' },
  });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(PORT, 'import.log'), line + '\n');
}
const pause = sec => spawnSync('ping', ['-n', String(sec), '127.0.0.1'], { stdio: 'ignore' });

fs.rmSync(path.join(PORT, 'import.log'), { force: true });

log('fetch origin main...');
if (sh('git', ['fetch', 'origin', 'main']).code !== 0) { log('FETCH FAILED'); process.exit(1); }
let local = sh('git', ['rev-parse', 'HEAD']).out.trim();
let remote = sh('git', ['rev-parse', 'origin/main']).out.trim();

function pushWithRetry() {
  for (let a = 1; a <= 3; a++) {
    log(`push main (attempt ${a})...`);
    if (sh('git', ['push', 'origin', 'main']).code === 0) return true;
    pause(8);
  }
  return false;
}

if (local !== remote) {
  const mergeBase = sh('git', ['merge-base', 'HEAD', 'origin/main']).out.trim();
  if (mergeBase === local) {
    log('local behind remote - fast-forwarding');
    if (sh('git', ['merge', '--ff-only', 'origin/main']).code !== 0) { log('FF FAILED'); process.exit(1); }
  } else if (mergeBase === remote) {
    log('local ahead - pushing pending commits first');
    if (!pushWithRetry()) { log('PUSH OF EXISTING COMMITS FAILED - re-run to retry'); process.exit(1); }
  } else {
    log('DIVERGED - resolve manually'); process.exit(1);
  }
}

function untracked() {
  const r = sh('git', ['ls-files', '-o', '--exclude-standard', '-z', '--', 'projects/']);
  if (r.code !== 0) { log('ls-files FAILED: ' + r.out.slice(0, 300)); process.exit(1); }
  return r.out.split(NUL).filter(Boolean);
}

function makeChunks(paths) {
  const items = paths.map(rel => {
    let size = 0;
    try { size = fs.statSync(path.join(PORT, rel)).size; } catch { }
    return { rel, size };
  }).sort((a, b) => a.rel.localeCompare(b.rel));
  const chunks = [];
  let cur = [], sz = 0;
  for (const it of items) {
    if (it.size > CHUNK) { if (cur.length) { chunks.push(cur); cur = []; sz = 0; } chunks.push([it]); continue; }
    if (sz + it.size > CHUNK) { chunks.push(cur); cur = []; sz = 0; }
    cur.push(it); sz += it.size;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

let pending = untracked();
const total = pending.length;
if (!total) log('nothing to import');

while (pending.length) {
  const chunks = makeChunks(pending);
  const chunk = chunks[0];
  const mb = (chunk.reduce((a, f) => a + f.size, 0) / 1048576).toFixed(1);

  const specs = chunk.map(f => ':(literal)' + f.rel).join('\n') + '\n';
  const specFile = path.join(PORT, '.git', 'PENDING_SPECS');
  fs.writeFileSync(specFile, specs, 'utf8');
  const add = sh('git', ['add', '--pathspec-from-file=' + specFile]);
  if (add.code !== 0) { log('ADD FAILED: ' + add.out.slice(0, 400)); process.exit(1); }

  const folders = [...new Set(chunk.map(f => f.rel.split('/')[1]))];
  const label = folders.length === 1 ? folders[0] : folders.length + ' folders';
  sh('git', ['commit', '-q', '-m', 'import projects: ' + label + ' (' + mb + ' MB)']);

  if (!pushWithRetry()) { log('PUSH FAILED at chunk (' + mb + ' MB) - re-run to resume'); process.exit(1); }

  pending = untracked();
  log('chunk done: ' + label + ' (' + mb + ' MB) - remaining files: ' + pending.length + ' / ' + total);
}

local = sh('git', ['rev-parse', 'HEAD']).out.trim();
remote = sh('git', ['ls-remote', 'origin', 'main']).out.split(/\s+/)[0];
if (local === remote && !untracked().length) log('DONE: all projects imported, remote main = ' + local.slice(0, 7));
else { log('VERIFY FAILED local=' + local.slice(0, 7) + ' remote=' + (remote || 'none').slice(0, 7)); process.exit(2); }
