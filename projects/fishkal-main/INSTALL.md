# FISHKAL — Installation Guide (cPanel)

This document is for the site administrator. Follow it step by step.

---

## What You Will Receive

A single ZIP file named `fishkal.zip` containing:

    fishkal/
    ├── index.html
    ├── deep-catch/
    ├── assets/
    ├── tools/
    ├── .htaccess
    ├── robots.txt
    ├── sitemap.xml
    └── README.md

---

## Requirements

- cPanel hosting with Apache
- PHP 7.4+ (only for SSL auto-config; not used by the site)
- SSL certificate (Let's Encrypt via AutoSSL is fine)
- ~20 MB of disk space

---

## Step 1 — Back Up

Before doing anything:

1. Log in to **cPanel**.
2. Open **File Manager**.
3. Navigate to `public_html`.
4. If a website already exists, right-click `public_html` → **Compress** →
   choose **Zip Archive** → download the resulting ZIP to your computer.

---

## Step 2 — Upload

1. In File Manager, go to `public_html`.
2. Click **Upload**.
3. Select `fishkal.zip`.
4. Wait for the upload to finish.
5. Close the upload window.
6. Back in File Manager, right-click `fishkal.zip` → **Extract**.
7. Confirm. The files will be extracted into `public_html/fishkal/`.
8. **Important:** move the contents of `fishkal/` up to `public_html/`.
   - Select all files inside `fishkal/`
   - Click **Move**
   - Set destination to `/public_html`
9. Delete the now-empty `fishkal/` folder.
10. Delete `fishkal.zip`.

Final structure inside `public_html`:

    public_html/
    ├── index.html
    ├── deep-catch/
    ├── assets/
    ├── tools/
    ├── .htaccess
    ├── robots.txt
    └── sitemap.xml

---

## Step 3 — Permissions

Correct permissions prevent 403 and 500 errors.

In File Manager, right-click each item and choose **Change Permissions**:

| Item                        | Permission |
|-----------------------------|-----------|
| `public_html`               | 755       |
| `public_html/*.html`        | 644       |
| `public_html/deep-catch`    | 755       |
| `public_html/deep-catch/*`  | 644       |
| `public_html/assets`        | 755       |
| `public_html/assets/css`    | 755       |
| `public_html/assets/js`     | 755       |
| `public_html/assets/img`    | 755       |
| `public_html/assets/data`   | 755       |
| `public_html/tools`         | 755       |
| `.htaccess`                 | 644       |

---

## Step 4 — SSL Certificate

1. In cPanel, open **SSL/TLS Status**.
2. Click **Run AutoSSL**.
3. Wait ~10 minutes.
4. Refresh the page. All domains should show a green lock.

After SSL is active, `.htaccess` will automatically redirect HTTP → HTTPS.

---

## Step 5 — Test

Open a browser and visit:

- `https://yourdomain.com/` — the landing page
- `https://yourdomain.com/deep-catch/` — the full experience

Check that:

- [ ] The landing page loads with the FISHKAL wordmark
- [ ] The "Enter the experience" button works
- [ ] The deep-catch page loads the coast photograph
- [ ] Scrolling descends the camera
- [ ] The hook drops and settles
- [ ] The strike button appears
- [ ] The result card appears after a catch or escape
- [ ] The language dropdown works
- [ ] The WhatsApp button opens WhatsApp

---

## Step 6 — Edit Contact Details

The client-editable file is:

    public_html/assets/js/config.js

Open it in cPanel → File Manager → **Edit**.

Change these lines:

```js
wa:    '971500000000',              // ← WhatsApp number
email: 'hello@fishkal.ae',          // ← Contact email
phone: '+971 50 000 0000',          // ← Display phone
launch:'2026-10-18T10:00:00+04:00', // ← Countdown target
```

Save. Refresh the site. Done.

No coding knowledge required.

---

## Step 7 — Add Google Analytics (Optional)

1. Create a GA4 property at analytics.google.com.
2. Copy the Measurement ID (G-XXXXXXXXXX).
3. Open `assets/js/config.js`.
4. Set:

```js
gaId: 'G-XXXXXXXXXX'
```

5. Save and refresh.

Events already tracked:

| Event       | When it fires                      |
|-------------|------------------------------------|
| start       | Visitor enters the experience      |
| first_cast  | Hook is cast for the first time    |
| strike      | Visitor taps at the strike moment  |
| catch       | Fish is landed                     |
| escape      | Fish escapes                       |
| share_click | Visitor shares the catch           |
| lang_change | Visitor changes language           |

---

## Step 8 — Change Default Language

In `assets/js/config.js`:

```js
defaultLang: 'en',   // 'en' | 'ar' | 'fr' | 'es' | 'tr'
```

The language switcher in the top corner stays available to visitors.

---

## Step 9 — Update the Site

To update:

1. Back up the current `public_html`.
2. Upload the new ZIP.
3. Extract over the existing files.
4. **Do not overwrite `assets/js/config.js`** — that is your configuration.

---

## Troubleshooting

### Blank page

- Open browser console (F12) → look for errors.
- Clear browser cache (Ctrl+Shift+R).
- Check that `assets/js/*.js` all loaded (Network tab).

### Images not loading

- Confirm `assets/img/hero.webp` exists.
- Check permissions are 644.
- Check the path in `config.js` is `/assets/img/hero.webp`.

### WhatsApp button not working

- `wa` number in `config.js` must be digits only.
- Do not include `+`, spaces or dashes.
- Example: `971500000000`, not `+971 50 000 0000`.

### 403 Forbidden

- Right-click `public_html` → Permissions → 755.
- Right-click all `.html` files → Permissions → 644.

### 500 Internal Server Error

- `.htaccess` may contain a directive your host does not allow.
- Rename `.htaccess` to `.htaccess.bak` and reload.
- If the site works, contact the host to enable `mod_rewrite` and `mod_headers`.

### Still not working

- cPanel → Errors → review recent log entries.
- Send the error text to the developer.

---

## Security Notes

- HTTPS is enforced automatically after AutoSSL.
- `assets/js` is disallowed in `robots.txt`.
- Directory listing is disabled in `.htaccess`.
- No server-side code, no database, no user input.

---

## Version

- Package: FISHKAL — Deep Catch
- Version: 1.0.0
- Build date: see CHANGELOG.md

---

## Support

For technical support, contact the developer with:

- The exact URL where the problem occurs
- The browser and version
- A screenshot of the browser console (F12 → Console tab)
