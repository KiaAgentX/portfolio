"""Heuristic Hokm agents (seats 1..3).

Moves are pure heuristics — instant, always legal, free. The LLM is only
ever used for chat/banter by the front adapters, never for moves.
Difficulties: "easy" (random legal) and "normal" (classic casual logic:
shed low when partner wins, win cheap when an opponent wins, lead high
from the longest suit).
"""
from __future__ import annotations

import random

from . import hokm
from .hokm import SUITS, TEAM_OF, card_suit, card_value, legal_plays, trick_winner


def choose_trump(hand5: list[str], rng=None) -> str:
    """Trump for a 5-card hakem hand: longest suit, ties by strength."""
    rng = rng or random
    best, best_key = SUITS[0], None
    for s in SUITS:
        cards = [c for c in hand5 if card_suit(c) == s]
        key = (len(cards), sum(card_value(c) for c in cards), rng.random())
        if best_key is None or key > best_key:
            best, best_key = s, key
    return best


def choose_card(st: dict, seat: int, difficulty: str = "normal", rng=None) -> str:
    legal = legal_plays(st, seat)
    if len(legal) == 1 or difficulty == "easy":
        return (rng or random).choice(legal)
    trick = st["current"]
    trump = st["trump"]
    if not trick:
        return _lead(legal, trump)
    if TEAM_OF[trick_winner(trick, trump)] == TEAM_OF[seat]:
        return min(legal, key=card_value)  # partner winning: shed lowest
    winners = [c for c in legal if _beats(trick, trump, c)]
    if winners:  # win as cheaply as possible (non-trump first, then low)
        return min(winners, key=lambda c: (card_suit(c) == trump, card_value(c)))
    return min(legal, key=card_value)  # can't win: throw lowest


def _beats(trick: list, trump: str, card: str) -> bool:
    return trick_winner(trick + [[-1, card]], trump) == -1


def _lead(legal: list[str], trump: str) -> str:
    non_trump = [c for c in legal if card_suit(c) != trump]
    pool = non_trump or legal
    by_suit: dict[str, list[str]] = {}
    for c in pool:
        by_suit.setdefault(card_suit(c), []).append(c)
    longest = max(by_suit.values(), key=len)
    if pool is legal:  # only trumps left: lead low
        return min(longest, key=card_value)
    return max(longest, key=card_value)  # cash the top of the longest suit


def agent_act(st: dict, seat: int, difficulty: str = "normal", rng=None) -> dict:
    """Play one full agent action (declare or card). Returns engine result."""
    if st["phase"] == "declare" and st["turn"] == seat:
        return hokm.declare_trump(st, seat, choose_trump(st["hands"][seat], rng))
    if st["phase"] == "play" and st["turn"] == seat:
        return hokm.play_card(st, seat, choose_card(st, seat, difficulty, rng))
    return {"ok": False, "err": "not_agent_turn"}
