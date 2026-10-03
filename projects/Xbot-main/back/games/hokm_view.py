"""Hokm table rendering + surface-flow helpers (no telegram imports).

Both surfaces (bot + web) share this: message text building, the
"run agents until the human must act" loop, and banter selection.
Unit-tested in tests/test_hokm_view.py.
"""
from __future__ import annotations

from back.games import hokm as engine
from back.games import hokm_ai as ai
from back.games.hokm_personas import PERSONAS, SEAT_PERSONA
from front.i18n import t

SUIT_SYM = {"S": "♠️", "H": "♥️", "D": "♦️", "C": "♣️"}

USER_SEAT = 0


# ------------------------------------------------------------------ basics

def session_key(surface: str, uid) -> str:
    return f"hokm:{surface}:{uid}"


def card_text(card: str) -> str:
    return f"{engine.card_rank(card)}{SUIT_SYM[engine.card_suit(card)]}"


def persona_id(seat: int) -> str:
    return SEAT_PERSONA[seat] if 0 <= seat < 4 else "you"


def seat_name(seat: int, lang: str) -> str:
    pid = persona_id(seat)
    emo = PERSONAS[pid]["emoji"] if pid in PERSONAS else "👤"
    return f"{emo} {t(f'hokm.p.{pid}', lang)}"


def suit_name(suit: str, lang: str) -> str:
    return t(f"hokm.suit.{suit}", lang)


def cb(owner, action: str, param: str = "") -> str:
    base = f"hokm:{owner}:{action}"
    return f"{base}:{param}" if param else base


def trump_text(st: dict, lang: str) -> str:
    return t("hokm.trump_line", lang, sym=SUIT_SYM[st["trump"]],
             suit=suit_name(st["trump"], lang),
             hakem=seat_name(st["hakem"], lang))


def format_say(seat: int, text: str, lang: str) -> str:
    return f"{seat_name(seat, lang)}:\n{text}"


# ---------------------------------------------------------------- rendering

def _round_result_line(st: dict, lang: str) -> str:
    w = st["last"]["w"] if st.get("last", {}).get("e") == "round" else None
    if w is None:  # derive from score movement is unreliable; use tricks
        w = 0 if st["tricks_won"][0] >= engine.TRICKS_TO_WIN else 1
    pts = st["kot"]["points"] if st.get("kot") else 1
    out = []
    if st.get("kot"):
        out.append(t("hokm.kot_us" if w == 0 else "hokm.kot_them", lang))
    out.append(t("hokm.round_win" if w == 0 else "hokm.round_lose", lang,
                 a=st["tricks_won"][0], b=st["tricks_won"][1], pts=pts))
    return "\n".join(out)


def _trick_line(st: dict, lang: str) -> str:
    if not st["current"]:
        return t("hokm.trick_empty", lang)
    plays = " • ".join(f"{seat_name(s, lang)} {card_text(c)}" for s, c in st["current"])
    return t("hokm.trick_now", lang, plays=plays)


def _counts_line(st: dict, lang: str) -> str:
    parts = [f"{seat_name(s, lang)} ×{len(st['hands'][s])}" for s in (2, 1, 3)]
    return "🂠 " + " • ".join(parts)


def render_table(st: dict, lang: str) -> str:
    lines = [
        f"{t('hokm.title', lang)} • {t('hokm.round', lang, n=st['round_no'])}",
        t("hokm.score", lang, us=st["score"][0], them=st["score"][1],
          target=st["target"]),
    ]
    ph = st["phase"]
    if ph == "match_over":
        lines.append(t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1]))
        key = "hokm.match_win" if st["winner"] == 0 else "hokm.match_lose"
        lines.append(t(key, lang, us=st["score"][0], them=st["score"][1]))
        return "\n".join(lines)
    if ph == "round_over":
        lines.append(t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1]))
        lines.append(_round_result_line(st, lang))
        return "\n".join(lines)
    lines.append(t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1]))
    if st.get("trump"):
        lines.append(trump_text(st, lang))
    if ph == "declare":
        if st["turn"] == USER_SEAT:
            lines.append(t("hokm.ask_trump", lang))
        else:
            lines.append(t("hokm.declare_wait", lang,
                             name=seat_name(st["turn"], lang)))
    else:  # play
        lines.append(_trick_line(st, lang))
        last = st.get("last") or {}
        if last.get("e") == "trick" and not st["current"]:
            lines.append(t("hokm.last_trick", lang, name=seat_name(last["w"], lang)))
        if st["turn"] == USER_SEAT:
            lines.append(t("hokm.your_turn", lang))
        else:
            lines.append(t("hokm.wait_turn", lang, name=seat_name(st["turn"], lang)))
    hand = st["hands"][USER_SEAT]
    lines.append(t("hokm.your_hand", lang, n=len(hand)))
    lines.append(" ".join(card_text(c) for c in hand) or "—")
    lines.append(_counts_line(st, lang))
    return "\n".join(lines)


def board_actions(st: dict) -> dict:
    """What buttons the human gets: cards / suits / next / new."""
    ph = st["phase"]
    return {
        "cards": (engine.legal_plays(st, USER_SEAT)
                  if ph == "play" and st["turn"] == USER_SEAT else []),
        "suits": (list(engine.SUITS)
                  if ph == "declare" and st["turn"] == USER_SEAT else []),
        "next": ph == "round_over",
        "new": ph in ("round_over", "match_over"),
    }


# -------------------------------------------------------------------- flow

def result_events(res: dict, st: dict) -> list[dict]:
    """Notable events from one engine result (user's or agent's action)."""
    evs: list[dict] = []
    if res.get("trick_done"):
        evs.append({"e": "trick", "w": res["trick_winner"], "team": res["team"],
                    "count": res["count"],
                    "cards": [list(x) for x in st["tricks"][-1]["cards"]]})
    if res.get("round_over"):
        evs.append({"e": "round", "w": res["round_winner"],
                    "pts": res["points"], "kot": res["kot"]})
    if res.get("match_over"):
        evs.append({"e": "match", "w": res["winner"]})
    return evs


def declare_event(seat: int, suit: str) -> dict:
    return {"e": "declare", "seat": seat, "suit": suit}


def drain_agents(st: dict, user_seat: int = USER_SEAT,
                 difficulty: str = "normal") -> list[dict]:
    """Run agent turns until the human must act or the round/match ends."""
    evs: list[dict] = []
    for _ in range(60):
        ph, turn = st["phase"], st["turn"]
        if ph == "declare" and turn != user_seat:
            r = ai.agent_act(st, turn, difficulty)
            if not r.get("ok"):
                break
            evs.append(declare_event(turn, st["trump"]))
            continue
        if ph == "play" and turn != user_seat:
            r = ai.agent_act(st, turn, difficulty)
            if not r.get("ok"):
                break
            evs.extend(result_events(r, st))
            continue
        break
    return evs


# ------------------------------------------------------------------- banter

_BANTER_PRIORITY = {"match": 0, "round": 1, "declare": 2, "trick": 3}


def banter_for(e: dict, lang: str) -> tuple[int, str] | None:
    """Canned (speaker_seat, text) for one event."""
    kind = e["e"]
    if kind == "declare":
        seat = e["seat"]
        spk = seat if seat != USER_SEAT else 2  # mate reacts to your call
        return spk, t("hokm.say.declare", lang, suit=suit_name(e["suit"], lang))
    if kind == "trick":
        w = e["w"]
        key = "hokm.say.trick_us" if e["team"] == 0 else "hokm.say.trick_them"
        spk = w if w != USER_SEAT else 2
        return spk, t(key, lang)
    if kind == "round":
        if e["kot"]:
            key = "hokm.say.kot_us" if e["w"] == 0 else "hokm.say.kot_them"
        else:
            key = "hokm.say.round_win" if e["w"] == 0 else "hokm.say.round_lose"
        return (2 if e["w"] == 0 else 1), t(key, lang)
    if kind == "match":
        key = "hokm.say.match_win" if e["w"] == 0 else "hokm.say.match_lose"
        return (2 if e["w"] == 0 else 1), t(key, lang)
    return None


def pick_banter(evs: list[dict], lang: str, limit: int = 2) -> list[tuple[int, str, dict]]:
    """Pick up to `limit` (speaker, canned_text, event), most important first."""
    key_evs = [e for e in evs if e["e"] != "trick"]
    tricks = [e for e in evs if e["e"] == "trick"]
    key_evs += tricks[-1:]
    key_evs.sort(key=lambda e: _BANTER_PRIORITY[e["e"]])
    out: list[tuple[int, str, dict]] = []
    for e in key_evs[:limit]:
        b = banter_for(e, lang)
        if b:
            out.append((b[0], b[1], e))
    return out


def event_context(e: dict, st: dict, lang: str) -> str:
    """One factual paragraph about the event + status (LLM prompt input)."""
    if e["e"] == "declare":
        what = t("hokm.declared", lang, name=seat_name(e["seat"], lang),
                 sym=SUIT_SYM[e["suit"]], suit=suit_name(e["suit"], lang))
    elif e["e"] == "trick":
        what = t("hokm.trick_won", lang, name=seat_name(e["w"], lang), n=e["count"])
    elif e["e"] == "round":
        what = _round_result_line(st, lang)
    elif e["e"] == "match":
        key = "hokm.match_win" if e["w"] == 0 else "hokm.match_lose"
        what = t(key, lang, us=st["score"][0], them=st["score"][1])
    else:
        what = ""
    parts = [what,
             t("hokm.score", lang, us=st["score"][0], them=st["score"][1],
               target=st["target"]),
             t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1])]
    if st.get("trump"):
        parts.append(trump_text(st, lang))
    return "\n".join(parts)


# ------------------------------------------------------------------ web API

CHAT_CAP = 50
WEB_CHAT_ORDER = ("mate", "wolf", "fox")


def chat_append(st: dict, by: str, text: str) -> None:
    """Append one web-chat line (by: you|wolf|mate|fox|sys), capped."""
    log = st.setdefault("webchat", [])
    log.append({"by": by, "text": text})
    if len(log) > CHAT_CAP:
        del log[:len(log) - CHAT_CAP]


def ack_line(pid: str, lang: str) -> str:
    """Canned table-talk reply when the LLM is unavailable."""
    if pid not in PERSONAS:
        pid = "mate"
    return t(f"hokm.say.ack_{pid}", lang)


def chat_persona(text: str, st: dict) -> str:
    """Who answers table-talk: a mentioned persona, else rotation."""
    low = (text or "").lower()
    for pid in PERSONAS:
        names = {pid, t(f"hokm.p.{pid}", "fa").lower(), t(f"hokm.p.{pid}", "en").lower()}
        if any(n and n in low for n in names):
            return pid
    nxt = (int(st.get("webchat_turn", -1)) + 1) % len(WEB_CHAT_ORDER)
    st["webchat_turn"] = nxt
    return WEB_CHAT_ORDER[nxt]


def table_status(st: dict, lang: str) -> str:
    """Compact status paragraph (LLM context for table-talk replies)."""
    parts = [
        t("hokm.score", lang, us=st["score"][0], them=st["score"][1],
          target=st["target"]),
        t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1]),
    ]
    if st.get("trump"):
        parts.append(trump_text(st, lang))
    return "\n".join(parts)


def web_state(st: dict, lang: str) -> dict:
    """JSON-safe snapshot for the web game page (all strings pre-rendered)."""
    acts = board_actions(st)
    legal = set(acts["cards"])
    ph = st["phase"]
    if ph == "declare":
        if st["turn"] == USER_SEAT:
            prompt = t("hokm.ask_trump", lang)
        else:
            prompt = t("hokm.declare_wait", lang, name=seat_name(st["turn"], lang))
    elif ph == "play":
        if st["turn"] == USER_SEAT:
            prompt = t("hokm.your_turn", lang)
        else:
            prompt = t("hokm.wait_turn", lang, name=seat_name(st["turn"], lang))
    else:
        prompt = ""
    result = ""
    if ph == "round_over":
        result = _round_result_line(st, lang)
    elif ph == "match_over":
        key = "hokm.match_win" if st["winner"] == 0 else "hokm.match_lose"
        result = t(key, lang, us=st["score"][0], them=st["score"][1])
    last = st.get("last") or {}
    chat = []
    for m in st.get("webchat", [])[-CHAT_CAP:]:
        by = m.get("by", "sys")
        if by == "sys":
            name = ""
        elif by == "you":
            name = seat_name(USER_SEAT, lang)
        elif by in PERSONAS:
            name = seat_name(PERSONAS[by]["seat"], lang)
        else:
            name = by
        chat.append({"by": by, "name": name, "text": m.get("text", "")})
    return {
        "phase": ph,
        "round": st["round_no"],
        "score_text": t("hokm.score", lang, us=st["score"][0], them=st["score"][1],
                        target=st["target"]),
        "tricks_text": t("hokm.tricks", lang, a=st["tricks_won"][0], b=st["tricks_won"][1]),
        "trump": ({"suit": st["trump"], "sym": SUIT_SYM[st["trump"]],
                   "name": suit_name(st["trump"], lang),
                   "hakem": seat_name(st["hakem"], lang)} if st.get("trump") else None),
        "trump_text": trump_text(st, lang) if st.get("trump") else "",
        "current": [{"seat": s, "name": seat_name(s, lang), "card": c, "text": card_text(c)}
                    for s, c in st["current"]],
        "trick_text": _trick_line(st, lang),
        "last_text": (t("hokm.last_trick", lang, name=seat_name(last["w"], lang))
                      if last.get("e") == "trick" and not st["current"] and ph == "play" else ""),
        "prompt": prompt,
        "hand_title": t("hokm.your_hand", lang, n=len(st["hands"][USER_SEAT])),
        "hand": [{"card": c, "text": card_text(c), "playable": c in legal}
                 for c in st["hands"][USER_SEAT]],
        "counts": [{"seat": s, "name": seat_name(s, lang), "n": len(st["hands"][s])}
                   for s in (2, 1, 3)],
        "suits": ([{"suit": s, "sym": SUIT_SYM[s], "name": suit_name(s, lang)}
                   for s in acts["suits"]] if acts["suits"] else []),
        "next": acts["next"],
        "new": acts["new"],
        "result": result,
        "chat": chat,
        "b_next": t("hokm.b.next", lang),
        "b_new": t("hokm.b.new", lang),
    }
