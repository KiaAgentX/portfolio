# -*- coding: utf-8 -*-
"""Command-line companion - PRO edition.

    python src/cli.py serve [--port 5000]
    python src/cli.py backtest [--seed 7] [--candles 3000] [--tp 8] [--sl 4]
                               [--strategy ensemble]
    python src/cli.py sweep [--seed 7]
    python src/cli.py journal [--limit 20]
    python src/cli.py stats
    python src/cli.py config
    python src/cli.py test
"""
import argparse
import os
import sys

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)


def cmd_serve(args):
    os.environ["PORT"] = str(args.port)
    if args.auto:
        os.environ["AUTO_START"] = "1"
    from src import server  # noqa: F401  (runs under __main__? no - invoke)
    # start exactly like `python src/server.py`
    import runpy
    runpy.run_path(os.path.join(_REPO_ROOT, "src", "server.py"),
                   run_name="__main__")


def cmd_backtest(args):
    from src import backtest
    m = backtest.run_backtest(seed=args.seed, candles=args.candles,
                              tp=args.tp, sl=args.sl, trail=args.trail,
                              strategy=args.strategy)
    print("\n=== BACKTEST REPORT ===")
    for k in ("strategy", "trades", "winrate", "profit_factor", "net_pnl",
              "final_balance", "max_drawdown_pct", "sharpe", "avg_win",
              "avg_loss"):
        print(f"  {k:>18}: {m[k]}")
    print("  last trades:")
    for t in m["last_trades"][-6:]:
        print(f"    {t['side']:4} {t['entry']:>9} -> {t['exit']:>9} "
              f"{t['pnl']:+8.2f}  [{t['reason']}]")


def cmd_sweep(args):
    from src import backtest
    rows = backtest.sweep(seed=args.seed)
    print(f"\n{'TP':>5} {'SL':>5} {'#':>4} {'win%':>6} {'PF':>6} "
          f"{'net':>9} {'mdd%':>6}")
    for r in rows:
        print(f"{r['tp']:>5} {r['sl']:>5} {r['trades']:>4} "
              f"{r['winrate']:>6} {r['pf']:>6} {r['net']:>9} {r['mdd']:>6}")


def cmd_journal(args):
    from src.journal import Journal
    j = Journal()
    for t in j.trades(args.limit):
        print(f"#{t['id']:<5} {t['side']:4} vol={t['volume']} "
              f"{t['open_price']:>9}->{t['close_price']:>9} "
              f"{t['pnl']:+8.2f} [{t['reason']}] {t['strategy']}")


def cmd_stats(args):
    from src.journal import Journal
    s = Journal().stats()
    print(f"trades={s['trades']} total_pnl={s['total_pnl']} "
          f"winrate={s['winrate']}% best={s['best']} worst={s['worst']}")


def cmd_config(args):
    from src.config import CFG
    for k, v in CFG.safe_dict().items():
        print(f"  {k:>20} = {v}")
    for p in CFG.validate():
        print(f"  [!] {p}")


def cmd_test(args):
    import unittest
    suite = unittest.defaultTestLoader.discover(
        os.path.join(_REPO_ROOT, "tests"))
    res = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if res.wasSuccessful() else 1)


def main():
    p = argparse.ArgumentParser(prog="fly-gold-pro",
                                description="Fly-Gold-Trader PRO CLI")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("serve"); s.add_argument("--port", type=int, default=5000)
    s.add_argument("--auto", action="store_true"); s.set_defaults(fn=cmd_serve)

    b = sub.add_parser("backtest")
    b.add_argument("--seed", type=int, default=7)
    b.add_argument("--candles", type=int, default=3000)
    b.add_argument("--tp", type=float, default=8.0)
    b.add_argument("--sl", type=float, default=4.0)
    b.add_argument("--trail", type=float, default=3.0)
    b.add_argument("--strategy", default="ensemble")
    b.set_defaults(fn=cmd_backtest)

    w = sub.add_parser("sweep"); w.add_argument("--seed", type=int, default=7)
    w.set_defaults(fn=cmd_sweep)

    j = sub.add_parser("journal"); j.add_argument("--limit", type=int, default=20)
    j.set_defaults(fn=cmd_journal)

    st = sub.add_parser("stats"); st.set_defaults(fn=cmd_stats)
    cf = sub.add_parser("config"); cf.set_defaults(fn=cmd_config)
    t = sub.add_parser("test"); t.set_defaults(fn=cmd_test)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
