"""Hokm view/flow tests (no telegram needed): rendering, drain, banter,
sessions, plus a full scripted user session mirroring the glue path."""
import unittest

from back.games import hokm as engine
from back.games import hokm_view as view
from back.games.hokm_ai import choose_trump


def fresh(first_hakem=0, seed=21, trump="H"):
    st = engine.new_match(first_hakem=first_hakem, seed=seed)
    assert engine.declare_trump(st, first_hakem, trump)["ok"]
    return st


def rigged_kot(hakem=1, score=None):
    st = engine.new_match(first_hakem=hakem, seed=7)
    engine.declare_trump(st, hakem, "H")
    st["tricks_won"] = [6, 0]
    st["hands"] = [["2C"], ["3C"], ["AC"], ["4C"]]
    st["current"] = []
    st["leader"] = 0
    st["turn"] = 0
    if score:
        st["score"] = list(score)
    return st


class ViewRenderTest(unittest.TestCase):
    def assertLeakFree(self, text):
        self.assertNotIn("hokm.", text)  # missing keys render as the key itself

    def renders(self, st):
        fa = view.render_table(st, "fa")
        en = view.render_table(st, "en")
        self.assertLeakFree(fa)
        self.assertLeakFree(en)
        return fa, en

    def test_declare_user(self):
        st = engine.new_match(first_hakem=0, seed=1)
        fa, en = self.renders(st)
        self.assertIn("👑", fa)
        self.assertIn("(5)", fa)  # 5-card hand shown

    def test_declare_agent(self):
        st = engine.new_match(first_hakem=1, seed=1)
        fa, en = self.renders(st)
        self.assertIn("🐺", fa)  # wolf declares

    def test_play_user_turn(self):
        st = fresh(first_hakem=0, seed=2)
        fa, en = self.renders(st)
        self.assertIn("🎯", fa)
        self.assertIn("♥️", fa)  # trump symbol visible
        self.assertIn("(13)", fa)

    def test_play_wait_and_last_trick(self):
        st = fresh(first_hakem=0, seed=3)
        engine.play_card(st, 0, engine.legal_plays(st, 0)[0])
        fa, en = self.renders(st)
        self.assertIn("⏳", fa)
        # complete the trick -> last-trick line appears on empty table
        for _ in range(3):
            engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
        fa, _ = self.renders(st)
        self.assertIn("🏆", fa)

    def test_round_over(self):
        st = rigged_kot()
        for _ in range(4):
            engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
        self.assertEqual(st["phase"], "round_over")
        fa, en = self.renders(st)
        self.assertIn("🔥", fa)  # kot line

    def test_match_over(self):
        st = rigged_kot(hakem=1, score=[5, 0])  # kot +3 -> 8, match ends
        for _ in range(4):
            engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
        self.assertEqual(st["phase"], "match_over")
        fa, en = self.renders(st)
        self.assertIn("🏆🏆🏆", fa)

    def test_board_actions(self):
        d_user = engine.new_match(first_hakem=0, seed=1)
        a = view.board_actions(d_user)
        self.assertEqual(a["suits"], ["S", "H", "D", "C"])
        self.assertEqual(a["cards"], [])
        p = fresh(first_hakem=0, seed=1)
        a = view.board_actions(p)
        self.assertEqual(a["cards"], engine.legal_plays(p, 0))
        self.assertFalse(a["next"])
        r = rigged_kot()
        for _ in range(4):
            engine.play_card(r, r["turn"], engine.legal_plays(r, r["turn"])[0])
        a = view.board_actions(r)
        self.assertTrue(a["next"] and a["new"])

    def test_cb_format(self):
        self.assertEqual(view.cb(5, "play", "10H"), "hokm:5:play:10H")
        self.assertEqual(view.cb(5, "next"), "hokm:5:next")

    def test_names_and_cards(self):
        self.assertEqual(view.card_text("10H"), "10♥️")
        self.assertIn("یار", view.seat_name(2, "fa"))
        self.assertIn("Mate", view.seat_name(2, "en"))
        self.assertEqual(view.suit_name("D", "fa"), "خشت")
        self.assertEqual(view.suit_name("D", "en"), "Diamonds")


class ViewFlowTest(unittest.TestCase):
    def test_drain_to_user(self):
        st = engine.new_match(first_hakem=1, seed=4)
        evs = view.drain_agents(st)
        self.assertTrue(evs)  # agent declared at least
        kinds = {e["e"] for e in evs}
        self.assertTrue(kinds <= {"declare", "trick", "round", "match"})
        if st["phase"] in ("declare", "play"):
            self.assertEqual(st["turn"], 0)
        else:
            self.assertIn(st["phase"], ("round_over", "match_over"))

    def test_drain_user_hakem_noop(self):
        st = engine.new_match(first_hakem=0, seed=5)
        self.assertEqual(view.drain_agents(st), [])

    def test_result_events_and_banter(self):
        st = rigged_kot()
        evs = []
        for _ in range(4):
            r = engine.play_card(st, st["turn"], engine.legal_plays(st, st["turn"])[0])
            evs += view.result_events(r, st)
        self.assertTrue(any(e["e"] == "trick" for e in evs))
        self.assertTrue(any(e["e"] == "round" and e["kot"] for e in evs))
        for lang in ("fa", "en"):
            picks = view.pick_banter(evs, lang)
            self.assertLessEqual(len(picks), 2)
            for seat, text, ev in picks:
                self.assertIn(seat, (1, 2, 3))
                self.assertTrue(text)
                self.assertNotIn("hokm.", text)
                ctx = view.event_context(ev, st, lang)
                self.assertTrue(ctx)
                self.assertNotIn("hokm.", ctx)

    def test_full_user_session_sim(self):
        """Scripted human (declare longest suit, play first legal) to match end,
        rendering every step in both languages — the exact glue path."""
        st = engine.new_match(seed=99)
        steps = 0
        while st["phase"] != "match_over" and steps < 2000:
            for lang in ("fa", "en"):
                text = view.render_table(st, lang)
                self.assertNotIn("hokm.", text)
            if st["phase"] == "declare" and st["turn"] == 0:
                r = engine.declare_trump(st, 0, choose_trump(st["hands"][0]))
                self.assertTrue(r["ok"])
                view.drain_agents(st)
            elif st["phase"] == "play" and st["turn"] == 0:
                r = engine.play_card(st, 0, engine.legal_plays(st, 0)[0])
                self.assertTrue(r["ok"])
                view.drain_agents(st)
            elif st["phase"] == "round_over":
                engine.next_round(st)
                view.drain_agents(st)
            else:
                view.drain_agents(st)
            steps += 1
        self.assertEqual(st["phase"], "match_over")
        for lang in ("fa", "en"):
            self.assertNotIn("hokm.", view.render_table(st, lang))

    def test_session_isolation(self):
        from data import store
        import tempfile
        db = tempfile.mktemp(suffix=".db")
        try:
            store.init_db(db)
            a = engine.new_match(first_hakem=0, seed=1)
            b = engine.new_match(first_hakem=2, seed=2)
            store.save_game(view.session_key("tg", 1), "hokm", a, db)
            store.save_game(view.session_key("tg", 2), "hokm", b, db)
            self.assertEqual(store.load_game(view.session_key("tg", 1), db)["state"], a)
            self.assertEqual(store.load_game(view.session_key("tg", 2), db)["state"], b)
            store.delete_game(view.session_key("tg", 1), db)
            self.assertIsNone(store.load_game(view.session_key("tg", 1), db))
            self.assertIsNotNone(store.load_game(view.session_key("tg", 2), db))
        finally:
            import os
            try:
                os.remove(db)
            except OSError:
                pass


if __name__ == "__main__":
    unittest.main()
