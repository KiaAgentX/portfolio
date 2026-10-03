"""SQLite persistence for settings, users, catalog, orders, and tickets."""
from __future__ import annotations

import json
import os
import random
import sqlite3
import time
from typing import Any

from config import settings

SETTING_DEFS: list[tuple[str, str, str]] = [
    ("chat_model", "ai", "text"),
    ("system_prompt", "ai", "area"),
    ("max_tokens", "ai", "text"),
    ("temperature", "ai", "text"),
    ("max_history", "ai", "text"),
    ("image_model", "ai", "text"),
    ("tts_provider", "media", "text"),
    ("tts_gender", "media", "text"),
    ("edge_rate", "media", "text"),
    ("default_mode", "texts", "text"),
    ("welcome_text", "texts", "area"),
    ("welcome_text_en", "texts", "area"),
    ("help_text", "texts", "area"),
    ("help_text_en", "texts", "area"),
]

GROUPS = ["ai", "media", "texts"]

SETTING_KEYS = {k for k, _, _ in SETTING_DEFS}

CONNECTION_KEYS = (
    "openai_api_key", "openai_base_url",
    "image_api_key", "image_base_url",
    "audio_api_key", "audio_base_url",
)


def _db(path: str | None = None) -> str:
    return path or os.environ.get("DB_PATH") or settings.db_path


def _connect(path: str | None = None) -> sqlite3.Connection:
    p = _db(path)
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    con = sqlite3.connect(p)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA foreign_keys=ON")
    return con


def init_db(path: str | None = None) -> None:
    con = _connect(path)
    con.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            mode    TEXT    NOT NULL DEFAULT 'text',
            model   TEXT    NOT NULL DEFAULT '',
            name    TEXT    NOT NULL DEFAULT '',
            lang    TEXT    NOT NULL DEFAULT 'fa'
        );
        CREATE TABLE IF NOT EXISTS catalog (
            id    INTEGER PRIMARY KEY CHECK (id = 1),
            data  TEXT NOT NULL DEFAULT '{}'
        );
        CREATE TABLE IF NOT EXISTS orders (
            ref     TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL DEFAULT 0,
            kind    TEXT    NOT NULL DEFAULT 'order',
            code    TEXT    NOT NULL DEFAULT '',
            qty     INTEGER NOT NULL DEFAULT 1,
            status  TEXT    NOT NULL DEFAULT 'pending',
            why     TEXT    NOT NULL DEFAULT '',
            descr   TEXT    NOT NULL DEFAULT '',
            src     TEXT    NOT NULL DEFAULT '',
            ts      REAL    NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tickets (
            ref     TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL DEFAULT 0,
            sev     TEXT    NOT NULL DEFAULT 'normal',
            status  TEXT    NOT NULL DEFAULT 'open',
            ts      REAL    NOT NULL
        );
        CREATE TABLE IF NOT EXISTS messages (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket   TEXT    NOT NULL,
            from_mgr INTEGER NOT NULL DEFAULT 0,
            text     TEXT    NOT NULL DEFAULT '',
            ts       REAL    NOT NULL
        );
        CREATE TABLE IF NOT EXISTS game_sessions (
            key        TEXT PRIMARY KEY,
            game       TEXT NOT NULL DEFAULT '',
            state_json TEXT NOT NULL DEFAULT '{}',
            updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cols = [r[1] for r in con.execute("PRAGMA table_info(users)")]
    if "lang" not in cols:
        con.execute("ALTER TABLE users ADD COLUMN lang TEXT NOT NULL DEFAULT 'fa'")
    con.commit()
    con.close()


# ---------------------------------------------------------------- settings

def get_setting(key: str, default: str = "", path: str | None = None) -> str:
    con = _connect(path)
    row = con.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    con.close()
    return row["value"] if row else default


def set_setting(key: str, value: str, path: str | None = None) -> None:
    con = _connect(path)
    con.execute("INSERT OR REPLACE INTO settings(key, value) VALUES(?, ?)", (key, value))
    con.commit()
    con.close()


def del_setting(key: str, path: str | None = None) -> None:
    con = _connect(path)
    con.execute("DELETE FROM settings WHERE key=?", (key,))
    con.commit()
    con.close()


def all_settings(path: str | None = None) -> dict[str, str]:
    con = _connect(path)
    rows = con.execute("SELECT key, value FROM settings").fetchall()
    con.close()
    return {r["key"]: r["value"] for r in rows}


# ---------------------------------------------------------------- users

def user_get(user_id: int, name: str = "", mode: str = "",
             lang: str = "", path: str | None = None) -> dict:
    con = _connect(path)
    row = con.execute("SELECT * FROM users WHERE user_id=?", (user_id,)).fetchone()
    if row:
        if name and name != row["name"]:
            con.execute("UPDATE users SET name=? WHERE user_id=?", (name, user_id))
            con.commit()
        d = dict(row)
        con.close()
        return d
    con.execute(
        "INSERT INTO users(user_id, mode, name, lang) VALUES(?, ?, ?, ?)",
        (user_id, mode or "text", name, lang or settings.default_lang or "fa"),
    )
    con.commit()
    row = con.execute("SELECT * FROM users WHERE user_id=?", (user_id,)).fetchone()
    d = dict(row)
    con.close()
    return d


def user_lang(user_id: int, path: str | None = None) -> str:
    con = _connect(path)
    row = con.execute("SELECT lang FROM users WHERE user_id=?", (user_id,)).fetchone()
    con.close()
    return row["lang"] if row else (settings.default_lang or "fa")


def set_lang(user_id: int, lang: str, path: str | None = None) -> str:
    if lang not in ("fa", "en"):
        lang = "fa"
    con = _connect(path)
    con.execute("UPDATE users SET lang=? WHERE user_id=?", (lang, user_id))
    con.commit()
    con.close()
    return lang


def user_name(user_id: int, path: str | None = None) -> str:
    con = _connect(path)
    row = con.execute("SELECT name FROM users WHERE user_id=?", (user_id,)).fetchone()
    con.close()
    return row["name"] if row else ""


def user_exists(user_id: int, path: str | None = None) -> bool:
    con = _connect(path)
    row = con.execute("SELECT 1 FROM users WHERE user_id=?", (user_id,)).fetchone()
    con.close()
    return row is not None


def user_set(user_id: int, path: str | None = None, **kwargs: Any) -> None:
    con = _connect(path)
    for k, v in kwargs.items():
        if k in ("mode", "model", "name", "lang"):
            con.execute(f"UPDATE users SET {k}=? WHERE user_id=?", (v, user_id))
    con.commit()
    con.close()


def list_users(limit: int = 100, path: str | None = None) -> list[dict]:
    con = _connect(path)
    rows = con.execute("SELECT * FROM users ORDER BY user_id DESC LIMIT ?", (limit,)).fetchall()
    con.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------- catalog

def get_catalog(path: str | None = None, seed: str = "catalog.json") -> dict:
    con = _connect(path)
    row = con.execute("SELECT data FROM catalog WHERE id=1").fetchone()
    con.close()
    if row and row["data"] and row["data"] != "{}":
        try:
            return json.loads(row["data"])
        except Exception:
            pass
    if seed:
        seed_path = seed
        if not os.path.isabs(seed_path):
            seed_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), seed_path)
        try:
            with open(seed_path, encoding="utf-8") as f:
                cat = json.load(f)
            save_catalog(cat, path)
            return cat
        except Exception:
            pass
    return {"services": []}


def save_catalog(cat: dict, path: str | None = None) -> None:
    con = _connect(path)
    con.execute("INSERT OR REPLACE INTO catalog(id, data) VALUES(1, ?)", (json.dumps(cat, ensure_ascii=False),))
    con.commit()
    con.close()


def svc_by_code(catalog: dict, code: str) -> dict | None:
    for s in catalog.get("services", []):
        if s.get("code") == code:
            return s
    return None


# ---------------------------------------------------------------- orders

def new_ref(prefix: str = "ORD", path: str | None = None) -> str:
    return f"{prefix}-{random.randint(0, 0xFFFF):04X}"


# NOTE: (..., descr, path) positional order is the original v3 API — keep it.
# `src` stays LAST so old 6-arg and 7-arg positional calls keep working.
def create_order(ref: str, user_id: int, kind: str, code: str,
                 qty: int = 1, descr: str = "",
                 path: str | None = None, src: str = "") -> None:
    con = _connect(path)
    con.execute(
        "INSERT OR REPLACE INTO orders(ref, user_id, kind, code, qty, descr, src, ts) VALUES(?,?,?,?,?,?,?,?)",
        (ref, user_id, kind, code, qty, descr, src, time.time()),
    )
    con.commit()
    con.close()


def get_order(ref: str, path: str | None = None) -> dict | None:
    con = _connect(path)
    row = con.execute("SELECT * FROM orders WHERE ref=?", (ref,)).fetchone()
    con.close()
    return dict(row) if row else None


def set_order(ref: str, status: str, why: str = "", path: str | None = None) -> None:
    con = _connect(path)
    con.execute("UPDATE orders SET status=?, why=? WHERE ref=?", (status, why, ref))
    con.commit()
    con.close()


def list_orders(status: str | None = None, limit: int = 50,
                path: str | None = None) -> list[dict]:
    con = _connect(path)
    if status:
        rows = con.execute(
            "SELECT * FROM orders WHERE status=? ORDER BY ts DESC LIMIT ?",
            (status, limit),
        ).fetchall()
    else:
        rows = con.execute(
            "SELECT * FROM orders ORDER BY ts DESC LIMIT ?", (limit,)
        ).fetchall()
    con.close()
    return [dict(r) for r in rows]


def user_orders(user_id: int, limit: int = 20, path: str | None = None) -> list[dict]:
    con = _connect(path)
    rows = con.execute(
        "SELECT * FROM orders WHERE user_id=? ORDER BY ts DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------- tickets

def create_ticket(ref: str, user_id: int, sev: str, text: str,
                  path: str | None = None) -> None:
    con = _connect(path)
    con.execute(
        "INSERT OR REPLACE INTO tickets(ref, user_id, sev, ts) VALUES(?,?,?,?)",
        (ref, user_id, sev, time.time()),
    )
    con.execute(
        "INSERT INTO messages(ticket, from_mgr, text, ts) VALUES(?,?,?,?)",
        (ref, 0, text, time.time()),
    )
    con.commit()
    con.close()


def get_ticket(ref: str, path: str | None = None) -> dict | None:
    con = _connect(path)
    row = con.execute("SELECT * FROM tickets WHERE ref=?", (ref,)).fetchone()
    con.close()
    return dict(row) if row else None


def set_ticket(ref: str, status: str, path: str | None = None) -> None:
    con = _connect(path)
    con.execute("UPDATE tickets SET status=? WHERE ref=?", (status, ref))
    con.commit()
    con.close()


def list_tickets(open_only: bool = True, limit: int = 50,
                 path: str | None = None) -> list[dict]:
    con = _connect(path)
    if open_only:
        rows = con.execute(
            "SELECT * FROM tickets WHERE status IN ('open','waiting') ORDER BY ts DESC LIMIT ?",
            (limit,),
        ).fetchall()
    else:
        rows = con.execute(
            "SELECT * FROM tickets ORDER BY ts DESC LIMIT ?", (limit,)
        ).fetchall()
    con.close()
    return [dict(r) for r in rows]


def user_tickets(user_id: int, limit: int = 20, path: str | None = None) -> list[dict]:
    con = _connect(path)
    rows = con.execute(
        "SELECT * FROM tickets WHERE user_id=? ORDER BY ts DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------- messages

def add_msg(ticket: str, from_mgr: int, text: str,
            path: str | None = None) -> None:
    con = _connect(path)
    con.execute(
        "INSERT INTO messages(ticket, from_mgr, text, ts) VALUES(?,?,?,?)",
        (ticket, from_mgr, text, time.time()),
    )
    con.commit()
    con.close()


def thread(ticket: str, path: str | None = None) -> list[dict]:
    con = _connect(path)
    rows = con.execute(
        "SELECT * FROM messages WHERE ticket=? ORDER BY id ASC", (ticket,)
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------- stats

def stats(path: str | None = None) -> dict[str, int]:
    con = _connect(path)
    users = con.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
    pending = con.execute("SELECT COUNT(*) AS c FROM orders WHERE status='pending'").fetchone()["c"]
    orders = con.execute("SELECT COUNT(*) AS c FROM orders").fetchone()["c"]
    tickets = con.execute("SELECT COUNT(*) AS c FROM tickets").fetchone()["c"]
    open_tickets = con.execute(
        "SELECT COUNT(*) AS c FROM tickets WHERE status IN ('open','waiting')"
    ).fetchone()["c"]
    con.close()
    return {"users": users, "pending": pending, "orders": orders,
            "tickets": tickets, "open_tickets": open_tickets}


# ---------------------------------------------------------------- game sessions

def save_game(key: str, game: str, state: dict, path: str | None = None) -> None:
    con = _connect(path)
    con.execute(
        "INSERT OR REPLACE INTO game_sessions(key, game, state_json, updated) "
        "VALUES(?, ?, ?, CURRENT_TIMESTAMP)",
        (key, game, json.dumps(state, ensure_ascii=False)),
    )
    con.commit()
    con.close()


def load_game(key: str, path: str | None = None) -> dict | None:
    con = _connect(path)
    row = con.execute(
        "SELECT game, state_json FROM game_sessions WHERE key=?", (key,),
    ).fetchone()
    con.close()
    if not row:
        return None
    try:
        return {"game": row["game"], "state": json.loads(row["state_json"])}
    except Exception:
        return None


def delete_game(key: str, path: str | None = None) -> None:
    con = _connect(path)
    con.execute("DELETE FROM game_sessions WHERE key=?", (key,))
    con.commit()
    con.close()
