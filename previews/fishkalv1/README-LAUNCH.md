# Fishkal — cPanel Launch Package

## Contents
- `public_html/`  → upload ALL of its contents to your cPanel `public_html` (site root)
- `private/setup.html` → PRIVATE English launch-control page. Keep OUTSIDE public_html.

## Launch steps
1. cPanel → File Manager → `public_html` → upload the contents of `public_html/` from this zip.
2. Open `private/setup.html` on your computer (double-click). Edit the launch date.
3. Click **Download config.js** and upload it over `public_html/config.js`. Changes go live instantly.
4. cPanel → SSL/TLS Status → **Run AutoSSL** (HTTPS is required for install prompt + service worker).
5. Done. No database, no build step. `.htaccess` already handles HTTPS redirect, caching, compression, MIME.

## Notes
- `config.js` is the single place the business edits the launch countdown.
- The fishing game, languages and visuals need no maintenance.
