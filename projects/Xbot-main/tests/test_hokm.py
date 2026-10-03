"""Hokm engine + agent tests. Logic is stdlib-only; the session test uses
data.store like the rest of the suite (needs dotenv, same as test_store)."""
import json
import os
import random
import tempfile
import unittest

from back.games import hokm
from back.games.hokm_ai import agent_act, choose_card, choose_trump


def fresh(first_hakem=0, seed=11, trump="H"):
    st = hokm.new_match(first_hakem=first_hakem, seed=seed)
    r = hokm.declare_trump(st, first_hakem, trump)
    assert r["ok"]
    return st


def rigged_kot(hakem):
    """Team 0 at 6 tricks; one more trick wins the round 7-0."""
    st = hokm.new_match(first_hakem=hakem, seed=7)
    hokm.declare_trump(st, hakem, "H")
    st["tricks_won"] = [6, 0]
    st["hands"] = [["2C"], ["3C"], ["AC"], ["4C"]]
    st["current"] = []
    st["leader"] = 0
    st["turn"] = 0
    return st


def play_full_round(st):
    steps = 0
    while st["phase"] == "play" and steps < 60:
        r = agent_act(st, st["turn"])
        assert r["ok"], r
        steps += 1
    return st


class HokmEngineTest(unittest.TestCase):
    def test_deck_unique_52(self):
        d = hokm.new_deck(seed=1)
        self.assertEqual(len(d), 52)
        self.assertEqual(len(set(d)), 52)

    def test_deal_and_declare_flow(self):
        st = hokm.new_match(first_hakem=0, seed=1)
        self.assertEqual(st["phase"], "declare")
        self.assertTrue(all(len(h) == 5 for h in st["hands"]))
        self.assertEqual(len(st["deck_rest"]), 32)
        r = hokm.declare_trump(st, 0, "H")
        self.assertTrue(r["ok"])
        self.assertEqual(st["trump"], "H")
        self.assertTrue(all(len(h) == 13 for h in st["hands"]))
        self.assertEqual(st["phase"], "play")
        self.assertEqual(st["turn"], 0)  # hakem leads
        self.assertNotIn("deck_rest", st)

    def test_declare_validation(self):
        st = hokm.new_match(first_hakem=0, seed=2)
        self.assertEqual(hokm.declare_trump(st, 1, "H")["err"], "not_turn")
        self.assertEqual(hokm.declare_trump(st, 0, "X")["err"], "bad_suit")
        self.assertTrue(hokm.declare_trump(st, 0, "H")["ok"])
        self.assertEqual(hokm.declare_trump(st, 0, "S")["err"], "not_declare")

    def test_must_follow_suit(self):
        st = fresh()
        st["current"] = [[0, "AH"]]
        st["hands"][1] = ["KH", "2C"]
        self.assertEqual(hokm.legal_plays(st, 1), ["KH"])
        st["hands"][1] = ["2C", "3D"]  # void in hearts: anything goes
        self.assertEqual(sorted(hokm.legal_plays(st, 1)), ["2C", "3D"])
        st["hands"][1] = ["KH", "2C"]
        st["turn"] = 1
        r = hokm.play_card(st, 1, "2C")
        self.assertFalse(r["ok"])
        self.assertEqual(r["err"], "must_follow")
        self.assertEqual(r["suit"], "H")

    def test_trick_winner_cases(self):
        led = [[0, "KH"], [1, "AH"], [2, "QH"], [3, "JH"]]
        self.assertEqual(hokm.trick_winner(led, "S"), 1)  # highest led, no trump
        trumped = [[0, "KS"], [1, "2H"], [2, "AS"], [3, "5S"]]
        self.assertEqual(hokm.trick_winner(trumped, "H"), 1)  # only trump wins
        duel = [[0, "AS"], [1, "KH"], [2, "QS"], [3, "AH"]]
        self.assertEqual(hokm.trick_winner(duel, "H"), 3)  # higher trump wins

    def test_trick_flow_and_leader(self):
        st = fresh(first_hakem=1, seed=5, trump="S")
        self.assertEqual(st["turn"], 1)
        for _ in range(3):
            r = agent_act(st, st["turn"])
            self.assertTrue(r["ok"])
            self.assertFalse(r["trick_done"])
        r = agent_act(st, st["turn"])
        self.assertTrue(r["trick_done"])
        self.assertEqual(sum(st["tricks_won"]), 1)
        self.assertEqual(st["leader"], r["trick_winner"])
        self.assertEqual(st["turn"], r["trick_winner"])

    def test_early_stop_at_7(self):
        st = fresh(seed=9)
        play_full_round(st)
        self.assertIn(st["phase"], ("round_over", "match_over"))
        self.assertEqual(max(st["tricks_won"]), 7)  # winner stopped at exactly 7

    def test_kot_vs_hakem_scores_3(self):
        st = rigged_kot(hakem=1)  # hakem (team 1) gets kotted by team 0
        for s in range(4):
            r = agent_act(st, st["turn"])
        self.assertTrue(r["round_over"])
        self.assertTrue(r["kot"])
        self.assertEqual(r["points"], 3)
        self.assertEqual(st["score"], [3, 0])

    def test_plain_kot_scores_2(self):
        st = rigged_kot(hakem=0)  # hakem's own team deals the kot
        for s in range(4):
            r = agent_act(st, st["turn"])
        self.assertTrue(r["kot"])
        self.assertEqual(r["points"], 2)

    def test_next_round_rotates_hakem(self):
        st = fresh(seed=4)
        play_full_round(st)
        if st["phase"] == "match_over":
            self.skipTest("match ended in round 1 (kot)")
        h, n = st["hakem"], st["round_no"]
        self.assertTrue(hokm.next_round(st)["ok"])
        self.assertEqual(st["hakem"], (h + 1) % 4)
        self.assertEqual(st["round_no"], n + 1)
        self.assertEqual(st["phase"], "declare")

    def test_full_match_ai_completes(self):
        for seed in (1, 2, 3):
            st = hokm.new_match(seed=seed)
            steps = 0
            while st["phase"] != "match_over" and steps < 2000:
                if st["phase"] in ("declare", "play"):
                    r = agent_act(st, st["turn"])
                    self.assertTrue(r["ok"], (seed, r))
                elif st["phase"] == "round_over":
                    hokm.next_round(st)
                steps += 1
            self.assertEqual(st["phase"], "match_over")
            self.assertGreaterEqual(st["score"][st["winner"]], st["target"])

    def test_serialize_roundtrip_continues(self):
        st = fresh(seed=6)
        agent_act(st, st["turn"])
        agent_act(st, st["turn"])
        st2 = json.loads(json.dumps(st))  # save + load
        self.assertEqual(st2, st)
        r = agent_act(st2, st2["turn"])
        self.assertTrue(r["ok"])


class HokmAiTest(unittest.TestCase):
    def test_trump_picks_longest_suit(self):
        self.assertEqual(choose_trump(["AS", "KS", "2S", "3H", "4D"]), "S")
        self.assertEqual(choose_trump(["AH", "KH", "2D", "3C", "4S"]), "H")

    def test_trump_tiebreak_deterministic(self):
        hand = ["AH", "2H", "AS", "2S", "3D"]
        a = choose_trump(hand, random.Random(0))
        b = choose_trump(hand, random.Random(0))
        self.assertEqual(a, b)
        self.assertIn(a, ("H", "S"))

    def test_ai_beats_opponent_cheap(self):
        st = fresh()
        st["current"] = [[0, "KH"]]  # seat 0 (team 0) leads; seat 1 must respond
        st["hands"][1] = ["AH", "QH", "2S"]
        self.assertEqual(choose_card(st, 1), "AH")  # only winner, takes it

    def test_ai_trumps_when_void(self):
        st = fresh(trump="S")
        st["current"] = [[0, "KH"]]
        st["hands"][1] = ["2S", "3C"]
        self.assertEqual(choose_card(st, 1), "2S")

    def test_ai_sheds_low_when_partner_wins(self):
        st = fresh()
        st["current"] = [[0, "AH"]]  # partner (seat 0) winning
        st["hands"][2] = ["KH", "QH"]
        self.assertEqual(choose_card(st, 2), "QH")  # lowest, doesn't overtake

    def test_ai_easy_is_legal(self):
        st = fresh(seed=8)
        for _ in range(8):
            c = choose_card(st, st["turn"], difficulty="easy",
                            rng=random.Random(3))
            self.assertIn(c, hokm.legal_plays(st, st["turn"]))
            hokm.play_card(st, st["turn"], c)


class HokmStoreTest(unittest.TestCase):
    def test_game_session_roundtrip(self):
        from data import store
        db = tempfile.mktemp(suffix=".db")
        try:
            store.init_db(db)
            st = hokm.new_match(first_hakem=0, seed=1)
            store.save_game("hokm:tg:5", "hokm", st, db)
            got = store.load_game("hokm:tg:5", db)
            self.assertEqual(got["game"], "hokm")
            self.assertEqual(got["state"], st)
            self.assertIsNone(store.load_game("hokm:tg:6", db))
            store.delete_game("hokm:tg:5", db)
            self.assertIsNone(store.load_game("hokm:tg:5", db))
        finally:
            try:
                os.remove(db)
            except OSError:
                pass


if __name__ == "__main__":
    unittest.main()
