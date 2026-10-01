import { NextResponse, type NextRequest } from "next/server";
import { getRedisClient } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sessionToken")?.value;
  if (token) {
    const redis = await getRedisClient();
    if (redis) await redis.del(`user:session:${token}`).catch(() => {});
  }
  const base =
    process.env.PUBLIC_NERV_URL && process.env.PUBLIC_NERV_URL.startsWith("http")
      ? process.env.PUBLIC_NERV_URL
      : new URL(request.url).origin;
  const res = NextResponse.redirect(new URL("/signin", base));
  res.cookies.set("sessionToken", "", { path: "/", maxAge: 0 });
  return res;
}
