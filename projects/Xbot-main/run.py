"""Unified launcher: Telegram bot + webapp in ONE process (Railway/VPS/local).

- Railway: PORT is injected → web binds it, bot polls in a background thread.
- No TELEGRAM_BOT_TOKEN → web-only mode (panels still fully usable).
- RUN_BOT=false → web-only · RUN_WEB=false → bot-only (same as python bot.py).
"""
from __future__ import annotations

import logging
import threading

from config import settings

log = logging.getLogger("launch")


def _run_web(port: int) -> None:
    import front.web as webmod

    try:
        webmod.main(port=port)
    except Exception:
        log.exception("Web crashed.")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    from data.store import init_db

    init_db()
    want_bot = settings.run_bot and bool(settings.telegram_token)
    want_web = settings.run_web
    if settings.run_bot and not settings.telegram_token:
        log.warning("TELEGRAM_BOT_TOKEN is missing → web-only mode.")
    if not want_bot and not want_web:
        raise SystemExit("Nothing to run: RUN_BOT and RUN_WEB are both false.")
    if want_bot and want_web:
        web_port = settings.port or 5000
        settings.port = 0  # web owns PORT; the bot's tiny health server stays off
        t = threading.Thread(target=_run_web, args=(web_port,), name="web", daemon=True)
        t.start()
        log.info("Web thread started on %d; starting bot in main thread", web_port)
        import bot as botmod

        botmod.main()
    elif want_web:
        import front.web as webmod

        webmod.main(port=settings.port or 5000)
    else:
        import bot as botmod

        botmod.main()


if __name__ == "__main__":
    main()
