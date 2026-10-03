"""back.services tests (stdlib only — no pip packages needed)."""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back import services
from data import store


class ServicesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.db = os.path.join(self.tmp, "s.db")
        store.init_db(self.db)
        # services use the env-configured DB → point it at the temp file
        self._old = os.environ.get("DB_PATH")
        os.environ["DB_PATH"] = self.db

    def tearDown(self):
        if self._old is None:
            os.environ.pop("DB_PATH", None)
        else:
            os.environ["DB_PATH"] = self._old

    def test_approve_reject(self):
        store.create_order("ORD-A", 1, "order", "SVC1", 1, "")
        o = services.approve_order("ORD-A")
        self.assertIsNotNone(o)
        self.assertEqual(o["status"], "approved")
        self.assertIsNone(services.approve_order("ORD-A"))  # already handled
        self.assertIsNone(services.approve_order("ORD-NOPE"))
        store.create_order("QOT-R", 2, "quote", "SVC2", 1, "d")
        o = services.reject_order("QOT-R", "why-x")
        self.assertEqual((o["status"], o["why"]), ("rejected", "why-x"))
        self.assertIsNone(services.reject_order("QOT-R", "again"))

    def test_reply_ticket_transitions(self):
        store.create_ticket("TKT-T", 3, "normal", "hi")
        x = services.reply_ticket("TKT-T", True, "mgr says hi")
        self.assertEqual(x["status"], "waiting")  # open → waiting
        x = services.reply_ticket("TKT-T", False, "customer says hi")
        self.assertEqual(x["status"], "waiting")  # unchanged
        store.set_ticket("TKT-T", "resolved")
        x = services.reply_ticket("TKT-T", False, "still broken")
        self.assertEqual(x["status"], "open")  # resolved → reopened
        self.assertEqual(len(store.thread("TKT-T")), 4)
        self.assertIsNone(services.reply_ticket("TKT-NOPE", True, "x"))

    def test_validate_setting(self):
        self.assertEqual(services.validate_setting("chat_model", "gpt-x"), "")
        self.assertEqual(services.validate_setting("temperature", "0.9"), "")
        self.assertNotEqual(services.validate_setting("tts_provider", "xx"), "")
        self.assertNotEqual(services.validate_setting("tts_gender", "xx"), "")
        self.assertNotEqual(services.validate_setting("default_mode", "xx"), "")
        self.assertNotEqual(services.validate_setting("max_tokens", "abc"), "")
        self.assertNotEqual(services.validate_setting("max_tokens", "0"), "")
        self.assertNotEqual(services.validate_setting("temperature", "abc"), "")
        self.assertNotEqual(services.validate_setting("temperature", "9"), "")
        # localized errors
        self.assertNotEqual(
            services.validate_setting("tts_provider", "xx", "en"), "")

    def test_texts_for_admins(self):
        store.user_get(111, "Ali")
        store.set_lang(111, "en")
        out = dict(services.texts_for_admins([111, 222], "tickets.none"))
        self.assertIn("🎉", out[111])  # en version
        self.assertIn("🎉", out[222])  # unknown admin → fa default
        self.assertNotEqual(out[111], out[222])
        # callable kwarg resolved per language
        out = dict(services.texts_for_admins(
            [111, 222], "id.reply", uid=lambda L: f"id-{L}"))
        self.assertIn("id-en", out[111])
        self.assertIn("id-fa", out[222])

    def test_badge_sev(self):
        for st in ("pending", "approved", "rejected", "open", "waiting", "resolved"):
            self.assertNotEqual(services.badge(st, "fa"), f"badge.{st}")
            self.assertNotEqual(services.badge(st, "en"), f"badge.{st}")
        for sev in ("urgent", "normal", "question"):
            self.assertNotEqual(services.sev_label(sev, "fa"), f"sev.{sev}")

    def test_svc_display_missing(self):
        self.assertEqual(services.svc_display({}, "NOPE", "fa"), ("NOPE", ""))
        self.assertIn("💬", services.price_display({"services": []}, None, "fa"))


if __name__ == "__main__":
    unittest.main()
