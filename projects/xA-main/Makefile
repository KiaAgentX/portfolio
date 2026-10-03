.PHONY: dev up down logs test seed admin-build fmt

COMPOSE=docker compose

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f api worker hermes

dev:
	$(COMPOSE) up --build

test:
	python -m pytest tests -q

seed:
	python scripts/seed_db.py
	python scripts/ingest_knowledge.py
	python scripts/create_admin.py

admin-build:
	cd apps/admin && npm ci && npm run build

fmt:
	python -m ruff check --fix packages apps tests || true
