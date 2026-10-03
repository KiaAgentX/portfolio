import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = process.env.BASE || 'http://localhost:8877';
const errors = [];
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) console.log(`  PASS  ${name}`);
  else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
}

async function load(url, { polyfillFetch = false } = {}) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(`${url}: ${e.message}`));
  vc.on('error', (...a) => errors.push(`${url}: ${a.join(' ')}`));
  const dom = await JSDOM.fromURL(url, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      if (polyfillFetch) {
        window.fetch = (input, init) => {
          const u = new URL(input, window.location.href);
          return fetch(u, init);
        };
      }
    },
  });
  await new Promise(res => {
    if (dom.window.document.readyState === 'complete') res();
    else dom.window.addEventListener('load', res);
    setTimeout(res, 8000);
  });
  await new Promise(r => setTimeout(r, 400));
  return dom;
}

/* ---------- index ---------- */
console.log('INDEX PAGE');
{
  const dom = await load(BASE + '/');
  const d = dom.window.document;
  const cards = d.querySelectorAll('#grid .card');
  check('59 cards rendered', cards.length === 59, `got ${cards.length}`);
  check('category chips rendered', d.querySelectorAll('#chips .chip').length >= 8);
  check('stats show 59 projects', d.querySelector('.stat .v.green')?.textContent === '59');
  check('est. value present', /\$4[0-9]{2},[0-9]{3}/.test(d.querySelector('.stat .v.gold')?.textContent || ''));

  const input = d.querySelector('#search');
  input.value = 'trading';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const n = d.querySelectorAll('#grid .card').length;
  check('search filters (trading -> <48)', n > 0 && n < 48, `got ${n}`);

  input.value = 'zzzznotfound';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  check('empty state shown', d.querySelector('#grid .empty') !== null);

  input.value = '';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  const chip = Array.from(d.querySelectorAll('#chips .chip')).find(c => c.dataset.c === 'Trading & Fintech');
  chip.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const m = d.querySelectorAll('#grid .card').length;
  check('category filter works', m === 10, `got ${m}`);
  dom.window.close();
}

/* ---------- project page ---------- */
console.log('PROJECT PAGE (Hesaban — static preview)');
{
  const dom = await load(BASE + '/projects/Hesaban/', { polyfillFetch: true });
  const w = dom.window, d = w.document;
  check('title h1', d.querySelector('.phead h1')?.textContent === 'Hesaban');
  check('overview panel active by default', d.querySelector('#panel-overview').classList.contains('active'));

  d.querySelector('[data-tab="source"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 1500));
  const files = d.querySelectorAll('#src-tree .src-file');
  check('source tree loaded', files.length > 5, `got ${files.length}`);
  const code = d.querySelector('#src-code');
  check('code content loaded', (code?.textContent || '').length > 50);
  check('highlight.js applied', code?.className.includes('language-'), code?.className);

  d.querySelector('[data-tab="preview"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const iframe = d.querySelector('iframe.preview');
  check('preview iframe src set', !!iframe?.getAttribute('src'), iframe?.getAttribute('src') || '');
  dom.window.close();
}

/* ---------- project page with built preview ---------- */
console.log('PROJECT PAGE (win12 — built preview)');
{
  const dom = await load(BASE + '/projects/win12/', { polyfillFetch: true });
  const w = dom.window, d = w.document;
  d.querySelector('[data-tab="preview"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const iframe = d.querySelector('iframe.preview');
  check('built preview iframe set', (iframe?.src || '').includes('previews/win12'), iframe?.src || '');
  dom.window.close();
}

console.log(errors.length ? `\nConsole errors (${errors.length}):` : '\nNo console errors.');
errors.slice(0, 10).forEach(e => console.log('  ' + e));
process.exit(failed ? 1 : 0);
