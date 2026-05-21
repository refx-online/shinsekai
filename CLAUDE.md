# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **re;fx** osu! private server monorepo. Eight services, each in its own subdirectory with its own git repo, Dockerfile, and `.env`.

| Service | Language | Role |
|---|---|---|
| `forlorn` | Rust (Axum) | `/web/` handler — score submission, leaderboards, replays, screenshots, direct |
| `omajinai` | Rust (Warp) | PP calculator microservice |
| `recalculate` | Rust (CLI) | Batch score/stat recalculation tool |
| `mist` | TypeScript (Fastify) | Public developer API (`/v1`) |
| `dorchadas` | SvelteKit + Bun | Web frontend |
| `bakenohana` | Crystal (Kemal) | Bancho protocol server (real-time TCP-over-HTTP) |
| `assets-service` | Python (FastAPI) | Seasonal BGs, menu content, medals |
| `updater-service` | Python (FastAPI) | Client/patcher file distribution via R2/local storage |

All services use `--network=host` Docker and share a MySQL (`bancho` DB) + Redis instance. Beatmaps, replays, screenshots, and osz files live in the `meat-my-beat-i_data` Docker volume mounted at `/srv/root/.data`.

---

## forlorn (Rust/Axum)

**Build & run:**
```bash
cd forlorn
cargo build --release          # binary at target/release/forlorn
cargo +nightly fmt --all -- --emit=files   # format
make build && make run         # Docker
```

**Architecture:**
- Workspace with three crates: `forlorn` (main), `webhook` (Discord embed builder), `storage` (R2 + local file abstraction)
- `forlorn/src/routes/mod.rs` — all route registrations; each `/web/` endpoint has both `osu-*` and `refx-*` aliases
- `forlorn/src/usecases/score.rs` — score submission logic (decrypt, validate, calculate pp/accuracy/placement/xp)
- `forlorn/src/infrastructure/redis/publish/` — Redis pub/sub events (score, announce, notify, restrict, refresh_stats)
- `forlorn/src/infrastructure/omajinai/` — HTTP client to omajinai for pp calculation
- `AppState` holds: DB pool, Redis connection + subscriber, R2/local storage, Datadog metrics client, rslock `LockManager`, and two `DashSet`s for unsubmitted/needs-update beatmaps
- Config loaded from env vars via `Config::from_env()` in `forlorn/src/config.rs`

**Key env vars:** `PORT`, `DATABASE_*`, `REDIS_*`, `R2_*`, `OMAJINAI_BASE_URL`, `OMAJINAI_BEATMAP_PATH`, `DISCORD_SCORE_WEBHOOK`, `OSU_API_KEY`

---

## omajinai (Rust/Warp)

**Build & run:**
```bash
cd omajinai
cargo build --release
cargo +nightly fmt --all -- --emit=files
make build && make run
```

**Architecture:**
- Single binary HTTP service (port 1994 default)
- `src/services/beatmap.rs` — in-memory `RwLock<HashMap<i32, Beatmap>>` cache; loads `.osu` files from `BEATMAPS_PATH`
- `src/services/performance.rs` — wraps `refx-pp` crate for pp calculation
- `src/handlers/performance.rs` — POST handler; calls performance service
- Uses `refx-pp` (private fork of rosu-pp) pinned to a specific git rev

**Key env vars:** `PORT`, `CACHE_SIZE`, `BEATMAPS_PATH`

---

## recalculate (Rust/CLI)

**Build & run:**
```bash
cd recalculate
cargo build --release          # binary: target/release/recalc
./target/release/recalc [OPTIONS]
make build && make run ARGS="--no-stats -m 0,1"   # Docker
```

**Options:** `--no-scores`, `--no-stats`, `-m <modes>` (comma-separated mode IDs), `-d` (debug)

**Architecture:**
- Fetches best scores from MySQL, recalculates pp via `refx-pp`, updates `scores` table
- Recomputes weighted pp/accuracy per user, updates `stats` table, refreshes Redis leaderboards
- Supports legacy and lazer scores, custom clock rates, relax (modes 4-6), autopilot (8), cheat (12/16), touch device (20)

**Key env vars:** `DATABASE_URL`, `REDIS_URL`, `BEATMAPS_PATH`, `BEATMAPS_SERVICE_URL`

---

## mist (TypeScript/Fastify)

**Build & run:**
```bash
cd mist
npm install
npm run dev        # ts-node (development)
npm run build      # compile to dist/
npm run start      # run compiled output
```

**Architecture:**
- Single-file route handler: `src/routes/v1.ts` — all endpoints under `/v1`
- `src/repositories/` — one file per domain (users, maps, scores, stats, clans, history, tourney)
- `src/db.ts` — MySQL pool with `fetchOne`/`fetchAll`; **`LIMIT ?` as prepared statement param fails** — always interpolate bounds-checked values directly: `` `LIMIT ${limit}` ``
- `src/redis.ts` — ioredis singleton for rank lookups
- Redis leaderboard keys: `bancho:leaderboard:{mode}` and `bancho:leaderboard:{mode}:{country}`; mode 7 maps to redis key 8
- Float fields must be rounded: `r2()` (2dp), `r3()` (3dp) to match Python orjson output
- Datetime format: `YYYY-MM-DDTHH:MM:SS` (no timezone suffix) via `fmtDatetime()`
- Lazer scores: when `mods_json` present, omit `mods` integer and `mods_readable`; when absent, set `mods_json: null`

**Key env vars:** `REPLAYS_PATH` (default `.data/osr`), MySQL/Redis connection vars

---

## dorchadas (SvelteKit/Bun)

See `dorchadas/CLAUDE.md` for full details.

**Build & run:**
```bash
cd dorchadas
bun run dev        # dev server
bun run build      # production build
bun run check      # type check
bun run ci         # type check + lint
bun run format     # prettier
make build && make run   # Docker
```

**Style:** tabs, single quotes, no trailing commas, 100-col width (`.prettierrc`). Components PascalCase, routes lowercase.

---

## bakenohana (Crystal/Kemal)

**Build & run:**
```bash
cd bakenohana
shards install
crystal run --release src/bakenohana.cr   # run server
shards build                               # compile binary
crystal spec                               # all tests
crystal spec spec/packet_spec.cr          # single spec file
make build && make run                     # Docker
```

**Architecture:**
- Bancho protocol server — the real-time TCP-over-HTTP endpoint the osu! client talks to
- `Middleware::Dispatcher` (`src/app/middleware.cr`) intercepts every request and routes by subdomain before Kemal's router: `c/ce/c4/c5/c6` → Cho (Bancho), `a` → Ava (avatars), `osu` → Web (registration)
- Single `POST /` endpoint handles all client communication: no `osu-token` header = login, with token = packet loop
- `BanchoPacketReader` (`src/app/packets/reader.cr`) — `Iterator(BasePacket)` that walks a `Bytes` slice, reads 7-byte header (id u16 + pad + len u32), dispatches to registered packet class
- Server packets built via `Packets.write` (`src/app/packets/packets.cr`) — takes `ServerPacket` enum + typed `{value, OsuType}` tuples, serialises little-endian
- `PlayerSession` / `ChannelSession` in `src/app/state/sessions.cr` — all live state, mutex-guarded
- `Player` owns a mutex-protected `IO::Memory` queue; `enqueue(Bytes)` / `dequeue : Bytes`
- PP calculation via `librosu_ffi.so` (Crystal C FFI) — `.so` must be at `src/app/lib/native/librosu_ffi.so` at compile time
- Redis pub/sub (`src/app/state/pubsub.cr`) subscribes to `refx:notify`, `refx:restrict`, `refx:refresh_stats`, `refx:recalculate` published by forlorn
- Bot commands registered with `command` macro in `src/app/objects/commands.cr`; prefix set by `BOAT_PREFIX`

**Key env vars:** `PORT`, `DB_HOST/PORT/NAME/USER/PASS`, `REDIS_URL`, `DOMAIN`, `AVA_PATH`, `OMAJINAI_URL`, `OSU_API_KEY`, `BOAT_PREFIX`, `MAP_MIRROR_API`, `DISCORD_RANK_WEBHOOK`

---

## assets-service (Python/FastAPI)

**Build & run:**
```bash
cd assets-service
poetry install
python main.py
make build && make run   # Docker
```

**Routes:** seasonal BGs, menu content (with expiry), medals (served from `.data/assets/`), no database

**Key env vars:** `HOST`, `PORT`, `DEBUG`, `SEASONAL_BGS` (comma-separated), `MENU_ICON_URL`, `MENU_ONCLICK_URL`, `EXPIRES_IN`

---

## updater-service (Python/FastAPI)

**Build & run:**
```bash
cd updater-service
poetry install
python main.py
make build && make run   # Docker
```

**Routes:** stream client/nolimit/patcher files, serve avatars, list file metadata with MD5/size/URL

**Storage backends:** Cloudflare R2 (`aioboto3`) or local filesystem, selected by config. Files organized under `resources/client`, `resources/nolimit`, `resources/patcher`, `resources/ava`.

**Key env vars:** `HOST`, `PORT`, `DEBUG`, `STORAGE_PUBLIC_BASE_URL`, `R2_*`, `LOCAL_STORAGE_ROOT`

---

## Python services (shared conventions)

Both `assets-service` and `updater-service` follow the same layout:
- `main.py` — uvicorn entrypoint
- `app/settings.py` — env var loading via `python-dotenv`
- `app/state/services.py` — service singletons
- `app/route/` or `app/routes/` — route handlers
- Linting: `black` + `isort`; type checking: `mypy` (strict, pydantic plugin)
- Pre-commit hooks configured in `.pre-commit-config.yaml`
