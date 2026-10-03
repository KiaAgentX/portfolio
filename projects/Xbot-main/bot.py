"""LaunchBot v3 — thin Telegram entrypoint.

All handlers live in front.bot_handlers (front layer); business rules in
back.services; persistence in data.store; models in llm.client.
This module only does env checks, warmup and polling.

Run standalone:  python bot.py     (bot only + tiny health server)
Run full stack:  python run.py     (bot + webapp — Railway uses this)
"""
from __future__ import annotations

import logging
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from telegram import Update

from config import settings
from data import store
from front import bot_handlers

log = logging.getLogger("launch-bot")


def _start_health_server(port: int) -> None:
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"OK")

        def log_message(self, *args):
            pass

    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    if not settings.telegram_token:
        print("ERROR: TELEGRAM_BOT_TOKEN is not set.", file=sys.stderr)
        sys.exit(1)
    if not settings.openai_api_key:
        print("ERROR: OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)
    store.init_db()
    bot_handlers.load_catalog()
    bot_handlers.refresh_settings()
    if settings.port:
        threading.Thread(target=_start_health_server, args=(settings.port,), daemon=True).start()
        log.info("Health on %d", settings.port)

    app = bot_handlers.build_app()
    log.info("Launch bot starting (model=%s, base=%s, admins=%s, default_lang=%s)",
             settings.chat_model, settings.openai_base_url,
             sorted(settings.admin_ids) or "none", settings.default_lang)
    app.run_polling(drop_pending_updates=True, allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
