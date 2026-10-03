#!/bin/sh
set -e
export PORT="${PORT:-8088}"
exec python -m uvicorn server:app --host 0.0.0.0 --port "$PORT"
