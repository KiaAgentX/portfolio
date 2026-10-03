# TELEGRAM LIVE-TEST CHECKLIST (Stage 12)

Everything code-side is ready. Executing this checklist requires exactly one secret:
`TELEGRAM_BOT_TOKEN` (from @BotFather). Put it in `.env` as `TELEGRAM_BOT_TOKEN=…`
and restart `apps/api` + `apps/bot`.

## Pre-flight (code already done ✅)

- [x] `verifyInitData` HMAC validation against bot token (`apps/api/src/telegram.ts`)
- [x] `/auth/telegram` endpoint exchanges initData → session token
- [x] Mini-app reads real `Telegram.WebApp.initData`, guest fallback outside Telegram
- [x] `Referral` table + deep-link parser (`ref_<code>`)
- [x] Mini-app game + leaderboard routes

## With token (execute in order)

1. **Bot starts**: `pnpm dev:bot` — expect "bot listening" in logs
2. **Set menu**: in Telegram, open the bot → /start → expect welcome message
3. **Menu button** → point it at the mini-app URL (BotFather → Menu Button → `https://<mini-app-host>`)
4. **Auth E2E**: open mini-app inside Telegram → API log shows `/auth/telegram` (not `/auth/guest`)
5. **Play a run** inside the mini-app → run recorded under your Telegram identity
6. **Leaderboard** inside mini-app shows that run
7. **Referral**: second account opens `https://t.me/<bot>?start=ref_<playerId>` → `Referral` row created, `rewarded=false` until reward config (§46)
8. **Negative tests**: replayed initData (old `auth_date`) rejected; tampered hash rejected

## HTTPS note

Telegram requires HTTPS for mini-apps. Local dev: `ngrok http 3001` (or any tunnel)
and set the tunnel URL in BotFather. Ports on this machine: mini-app dev runs on
3001 by default (`pnpm dev:mini-app`), API on `API_PORT` (4100 locally — 4000 is
occupied by another checkout on this machine).
