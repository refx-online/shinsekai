import { redirect } from "next/navigation";
import { Card, Gauge, Badge } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { currentSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/privs";

const SERVICES = [
  { name: "bancho", url: "http://localhost:7777/api/v1/get_player_count" },
  { name: "forlorn", url: "http://localhost:3030/web/osu-getfriends.php" },
  { name: "omajinai", url: "http://localhost:1994/health" },
  { name: "mist", url: "http://localhost:7273/v1/get_leaderboard?mode=0" },
  { name: "assets", url: "http://localhost:9929/menu-content.json" },
  { name: "updater", url: "http://localhost:1272/metadata.json" },
  { name: "beatmap", url: "http://localhost:3700/v1/get_beatmaps?b=75" },
];

async function checkService(url: string): Promise<{ up: boolean; ms: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    return { up: res.status < 500, ms: Date.now() - start };
  } catch {
    return { up: false, ms: -1 };
  }
}

export default async function LivePage() {
  const user = await currentSessionUser();
  if (!user || !isStaff(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");

  let online: { name: string; match: string | null }[] = [];
  try {
    const res = await fetch("http://localhost:7777/api/v1/get_online", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const text = await res.text();
      online = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("---") && !l.endsWith("(bot)"))
        .map((l) => {
          const m = l.match(/^(.*) \[match: (.*)\]$/);
          return m ? { name: m[1], match: m[2] } : { name: l, match: null };
        });
    }
  } catch {
    // bancho down — gauges show it
  }

  const services = await Promise.all(
    SERVICES.map(async (s) => ({ ...s, ...(await checkService(s.url)) }))
  );

  const recentScores = await db("scores as s")
    .join("users as u", "u.id", "s.userid")
    .leftJoin("maps as m", "m.md5", "s.map_md5")
    .select("s.id", "s.pp", "s.acc", "s.mode", "u.id as user_id", "u.name as username", "m.artist", "m.title", "m.version")
    .orderBy("s.id", "desc")
    .limit(10);

  const recentUsers = await db("users")
    .select("id", "name", "country")
    .orderBy("creation_time", "desc")
    .limit(8);

  const allUp = services.every((s) => s.up);

  return (
    <main className="flex flex-col gap-4">
      <Card title="LIVE OPS" eyebrow={`${online.length} ONLINE`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Gauge
              key={s.name}
              label={s.name.toUpperCase()}
              value={s.up ? Math.min(100, Math.max(1, s.ms)) : 0}
              max={1000}
              unit="ms"
              color={s.up ? "green" : "red"}
              size={110}
            />
          ))}
        </div>
        {!allUp && (
          <p className="mt-2 text-sm opacity-70">A service is down. See which gauge is red.</p>
        )}
      </Card>

      <Card title="ONLINE NOW" eyebrow={`${online.length} PLAYERS`}>
        {online.length ? (
          <div className="flex flex-wrap gap-2">
            {online.map((p) => (
              <Badge
                key={p.name}
                label={p.match ? `${p.name} ⚔ ${p.match}` : p.name}
              />
            ))}
          </div>
        ) : (
          <p className="opacity-60">Nobody online.</p>
        )}
      </Card>

      <Card title="LATEST SCORES" eyebrow="10 MOST RECENT">
        <div className="flex flex-col gap-1 font-mono text-sm">
          {recentScores.map((s: any) => (
            <div key={s.id}>
              #{s.id} {s.username} {Math.round(s.pp)}pp{" "}
              {s.artist ? `${s.artist} - ${s.title} [${s.version}]` : s.mode}
            </div>
          ))}
        </div>
      </Card>

      <Card title="NEWEST ACCOUNTS" eyebrow="8 MOST RECENT">
        <div className="flex flex-wrap gap-2">
          {recentUsers.map((u: any) => (
            <Badge key={u.id} label={`${u.name} (${u.country})`} />
          ))}
        </div>
      </Card>
    </main>
  );
}
