import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '..', 'src', 'assets');

/* font-free geometric K mark */
function iconSvg({ size, maskable }) {
  const pad = maskable ? 0 : 40;
  const rx = maskable ? 0 : 96;
  const stroke = maskable ? 44 : 52;
  const frame = maskable ? '' : `<rect x="40" y="40" width="432" height="432" rx="70" fill="none" stroke="#ef4435" stroke-width="16" opacity=".9"/>`;
  const k = `<path d="M176 136V376 M176 256 L336 136 M176 256 L336 376" stroke="#f0ebdf" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rx}" fill="#06060e"/>
  ${frame}
  <g transform="${maskable ? 'translate(256 256) scale(0.78) translate(-256 -256)' : ''}">${k}</g>
</svg>`;
}

const targets = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, false],
];

for (const [name, size, maskable] of targets) {
  const buf = Buffer.from(iconSvg({ size, maskable }));
  await sharp(buf, { density: 300 }).resize(size, size).png().toFile(path.join(ASSETS, name));
  console.log('wrote', name);
}
