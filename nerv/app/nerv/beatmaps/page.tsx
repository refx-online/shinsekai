import { redirect } from "next/navigation";
import { Card, DataGrid, Button, InputField } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import { currentSessionUser } from "@/lib/auth";
import { canModifyMapStatus } from "@/lib/privs";
import { RankedStatus, statusStringToId } from "@/lib/beatmap-status";
import { fetchBeatmap } from "@/lib/mist";

const REFX_REFRESH_CHANNEL = "refx:refresh_bmap_cache";
const FORLORN_REFRESH_CHANNEL = "forlorn:refresh_map";

async function rankAction(formData: FormData) {
  "use server";
  const user = await currentSessionUser();
  if (!user || !canModifyMapStatus(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  const redis = await getRedisClient();
  if (!db || !redis) throw new Error("Backend connection failed");

  const status = String(formData.get("status") ?? "");
  const scope = String(formData.get("scope") ?? "map");
  const beatmapId = Number(formData.get("beatmapId"));
  if (!status || (scope !== "map" && scope !== "set") || !beatmapId) {
    throw new Error("Invalid rank request");
  }
  const newStatus = statusStringToId(status);

  const beatmap = await db("maps").where("id", beatmapId).first();
  if (!beatmap) throw new Error("Beatmap not found");

  await db.transaction(async (trx) => {
    if (scope === "set") {
      await trx("maps").where("set_id", beatmap.set_id).update({ status: newStatus, frozen: 1 });
    } else {
      await trx("maps").where("id", beatmap.id).update({ status: newStatus, frozen: 1 });
    }
    const ids = await trx("maps")
      .where(scope === "set" ? "set_id" : "id", scope === "set" ? beatmap.set_id : beatmap.id)
      .select("id");
    if (ids.length) {
      await trx("map_requests").whereIn("map_id", ids.map((m: any) => m.id)).update({ active: 0 });
    }
  });

  await db("scores").where("map_md5", beatmap.md5).update({ map_status: newStatus });

  if (scope === "set") {
    const setMaps = await db("maps").where("set_id", beatmap.set_id).select("id");
    for (const map of setMaps) {
      await redis.publish(REFX_REFRESH_CHANNEL, `${map.id}|${newStatus}`);
    }
  } else {
    await redis.publish(REFX_REFRESH_CHANNEL, `${beatmap.id}|${newStatus}`);
  }
  await redis.publish(FORLORN_REFRESH_CHANNEL, beatmap.md5);

  const webhookUrl = process.env.DISCORD_WEBHOOK_RANK;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${user.name} changed map ${beatmap.id} status to ${status}!`,
      }),
    }).catch(() => {});
  }

  redirect(`/nerv/beatmaps?id=${beatmap.id}`);
}

async function dismissAction(formData: FormData) {
  "use server";
  const user = await currentSessionUser();
  if (!user || !canModifyMapStatus(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Missing request id");
  await db("map_requests").where("id", id).update({ active: 0 });
  redirect("/nerv/beatmaps");
}

export default async function BeatmapsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await currentSessionUser();
  if (!user || !canModifyMapStatus(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");

  const { id } = await searchParams;
  const lookupId = id && /^\d+$/.test(id) ? Number(id) : null;
  let info: any = null;
  if (lookupId) {
    try {
      const res = await fetchBeatmap(lookupId);
      if (res.status === "success") info = (res as any).map ?? res;
    } catch {
      info = null;
    }
  }

  const queue = await db("map_requests as mr")
    .join("maps as m", "m.id", "mr.map_id")
    .join("users as u", "u.id", "mr.player_id")
    .select(
      "mr.id",
      "mr.map_id",
      "u.name as requester",
      "m.title",
      "m.artist",
      "m.version",
      "m.set_id",
      "m.status"
    )
    .where("mr.active", 1)
    .orderBy("mr.datetime", "asc");

  return (
    <main className="flex flex-col gap-4">
      <Card title="BEATMAP RANKING" eyebrow="BAT REQUIRED">
        <form method="GET" className="mb-3 flex gap-2">
          <InputField label="Beatmap ID" name="id" defaultValue={lookupId ?? ""} />
          <Button type="submit">Lookup</Button>
        </form>

        {info && (
          <div className="mb-3">
            <p>
              {info.artist} - {info.title} [{info.version}] (status {info.status})
            </p>
            <form action={rankAction} className="mt-2 flex gap-2">
              <input type="hidden" name="beatmapId" value={info.id} />
              <select name="status" defaultValue="ranked">
                <option value="ranked">Ranked</option>
                <option value="approved">Approved</option>
                <option value="qualified">Qualified</option>
                <option value="loved">Loved</option>
                <option value="pending">Pending</option>
              </select>
              <select name="scope" defaultValue="map">
                <option value="map">Map</option>
                <option value="set">Set</option>
              </select>
              <Button type="submit">Apply</Button>
            </form>
          </div>
        )}
      </Card>

      <Card title="RANKING QUEUE" eyebrow={`${queue.length} PENDING`}>
        {queue.length === 0 ? (
          <p className="opacity-60">// No pending requests //</p>
        ) : (
          <DataGrid
            columns={[
              { key: "map_id", header: "MAP" },
              { key: "title", header: "TITLE" },
              { key: "requester", header: "BY" },
            ]}
            data={queue.map((r: any) => ({
              map_id: r.map_id,
              title: `${r.artist} - ${r.title} [${r.version}]`,
              requester: r.requester,
            }))}
          />
        )}
        {queue.map((r: any) => (
          <form key={r.id} action={dismissAction} className="mt-1 inline-block">
            <input type="hidden" name="id" value={r.id} />
            <Button type="submit" size="sm" variant="ghost">
              Dismiss #{r.map_id}
            </Button>
          </form>
        ))}
      </Card>
    </main>
  );
}
