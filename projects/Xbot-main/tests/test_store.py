"""data.store unit tests (stdlib only — no pip packages needed)."""
import os
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data import store


class StoreTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.db = os.path.join(self.tmp, "t.db")
        store.init_db(self.db)

    def test_settings_crud(self):
        self.assertEqual(store.get_setting("chat_model", "dflt", self.db), "dflt")
        store.set_setting("chat_model", "gpt-x", self.db)
        self.assertEqual(store.get_setting("chat_model", "dflt", self.db), "gpt-x")
        store.set_setting("chat_model", "gpt-y", self.db)
        self.assertEqual(store.all_settings(self.db)["chat_model"], "gpt-y")
        store.del_setting("chat_model", self.db)
        self.assertEqual(store.get_setting("chat_model", "dflt", self.db), "dflt")

    def test_setting_defs_sane(self):
        self.assertGreaterEqual(len(store.SETTING_DEFS), 10)
        keys = [k for k, _, _ in store.SETTING_DEFS]
        self.assertEqual(len(keys), len(set(keys)))
        from front.i18n import t
        for k, group, kind in store.SETTING_DEFS:
            self.assertIn(group, store.GROUPS)
            self.assertIn(kind, ("text", "area"))
            self.assertNotEqual(t(f"settings.label.{k}", "fa"), f"settings.label.{k}")
            self.assertNotEqual(t(f"settings.label.{k}", "en"), f"settings.label.{k}")
        for g in store.GROUPS:
            self.assertNotEqual(t(f"settings.group.{g}", "fa"), f"settings.group.{g}")

    def test_user_lang_default(self):
        u = store.user_get(777, "Sam", path=self.db)
        self.assertEqual(u["lang"], "fa")
        self.assertEqual(store.user_lang(777, self.db), "fa")
        self.assertEqual(store.user_lang(999999, self.db), "fa")  # unknown → fa

    def test_set_lang(self):
        store.user_get(778, path=self.db)
        self.assertEqual(store.set_lang(778, "en", self.db), "en")
        self.assertEqual(store.user_lang(778, self.db), "en")
        self.assertEqual(store.set_lang(778, "xx", self.db), "fa")  # invalid → fa

    def test_lang_migration(self):
        legacy = os.path.join(self.tmp, "legacy.db")
        con = sqlite3.connect(legacy)
        con.execute("CREATE TABLE users (user_id INTEGER PRIMARY KEY, mode TEXT DEFAULT 'text',"
                    " model TEXT DEFAULT '', name TEXT DEFAULT '')")
        con.execute("INSERT INTO users (user_id, name) VALUES (5, 'Old')")
        con.commit()
        con.close()
        store.init_db(legacy)  # must add the lang column, keep the row
        cols = [r[1] for r in sqlite3.connect(legacy).execute("PRAGMA table_info(users)")]
        self.assertIn("lang", cols)
        self.assertEqual(store.user_lang(5, legacy), "fa")
        self.assertEqual(store.user_name(5, legacy), "Old")

    def test_user_name_no_create(self):
        self.assertEqual(store.user_name(424242, self.db), "")
        self.assertFalse(store.user_exists(424242, self.db))

    def test_catalog_seed_fallback(self):
        cat = store.get_catalog(self.db, seed="catalog.json")
        self.assertIn("services", cat)

    def test_catalog_override(self):
        custom = {
            "currency": {"fa": "تومان", "en": "USD"},
            "services": [
                {"code": "X1", "icon": "🧪",
                 "fa": {"name": "تست", "desc": "d"},
                 "en": {"name": "Test", "desc": "d"},
                 "price": 100}
            ],
        }
        store.save_catalog(custom, self.db)
        cat = store.get_catalog(self.db)
        self.assertEqual(len(cat["services"]), 1)
        self.assertEqual(store.svc_by_code(cat, "X1")["icon"], "🧪")

    def test_orders(self):
        store.create_order("ORD-0001", 111, "order", "SVC1", 2, "web", self.db)
        o = store.get_order("ORD-0001", self.db)
        self.assertEqual(o["qty"], 2)
        self.assertEqual(o["status"], "pending")
        store.set_order("ORD-0001", "approved", "", self.db)
        self.assertEqual(store.get_order("ORD-0001", self.db)["status"], "approved")
        self.assertEqual(store.list_orders("pending", path=self.db), [])
        self.assertEqual(len(store.user_orders(111, path=self.db)), 1)

    def test_tickets(self):
        store.create_ticket("TKT-0001", 222, "urgent", "help!", self.db)
        t = store.get_ticket("TKT-0001", self.db)
        self.assertEqual(t["sev"], "urgent")
        self.assertEqual(t["status"], "open")
        store.add_msg("TKT-0001", 1, "on it", self.db)
        th = store.thread("TKT-0001", self.db)
        self.assertEqual(len(th), 2)
        self.assertEqual(th[1]["from_mgr"], 1)
        store.set_ticket("TKT-0001", "resolved", self.db)
        self.assertEqual(store.list_tickets(path=self.db), [])
        self.assertEqual(len(store.user_tickets(222, path=self.db)), 1)

    def test_refs_unique(self):
        import random
        import re
        random.seed(42)  # deterministic — no flaky collisions
        refs = [store.new_ref("ORD") for _ in range(200)]
        self.assertTrue(all(re.fullmatch(r"ORD-[0-9A-F]{4}", r) for r in refs))
        self.assertEqual(len(set(refs)), 200)

    def test_stats(self):
        s = store.stats(self.db)
        self.assertEqual(s["pending"], 0)
        store.create_order("ORD-1", 1, "order", "SVC1", 1, "", self.db)
        self.assertEqual(store.stats(self.db)["pending"], 1)


if __name__ == "__main__":
    unittest.main()
