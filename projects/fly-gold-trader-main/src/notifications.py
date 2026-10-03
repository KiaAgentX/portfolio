# -*- coding: utf-8 -*-
"""Optional outbound alerts - PRO edition.

Fire-and-forget notifications on OPEN / CLOSE / BLOCK events.
Supports a generic JSON webhook and/or Telegram. Disabled silently when
not configured. Rate-limited to avoid spam. Uses only the stdlib so the
installer stays light.
"""
import json
import threading
import time
import urllib.request

_MIN_INTERVAL = 2.0


class Notifier:
    def __init__(self, cfg):
        self.cfg = cfg
        self._last = 0.0
        self.sent = 0
        self.errors = 0

    @property
    def enabled(self):
        return bool(self.cfg.notify_url or (self.cfg.tg_token and self.cfg.tg_chat))

    def notify(self, event, text):
        if not self.enabled:
            return False
        now = time.time()
        if now - self._last < _MIN_INTERVAL:
            return False
        self._last = now
        payload = {"event": event, "text": text, "ts": now}

        def _send():
            try:
                if self.cfg.notify_url:
                    req = urllib.request.Request(
                        self.cfg.notify_url,
                        data=json.dumps(payload).encode(),
                        headers={"Content-Type": "application/json"})
                    urllib.request.urlopen(req, timeout=5)
                if self.cfg.tg_token and self.cfg.tg_chat:
                    url = f"https://api.telegram.org/bot{self.cfg.tg_token}/sendMessage"
                    body = json.dumps({"chat_id": self.cfg.tg_chat,
                                       "text": f"[FlyGold] {event}: {text}"}).encode()
                    urllib.request.urlopen(urllib.request.Request(
                        url, data=body,
                        headers={"Content-Type": "application/json"}), timeout=5)
                self.sent += 1
            except Exception:
                self.errors += 1

        threading.Thread(target=_send, daemon=True).start()
        return True

    def test(self):
        if not self.enabled:
            return {"ok": False, "error": "notifications not configured "
                                          "(set NOTIFY_URL or TELEGRAM_*)"}
        ok = self.notify("TEST", "Fly-Gold-Pro notifier self-test")
        return {"ok": ok, "sent_total": self.sent, "errors": self.errors}

    def stats(self):
        return {"enabled": self.enabled, "sent": self.sent,
                "errors": self.errors}
