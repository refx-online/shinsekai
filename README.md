# shinsekai

Docker Compose orchestration layer for the re;fx osu! private server.

## Services

| Service | Role | Port |
|---|---|---|
| `bakenohana` | Bancho protocol (TCP-over-HTTP) | 7777 |
| `forlorn` | `/web/` handler (scores, replays, leaderboards) | 3030 |
| `omajinai` | PP calculator microservice | 1994 |
| `mist` | Public developer API (`/v1`) | 7273 |
| `dorchadas` | Web frontend | 3000 |
| `assets-service` | Seasonal BGs, menu content, medals | 9929 |
| `updater-service` | Client/patcher file distribution | 1272 |
| `cloudflared` | Cloudflare Tunnel | — |
| `mysql` | MySQL 8.0 | 3306 |
| `redis` | Redis 7 | 6379 |

## Prerequisites

- Docker + Docker Compose v2
- Each service directory must have a `.env` (copy from `.env.example`)

## Setup

```sh
# 1. Configure shared infra vars
cp .env.example .env
$EDITOR .env   # set TUNNEL_TOKEN, MYSQL_*, REDIS_*

# 2. Configure each service
for svc in bakenohana forlorn omajinai mist dorchadas assets-service updater-service recalculate; do
  cp $svc/.env.example $svc/.env
done

# 3. Start everything
make run
```

On first start, `init.sql` is automatically applied to MySQL.

## Commands

```sh
make run                        # start all services (foreground)
make run-infra                  # start MySQL + Redis only
make stop                       # stop without removing containers
make down                       # stop + remove containers
make rebuild                    # full image rebuild + start
make rebuild-svc SERVICE=mist   # rebuild one image
make logs                       # follow all logs
make logs SERVICE=forlorn       # follow one service
make mysql                      # MySQL shell
make redis                      # Redis CLI
make shell SERVICE=forlorn      # shell into container
make recalc ARGS="--no-stats"   # run recalculate CLI
make clean                      # remove containers + volumes (destructive)
```

## Volumes

| Volume | Purpose |
|---|---|
| `union_data` | Shared beatmaps, replays, screenshots, osz files (`/srv/root/.data`) |
| `mysql_data` | MySQL data directory |
| `redis_data` | Redis AOF persistence |

## Networking

All services use `--network=host`. No port mapping — each service binds directly to its configured port on the host. `cloudflared` exposes services externally via Cloudflare Tunnel without opening inbound firewall ports.

## Startup order

```
mysql + redis → bakenohana → forlorn
             ↘ mist
             ↘ dorchadas
```

`recalculate` is excluded from `make run` (profile: `tools`). Run on demand with `make recalc`.
