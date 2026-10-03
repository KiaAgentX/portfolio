import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const langs = ['xml', 'css', 'javascript', 'typescript', 'python', 'json', 'bash', 'markdown', 'yaml', 'sql', 'cpp', 'c', 'csharp', 'go', 'rust', 'java', 'php', 'powershell', 'dockerfile', 'ini', 'diff', 'nginx'];

const entry = `
import hljs from 'highlight.js/lib/core';
${langs.map(l => `import ${l.replace(/\+/g, 'p')} from 'highlight.js/lib/languages/${l}';`).join('\n')}
${langs.map(l => `hljs.registerLanguage('${l}', ${l.replace(/\+/g, 'p')});`).join('\n')}
window.hljs = hljs;
`;

const tmp = path.join(pkg, '.hljs-entry.js');
fs.writeFileSync(tmp, entry);

const out = path.join(pkg, 'src', 'assets', 'highlight.min.js');
await build({
  entryPoints: [tmp],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: out,
  logLevel: 'error',
});
fs.unlinkSync(tmp);

const css = path.join(pkg, 'node_modules', 'highlight.js', 'styles', 'github-dark.min.css');
fs.copyFileSync(css, path.join(pkg, 'src', 'assets', 'highlight.min.css'));
console.log('vendored highlight.js ->', out, fs.statSync(out).size, 'bytes');
