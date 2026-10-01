import { NextResponse } from "next/server";
import { currentSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/privs";
import { buildSnapshot } from "@/lib/snapshot";

export async function GET() {
  const user = await currentSessionUser();
  if (!user || !isStaff(user.priv)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const snap = await buildSnapshot();
  if (!snap) {
    return NextResponse.json({ error: "backend unavailable" }, { status: 503 });
  }
  return NextResponse.json(snap, {
    headers: { "Cache-Control": "no-store" },
  });
}
