# speedforce — endpoint contract required by the osu!(lazer) client

Derived from the client source at `/srv/refx-main/refx-lazer` (fork of `ppy/osu`,
branch `refx`), cross-checked against `ppy/osu-framework` and the reference server
`/srv/refx-main/reference/osu-server-spectator`.

This document supersedes the "speedforce service design" section of `notes.md` and
corrects several claims in it (see §8). Nothing here is implemented yet.

Active endpoint config is `RefxEndpointConfiguration` (`osu.Game/Online/RefxEndpointConfiguration.cs`),
overridden in `osu.Desktop/OsuGameDesktop.cs:114-116`:

| Field | Value |
|---|---|
| `APIUrl` | `https://api.041095.xyz` (override `REFX_API_URL`) |
| `WebsiteUrl` | `https://refx.041095.xyz` (override `REFX_WEBSITE_URL`) |
| `MultiplayerUrl` | `{APIUrl}/signalr/multiplayer` |
| `SpectatorUrl` | `{APIUrl}/signalr/spectator` |
| `MetadataUrl` | `{APIUrl}/signalr/metadata` |
| `APIClientID` | `5` |
| `APIClientSecret` | `""` — **must be set**, see §5 |
| `BeatmapSubmissionServiceUrl` | `null` (beatmap upload disabled) |
| `LivenessProbeUrl` | `null` (outage mechanism disabled) |

---

## 1. Minimum viable set

To get from launch to a playable client, in the order the client calls them:

| # | Call | Blocking? | Notes |
|---|---|---|---|
| 1 | `POST /oauth/token` `grant_type=password` | **yes** | must return `access_token`, `expires_in`, `refresh_token` |
| 2 | `GET /api/v2/me/` | **yes** | trailing slash. This *is* the login payload |
| 3 | `GET /api/v2/friends` | no | fires on `APIState.Online` |
| 4 | `GET /api/v2/blocks` | no | fires on `APIState.Online` |
| 5 | `GET /api/v2/me/beatmapset-favourites` | no | fires on `APIState.Online` |
| 6 | `GET /api/v2/notifications` | no | must return `notification_endpoint` or chat stays dead |
| 7 | `POST /signalr/{metadata,spectator,multiplayer}/negotiate` | no | then WebSocket upgrade |
| 8 | `GET /api/v2/chat/channels`, `/chat/ack`, `/chat/updates` | no | chat comes online over the notifications socket |

Then, to actually play something:

| Call | Purpose |
|---|---|
| `GET /api/v2/beatmapsets/search` | song select |
| `GET /api/v2/beatmapsets/{id}` or `/beatmapsets/lookup?beatmap_id=` | selected map detail |
| `GET /api/v2/beatmaps/lookup?id=&checksum=` | specific difficulty |
| **`GET /api/v2/beatmapsets/{id}/download`** | **the `.osz` — must be a real playable archive** |
| `GET /api/v2/beatmaps/{id}/scores` | leaderboard after play |

Score submission is 2-phase:

| Step | Call |
|---|---|
| mint token | `POST /api/v2/beatmaps/{beatmapId}/solo/scores` (form: `version_hash`, `beatmap_hash`, `ruleset_id`) → `{"id": <token>}` |
| submit | `PUT /api/v2/beatmaps/{beatmapId}/solo/scores/{token}` with `SoloScoreInfo` JSON |

Multiplayer variant: `POST /api/v2/rooms/{roomId}/playlist/{itemId}/scores` then
`PUT /api/v2/rooms/{roomId}/playlist/{itemId}/scores/{token}`.

---

## 2. Full `/api/v2` inventory

67 endpoint-bearing request classes + `Solo/` + `Rooms/`. No `[Obsolete]` markers
anywhere in `API/Requests/` — all are live.

### Session / current user
| Method | Path | Auth |
|---|---|---|
| POST | `/oauth/token` | client creds in form |
| POST | `/users` (**not** `/api/v2` — registration) | anonymous |
| GET | `/api/v2/me/` , `/api/v2/me/{mode}` | user |
| PUT | `/api/v2/me/options` | user |
| GET | `/api/v2/me/beatmapset-favourites` | user |
| POST | `/api/v2/session/verify`, `/verify/reissue`, `/verify/mail-fallback` | user |

### Users
| Method | Path | Auth |
|---|---|---|
| GET | `/api/v2/users/{lookup}/{mode}?key={id\|username}` | public |
| GET | `/api/v2/users/?ids[]=` (≤50), `/users/lookup/?ids[]=[&ruleset_id=]` | public |
| GET | `/api/v2/search?mode=user&query=` | public |
| GET/POST/DELETE | `/api/v2/friends`, `/friends/{id}?target=` | user |
| GET/POST/DELETE | `/api/v2/blocks`, `/blocks/{id}?target=` | user |
| GET | `/api/v2/users/{id}/scores/{best\|firsts\|recent\|pinned}` | public |
| GET | `/api/v2/users/{id}/beatmapsets/{favourite\|ranked\|loved\|pending\|guest\|graveyard\|nominated\|most_played}` | public |
| GET | `/api/v2/users/{id}/kudosu`, `/recent_activity` | public |

### Beatmaps
| Method | Path | Auth |
|---|---|---|
| GET | `/api/v2/beatmapsets/search` (`q`,`c`,`m`,`s`,`g`,`l`,`sort`,`e`,`r`,`played`,`nsfw`, cursor) | public |
| GET | `/api/v2/beatmapsets/{id}`, `/beatmapsets/lookup?beatmap_id=` | public |
| GET | `/api/v2/beatmapsets/{id}/download[?noVideo=1]` | public |
| POST | `/api/v2/beatmapsets/{id}/favourites?action=` | user |
| GET | `/api/v2/beatmaps/?ids[]=`, `/beatmaps/lookup?id=&checksum=&filename=` | public |
| PUT/DELETE | `/api/v2/beatmaps/{id}/tags/{tagId}` | user |
| GET | `/api/v2/tags` | public |

There is **no difficulty endpoint** — `difficulty_rating` ships inside the beatmap
objects. Minimum fields the client reads: `id`, `beatmapset_id`, `difficulty_rating`,
`mode_int`, `version`, `status`, `checksum`, `count_circles|count_sliders|count_spinners`,
`cs|ar|accuracy|drain`, `total_length|hit_length`, `bpm`, `failtimes`, `max_combo`.

### Scores
| Method | Path | Auth |
|---|---|---|
| GET | `/api/v2/beatmaps/{id}/scores?type=&mode=&mods[]=&limit=` | public |
| POST/PUT | `/api/v2/beatmaps/{id}/solo/scores[/{token}]` | user |
| GET | `/api/v2/scores/{id}/download` | public |

### Rooms (REST side of multiplayer)
`GET|POST /api/v2/rooms`, `GET|DELETE /api/v2/rooms/{id}`,
`PUT|DELETE /api/v2/rooms/{id}/users/{userId}[?password=]`,
`GET /api/v2/rooms/{id}/leaderboard`,
`GET|POST /api/v2/rooms/{id}/playlist/{itemId}/scores`,
`GET /api/v2/rooms/{id}/playlist/{itemId}/scores/{scoreId}`,
`GET /api/v2/rooms/{id}/playlist/{itemId}/scores/users/{userId}`.

Real-time state is the MPv2 hub, not REST — see §4.

### Rankings
`GET /api/v2/rankings/{mode}/{performance|score|country|charts}[?page=&country=|spotlight=]`,
`/rankings/kudosu`, `/rankings/osu/performance` (hardcoded), `/api/v2/spotlights`.

### Chat / notifications
`GET|POST /api/v2/chat/channels`, `GET /api/v2/chat/channels/{id}`,
`POST /api/v2/chat/new`, `GET|POST /api/v2/chat/channels/{id}/messages`,
`PUT /api/v2/chat/channels/{id}/mark-as-read/{messageId}`,
`PUT|DELETE /api/v2/chat/channels/{id}/users/{userId}`,
`POST /api/v2/chat/ack`, `GET /api/v2/chat/updates[?channel=&since=&includes[]=presence]`,
`GET /api/v2/notifications`.

### Misc
`GET /api/v2/news`, `/wiki/{culture}/{path}`, `/changelog`, `/changelog/{name}/{version}`,
`/seasonal-backgrounds`, `/comments`, `POST /api/v2/comments`, `POST|DELETE /api/v2/comments/{id}/vote`,
`DELETE /api/v2/comments/{id}`, `POST /api/v2/reports`, `POST /api/v2/screenshots`.

### Disabled in our config
`PUT|PATCH {BeatmapSubmissionServiceUrl}/beatmapsets` — beatmap authoring only, and
`RefxEndpointConfiguration` sets it `null`, which makes all three throw
`NotSupportedException`. Never touched in normal play. **Do not build.**

---

## 3. What the client does *not* need

Worth stating explicitly, since notes.md previously implied otherwise:

- **No `/web/` bancho endpoints.** Zero references to legacy bancho in the lazer tree.
- **No `/.well-known/*` OAuth discovery, no JWKS, no `/oauth/authorize`.** `git grep`
  finds zero hits. The client never validates the JWT signature — it treats the access
  token as opaque. There is no PKCE and no browser round-trip; the login panel posts
  username/password straight to `/oauth/token` (ROPC).
- **No `menu-content.json`.** `GetMenuContentRequest` hard-codes `assets.ppy.sh` but has
  zero live references — dead code. (assets-service already serves this for stable.)
- **No HTML pages from `WebsiteUrl`.** It only builds links and hands them to the OS
  browser. A wrong value won't break login.
- **No liveness probe.** Field is `null`; leave it that way. It is the one thing that can
  hard-lock users out of online play.
- **No store/marketplace** — removed from the client.

---

## 4. Non-REST endpoints

### SignalR hubs ×3
Each requires, in order:
```
POST {hubUrl}/negotiate?negotiateVersion=1     Accept: */*
GET  {hubUrl}?id={connectionToken}             Upgrade: websocket
```
Both carry `Authorization: Bearer <jwt>`, `X-Osu-Version-Hash` (32 hex, MD5 of the exe),
`X-Client-Session-ID` (must be a parseable GUID), `X-Requested-With: XMLHttpRequest`.

Protocol is **MessagePack only**. The reference server explicitly removes JSON:
`options.SupportedProtocols?.Remove("json")`. Both sides must use
`SignalRUnionWorkaroundResolver.OPTIONS` or `[Union]` types (6 union families) break.

`ClientCheckVersion` must be **false** (the reference gate) or every hub call fails with
`InvalidStateException` until `osu_build` is seeded with our hash and `allow_bancho = 1`.

### Notifications WebSocket — *not* SignalR
`GET /api/v2/notifications` returns a `notification_endpoint` field. The client opens a
bare `ClientWebSocket` there with `Authorization: Bearer`. Frames are
`{event, data, error}` JSON. Client sends `chat.start` / `chat.end`; expects
`chat.channel.join`, `chat.channel.part`, `chat.message.new`, `new_private_notification`,
`verified`, `logout`. **`logout` forces a full client logout**, so don't emit it spuriously.

Chat is multiplexed over this same socket. Presence comes from
`GET /api/v2/chat/updates?since=0&includes[]=presence`.

### Beatmap download
`GET /APIUrl}/api/v2/beatmapsets/{id}/download[?noVideo=1]` on the **API host**. Returns a
ZIP. Must contain at least one `.osu` plus its audio, and any background/video unless
`noVideo=1`. **No single zip entry may exceed 100 MB** — `ZipArchiveReader.MaximumEntrySize`
throws `InsufficientMemoryException` beyond that. Lazer follows redirects on the same
HttpClient, so a 302 to a CDN is fine, but the bearer token only rides the original request.

### Avatars — **currently blocked, needs a client patch**
`APIUser.avatar_url` is loaded through `TrustedDomainOnlineStore`
(`osu.Game/Online/TrustedDomainOnlineStore.cs:12-21`), which rejects any host not ending
in `.ppy.sh`:

```csharp
if (!Uri.TryCreate(url, UriKind.Absolute, out Uri? uri) || !uri.Host.EndsWith(@".ppy.sh", ...))
{
    Logger.Log($@"Blocking resource lookup from external website: {url}", ...);
    return string.Empty;
}
```

So an `avatar_url` on `api.041095.xyz` is **silently dropped** and every avatar falls back
to the guest texture. `osu.Game/OsuGameBase.cs:307` uses the same store, so beatmap cover
artwork from our domain is blocked too. This file is not patched in our fork. One-line fix:
also trust `*.041095.xyz`. (Stable is unaffected — it has its own path.)

---

## 5. Auth spec

### `/oauth/token` request
**Content-Type is `multipart/form-data`, not `application/x-www-form-urlencoded`.**
Verified: `osu!framework/IO/Network/WebRequest.cs:340-350` builds a
`MultipartFormDataContent` for any request with form parameters, and line 342 *throws* if
you combine form parameters with a custom Content-Type. `OAuth.cs:206-212` uses
`AddParameter`, so the token request is multipart. PHP absorbs this transparently, which is
why it works against osu-web — **a FastAPI app must have `python-multipart` installed** or
it will see zero fields and return `invalid_grant` forever.

| Parameter | Value |
|---|---|
| `grant_type` | `password` or `refresh_token` |
| `client_id` | `5` |
| `client_secret` | must match `oauth_clients` |
| `scope` | literally `*` |
| `username` / `password` | password grant only |
| `refresh_token` | refresh grant only |

Client credentials come from the **form body only** — no HTTP Basic, no `Authorization`
header on the token request.

### `/oauth/token` response
| Field | Requirement |
|---|---|
| `access_token` | mandatory, non-empty |
| `expires_in` | **mandatory JSON number**, seconds. Omit it and `OAuthToken.ExpiresIn` goes negative → `IsValid` false → immediate `Logout()`. Client requires **> 30s** remaining |
| `refresh_token` | mandatory in practice — persisted as `accessToken\|expiry\|refreshToken`; without it the session dies when the access token expires |
| `token_type` / `scope` | ignored by the client |

Errors: non-2xx is what matters (401 → login error screen). Body `{"error": ..., "hint": ...}`.

### JWT for the hubs
The game client doesn't parse the token, but **our own SignalR server validates it**, so:

| Requirement | Value |
|---|---|
| Algorithm | **RS256** (asymmetric). `notes.md` says HS256 — that is wrong, see §8 |
| `aud` | `"5"` |
| `iss` | not validated |
| `scopes` | must contain `"*"` |
| `jti` | must be present — used as the token lookup key |
| `sub` / `osu_user_id` | the osu! user id |

Policy: `RequireAuthenticatedUser()` + `RequireClaim("scopes", "*")`
(`osu-server-spectator/Startup.cs:110-114`). RS256 because the reference loads an RSA
public key from `oauth-public.key` (`ConfigureJwtBearerOptions.cs:59,159-181`).

Either maintain a token table for revocation lookups, or skip the DB check and put
`osu_user_id` straight in the JWT — equivalent from the client's view and much simpler.

### Refresh behaviour
`/oauth/token` is hit on **every** `AccessToken` read, including each hub negotiate, and
**synchronously inside a lock**. A slow token endpoint stalls hub negotiation. On refresh
failure the client discards the token entirely and logs out — so make it reliable, and
don't return 401 for a request that used a still-valid refresh token.

---

## 6. Gotchas that will silently break the client

1. **Trailing slashes matter.** `GetMeRequest.Target` is `me/{Ruleset?.ShortName}`; with
   no ruleset the URL is literally `/api/v2/me/`. Same for `/api/v2/users/{id}/`. A strict
   router that 301-redirects will break the client's POST/PUT bodies.
2. **`ids[]` is repeated in the query string**, up to 50 per request. `GetUsersRequest` and
   `GetBeatmapsRequest` must be parsed as multi-valued.
3. **Some "body" params are actually query params** — `AddFriend`/`BlockUser`/`JoinRoom`
   use `?target=` / `?password=`.
4. **`x-api-version` header** on every REST call. Value is `AssemblyVersion.Major*10000+Minor`
   on deployed builds (so `10000` for our `1.0.x`), else `yyyymmdd`. Don't reject on it.
5. **Status codes are load-bearing.** `APIState.Failing` is entered after 3 consecutive
   failures; 4xx on `/api/v2/me` logs the user out, 5xx retries forever. Returning 500
   during startup bricks the client UI.
6. **Return correct `Content-Type` on error.** The client parses `{"error": "..."}` out of
   the body of a failing response to raise `APIException`. 401/403 trigger full logout.
7. **`.osz` entries must be under 100 MB each** or import throws.
8. **Don't set `session_verification_method`** in `/api/v2/me` unless you also implement
   `/api/v2/session/verify` — return `null` to skip 2FA entirely.

---

## 7. Suggested build order

Each step is independently verifiable against a real client.

1. **`/oauth/token` + `/api/v2/me/`** — nothing else works until login does. Verify by
   watching the client reach `APIState.Online`.
2. **`/api/v2/beatmapsets/search`, `/beatmapsets/{id}`, `/beatmaps/{id}/download`** — song
   select and actual gameplay. We already serve full `.osz` from `beatmap-service`.
3. **Score submission** (mint + PUT) wired to the existing `forlorn` `/web/` handlers.
4. **`/signalr/metadata`** — presence, lowest-value hub, small method set (8 methods).
5. **`/signalr/spectator`** — needed so online play feels right; frame data is optional at
   first.
6. **`/signalr/multiplayer`** — the big one (~6,200 LOC reference). Room creation also has
   to go through an osu-web-style `_lio` interop, since room IDs originate server-side.
7. **Chat + notifications socket** — only worth it once the above work.

Steps 1–3 are small and unblock solo play. Step 6 is the bulk of the effort and is where
MPv2 crossplay work lands anyway.

---

## 8. Corrections to `notes.md`

The existing "speedforce service design" section contains several claims that would
produce a server the client rejects:

| notes.md says | Actually |
|---|---|
| `HS256 JWT` | **RS256** — the reference hub loads an RSA public key |
| SignalR hubs "with `\x1e` record separator" (JSON framing) | **MessagePack only**; the server removes the JSON protocol outright |
| hubs at `/metadata`, `/spectator` | our config resolves to `{APIUrl}/signalr/*` — must be mounted at that prefix |
| `/oauth/token` supports `client_credentials` | the game client only uses `password` + `refresh_token`; `client_credentials` is tournament/referee-only |
| `JWT_ALGORITHM` as a knob | only one algorithm is accepted by the hub validator |
| chat WS at a fixed `/home/notifications/feed` | the URL is whatever `notification_endpoint` returns; the field name matters |
| avatar URLs from our domain | blocked by `TrustedDomainOnlineStore` until patched |
| `migrated by alembic 0001_lazer_extras` etc. | schema is undesigned; `oauth_tokens` needs `(jti, user_id, expires_at, revoked)` if revocation is wanted |

`APIState` transitions and the full startup ordering are in `osu.Game/Online/API/APIAccess.cs:178-461`
— read that before writing the login path.