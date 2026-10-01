import { redirect } from "next/navigation";
import { Card, Button, Badge, InputField } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import { currentSessionUser } from "@/lib/auth";
import { isAdmin, Privileges, hasPrivilege } from "@/lib/privs";

async function staff() {
  const user = await currentSessionUser();
  if (!user || !isAdmin(user.priv)) redirect("/signin");
  return user;
}

async function logToDiscord(message: string) {
  const url = process.env.DISCORD_WEBHOOK_LOG;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message, username: "Nerv" }),
  }).catch(() => {});
}

async function updateField(formData: FormData) {
  "use server";
  const me = await staff();
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");
  const userId = Number(formData.get("userId"));
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!userId || !field) throw new Error("Missing required fields");

  if (field === "name" && (value.length < 3 || value.length > 20)) {
    throw new Error("Username must be 3-20 characters");
  }
  if (field === "priv") {
    const v = Number(value);
    const maxPriv = Object.values(Privileges).reduce((s: number, p) => s | (p as number), 0);
    if (isNaN(v) || v < 0 || v > maxPriv) throw new Error("Invalid privilege value");
  }

  const patch: Record<string, unknown> =
    field === "name"
      ? { [field]: value, safe_name: value.toLowerCase().trim().replace(/ /g, "_") }
      : field === "priv"
        ? { [field]: Number(value) }
        : { [field]: value };
  await db("users").where("id", userId).update(patch);
  await logToDiscord(`${me.name} (${me.id}) updated user ${userId}'s ${field}!`);
  redirect(`/nerv/u/${userId}`);
}

async function toggleRestrict(formData: FormData) {
  "use server";
  const me = await staff();
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");
  const userId = Number(formData.get("userId"));
  const user = await db("users").where("id", userId).first();
  if (!user) throw new Error("User not found.");
  if (user.id === 1) throw new Error("Asuka said no.");
  const restricted = !hasPrivilege(user.priv, Privileges.UNRESTRICTED);
  const newPriv = restricted
    ? user.priv | Privileges.UNRESTRICTED
    : user.priv & ~Privileges.UNRESTRICTED;
  await db("users").where("id", userId).update({ priv: newPriv });
  await logToDiscord(
    `${me.name} (${me.id}) ${restricted ? "unrestricted" : "restricted"} ${user.name} (${user.id})!`
  );
  redirect(`/nerv/u/${userId}`);
}

async function silence(formData: FormData) {
  "use server";
  const me = await staff();
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");
  const userId = Number(formData.get("userId"));
  const duration = Number(formData.get("duration"));
  const reason = String(formData.get("reason") ?? "");
  if (!duration || !reason) throw new Error("Duration and reason are required");
  const user = await db("users").where("id", userId).first();
  if (!user) throw new Error("User not found.");
  if (user.id === 1) throw new Error("Asuka said no.");
  const silenceEnd = Math.floor(Date.now() / 1000) + duration * 3600;
  await db("users").where("id", userId).update({ silence_end: silenceEnd });
  await logToDiscord(
    `${me.name} (${me.id}) silenced ${user.name} (${user.id}) for ${duration} hours! Reason: ${reason}`
  );
  redirect(`/nerv/u/${userId}`);
}

async function wipe(formData: FormData) {
  "use server";
  const me = await staff();
  const db = await getMySQLDatabase();
  const redis = await getRedisClient();
  if (!db || !redis) throw new Error("Backend connection failed");
  const userId = Number(formData.get("userId"));
  const modes = String(formData.get("modes") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n));
  if (!modes.length) throw new Error("No modes selected (comma-separated ids)");
  const user = await db("users").where("id", userId).first();
  if (!user) throw new Error("User not found");
  if (user.id === 1) throw new Error("Asuka said no.");

  await db.transaction(async (trx) => {
    await trx("stats").whereIn("mode", modes).where("id", userId).update({
      tscore: 0, rscore: 0, pp: 0, plays: 0, playtime: 0, acc: 0.0,
      max_combo: 0, total_hits: 0, replay_views: 0, xh_count: 0,
      x_count: 0, sh_count: 0, s_count: 0, a_count: 0, xp: 0,
    });
    await trx("scores").whereIn("mode", modes).where("userid", userId).del();
    await trx("users_log").where("user_id", userId).del();
  });

  for (const mode of modes) {
    await redis.zRem(`bancho:leaderboard:${mode}`, String(userId));
    await redis.zRem(`bancho:leaderboard:${mode}:${user.country}`, String(userId));
  }

  await logToDiscord(
    `${me.name} (${me.id}) wiped ${user.name} (${user.id}) on modes: ${modes.join(", ")}!`
  );
  redirect(`/nerv/u/${userId}`);
}

export default async function NervUserPage({ params }: { params: Promise<{ userId: string }> }) {
  await staff();
  const { userId } = await params;
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");

  const user = await db("users").where("id", userId).first();
  if (!user) throw new Error("User not found.");

  const stats = await db("stats").where("id", userId).orderBy("mode");
  const scores = await db("scores").where("userid", userId).orderBy("id", "desc").limit(10);
  const flags = await db("scores_flag").where("user_id", userId).orderBy("created_at", "desc");

  const restricted = !hasPrivilege(user.priv, Privileges.UNRESTRICTED);

  return (
    <main className="flex flex-col gap-4">
      <Card
        title={`${user.name} [#${user.id}]`}
        eyebrow={`${user.country.toUpperCase()} · PRIV ${user.priv}`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge label={restricted ? "RESTRICTED" : "ACTIVE"} variant={restricted ? "danger" : "success"} />
          <Badge label={`SILENCED: ${user.silence_end > 0 ? "YES" : "NO"}`} />
        </div>
        <form action={toggleRestrict} className="mt-3">
          <input type="hidden" name="userId" value={user.id} />
          <Button type="submit" variant="danger">
            {restricted ? "Unrestrict" : "Restrict"}
          </Button>
        </form>
      </Card>

      <Card title="EDIT FIELD" eyebrow="NAME / PRIV / COUNTRY">
        <form action={updateField} className="flex flex-wrap gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <InputField label="Field" name="field" defaultValue="country" />
          <InputField label="Value" name="value" defaultValue={user.country} />
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <Card title="SILENCE" eyebrow="HOURS + REASON">
        <form action={silence} className="flex flex-wrap gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <InputField label="Hours" name="duration" defaultValue="24" />
          <InputField label="Reason" name="reason" />
          <Button type="submit" variant="danger">
            Silence
          </Button>
        </form>
      </Card>

      <Card title="WIPE" eyebrow="DESTRUCTIVE">
        <form action={wipe} className="flex flex-wrap gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <InputField label="Modes (comma ids)" name="modes" defaultValue="0,1,2,3" />
          <Button type="submit" variant="danger">
            Wipe scores
          </Button>
        </form>
      </Card>

      <Card title="STATS" eyebrow={`${stats.length} MODES`}>
        <div className="font-mono text-sm">
          {stats.map((s: any) => (
            <div key={s.mode}>
              mode {s.mode}: {s.pp}pp / {s.plays} plays / {Number(s.acc).toFixed(2)}%
            </div>
          ))}
        </div>
      </Card>

      <Card title="FLAGS" eyebrow={`${flags.length} OPEN`}>
        <div className="font-mono text-sm">
          {flags.length === 0 && <p className="opacity-60">No flags on this user.</p>}
          {flags.map((f: any) => (
            <div key={`${f.score_id}-${f.kind}`}>
              #{f.score_id} [{f.kind}] {f.reason}
            </div>
          ))}
        </div>
      </Card>

      <Card title="RECENT SCORES" eyebrow="10 LATEST">
        <div className="font-mono text-sm">
          {scores.map((s: any) => (
            <div key={s.id}>
              #{s.id} mode={s.mode} {Math.round(s.pp)}pp {Number(s.acc).toFixed(2)}%
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
