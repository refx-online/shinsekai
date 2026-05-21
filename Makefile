COMPOSE := docker compose
SERVICE ?= forlorn

.PHONY: run run-infra stop down logs rebuild \
        mysql redis shell \
        recalc clean help

# ── Dev workflow ──────────────────────────────────────────────────────────────

## Start all services in the foreground (Ctrl-C to stop)
run:
	$(COMPOSE) up

## Start only MySQL + Redis (useful when running microservices outside Docker)
run-infra:
	$(COMPOSE) up mysql redis

## Stop running services without removing containers
stop:
	$(COMPOSE) stop

## Stop and remove containers (keeps volumes)
down:
	$(COMPOSE) down --remove-orphans

## Follow logs for all services; pass SERVICE= to filter one
logs:
	$(COMPOSE) logs -f $(if $(filter-out forlorn,$(SERVICE)),$(SERVICE),)

## Rebuild all images then start in foreground
rebuild:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up

## Rebuild a single service image: make rebuild-svc SERVICE=mist
rebuild-svc:
	$(COMPOSE) build --no-cache $(SERVICE)

# ── Shells & CLIs ─────────────────────────────────────────────────────────────

## Open a MySQL shell as the app user
mysql:
	$(COMPOSE) exec mysql mysql -u$${MYSQL_USER} -p$${MYSQL_PASSWORD} $${MYSQL_DATABASE}

## Open a Redis CLI session
redis:
	$(COMPOSE) exec redis redis-cli -p $${REDIS_PORT:-6379}

## Open a shell inside a running container: make shell SERVICE=forlorn
shell:
	$(COMPOSE) exec $(SERVICE) sh

# ── One-off tools ─────────────────────────────────────────────────────────────

## Run the recalculate CLI (pass ARGS= for flags): make recalc ARGS="--no-stats -m 0,1"
recalc:
	$(COMPOSE) run --rm --profile tools recalculate $(ARGS)

# ── Cleanup ───────────────────────────────────────────────────────────────────

## Remove containers AND volumes (destructive — wipes MySQL/Redis data)
clean:
	$(COMPOSE) down -v --remove-orphans

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@grep -E '^##' Makefile | sed 's/## //'
