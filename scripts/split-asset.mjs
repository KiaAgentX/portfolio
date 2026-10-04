import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = path.resolve(HERE, '..');
const EXE = path.join(PORT, 'release', 'Kia-Portfolio-1.0.0-win-x64.exe');
const PARTS = path.join(PORT, 'release', 'parts');
const SIZE = 20 * 1024 * 1024; /* 20MB — survives short-lived stalls */

fs.rmSync(PARTS, { recursive: true, force: true });
fs.mkdirSync(PARTS, { recursive: true });

const buf = fs.readFileSync(EXE);
const total = Math.ceil(buf.length / SIZE);
const names = [];
const hash = crypto.createHash('sha256').update(buf).digest('hex');

for (let i = 0; i < total; i++) {
  const part = buf.subarray(i * SIZE, Math.min((i + 1) * SIZE, buf.length));
  const name = `Kia-Portfolio-1.0.0-win-x64.exe.${String(i + 1).padStart(3, '0')}`;
  fs.writeFileSync(path.join(PARTS, name), part);
  names.push(name);
  console.log(`${name} ${(part.length / 1048576).toFixed(1)} MB`);
}

const readme = `Kia Portfolio v1.0.0 — Desktop (Windows portable)
====================================================

The installer is split into ${total} parts (20 MB each) for reliable downloads.

HOW TO INSTALL
--------------
1. Download ALL ${total} files (…exe.001 … exe.${String(total).padStart(3, '0')}) plus reassemble.bat
   into the SAME folder.
2. Double-click reassemble.bat   (or run:  copy /b *.001+*.002 ... output — see bat)
3. Run:  Kia-Portfolio-1.0.0-win-x64.exe
   - Portable: no installation, no admin rights.
   - Works offline: the entire site (60 projects, previews, source viewer) is bundled.

VERIFY (optional)
-----------------
SHA-256 of the reassembled exe must be:
${hash}

Persian:
1) همه ${total} فایل را در یک پوشه دانلود کنید.
2) روی reassemble.bat دوبار کلیک کنید.
3) فایل Kia-Portfolio-1.0.0-win-x64.exe را اجرا کنید — نصب و ادمین لازم نیست.
`;
fs.writeFileSync(path.join(PARTS, 'DESKTOP-README.txt'), readme, 'utf8');

/* robust bat: reassemble by ordered list */
const copyCmds = names.map((n, i) => (i === 0 ? `copy /b "${n}" "Kia-Portfolio-1.0.0-win-x64.exe"` : `copy /b "Kia-Portfolio-1.0.0-win-x64.exe" + "${n}" "Kia-Portfolio-1.0.0-win-x64.exe"`)).join('\r\n');
fs.writeFileSync(path.join(PARTS, 'reassemble.bat'),
  `@echo off\r\nchcp 65001 >nul\r\ncd /d "%~dp0"\r\ndel /q "Kia-Portfolio-1.0.0-win-x64.exe" 2>nul\r\n${copyCmds}\r\necho.\r\necho SHA-256 expected:\r\necho ${hash}\r\necho Done. Run Kia-Portfolio-1.0.0-win-x64.exe\r\npause\r\n`, 'utf8');

fs.writeFileSync(path.join(PARTS, 'SHA256.txt'), `${hash}  Kia-Portfolio-1.0.0-win-x64.exe\n`, 'utf8');

const list = fs.readdirSync(PARTS);
console.log(`parts dir: ${list.length} files, ${(list.reduce((a, n) => a + fs.statSync(path.join(PARTS, n)).size, 0) / 1048576).toFixed(1)} MB total`);
