import { redirect } from "next/navigation";
import { Card, DataGrid, Button, Badge } from "@mdrbx/nerv-ui";
import { getMySQLDatabase } from "@/lib/db";
import { currentSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/privs";

async function dismissFlag(scoreId: number, kind: string) {
  "use server";
  const user = await currentSessionUser();
  if (!user || !isAdmin(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");
  await db("scores_flag").where({ score_id: scoreId, kind }).del();
  redirect("/nerv/flags");
}

export default async function FlagsPage() {
  const user = await currentSessionUser();
  if (!user || !isAdmin(user.priv)) redirect("/signin");
  const db = await getMySQLDatabase();
  if (!db) throw new Error("Database connection failed");

  const flags = await db("scores_flag as sf")
    .join("users as u", "u.id", "sf.user_id")
    .join("scores as s", "s.id", "sf.score_id")
    .leftJoin("maps as m", "m.md5", "s.map_md5")
    .select(
      "sf.score_id",
      "sf.kind",
      "sf.reason",
      "sf.created_at",
      "u.id as user_id",
      "u.name as username",
      "s.pp",
      "s.acc",
      "s.mode",
      "m.artist",
      "m.title",
      "m.version"
    )
    .orderBy("sf.created_at", "desc")
    .limit(100);

  return (
    <main className="flex flex-col gap-4">
      <Card title="SCORE FLAGS" eyebrow={`${flags.length} OPEN`}>
        {flags.length === 0 ? (
          <p className="opacity-60">Queue is empty. Suspicious scores land here on submit.</p>
        ) : (
          <DataGrid
            columns={[
              { key: "score_id", header: "SCORE" },
              { key: "username", header: "PLAYER" },
              { key: "kind", header: "KIND" },
              { key: "reason", header: "REASON" },
              { key: "pp", header: "PP" },
              { key: "action", header: "" },
            ]}
            data={flags.map((f: any) => ({
              score_id: f.score_id,
              username: f.username,
              kind: f.kind,
              reason: f.reason,
              pp: Math.round(f.pp),
              action: "",
            }))}
          />
        )}
      </Card>
      {flags.map((f: any) => (
        <form
          key={`${f.score_id}-${f.kind}`}
          action={dismissFlag.bind(null, f.score_id, f.kind)}
        >
          <Button type="submit" variant="danger" size="sm">
            Dismiss #{f.score_id} ({f.kind})
          </Button>
        </form>
      ))}
      <Card title="LEGEND" eyebrow="HOW TO READ">
        <p className="opacity-70">
          Dismiss the noise. Restrict from the user page when it is real.{" "}
          <Badge variant="warning" label="overcheat" /> = malformed assist values.{" "}
          <Badge variant="warning" label="mods_conflict" /> = illegal mod combo.
        </p>
      </Card>
    </main>
  );
}
