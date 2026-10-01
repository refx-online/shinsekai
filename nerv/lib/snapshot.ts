import { getMySQLDatabase } from "./db";

export interface ServiceHealth {
  name: string;
  up: boolean;
  ms: number;
}

export interface Snapshot {
  at: number;
  totals: {
    users: number;
    restricted: number;
    scores: number;
    rankedMaps: number;
    openFlags: number;
    perfReports: number;
  };
  online: { count: number; names: string[] };
  services: ServiceHealth[];
  scores24h: { label: string; value: number }[];
  regs7d: { label: string; value: number }[];
  perMode: { mode: number; count: number }[];
  grades: { grade: string; count: number }[];
  countries: { country: string; count: number }[];
  topPlayers: {
    id: number;
    name: string;
    country: string;
    pp: number;
    plays: number;
    acc: number;
  }[];
  latestScores: {
    id: number;
    pp: number;
    acc: number;
    mode: number;
    grade: string | null;
    username: string;
    user_id: number;
    title: string | null;
  }[];
  latestFlags: {
    score_id: number;
    kind: string;
    reason: string;
    username: string;
    created_at: string;
  }[];
  newestUsers: { id: number; name: string; country: string }[];
  perf: {
    reports24h: number;
    avgFrametime: number;
    totalSpikes: number;
    completionRate: number;
    fpsCaps: { label: string; value: number }[];
  };
  topMaps: { title: string; plays: number }[];
}

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

export async function buildSnapshot(): Promise<Snapshot | null> {
  const db = await getMySQLDatabase();
  if (!db) return null;

  const [[{ users }]] = (await db.raw(
    "SELECT COUNT(*) AS users FROM users"
  )) as unknown as [{ users: number }][];
  const restrictedRow = await db("users")
    .whereRaw("priv & ? = 0", [1])
    .count("* as count")
    .first();
  const [[{ scores }]] = (await db.raw(
    "SELECT COUNT(*) AS scores FROM scores"
  )) as unknown as [{ scores: number }][];
  const rankedRow = await db("maps").where("status", 2).count("* as count").first();
  const flagRow = await db("scores_flag").count("* as count").first();
  const perfRow = await db("performance_reports").count("* as count").first();

  // online players from bancho
  let onlineNames: string[] = [];
  try {
    const res = await fetch("http://localhost:7777/api/v1/get_online", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const text = await res.text();
      onlineNames = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("---") && !l.endsWith("(bot)"));
    }
  } catch {
    // bancho down
  }

  const services = await Promise.all(
    SERVICES.map(async (s) => ({ ...s, ...(await checkService(s.url)) }))
  );

  // scores per hour, last 24h
  const scoreBuckets = (await db("scores")
    .select(db.raw("DATE_FORMAT(play_time, '%Y-%m-%d %H:00') AS bucket"))
    .count("* as count")
    .where("play_time", ">", db.raw("NOW() - INTERVAL 24 HOUR"))
    .groupByRaw("DATE_FORMAT(play_time, '%Y-%m-%d %H:00')")
    .orderByRaw("DATE_FORMAT(play_time, '%Y-%m-%d %H:00')")) as unknown as {
    bucket: string;
    count: number;
  }[];

  // registrations per day, last 7d (kept narrow so bars never overflow)
  const nowSec = Math.floor(Date.now() / 1000);
  const regRows = (await db("users")
    .select("creation_time")
    .where("creation_time", ">", nowSec - 7 * 86400)) as unknown as {
    creation_time: number;
  }[];
  const regMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    regMap.set(`${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`, 0);
  }
  for (const r of regRows) {
    const d = new Date(r.creation_time * 1000);
    const k = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    regMap.set(k, (regMap.get(k) ?? 0) + 1);
  }

  const perMode = (await db("scores")
    .select("mode")
    .count("* as count")
    .groupBy("mode")
    .orderBy("mode")) as unknown as { mode: number; count: number }[];

  const grades = (await db("scores")
    .select("grade")
    .count("* as count")
    .whereNotNull("grade")
    .groupBy("grade")
    .orderByRaw("COUNT(*) DESC")
    .limit(10)) as unknown as { grade: string; count: number }[];

  const countries = (await db("users")
    .select("country")
    .count("* as count")
    .groupBy("country")
    .orderByRaw("COUNT(*) DESC")
    .limit(8)) as unknown as { country: string; count: number }[];

  const topPlayers = await db("stats as st")
    .join("users as u", "u.id", "st.id")
    .select("u.id", "u.name", "u.country", "st.pp", "st.plays", "st.acc")
    .where("st.mode", 0)
    .where("st.pp", ">", 0)
    .orderBy("st.pp", "desc")
    .limit(4);

  const latestScores = await db("scores as s")
    .join("users as u", "u.id", "s.userid")
    .leftJoin("maps as m", "m.md5", "s.map_md5")
    .select(
      "s.id",
      "s.pp",
      "s.acc",
      "s.mode",
      "s.grade",
      "u.id as user_id",
      "u.name as username",
      "m.title"
    )
    .orderBy("s.id", "desc")
    .limit(12);

  const latestFlags = await db("scores_flag as sf")
    .join("users as u", "u.id", "sf.user_id")
    .select("sf.score_id", "sf.kind", "sf.reason", "sf.created_at", "u.name as username")
    .orderBy("sf.created_at", "desc")
    .limit(8);

  const newestUsers = await db("users")
    .select("id", "name", "country")
    .orderBy("creation_time", "desc")
    .limit(6);

  const perfAgg = (await db("performance_reports")
    .select(
      db.raw("COUNT(*) AS n"),
      db.raw("AVG(average_frametime) AS avgft"),
      db.raw("SUM(spike_frames) AS spikes"),
      db.raw("AVG(completion) AS comprate")
    )
    .where("start_time", ">", nowSec - 86400)
    .first()) as unknown as {
    n: number;
    avgft: number | null;
    spikes: number | null;
    comprate: number | null;
  };
  const fpsCaps = (await db("performance_reports")
    .select("fps_cap")
    .count("* as count")
    .groupBy("fps_cap")
    .orderByRaw("COUNT(*) DESC")
    .limit(6)) as unknown as { fps_cap: string; count: number }[];

  const topMaps = (await db("scores as s")
    .join("maps as m", "m.md5", "s.map_md5")
    .select("m.title")
    .count("* as count")
    .groupBy("m.title")
    .orderByRaw("COUNT(*) DESC")
    .limit(6)) as unknown as { title: string; count: number }[];

  return {
    at: Date.now(),
    totals: {
      users: Number(users ?? 0),
      restricted: Number((restrictedRow as any)?.count ?? 0),
      scores: Number(scores ?? 0),
      rankedMaps: Number((rankedRow as any)?.count ?? 0),
      openFlags: Number((flagRow as any)?.count ?? 0),
      perfReports: Number((perfRow as any)?.count ?? 0),
    },
    online: { count: onlineNames.length, names: onlineNames.slice(0, 24) },
    services,
    scores24h: scoreBuckets.map((b) => ({ label: b.bucket.slice(-5), value: Number(b.count) })),
    regs7d: [...regMap.entries()].map(([label, value]) => ({ label, value })),
    perMode: perMode.map((m) => ({ mode: Number(m.mode), count: Number(m.count) })),
    grades: grades.map((g) => ({ grade: g.grade, count: Number(g.count) })),
    countries: countries.map((c) => ({ country: c.country.toUpperCase(), count: Number(c.count) })),
    topPlayers: topPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      country: p.country,
      pp: Math.round(p.pp),
      plays: p.plays,
      acc: Number(p.acc),
    })),
    latestScores: latestScores.map((s: any) => ({
      id: s.id,
      pp: Math.round(s.pp),
      acc: Number(s.acc),
      mode: s.mode,
      grade: s.grade,
      username: s.username,
      user_id: s.user_id,
      title: s.title,
    })),
    latestFlags: latestFlags.map((f: any) => ({
      score_id: f.score_id,
      kind: f.kind,
      reason: f.reason,
      username: f.username,
      created_at: String(f.created_at),
    })),
    newestUsers,
    perf: {
      reports24h: Number(perfAgg?.n ?? 0),
      avgFrametime: Number(perfAgg?.avgft ?? 0),
      totalSpikes: Number(perfAgg?.spikes ?? 0),
      completionRate: Number(perfAgg?.comprate ?? 0) * 100,
      fpsCaps: fpsCaps.map((f) => ({ label: String(f.fps_cap), value: Number(f.count) })),
    },
    topMaps: topMaps.map((m) => ({ title: m.title ?? "unknown", plays: Number(m.count) })),
  };
}
