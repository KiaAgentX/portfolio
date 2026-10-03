"""Hokm web-API view tests (no flask needed): web_state snapshot,
chat helpers, persona picking. Route tests live in test_web.py (CI)."""
import unittest

from back.games import hokm as engine
from back.games import hokm_view as view


def fresh(first_hakem=0, seed=31, trump="D"):
    st = engine.new_match(first_hakem=first_hakem, seed=seed)
    assert engine.declare_trump(st, first_hakem, trump)["ok"]
    return st


def rigged(score=None):
    st = engine.new_match(first_hakem=1, seed=7)
    engine.declare_trump(st, 1, "H")
    st["tricks_won"] = [6, 0]
    st["hands"] = [["2C"], ["3C"], ["AC"], ["4C"]]
    st["current"] = []
    st["leader"] = 0
    st["turn"] = 0
    if score:
        st["score"] = list(score)
    return st


def strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings(v)


class WebStateTest(unittest.TestCase):
    def assertLeakFreeState(self, st):
        for lang in ("fa", "en"):
            for s in strings(view.web_state(st, lang)):
                self.assertNotIn("hokm.", s)
                self.assertNotIn("web.", s)

    def test_declare_snapshot(self):
        st = engine.new_match(first_hakem=0, seed=1)
        ws = view.web_state(st, "fa")
        self.assertEqual(ws["phase"], "declare")
        self.assertEqual(len(ws["suits"]), 4)
        self.assertEqual(len(ws["hand"]), 5)
        self.assertTrue(all(not c["playable"] for c in ws["hand"]))
        self.assertIsNone(ws["trump"])
        self.assertLeakFreeState(st)

    def test_play_snapshot_playable_matches_legal(self):
        st = fresh(seed=2)
        ws = view.web_state(st, "en")
        legal = set(engine.legal_plays(st, 0))
        got = {c["card"] for c in ws["hand"] if c["playable"]}
        self.assertEqual(got, legal)
        self.assertEqual(ws["trump"]["suit"], "D")
        self.assertTrue(ws["prompt"])
        # after user plays, snapshot shows waiting prompt
        engine.play_card(st, 0, engine.legal_plays(st, 0)[0])
        ws = view.web_state(st, "fa")
        self.assertIn("⏳", ws["prompt"])
        self.assertLeakFreeState(st)

    def test_round_over_snapshot(self):
        st = rigged()
        for _ in range(4):
            engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
        ws = view.web_state(st, "fa")
        self.assertEqual(ws["phase"], "round_over")
        self.assertIn("🔥", ws["result"])
        self.assertTrue(ws["next"] and ws["new"])
        self.assertLeakFreeState(st)

    def test_match_over_snapshot(self):
        st = rigged(score=[5, 0])
        for _ in range(4):
            engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
        ws = view.web_state(st, "fa")
        self.assertEqual(ws["phase"], "match_over")
        self.assertIn("🏆🏆🏆", ws["result"])
        self.assertTrue(ws["new"])
        self.assertFalse(ws["next"])
        self.assertLeakFreeState(st)

    def test_chat_roundtrip_and_cap(self):
        st = fresh()
        view.chat_append(st, "you", "سلام میز")
        view.chat_append(st, "wolf", "هوهو")
        view.chat_append(st, "sys", "رویداد")
        for i in range(60):
            view.chat_append(st, "sys", f"n{i}")
        self.assertEqual(len(st["webchat"]), 50)
        ws = view.web_state(st, "fa")
        bys = [m["by"] for m in ws["chat"]]
        self.assertIn("sys", bys)
        names = {m["by"]: m["name"] for m in ws["chat"]}
        self.assertEqual(names.get("sys"), "")
        # fresh names check on uncapped log
        st2 = fresh()
        view.chat_append(st2, "you", "x")
        view.chat_append(st2, "fox", "y")
        ws2 = view.web_state(st2, "fa")
        got = {m["by"]: m["name"] for m in ws2["chat"]}
        self.assertIn("تو", got["you"])
        self.assertIn("روباه", got["fox"])

    def test_chat_persona_mention(self):
        st = fresh()
        self.assertEqual(view.chat_persona("گرگ بباز!", st), "wolf")
        self.assertEqual(view.chat_persona("hey fox, nice", st), "fox")
        self.assertEqual(view.chat_persona("mate, help!", st), "mate")
        self.assertEqual(view.chat_persona("یار دمت گرم", st), "mate")

    def test_chat_persona_rotation(self):
        st = fresh()
        self.assertEqual([view.chat_persona("hi", st) for _ in range(4)],
                         ["mate", "wolf", "fox", "mate"])

    def test_ack_and_status(self):
        for pid in ("wolf", "mate", "fox", "bogus"):
            for lang in ("fa", "en"):
                self.assertNotIn("hokm.", view.ack_line(pid, lang))
        st = fresh()
        for lang in ("fa", "en"):
            self.assertNotIn("hokm.", view.table_status(st, lang))


if __name__ == "__main__":
    unittest.main()
