#!/usr/bin/env bash
# Start the PRO server with the project venv
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then echo "[RUN] not installed yet - running ./setup.sh"; ./setup.sh; fi
./.venv/bin/python src/server.py
