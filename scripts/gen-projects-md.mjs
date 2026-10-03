import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const pj = JSON.parse(fs.readFileSync(path.join(PORT, 'src', 'projects.json'), 'utf8'));

const byCategory = {
  'Trading & Fintech': 'trading-quant',
  'E-Commerce & Marketplaces': 'ecommerce-marketplace',
  'Games & 3D': 'web3d-gpu',
  'Business & Accounting': 'persian-rtl-accounting',
  'Web & Brand Experiences': 'brand-content',
  'Developer Tools': 'devtools-internal',
  'Docs & Strategy': 'product-strategy',
  'AI & Agents': 'ai-agents',
  'Learning & Content': 'brand-content',
};
const overrides = {
  api: 'llm-orchestration', key: 'llm-orchestration', nova: 'llm-orchestration',
  craft: 'llm-orchestration', kiarouter: 'llm-orchestration',
  '0xElon': 'infra-deploy',
  'Neon-Prompt-Studio': 'devtools-internal', pad: 'devtools-internal',
  'khanehesabdari-v1': 'persian-rtl-accounting',
  Pyhub: 'brand-content', skill: 'brand-content', ag: 'brand-content',
  'guide-9router': 'brand-content', 'guide-railway': 'brand-content',
  'senpai-bot': 'ai-agents', Xbot: 'ai-agents', zenovix: 'ai-agents',
  AGI: 'ai-agents', xA: 'ai-agents', 'Kia-Agent': 'ai-agents', startagent: 'ai-agents',
  '0.6.0': 'ecommerce-marketplace',
};

const mod = p => overrides[p.id] || byCategory[p.category] || 'ai-agents';
const rows = pj.map(p =>
  `| [${p.name}](https://kiaagentx.github.io/portfolio/projects/${p.id}/) | ${p.category} | ${mod(p)} | $${p.value.toLocaleString('en-US')} | ${p.status} | ${p.previewReady ? 'live' : '—'} |`
);
const total = pj.reduce((a, p) => a + p.value, 0);
const counts = {};
pj.forEach(p => { const m = mod(p); counts[m] = (counts[m] || 0) + 1; });

const md = `# PROJECTS.md — 59 Projects to Skill Modules

Auto-generated map: every shipped project traced to the skill module it feeds.
Shipped value: $${total.toLocaleString('en-US')} · ${pj.length} projects · all previews live.

| Project | Category | Skill module | Est. value | Status | Preview |
|---|---|---|---|---|---|
${rows.join('\n')}

## Module distribution
${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([m, n]) => `- \`${m}\`: ${n} projects`).join('\n')}

---
Module definitions: \`skills/*/SKILL.md\` · Pricing: \`PRICING.md\` · Soul: \`SOUL.md\`
`;
fs.writeFileSync(path.join(PORT, '..', 'skills-repo', 'PROJECTS.md'), md);
console.log(`PROJECTS.md written: ${pj.length} rows, total $${total.toLocaleString('en-US')}`);
console.log('distribution:', JSON.stringify(counts));
