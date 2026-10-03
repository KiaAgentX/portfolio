"""i18n tests: fa/en parity, fallback rules, code-key coverage (stdlib only)."""
import json
import os
import re
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from front.i18n import available, t


class I18nTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(os.path.join(ROOT, "locales", "fa.json"), encoding="utf-8") as f:
            cls.fa = json.load(f)
        with open(os.path.join(ROOT, "locales", "en.json"), encoding="utf-8") as f:
            cls.en = json.load(f)

    def test_files_load(self):
        self.assertGreater(len(self.fa), 50)
        self.assertGreater(len(self.en), 50)

    def test_parity(self):
        """Every fa key exists in en and vice versa — no half-translated UI."""
        fa_only = set(self.fa) - set(self.en)
        en_only = set(self.en) - set(self.fa)
        self.assertEqual(fa_only, set(), f"missing in en: {sorted(fa_only)}")
        self.assertEqual(en_only, set(), f"missing in fa: {sorted(en_only)}")

    def test_missing_key_returns_key(self):
        self.assertEqual(t("definitely.missing.key", "en"), "definitely.missing.key")
        self.assertEqual(t("definitely.missing.key", "fa"), "definitely.missing.key")

    def test_format_kwargs(self):
        self.assertIn("5", t("id.reply", "en", uid=5))
        self.assertIn("5", t("id.reply", "fa", uid=5))

    def test_format_error_safe(self):
        """Wrong kwargs must never raise — raw template is returned."""
        self.assertIn("{uid}", t("id.reply", "fa", wrong=1))

    def test_available(self):
        langs = available()
        self.assertIn("fa", langs)
        self.assertIn("en", langs)

    def test_code_keys_covered(self):
        """Every literal t("...") in source must exist in BOTH locales."""
        pat = re.compile(r"""\bt\(\s*["']([^"'()]+)["']""")
        used: set[str] = set()
        for dp, _, fns in os.walk(ROOT):
            if "tests" in dp.split(os.sep):
                continue
            for fn in fns:
                if not fn.endswith(".py"):
                    continue
                with open(os.path.join(dp, fn), encoding="utf-8") as f:
                    used.update(pat.findall(f.read()))
        used = {k for k in used if "." in k}  # skip non-key literals
        missing_fa = {k for k in used if k not in self.fa}
        missing_en = {k for k in used if k not in self.en}
        self.assertEqual(missing_fa, set(), f"missing in fa.json: {sorted(missing_fa)}")
        self.assertEqual(missing_en, set(), f"missing in en.json: {sorted(missing_en)}")

    def test_no_key_kwarg_collision(self):
        """t(key, lang, **kw) — passing key= raises TypeError. Forbid it statically."""
        pat = re.compile(r"""\bt\([^)]*,\s*key\s*=""")
        hits = []
        for dp, _, fns in os.walk(ROOT):
            if "tests" in dp.split(os.sep):
                continue
            for fn in fns:
                if not fn.endswith(".py"):
                    continue
                with open(os.path.join(dp, fn), encoding="utf-8") as f:
                    if pat.search(f.read()):
                        hits.append(fn)
        self.assertEqual(hits, [])

    def test_dynamic_families_covered(self):
        """Dynamically built keys (f-strings) must also exist in both locales."""
        from data import store
        want = {"mode.voice", "mode.text"}
        want.update(f"menu.{k}" for k in
                    ("catalog", "quote", "support", "orders", "search", "image", "mode", "help"))
        want.update(f"settings.group.{g}" for g in store.GROUPS)
        want.update(f"settings.label.{k}" for k, _, _ in store.SETTING_DEFS)
        want.update(f"badge.{s}" for s in
                    ("pending", "approved", "rejected", "open", "waiting", "resolved"))
        want.update(f"sev.{s}" for s in ("urgent", "normal", "question"))
        want.update(f"approvals.{r}" for r in ("r0", "r1", "r2"))
        want.update({"lang.fa", "lang.en"})
        want.update(f"hokm.suit.{s}" for s in ("S", "H", "D", "C"))
        want.update(f"hokm.p.{p}" for p in ("you", "wolf", "mate", "fox"))
        want.update(f"hokm.say.ack_{p}" for p in ("wolf", "mate", "fox"))
        # notify keys are passed as plain strings (per-admin/per-user render)
        want.update({"catalog.notify", "quote.notify", "support.notify", "tickets.newmsg",
                     "web.notify.order", "web.notify.quote",
                     "web.notify.ticket", "web.notify.reply"})
        for key in sorted(want):
            self.assertIn(key, self.fa, f"missing in fa.json: {key}")
            self.assertIn(key, self.en, f"missing in en.json: {key}")


if __name__ == "__main__":
    unittest.main()
