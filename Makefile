# ─────────────────────────────────────────
# Mini ERP + CRM Portal — Docker Makefile
# ─────────────────────────────────────────

.PHONY: up down build logs seed restart clean status

## Start all services (build if needed)
up:
	docker compose up -d --build
	@echo "✅ Services started:"
	@echo "   Frontend → http://localhost:3000"
	@echo "   Backend  → http://localhost:5000"
	@echo "   DB       → localhost:5432"

## Stop all services
down:
	docker compose down

## Build images without starting
build:
	docker compose build

## View live logs for all services
logs:
	docker compose logs -f

## View backend logs only
logs-backend:
	docker compose logs -f backend

## Seed demo data into database
seed:
	docker compose exec backend sh -c "cd /app && npx ts-node /app/prisma/seed.ts" 2>/dev/null || \
	docker compose exec backend sh -c "node -e \"require('./dist/prisma/seed.js')\""  2>/dev/null || \
	echo "Run seed manually: docker compose exec backend node dist/server.js"

## Restart all services
restart:
	docker compose restart

## Check service health status
status:
	docker compose ps

## Stop and remove containers + volumes (CAUTION: deletes data)
clean:
	docker compose down -v --remove-orphans
	@echo "⚠️  All containers and volumes removed."

## Rebuild backend only
rebuild-backend:
	docker compose build backend
	docker compose up -d backend

## Rebuild frontend only
rebuild-frontend:
	docker compose build frontend
	docker compose up -d frontend

## Open a bash shell in backend container
shell-backend:
	docker compose exec backend sh

## Open psql in the database container
shell-db:
	docker compose exec db psql -U erp_user -d erp_crm_db

## Push migrations to database
migrate:
	docker compose exec backend npx prisma migrate deploy

## Show help
help:
	@echo ""
	@echo "Available commands:"
	@echo "  make up              — Build & start all services"
	@echo "  make down            — Stop all services"
	@echo "  make build           — Build Docker images only"
	@echo "  make logs            — Tail all logs"
	@echo "  make seed            — Seed demo data into database"
	@echo "  make status          — View container health status"
	@echo "  make restart         — Restart all services"
	@echo "  make clean           — Stop and remove all data (DESTRUCTIVE)"
	@echo "  make shell-backend   — Shell into backend container"
	@echo "  make shell-db        — PostgreSQL shell in DB container"
	@echo ""
