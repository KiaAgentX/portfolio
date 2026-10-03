# -*- coding: utf-8 -*-
"""Persistent trade journal (SQLite) - PRO edition.

Every fill (live or paper) is stored with its strategy, reason and PnL so
the dashboard can show history, stats and an equity curve that survive
restarts.
"""
import os
import sqlite3
import threading
import time

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(_REPO_ROOT, "data", "journal.db")


class Journal:
    def __init__(self, path=DB_PATH):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self._lock = threading.Lock()
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.conn.execute(
            """CREATE TABLE IF NOT EXISTS trades(
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               ts REAL, symbol TEXT, side TEXT, volume REAL,
               open_price REAL, close_price REAL, pnl REAL,
               reason TEXT, strategy TEXT, mode TEXT)""")
        self.conn.commit()

    def record(self, symbol, side, volume, open_price, close_price,
               pnl, reason, strategy, mode):
        with self._lock:
            self.conn.execute(
                "INSERT INTO trades(ts,symbol,side,volume,open_price,"
                "close_price,pnl,reason,strategy,mode) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (time.time(), symbol, side, volume, open_price, close_price,
                 round(pnl, 2), reason, strategy, mode))
            self.conn.commit()

    def trades(self, limit=200):
        with self._lock:
            cur = self.conn.execute(
                "SELECT id,ts,symbol,side,volume,open_price,close_price,pnl,"
                "reason,strategy,mode FROM trades ORDER BY id DESC LIMIT ?",
                (limit,))
            cols = ["id", "ts", "symbol", "side", "volume", "open_price",
                    "close_price", "pnl", "reason", "strategy", "mode"]
            return [dict(zip(cols, row)) for row in cur.fetchall()]

    def stats(self):
        with self._lock:
            cur = self.conn.execute(
                "SELECT COUNT(*), COALESCE(SUM(pnl),0), "
                "COALESCE(SUM(CASE WHEN pnl>0 THEN 1 ELSE 0 END),0), "
                "COALESCE(MAX(pnl),0), COALESCE(MIN(pnl),0) FROM trades")
            n, total, wins, best, worst = cur.fetchone()
            winrate = round(wins / n * 100, 1) if n else 0.0
            # equity curve (cumulative pnl, chronological)
            cur = self.conn.execute(
                "SELECT ts, pnl FROM trades ORDER BY id ASC")
            eq, acc = [], 0.0
            for ts, pnl in cur.fetchall():
                acc += pnl
                eq.append({"ts": ts, "equity": round(acc, 2)})
            return {"trades": n, "total_pnl": round(total, 2),
                    "winrate": winrate, "best": round(best, 2),
                    "worst": round(worst, 2), "equity": eq[-400:]}
