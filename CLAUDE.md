# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

## Layout

Working directory is `/srv/refx-main`. This monorepo lives at `/srv/refx-main/refx`.

```
/srv/refx-main/
├── refx/            this monorepo
├── refx-stable/     stable osu! client fork (branch 041095)
└── reference/       read-only upstream clones used as protocol references
    ├── osu-upstream/            ppy/osu
    └── osu-server-spectator/    ppy/osu-server-spectator (lazer MPv2 server)
```

Every service is a git submodule with its own repo, Dockerfile and `.env`. Never
commit `.env`, build output, or caches.

| Service | Language | Port | Role |
|---|---|---|---|
| `forlorn` | Rust (Axum) | 3030 | `/web/` — score submission, leaderboards, replays, screenshots |
| `omajinai` | Rust (Warp) | 1994 | PP calculator microservice |
| `recalculate` | Rust (CLI) | — | Batch score/stat recalculation tool |
| `mist` | TypeScript (Fastify) | 7273 | Public developer API (`/v1`) |
| `dorchadas` | SvelteKit + Bun | 3001 | Web frontend |
| `bakenohana` | Crystal (Kemal) | 7777 | Bancho protocol server (real-time TCP-over-HTTP) |
| `beatmap-service` | Node (Fastify) | 3700 | Beatmap metadata + `.osu`/`.osz` mirroring |
| `nerv` | Next.js 16 (standalone) | 3100 | Staff console (local setup only, in `docker-compose.override.yml`) |
| `assets-service` | Python (FastAPI) | 9929 | Seasonal BGs, menu content, medals |
| `updater-service` | Python (FastAPI) | 1272 | Client/patcher file distribution via R2/local |

`speedforce` (lazer API v2 + OAuth) is declared in `docker-compose.yml` but the
upstream repo is empty, so it is gated behind the `lazer` profile and does not
build. Plain `make run` skips it.

All services run `--network=host` and share MySQL (db `bancho`) + Redis. Persistent
data lives in the `union_data` volume at `/srv/root/.data` inside containers;
local bind mounts live under `/srv/refx-data`.

## Build & run

```bash
docker compose up -d              # whole stack
docker compose build <service> && docker compose up -d <service>
docker images <service>-latest --format '{{.CreatedSince}}'   # confirm a build landed
```

The last command matters. Several long debugging sessions were wasted chasing
phantom behaviour because a build had failed and the old image kept running.
Always confirm the image timestamp advanced before diagnosing the server.

Per-service native builds:

| Service | Install | Build | Test | Lint/format |
|---|---|---|---|---|
| `forlorn` | — | `cargo build --release` | `cargo test` | `cargo +nightly fmt --all -- --emit=files` |
| `omajinai` | — | `cargo build --release` | `cargo test` | `cargo +nightly fmt --all -- --emit=files` |
| `recalculate` | — | `cargo build --release` | `cargo test` | `cargo +nightly fmt --all -- --emit=files` |
| `beatmap-service` | `npm ci` | `npm run build` | — | — |
| `mist` | `npm install` | `npm run build` | — | — |
| `dorchadas` | — | `bun run build` | `bun run check` | `bun run ci`, `bun run format` |
| `bakenohana` | `shards install` | `shards build` | `crystal spec` | `crystal tool format` |
| `assets-service` | `poetry install` | — | — | `black`, `isort`, `mypy` |
| `updater-service` | `poetry install` | — | — | `black`, `isort`, `mypy` |

## Conventions

- Boring lowercase commit messages. Do not push, open PRs, or merge without an
  explicit request.
- Per-service style: `dorchadas` uses tabs, single quotes, no trailing commas,
  100-col. Python services use `black` + `isort` with strict `mypy`.
- Schema lives in `init.sql` at the repo root. It is applied by MySQL only on
  first container init, so changing it requires a manual migration to affect a
  running database.

## Gotchas that cause real bugs

- **Gamemode IDs are dense `0–15`**, not `0–7`: vanilla `0–3`, relax `4–6`,
  autopilot `7`, cheat `8–11`, cheat-relax `12–14`, cheat-autopilot `15`. Use
  `Gamemode#as_vn` in bakenohana for wire encoding — never `% 4`, since
  `21 % 4` lands on the wrong ruleset.
- **Beatmap approval is per-mode.** `maps.status_mask` is a 3-bit-per-mode mask
  (`-3→0, -1→1, 0→2, 1→3, 2→4, 3→5, 4→6, 5→7`), not a single status. Any query
  selecting or filtering maps must project it explicitly or leaderboards break.
- **`mist`: `LIMIT ?` fails as a prepared-statement param.** Interpolate
  bounds-checked values directly: `` `LIMIT ${limit}` ``.
- **`mist` output must match Python orjson.** Round floats with `r2()` (2dp) /
  `r3()` (3dp) and format datetimes as `YYYY-MM-DDTHH:MM:SS` via `fmtDatetime()`
  (no timezone suffix).
- **Lazer score rows:** when `mods_json` is present, omit the `mods` integer and
  `mods_readable`; when absent, set `mods_json: null`.
- **bakenohana paths are `src/transport/`, `src/state/`, `src/domain/`** — not
  `src/app/`. Read `bakenohana/CLAUDE.md` before editing it; the file layout
  changed and older docs are wrong.
- **bakenohana needs `librosu_ffi.so`** present at
  `src/app/lib/native/librosu_ffi.so` at compile time for PP calculation.
- **nerinyan (the `.osz` upstream) rate-limits bursts.** `beatmap-service`
  retries with exponential backoff; a naive loop of first-time downloads will
  surface as spurious `beatmap set not found`.
- Lazer `.osz` endpoints must return a full playable archive, not a bare `.osu`.
  Multiplayer stages block until every client reports the map locally available.

## Per-service detail

`bakenohana/CLAUDE.md`, `beatmap-service/CLAUDE.md`, `mist/CLAUDE.md`,
`dorchadas/CLAUDE.md`, `nerv/CLAUDE.md`.

## Local notes

`notes.md` in the repo root is gitignored. It holds design docs, protocol
research, incident logs and decisions that do not belong in a committed file.
Consult it for background, but treat `CLAUDE.md` as authoritative for anything
that must stay correct.
