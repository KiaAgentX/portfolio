import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const ROOT = path.resolve(PORT, '..');
const SRC = path.join(PORT, 'src');
const DIST = path.join(PORT, 'dist');

const config = JSON.parse(fs.readFileSync(path.join(SRC, 'config.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(SRC, 'projects.json'), 'utf8'));

execFileSync(process.execPath, [path.join(HERE, 'scan.mjs'), ROOT, path.join(PORT, 'scan.json')], { stdio: 'inherit' });
const scan = JSON.parse(fs.readFileSync(path.join(PORT, 'scan.json'), 'utf8'));
const scanById = Object.fromEntries(scan.map(s => [s.folder, s]));

/* ---------------- helpers ---------------- */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', 'venv', '__pycache__', 'coverage', '.cache']);
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.html', '.htm', '.css', '.scss', '.less', '.md', '.json', '.yml', '.yaml', '.sh', '.bat', '.ps1', '.sql', '.txt', '.toml', '.cfg', '.ini', '.csv', '.vue', '.svelte', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.java', '.cs', '.php', '.xml', '.graphql', '.prisma', '.dart', '.rb', '.lua', '.r', '.env', '.log']);
const TEXT_BASE = new Set(['dockerfile', 'makefile', '.gitignore', '.npmrc', '.nvmrc', '.editorconfig', '.eslintrc', '.prettierrc', 'license', 'procfile', 'cmakelists.txt']);
const HLJS_LANG = { '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.py': 'python', '.html': 'xml', '.htm': 'xml', '.css': 'css', '.scss': 'css', '.less': 'css', '.md': 'markdown', '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml', '.sh': 'bash', '.bat': 'bash', '.ps1': 'powershell', '.sql': 'sql', '.cpp': 'cpp', '.c': 'c', '.h': 'c', '.hpp': 'cpp', '.cs': 'csharp', '.go': 'go', '.rs': 'rust', '.java': 'java', '.php': 'php', '.xml': 'xml', '.vue': 'xml', '.svelte': 'xml', '.diff': 'diff', '.ini': 'ini', '.toml': 'ini' };

function walk(dir, acc = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function fmt(n) { return n.toLocaleString('en-US'); }
function money(n) { return '$' + fmt(n); }
function safeJson(obj) { return JSON.stringify(obj).replace(/</g, '\\u003c'); }

const repoUrl = p => config.site.sourceRepo
  ? `https://github.com/${config.site.sourceRepo}/tree/${config.site.sourceBranch || 'main'}/projects/${p.folder}`
  : `https://github.com/${config.owner.handle}/${p.repo}`;

/* ---------------- source extraction ---------------- */
function extractSource(folder) {
  const files = walk(folder);
  const candidates = [];
  for (const f of files) {
    const rel = path.relative(folder, f).replace(/\\/g, '/');
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f).toLowerCase();
    const isText = TEXT_EXT.has(ext) || TEXT_BASE.has(base) || base.startsWith('.env');
    if (!isText) continue;
    let st; try { st = fs.statSync(f); } catch { continue; }
    if (st.size > 512 * 1024) continue;
    const depth = rel.split('/').length;
    candidates.push({ rel, f, ext, depth, size: st.size });
  }
  candidates.sort((a, b) => a.depth - b.depth || (b.ext === '.md' ? 1 : 0) - (a.ext === '.md' ? 1 : 0) || a.rel.localeCompare(b.rel));

  const out = [];
  let budget = 1200000;
  for (const c of candidates) {
    if (out.length >= 200 || budget <= 0) break;
    let content;
    try { content = fs.readFileSync(c.f, 'utf8'); } catch { continue; }
    if (content.indexOf(String.fromCharCode(0)) !== -1) continue;
    let truncated = false;
    if (content.length > 60000) { content = content.slice(0, 60000); truncated = true; }
    budget -= content.length;
    const base = path.basename(c.rel).toLowerCase();
    const lang = HLJS_LANG[c.ext] || (base === 'dockerfile' ? 'dockerfile' : 'plaintext');
    out.push({ path: c.rel, lang, size: c.size, truncated, content });
  }
  return { files: out };
}

/* ---------------- preview preparation ---------------- */
function pickEntry(dir) {
  if (fs.existsSync(path.join(dir, 'index.html'))) return 'index.html';
  const htmls = walk(dir).filter(f => f.endsWith('.html'));
  if (!htmls.length) return null;
  htmls.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length);
  return path.relative(dir, htmls[0]).replace(/\\/g, '/');
}

function preparePreview(p) {
  const dest = path.join(DIST, 'previews', p.id);
  rmrf(dest);
  if (p.preview === 'static') {
    const folder = path.join(ROOT, p.folder);
    fs.cpSync(folder, dest, {
      recursive: true,
      filter: (s) => !['node_modules', '.git'].includes(path.basename(s)) && !s.endsWith('.zip'),
    });
    const entry = pickEntry(dest);
    if (!entry) { rmrf(dest); return { ready: false, entry: null }; }
    return { ready: true, entry };
  }
  if (p.preview === 'build') {
    const built = path.join(PORT, 'builds', p.id);
    if (fs.existsSync(path.join(built, 'index.html'))) {
      fs.cpSync(built, dest, { recursive: true });
      return { ready: true, entry: 'index.html' };
    }
    return { ready: false, entry: null };
  }
  return { ready: false, entry: null };
}

/* ---------------- gallery ---------------- */
function copyGallery(p) {
  const folder = path.join(ROOT, p.folder);
  const dest = path.join(DIST, 'projects', p.id, 'gallery');
  const files = walk(folder).filter(f => {
    const rel = path.relative(folder, f).replace(/\\/g, '/');
    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return false;
    if (fs.statSync(f).size > 400 * 1024) return false;
    if (/^docs\//.test(rel) || /shot|screen|demo|preview|capture/i.test(path.basename(f))) return true;
    return false;
  });
  files.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
  const chosen = files.slice(0, 3);
  if (!chosen.length) return [];
  mkdirp(dest);
  return chosen.map(f => {
    const name = path.basename(f);
    fs.copyFileSync(f, path.join(dest, name));
    return 'gallery/' + name;
  });
}

/* ---------------- HTML templates ---------------- */
function navHtml(base) {
  return `<header class="nav"><div class="container nav-inner">
    <a class="brand" href="${base}/"><span class="dot"></span>${esc(config.owner.name)}</a>
    <nav class="nav-links">
      <a href="${base}/#projects">Projects</a>
      <a href="${esc(config.owner.github)}" target="_blank" rel="noopener">GitHub</a>
      <a class="nav-cta" href="${base}/#projects">Explore Work</a>
    </nav>
  </div></header>`;
}

function buildIndex(stats, cards) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.site.title)}</title>
<meta name="description" content="${esc(config.site.description)}">
<meta property="og:title" content="${esc(config.site.title)}">
<meta property="og:description" content="${esc(config.site.description)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
${navHtml('.')}
<main>
  <section class="hero"><div class="container">
    <h1>Engineering <span class="grad">production software</span><br>across AI, fintech &amp; 3D.</h1>
    <p class="lead">${esc(config.site.description)}</p>
    <div class="stats">
      <div class="stat"><div class="v green">${stats.projects}</div><div class="k">Projects shipped</div></div>
      <div class="stat"><div class="v cyan">${fmt(stats.loc)}</div><div class="k">Lines of code</div></div>
      <div class="stat"><div class="v gold">${money(stats.value)}</div><div class="k">Est. portfolio value</div></div>
      <div class="stat"><div class="v">${stats.previews}</div><div class="k">Live previews</div></div>
    </div>
    <div class="toolbar" id="projects">
      <div class="search"><input id="search" type="search" placeholder="Search projects, stacks, categories…" autocomplete="off"></div>
      <div class="sort"><select id="sort">
        <option value="value">Sort: value</option>
        <option value="loc">Sort: lines of code</option>
        <option value="name">Sort: name</option>
      </select></div>
    </div>
    <div class="chips" id="chips"></div>
    <div class="grid" id="grid"></div>
  </div></section>
</main>
<footer class="footer"><div class="container row">
  <div>© ${new Date().getFullYear()} ${esc(config.owner.name)} · ${esc(config.owner.location)}</div>
  <div><a href="${esc(config.owner.github)}" target="_blank" rel="noopener">GitHub</a>${config.site.repoUrl ? ` · <a href="${esc(config.site.repoUrl)}" target="_blank" rel="noopener">Site source</a>` : ''}</div>
</div></footer>
<script>window.__PROJECTS__ = ${safeJson(cards)};</script>
<script src="assets/index.js"></script>
</body>
</html>`;
}

function buildProjectPage(p, ctx) {
  const base = '../..';
  const repo = repoUrl(p);
  const idx = projects.findIndex(x => x.id === p.id);
  const prevP = projects[idx - 1], nextP = projects[idx + 1];
  const statusBadge = p.status !== 'stable'
    ? `<span class="badge status-${p.status === 'in-dev' ? 'dev' : 'beta'}">${p.status === 'in-dev' ? 'in development' : 'beta'}</span>` : '';
  const stack = p.stack.map(s => `<span class="badge">${esc(s)}</span>`).join('');
  const gallery = ctx.gallery.length
    ? `<div class="gallery">${ctx.gallery.map(g => `<img src="${g}" alt="${esc(p.name)} screenshot" loading="lazy">`).join('')}</div>` : '';

  const previewPanel = ctx.preview.ready
    ? `<div class="preview-wrap">
        <div class="preview-bar">
          <span class="preview-url">previews/${esc(p.id)}/${esc(ctx.preview.entry)}</span>
          <a class="btn" href="${base}/previews/${esc(p.id)}/${esc(ctx.preview.entry)}" target="_blank" rel="noopener">Open fullscreen</a>
        </div>
        <iframe class="preview" data-defer="${base}/previews/${esc(p.id)}/${esc(ctx.preview.entry)}" title="${esc(p.name)} live preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
      </div>`
    : `<div class="no-preview">
        <strong>${p.preview === 'none' ? 'Server-side project — no browser preview' : 'Live preview is being prepared'}</strong>
        ${p.preview === 'none'
      ? 'This project runs as a backend service, bot or desktop workflow. Explore the full source code below, or run it locally with Docker.'
      : 'The static bundle for this project is generated by the portfolio build pipeline (npm run build:previews).'}
        <div class="cta-row" style="justify-content:center;margin-top:16px">
          <a class="btn" href="${esc(repo)}" target="_blank" rel="noopener">View on GitHub</a>
        </div>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} — ${esc(config.site.title)}</title>
<meta name="description" content="${esc(p.tagline)}">
<link rel="stylesheet" href="${base}/assets/style.css">
<link rel="stylesheet" href="${base}/assets/highlight.min.css">
</head>
<body>
${navHtml(base)}
<main class="container">
  <div class="phead">
    <a class="back" href="${base}/#projects">← All projects</a>
    <h1>${esc(p.name)}</h1>
    <p class="tag">${esc(p.tagline)}</p>
    <div class="pmeta">
      <span class="badge lang">${esc(p.language)}</span>
      <span class="badge">${esc(p.category)}</span>
      <span class="badge" style="color:var(--gold);border-color:rgba(251,191,36,.35)">Est. ${money(p.value)}</span>
      ${statusBadge}
    </div>
  </div>

  <div class="tabs">
    <button class="tab" data-tab="overview">Overview</button>
    <button class="tab" data-tab="preview">Live Preview</button>
    <button class="tab" data-tab="source">Source Code</button>
  </div>

  <section class="panel" id="panel-overview">
    <div class="ov-grid">
      <div class="ov-card">
        <h4>About this project</h4>
        <p>${esc(p.description)}</p>
        ${gallery}
        <div class="cta-row">
          <a class="btn primary" href="${esc(repo)}" target="_blank" rel="noopener">View source on GitHub</a>
          ${config.site.sourceRepo ? '' : `<a class="btn" href="${esc(repo)}/archive/refs/heads/main.zip">Download ZIP</a>`}
          ${ctx.preview.ready ? `<a class="btn" href="#preview">Live preview</a>` : ''}
        </div>
      </div>
      <div class="ov-card">
        <h4>Project facts</h4>
        <div class="kv"><span class="k">Category</span><span class="v">${esc(p.category)}</span></div>
        <div class="kv"><span class="k">Primary language</span><span class="v">${esc(p.language)}</span></div>
        <div class="kv"><span class="k">Lines of code</span><span class="v">${fmt(ctx.stats.loc)}</span></div>
        <div class="kv"><span class="k">Files</span><span class="v">${fmt(ctx.stats.fileCount)}</span></div>
        <div class="kv"><span class="k">Status</span><span class="v">${esc(p.status)}</span></div>
        <div class="kv"><span class="k">Est. market value</span><span class="v gold">${money(p.value)}</span></div>
        <div class="kv"><span class="k">${config.site.sourceRepo ? 'Source path' : 'Repository'}</span><span class="v">${esc(config.site.sourceRepo ? 'projects/' + p.folder : p.repo)}</span></div>
        <h4 style="margin-top:18px">Stack</h4>
        <div class="stack-chips">${stack}</div>
      </div>
    </div>
  </section>

  <section class="panel" id="panel-preview">${previewPanel}</section>

  <section class="panel" id="panel-source">
    <div class="src">
      <aside class="src-tree" id="src-tree"></aside>
      <div class="src-main">
        <div class="src-head">
          <span id="src-path">Select a file</span>
          <span>
            <button class="btn ghost" id="src-prev">‹</button>
            <button class="btn ghost" id="src-next">›</button>
            <a class="btn ghost" href="${esc(repo)}" target="_blank" rel="noopener">GitHub</a>
          </span>
        </div>
        <div class="src-code" id="src-code-wrap"><pre><code id="src-code"></code></pre></div>
        <div class="src-status" id="src-status">Loading source files…</div>
      </div>
    </div>
  </section>

  <nav class="pager">
    ${prevP ? `<a href="../${encodeURIComponent(prevP.id)}/"><div class="lbl">← Previous</div><div class="nm">${esc(prevP.name)}</div></a>` : '<span></span>'}
    ${nextP ? `<a class="next" href="../${encodeURIComponent(nextP.id)}/"><div class="lbl">Next →</div><div class="nm">${esc(nextP.name)}</div></a>` : '<span></span>'}
  </nav>
</main>
<script>window.__PROJECT__ = ${safeJson({ id: p.id, sourceAvailable: ctx.source.files.length > 0, repo })};</script>
<script src="${base}/assets/highlight.min.js"></script>
<script src="${base}/assets/project.js"></script>
</body>
</html>`;
}

/* ---------------- main ---------------- */
rmrf(DIST);
mkdirp(path.join(DIST, 'assets'));
mkdirp(path.join(DIST, 'data', 'src'));
mkdirp(path.join(DIST, 'projects'));

for (const f of ['style.css', 'index.js', 'project.js', 'highlight.min.js', 'highlight.min.css']) {
  fs.copyFileSync(path.join(SRC, 'assets', f), path.join(DIST, 'assets', f));
}

const cards = [];
let totalLoc = 0, totalValue = 0, previewCount = 0;

for (const p of projects) {
  const folder = path.join(ROOT, p.folder);
  const s = scanById[p.folder] || { loc: 0, fileCount: 0, languages: {}, sizeMB: 0 };

  const source = extractSource(folder);
  fs.writeFileSync(path.join(DIST, 'data', 'src', `${p.id}.json`), JSON.stringify(source));

  const preview = preparePreview(p);
  const gallery = copyGallery(p);

  const ctx = { preview, gallery, stats: s, source };
  mkdirp(path.join(DIST, 'projects', p.id));
  fs.writeFileSync(path.join(DIST, 'projects', p.id, 'index.html'), buildProjectPage(p, ctx));

  totalLoc += s.loc;
  totalValue += p.value;
  if (preview.ready) previewCount++;

  cards.push({
    id: p.id, name: p.name, tagline: p.tagline, description: p.description,
    category: p.category, language: p.language, stack: p.stack,
    value: p.value, status: p.status, preview: p.preview,
    previewReady: preview.ready, loc: s.loc, fileCount: s.fileCount,
  });

  const srcSize = Math.round(JSON.stringify(source).length / 1024);
  console.log(`  ${p.id.padEnd(22)} source:${String(source.files.length).padStart(3)}f ${String(srcSize).padStart(5)}KB  preview:${preview.ready ? 'ready' : (p.preview === 'none' ? 'n/a' : 'pending')}`);
}

const stats = { projects: projects.length, loc: totalLoc, value: totalValue, previews: previewCount };
fs.writeFileSync(path.join(DIST, 'index.html'), buildIndex(stats, cards));
fs.writeFileSync(path.join(DIST, 'data', 'projects.json'), JSON.stringify({ stats, projects: cards }, null, 2));

const distSize = walk(DIST).reduce((a, f) => a + fs.statSync(f).size, 0);
console.log(`\nBuilt ${projects.length} pages -> dist/ (${(distSize / 1048576).toFixed(1)} MB)`);
console.log(`Projects: ${stats.projects} · LOC: ${fmt(stats.loc)} · Est. value: ${money(stats.value)} · Live previews: ${stats.previews}`);

execFileSync(process.execPath, [path.join(HERE, 'redact-secrets.mjs'), '--apply'], { stdio: 'inherit' });
