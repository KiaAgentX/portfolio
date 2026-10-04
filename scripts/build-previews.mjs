import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const ROOT = path.resolve(PORT, '..');
const SRC = path.join(PORT, 'src');
const TMP = path.join(PORT, '.tmp-build');
const OUT = path.join(PORT, 'builds');

const only = process.argv.slice(2);
const projects = JSON.parse(fs.readFileSync(path.join(SRC, 'projects.json'), 'utf8'))
  .filter(p => p.preview === 'build' && (only.length === 0 || only.includes(p.id)));

const CONC = 4;

function run(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => out += d);
    child.on('close', code => resolve({ code, out }));
    child.on('error', e => resolve({ code: 1, out: String(e) }));
  });
}

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(PORT, 'build-previews.log'), line + '\n');
}

/* rewrite absolute /images/ references to relative (preview lives on a subpath) */
function fixImagePaths(dir) {
  const TXT = new Set(['.html', '.txt', '.js', '.css', '.json', '.rsc']);
  let changed = 0;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!TXT.has(path.extname(e.name).toLowerCase())) continue;
      let s;
      try { s = fs.readFileSync(p, 'utf8'); } catch { continue; }
      const out = s.replace(/(^|[^.\w])\/images\//g, '$1./images/');
      if (out !== s) { fs.writeFileSync(p, out); changed++; }
    }
  })(dir);
  return changed;
}

async function buildOne(p) {
  const tmp = path.join(TMP, p.id);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  fs.cpSync(path.join(ROOT, p.folder), tmp, {
    recursive: true,
    filter: s => !['node_modules', '.git', 'dist', 'build'].includes(path.basename(s)),
  });

  const isNext = fs.existsSync(path.join(tmp, 'next.config.ts')) || fs.existsSync(path.join(tmp, 'next.config.js')) || fs.existsSync(path.join(tmp, 'next.config.mjs'));
  const isVite = ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs'].some(n => fs.existsSync(path.join(tmp, n)));
  if (isNext) {
    for (const name of ['next.config.ts', 'next.config.js', 'next.config.mjs']) {
      const f = path.join(tmp, name);
      if (!fs.existsSync(f)) continue;
      let c = fs.readFileSync(f, 'utf8');
      if (!c.includes('output')) {
        log(`${p.id}: injecting output:"export" into ${name}`);
        c = c.replace(/const nextConfig[^=]*=\s*\{/, m => m + '\n  output: "export",');
      } else {
        c = c.replace(/output:\s*["'][^"']*["']\s*,?/, 'output: "export",');
      }
      c = c.replace(/^\s*basePath:.*$/m, '');
      if (!c.includes('assetPrefix')) {
        log(`${p.id}: injecting assetPrefix:"." into ${name}`);
        c = c.replace(/const nextConfig[^=]*=\s*\{/, m => m + '\n  assetPrefix: ".",');
      }
      if (!c.includes('images:')) {
        log(`${p.id}: injecting images.unoptimized (static host has no image optimizer)`);
        c = c.replace(/const nextConfig[^=]*=\s*\{/, m => m + '\n  images: { unoptimized: true },');
      }
      fs.writeFileSync(f, c);
    }
  }

  /* neon-apple: static-export-friendly patches (drop API routes + force-dynamic, generate prisma) */
  const isNeonApple = p.id === 'neon-apple';
  if (isNeonApple) {
    fs.rmSync(path.join(tmp, 'src', 'app', 'api'), { recursive: true, force: true });
    const page = path.join(tmp, 'src', 'app', 'page.tsx');
    if (fs.existsSync(page)) {
      let pc = fs.readFileSync(page, 'utf8');
      pc = pc.replace(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["'];?/, '');
      fs.writeFileSync(page, pc);
    }
    /* make SQLite reachable at prerender: absolute URL + copy next to schema */
    const dbSrc = path.join(tmp, 'db', 'custom.db');
    if (fs.existsSync(dbSrc)) {
      fs.mkdirSync(path.join(tmp, 'prisma', 'db'), { recursive: true });
      fs.copyFileSync(dbSrc, path.join(tmp, 'prisma', 'db', 'custom.db'));
      process.env.DATABASE_URL = 'file:' + path.join(tmp, 'db', 'custom.db').split(path.sep).join('/');
    }
    log(`${p.id}: stripped API routes + force-dynamic; DATABASE_URL=${process.env.DATABASE_URL ? 'absolute' : 'unchanged'}`);
  }

  log(`${p.id}: npm install…`);
  let r = await run('npm install --no-audit --no-fund --loglevel=error', [], tmp);
  if (r.code !== 0) {
    log(`${p.id}: npm install FAILED\n${r.out.slice(-1500)}`);
    fs.writeFileSync(path.join(PORT, 'builds', p.id + '.fail.txt'), r.out);
    fs.rmSync(tmp, { recursive: true, force: true });
    return false;
  }

  log(`${p.id}: build…`);
  if (isNeonApple) {
    log(`${p.id}: prisma generate…`);
    const gen = await run('npx', ['prisma', 'generate'], tmp);
    if (gen.code !== 0) log(`${p.id}: prisma generate warn: ${gen.out.slice(-400)}`);
    r = await run('npx', ['next', 'build'], tmp);
  } else if (isVite && !isNext) {
    r = await run('npx vite build --base=./', [], tmp);
    if (r.code !== 0) {
      log(`${p.id}: vite build failed, trying npm run build…`);
      r = await run('npm run build', [], tmp);
    }
  } else {
    r = await run('npm run build', [], tmp);
    if (r.code !== 0) {
      log(`${p.id}: npm run build failed, trying npx vite build…`);
      r = await run('npx vite build --base=./', [], tmp);
    }
  }
  if (r.code !== 0) {
    log(`${p.id}: BUILD FAILED\n${r.out.slice(-1500)}`);
    fs.writeFileSync(path.join(PORT, 'builds', p.id + '.fail.txt'), r.out);
    fs.rmSync(tmp, { recursive: true, force: true });
    return false;
  }

  let dist = null;
  for (const cand of ['dist', path.join('out'), path.join('.next', 'export')] ) {
    const c = path.join(tmp, cand);
    if (fs.existsSync(path.join(c, 'index.html'))) { dist = c; break; }
  }
  if (!dist) {
    log(`${p.id}: no dist/index.html produced`);
    fs.rmSync(tmp, { recursive: true, force: true });
    return false;
  }

  if (isNeonApple) {
    const n = fixImagePaths(dist);
    log(`${p.id}: rewrote absolute /images/ paths in ${n} files`);
  }

  const dest = path.join(OUT, p.id);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(dist, dest, { recursive: true });
  fs.rmSync(tmp, { recursive: true, force: true });
  log(`${p.id}: OK -> builds/${p.id}`);
  return true;
}

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(path.join(PORT, 'build-previews.log'), { force: true });
log(`Building ${projects.length} previews (concurrency ${CONC})`);

const queue = [...projects];
const results = [];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const ok = await buildOne(p);
    results.push({ id: p.id, ok });
  }
}
await Promise.all(Array.from({ length: Math.min(CONC, queue.length) }, worker));

const ok = results.filter(r => r.ok).map(r => r.id);
const fail = results.filter(r => !r.ok).map(r => r.id);
log(`DONE ok=${ok.length} fail=${fail.length}`);
if (fail.length) log(`failed: ${fail.join(', ')}`);
