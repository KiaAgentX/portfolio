#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fly-Gold-Trader PRO - one-click automatic installer.

Double-click setup.bat (Windows) or run ./setup.sh (Linux/macOS):
  1. checks Python >= 3.9
  2. creates an isolated .venv
  3. pip-installs requirements.txt inside it (platform aware)
  4. writes .env from .env.example (never overwrites an existing one)
  5. creates data/ for the SQLite journal
  6. optionally launches the server (--run)

Pure stdlib - it runs before any dependency exists.
"""
import os
import shutil
import subprocess
import sys
import venv

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV = os.path.join(ROOT, ".venv")

GOLD = "\033[93m" if os.name != "nt" else ""
GREEN = "\033[92m" if os.name != "nt" else ""
RED = "\033[91m" if os.name != "nt" else ""
RESET = "\033[0m" if os.name != "nt" else ""


def banner():
    print(f"""
{GOLD}  ╔══════════════════════════════════════════════════╗
  ║      🪰  FLY-GOLD-TRADER PRO — AUTO INSTALLER      ║
  ╚══════════════════════════════════════════════════╝{RESET}
""")


def step(msg):
    print(f"{GREEN}[SETUP]{RESET} {msg}")


def venv_python():
    return os.path.join(VENV, "Scripts" if os.name == "nt" else "bin",
                        "python.exe" if os.name == "nt" else "python")


def main():
    banner()
    run_after = "--run" in sys.argv
    port = "5000"
    if "--port" in sys.argv:
        port = sys.argv[sys.argv.index("--port") + 1]

    # 1) python version -----------------------------------------------------
    if sys.version_info < (3, 9):
        print(f"{RED}[SETUP] Python >= 3.9 required "
              f"(found {sys.version.split()[0]}){RESET}")
        return 1
    step(f"Python {sys.version.split()[0]} OK")

    # 2) venv ---------------------------------------------------------------
    if os.path.isdir(VENV):
        step(".venv already exists - reusing")
    else:
        step("creating virtual environment .venv ...")
        venv.create(VENV, with_pip=True)
    py = venv_python()

    # 3) deps ---------------------------------------------------------------
    step("installing requirements (first run downloads ~40 MB) ...")
    r = subprocess.call([py, "-m", "pip", "install", "--upgrade", "pip", "-q"])
    r = subprocess.call([py, "-m", "pip", "install", "-r",
                         os.path.join(ROOT, "requirements.txt")])
    if r != 0:
        print(f"{RED}[SETUP] pip install failed{RESET}")
        return 1
    step("dependencies installed ✔")

    # 4) env ----------------------------------------------------------------
    env_path = os.path.join(ROOT, ".env")
    if not os.path.exists(env_path):
        shutil.copy(os.path.join(ROOT, ".env.example"), env_path)
        step(".env created from .env.example (paper mode by default)")
    else:
        step(".env already present - kept")

    # 5) data dir ------------------------------------------------------------
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    step("data/ ready (SQLite journal)")

    print(f"""
{GREEN}  ✅ Installation complete!{RESET}

  Start the trader:
    Windows : setup.bat --run      (or run.bat)
    Unix    : ./run.sh
    Manual  : .venv/bin/python src/server.py      (or Scripts\\python.exe)

  Dashboard : http://127.0.0.1:{port}   (default mode: PAPER - zero risk)
  Backtest  : .venv/bin/python src/cli.py backtest
  Tests     : .venv/bin/python src/cli.py test
""")
    if run_after:
        step("--run given: launching server ...")
        env = dict(os.environ, PORT=port, AUTO_START="1")
        return subprocess.call([py, os.path.join(ROOT, "src", "server.py")],
                               env=env)
    return 0


if __name__ == "__main__":
    sys.exit(main())
