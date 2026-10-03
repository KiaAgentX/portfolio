"""
SenPai Neural OS — Telegram Bot + Mini Web App
aiogram v3 + aiohttp, ready for Railway deployment.

Environment variables:
    BOT_TOKEN   (required) Bot token from @BotFather
    WEBAPP_URL  (optional) Public URL of the deployed app, e.g.
                https://<service>.up.railway.app
                Required for the webhook and the WebApp menu button.
    USE_POLLING (optional) Set to "1" for local development (no HTTPS).
"""

import logging
import os
from pathlib import Path

from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web

BOT_TOKEN = os.environ["BOT_TOKEN"]
WEBAPP_URL = os.environ.get("WEBAPP_URL", "").rstrip("/")
BASE_PATH = "/senpai"  # must match absolute refs (/senpai/app.css ...) in app.html
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "senpai-secret")

STATIC_DIR = Path(__file__).parent / "static"

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("senpai-bot")

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

open_app_kb = (
    types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(
            text="🚀 Open SenPai Neural OS",
            web_app=types.WebAppInfo(url=WEBAPP_URL + BASE_PATH),
        )
    ]])
    if WEBAPP_URL else None
)


@dp.message(CommandStart())
async def cmd_start(message: types.Message) -> None:
    text = (
        "👋 Welcome to <b>SenPai · Neural OS</b> — Elon Musk Edition\n\n"
        "Tap the button below to launch the Web App inside Telegram."
        if open_app_kb else
        "👋 Welcome to <b>SenPai · Neural OS</b>!\n\n"
        "⚠️ WEBAPP_URL is not configured — Web App button disabled."
    )
    await message.answer(text, reply_markup=open_app_kb)


@dp.message()
async def any_message(message: types.Message) -> None:
    await message.answer(
        "Commands:\n/start — open the SenPai Web App\n/help — this message",
        reply_markup=open_app_kb,
    )


# ─── Web server: serves the static Mini App under /senpai ──────────────────

async def health(_request: web.Request) -> web.Response:
    return web.json_response({"status": "ok"})


async def index(_request: web.Request) -> web.FileResponse:
    return web.FileResponse(STATIC_DIR / "app.html")


def build_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/healthz", health)
    # NOTE: exact routes must precede add_static — the static resource matches
    # the bare prefix too (directory without index) and would 403 these URLs.
    app.router.add_get(BASE_PATH, index)
    app.router.add_get(f"{BASE_PATH}/", index)
    app.router.add_static(f"{BASE_PATH}/", path=str(STATIC_DIR))

    if WEBAPP_URL:
        webhook_path = f"/webhook/{WEBHOOK_SECRET}"
        SimpleRequestHandler(dispatcher=dp, bot=bot,
                             secret_token=WEBHOOK_SECRET).register(app, path=webhook_path)
        setup_application(app, dp, bot=bot)

    async def on_startup(_a: web.Application) -> None:
        if not WEBAPP_URL:
            logger.warning("WEBAPP_URL not set — webhook registration skipped")
            return
        await bot.set_webhook(
            f"{WEBAPP_URL}/webhook/{WEBHOOK_SECRET}",
            secret_token=WEBHOOK_SECRET,
            drop_pending_updates=True,
        )
        await bot.set_chat_menu_button(
            menu_button=types.MenuButtonWebApp(
                text="Open SenPai",
                web_app=types.WebAppInfo(url=WEBAPP_URL + BASE_PATH),
            )
        )
        logger.info("Webhook set to %s/webhook/***", WEBAPP_URL)

    app.on_startup.append(on_startup)
    return app


if __name__ == "__main__":
    if os.environ.get("USE_POLLING") == "1":
        import asyncio
        logger.info("Starting in POLLING mode")
        asyncio.run(dp.start_polling(bot))
    else:
        port = int(os.environ.get("PORT", 8000))
        logger.info("Starting server on 0.0.0.0:%s", port)
        web.run_app(build_app(), host="0.0.0.0", port=port)

