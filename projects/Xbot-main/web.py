"""Standalone web entry (the app lives in front.web).

Run standalone:  python web.py     (web only)
Run full stack:  python run.py     (bot + web — Railway uses this)
"""
from config import settings
from front.web import app, main  # noqa: F401  (app for gunicorn-style servers)

if __name__ == "__main__":
    main(port=settings.port or 5000)
