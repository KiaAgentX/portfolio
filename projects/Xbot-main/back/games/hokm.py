"""Hokm (حکم) — 4-player partnership card engine.

Pure rules, no I/O: the state is a JSON-safe dict, functions mutate + return
small result dicts. Seats 0..3, teams {0,2} vs {1,3}; seat 0 is the human
on every surface, seats 1..3 are agents (wolf/mate/fox).

Match rules (v1, authentic casual Hokm):
  - 5 cards dealt, hakem declares trump, remaining 8 dealt (13 each).
  - Hakem leads the first trick; winner of a trick leads the next.
  - Must follow the led suit if possible; highest trump wins, else highest led.
  - First team to 7 tricks takes the round (play stops early at 7):
      7-x  -> 1 point,  7-0 = kot -> 2 points (3 if hakem's team is kotted).
  - First team to TARGET_POINTS (7) wins the match. Hakem rotates each round.
"""
from __future__ import annotations

import random

SUITS = ("S", "H", "D", "C")  # Spades/Hearts/Diamonds/Clubs
RANKS = ("2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A")
RANK_VALUE = {r: i for i, r in enumerate(RANKS)}
TEAM_OF = (0, 1, 0, 1)  # seat -> team

TARGET_POINTS = 7
TRICKS_TO_WIN = 7
HAND_FULL = 13
HAND_FIRST_DEAL = 5
LOG_CAP = 40


# ---------------------------------------------------------------- cards

def card_suit(card: str) -> str:
    return card[-1]


def card_rank(card: str) -> str:
    return card[:-1]


def card_value(card: str) -> int:
    return RANK_VALUE[card[:-1]]


def team_of(seat: int) -> int:
    return TEAM_OF[seat]


def sort_hand(hand: list[str]) -> list[str]:
    return sorted(hand, key=lambda c: (SUITS.index(card_suit(c)), card_value(c)))


def new_deck(seed=None) -> list[str]:
    deck = [r + s for s in SUITS for r in RANKS]
    random.Random(seed).shuffle(deck)
    return deck


# ---------------------------------------------------------------- match

def new_match(first_hakem: int | None = None, target: int = TARGET_POINTS,
              seed=None) -> dict:
    """Create a match and deal round 1. `seed` makes every round reproducible."""
    if first_hakem is None:
        rng = random.Random(seed) if seed is not None else random
        first_hakem = rng.randrange(4)
    st: dict = {"v": 1, "seed": seed, "target": target,
                "score": [0, 0], "round_no": 0, "hakem": first_hakem,
                "phase": "new", "winner": None, "kot": None}
    start_round(st)
    return st


def _round_rng(st: dict) -> random.Random:
    seed = st.get("seed")
    if seed is None:
        return random.Random()
    return random.Random(f"{seed}:{st['round_no'] + 1}")


def start_round(st: dict) -> dict:
    deck = [r + s for s in SUITS for r in RANKS]
    _round_rng(st).shuffle(deck)
    st["round_no"] += 1
    st["hands"] = [sort_hand(deck[i * 5:i * 5 + 5]) for i in range(4)]
    st["deck_rest"] = deck[20:]  # 32 cards -> 8 more each after trump declared
    st["trump"] = None
    st["tricks_won"] = [0, 0]
    st["tricks"] = []
    st["current"] = []
    st["leader"] = st["hakem"]
    st["turn"] = st["hakem"]
    st["kot"] = None
    st["log"] = []
    st["last"] = {"e": "deal", "hakem": st["hakem"]}
    st["phase"] = "declare"
    return st


def declare_trump(st: dict, seat: int, suit: str) -> dict:
    if st["phase"] != "declare":
        return {"ok": False, "err": "not_declare"}
    if seat != st["turn"]:
        return {"ok": False, "err": "not_turn"}
    if suit not in SUITS:
        return {"ok": False, "err": "bad_suit"}
    rest = st.pop("deck_rest")
    for i in range(4):
        st["hands"][i] = sort_hand(st["hands"][i] + rest[i * 8:i * 8 + 8])
    st["trump"] = suit
    st["phase"] = "play"
    st["leader"] = st["hakem"]
    st["turn"] = st["hakem"]
    st["current"] = []
    _log(st, {"e": "declare", "seat": seat, "suit": suit})
    st["last"] = {"e": "declare", "seat": seat, "suit": suit}
    return {"ok": True}


def next_round(st: dict) -> dict:
    """Start the next round (rotates hakem). Only from round_over."""
    if st["phase"] != "round_over":
        return {"ok": False, "err": st["phase"]}
    st["hakem"] = (st["hakem"] + 1) % 4
    start_round(st)
    return {"ok": True}


# ---------------------------------------------------------------- tricks

def legal_plays(st: dict, seat: int) -> list[str]:
    """Cards `seat` may play: must follow the led suit if possible."""
    hand = st["hands"][seat]
    if not st["current"]:
        return list(hand)
    led = card_suit(st["current"][0][1])
    follow = [c for c in hand if card_suit(c) == led]
    return follow or list(hand)


def trick_winner(trick: list, trump: str) -> int:
    """Winning seat of a complete trick [(seat, card)...] in play order."""
    led = card_suit(trick[0][1])

    def key(item) -> tuple[int, int]:
        s = card_suit(item[1])
        v = card_value(item[1])
        if s == trump:
            return (2, v)
        if s == led:
            return (1, v)
        return (0, v)

    return max(trick, key=key)[0]


def play_card(st: dict, seat: int, card: str) -> dict:
    if st["phase"] != "play":
        return {"ok": False, "err": "not_play"}
    if seat != st["turn"]:
        return {"ok": False, "err": "not_turn"}
    if card not in st["hands"][seat]:
        return {"ok": False, "err": "no_card"}
    if card not in legal_plays(st, seat):
        return {"ok": False, "err": "must_follow",
                "suit": card_suit(st["current"][0][1])}
    st["hands"][seat].remove(card)
    st["current"].append([seat, card])
    res: dict = {"ok": True, "trick_done": False}
    if len(st["current"]) < 4:
        st["turn"] = (seat + 1) % 4
        return res
    w = trick_winner(st["current"], st["trump"])
    team = TEAM_OF[w]
    st["tricks_won"][team] += 1
    st["tricks"].append({"cards": [list(x) for x in st["current"]], "w": w})
    st["current"] = []
    st["leader"] = w
    st["turn"] = w
    res.update({"trick_done": True, "trick_winner": w, "team": team,
                "count": st["tricks_won"][team]})
    _log(st, {"e": "trick", "w": w, "n": st["tricks_won"][team]})
    st["last"] = {"e": "trick", "w": w, "team": team}
    if st["tricks_won"][team] >= TRICKS_TO_WIN:
        _end_round(st, team, res)
    return res


def _end_round(st: dict, wteam: int, res: dict) -> None:
    lteam = 1 - wteam
    hakem_team = TEAM_OF[st["hakem"]]
    kot = st["tricks_won"][lteam] == 0
    pts = (3 if hakem_team == lteam else 2) if kot else 1
    st["score"][wteam] += pts
    st["kot"] = {"team": wteam, "points": pts} if kot else None
    res.update({"round_over": True, "round_winner": wteam,
                "points": pts, "kot": kot, "score": list(st["score"])})
    _log(st, {"e": "round", "w": wteam, "pts": pts, "kot": kot})
    st["last"] = {"e": "round", "w": wteam, "pts": pts, "kot": kot}
    if st["score"][wteam] >= st["target"]:
        st["phase"] = "match_over"
        st["winner"] = wteam
        res["match_over"] = True
        res["winner"] = wteam
    else:
        st["phase"] = "round_over"


def _log(st: dict, ev: dict) -> None:
    log = st.setdefault("log", [])
    log.append(ev)
    if len(log) > LOG_CAP:
        del log[:len(log) - LOG_CAP]
