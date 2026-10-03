#!/usr/bin/env bash
# Fly-Gold-Trader PRO - one-click installer (Linux / macOS)
#   ./setup.sh          -> install only
#   ./setup.sh --run    -> install AND start the server
set -e
cd "$(dirname "$0")"
PY=$(command -v python3 || command -v python)
if [ -z "$PY" ]; then
  echo "[SETUP] python3 not found - install Python 3.9+ first"; exit 1
fi
"$PY" install.py "$@"
