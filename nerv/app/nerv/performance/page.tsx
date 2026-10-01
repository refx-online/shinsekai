import { redirect } from "next/navigation";
import { Card, DataGrid } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { currentSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/privs";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const user = await currentSessionUser();
  if (!user || !isStaff(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");

  const { user: userFilter } = await searchParams;
  const q = (userFilter ?? "").trim();

  const query = db("performance_reports as pr")
    .join("scores as s", "s.id", "pr.scoreid")
    .join("users as u", "u.id", "s.userid")
    .select(
      "pr.scoreid",
      "pr.mod_mode",
      "pr.os",
      "pr.fullscreen",
      "pr.fps_cap",
      "pr.frame_count",
      "pr.spike_frames",
      "pr.aim_rate",
      "pr.completion",
      "pr.average_frametime",
      "u.id as user_id",
      "u.name as username",
      "s.pp",
      "s.mode"
    )
    .orderBy("pr.scoreid", "desc")
    .limit(100);

  if (/^\d+$/.test(q)) query.where("u.id", Number(q));
  else if (q) query.where("u.name", "like", `%${q}%`);

  const reports = await query;

  const flag = (r: any): string => {
    const f: string[] = [];
    if (!r.frame_count) f.push("no frames");
    if (r.spike_frames > 50) f.push(`${r.spike_frames} spikes`);
    if (r.average_frametime > 33) f.push(`${r.average_frametime}ms avg`);
    if (!r.completion) f.push("quit");
    return f.join(", ") || "-";
  };

  return (
    <main className="flex flex-col gap-4">
      <Card title="PERFORMANCE REPORTS" eyebrow="CLIENT TELEMETRY">
        <form method="GET" className="mb-3 flex gap-2">
          <input
            name="user"
            defaultValue={q}
            placeholder="user id or name"
            className="border px-2 py-1 text-sm"
          />
          <button type="submit" className="border px-3 py-1 text-sm">
            Filter
          </button>
        </form>
        {reports.length === 0 ? (
          <p className="opacity-60">No reports yet — they land here as plays are submitted.</p>
        ) : (
          <DataGrid
            columns={[
              { key: "scoreid", header: "SCORE" },
              { key: "username", header: "PLAYER" },
              { key: "mode", header: "MODE" },
              { key: "pp", header: "PP" },
              { key: "fps", header: "FPS CAP" },
              { key: "frames", header: "FRAMES" },
              { key: "spikes", header: "SPIKES" },
              { key: "avg", header: "AVG MS" },
              { key: "hz", header: "AIM HZ" },
              { key: "flags", header: "FLAGS" },
            ]}
            data={reports.map((r: any) => ({
              scoreid: r.scoreid,
              username: r.username,
              mode: `${r.mod_mode} (${r.mode})`,
              pp: Math.round(r.pp),
              fps: r.fps_cap,
              frames: r.frame_count,
              spikes: r.spike_frames,
              avg: r.average_frametime,
              hz: r.aim_rate || "-",
              flags: flag(r),
            }))}
          />
        )}
      </Card>
    </main>
  );
}
