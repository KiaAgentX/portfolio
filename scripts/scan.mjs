import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || './scan.json');
const SKIP = new Set(['node_modules', '.git', 'venv', '__pycache__', 'dist', 'build', '.next', '.turbo', 'coverage']);

function walk(dir, acc = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function readReadme(dir) {
  for (const name of ['README.md', 'readme.md', 'Readme.md']) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      try { return fs.readFileSync(p, 'utf8').slice(0, 4000); } catch { }
    }
  }
  return '';
}

function extractDescription(md) {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  let title = '';
  let desc = '';
  let started = false;
  for (const line of lines) {
    const t = line.trim();
    if (!started) {
      const h = t.match(/^#\s+(.+)/);
      if (h) { title = h[1].replace(/[#*`]/g, '').trim(); started = true; }
      continue;
    }
    if (!t || /^[-*=]{3,}$/.test(t)) continue;
    if (/^#/.test(t)) break;
    if (/^```/.test(t)) { break; }
    desc += (desc ? ' ' : '') + t.replace(/[*`>#]/g, '').trim();
    if (desc.length > 280) break;
  }
  return { title, desc: desc.slice(0, 320) };
}

const LANG_BY_EXT = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript',
  '.py': 'Python', '.html': 'HTML', '.css': 'CSS', '.scss': 'CSS', '.md': 'Markdown',
  '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML', '.sh': 'Shell', '.sql': 'SQL',
  '.cpp': 'C++', '.c': 'C', '.cs': 'C#', '.go': 'Go', '.rs': 'Rust', '.java': 'Java',
  '.vue': 'Vue', '.svelte': 'Svelte', '.ipynb': 'Jupyter', '.ps1': 'PowerShell',
};

const projects = [];
for (const name of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  if (name === 'portfolio' || name.startsWith('.')) continue;

  const files = walk(dir);
  const extCount = {};
  const codeExtCount = {};
  let loc = 0;
  const notable = [];
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    extCount[ext] = (extCount[ext] || 0) + 1;
    const lang = LANG_BY_EXT[ext];
    if (lang && !['JSON', 'Markdown', 'YAML'].includes(lang)) {
      codeExtCount[lang] = (codeExtCount[lang] || 0) + 1;
      if (['.ts', '.tsx', '.js', '.jsx', '.py', '.html', '.css', '.vue'].includes(ext)) {
        try {
          const st = fs.statSync(f);
          if (st.size < 300000) loc += fs.readFileSync(f, 'utf8').split('\n').length;
        } catch { }
      }
    }
    const base = path.basename(f).toLowerCase();
    if (['package.json', 'requirements.txt', 'pyproject.toml', 'dockerfile', 'docker-compose.yml', 'vercel.json', 'netlify.toml'].includes(base)) {
      notable.push(path.relative(dir, f).replace(/\\/g, '/'));
    }
  }

  let pkg = null;
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { }
  }
  const deps = pkg ? { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) } : {};
  const frameworks = [];
  if (deps.next) frameworks.push('Next.js');
  if (deps.react) frameworks.push('React');
  if (deps.vue) frameworks.push('Vue');
  if (deps.vite) frameworks.push('Vite');
  if (deps.express) frameworks.push('Express');
  if (deps.tailwindcss) frameworks.push('Tailwind CSS');
  if (deps.typescript) frameworks.push('TypeScript');

  const readme = extractDescription(readReadme(dir));

  const hasStaticIndex = files.some(f => path.basename(f) === 'index.html' && path.dirname(f) === dir);
  const hasReq = files.some(f => ['requirements.txt', 'pyproject.toml'].includes(path.basename(f)));
  const isDocsOnly = files.length <= 12 && !hasStaticIndex && !pkg && (codeExtCount['Python'] || 0) === 0;

  projects.push({
    id: name.replace(/-main$/, ''),
    folder: name,
    title: readme.title || name.replace(/-main$/, ''),
    description: readme.desc || '',
    fileCount: files.length,
    loc,
    languages: Object.fromEntries(Object.entries(codeExtCount).sort((a, b) => b[1] - a[1])),
    frameworks,
    hasStaticIndex,
    hasPythonReq: hasReq,
    isDocsOnly,
    pkgName: pkg?.name || null,
    pkgScripts: pkg?.scripts || null,
    notable,
    sizeMB: Math.round((files.reduce((s, f) => { try { return s + fs.statSync(f).size; } catch { return s; } }, 0) / 1024 / 1024) * 10) / 10,
  });
}

fs.writeFileSync(OUT, JSON.stringify(projects, null, 2));
console.log(`Scanned ${projects.length} projects -> ${OUT}`);
