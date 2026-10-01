import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { getMySQLDatabase } from "./db";
import { getRedisClient } from "./redis";
import { isStaff, isAdmin } from "./privs";

export interface SessionUser {
  id: number;
  name: string;
  priv: number;
  country: string;
  clan_id: number;
}

export async function getUserFromSession(
  sessionToken?: string
): Promise<SessionUser | undefined> {
  if (!sessionToken) return undefined;
  const redis = await getRedisClient();
  if (!redis) return undefined;
  const userId = await redis.get(`user:session:${sessionToken}`);
  if (!userId) return undefined;
  const db = await getMySQLDatabase();
  if (!db) return undefined;
  const user = await db("users").where("id", userId).first();
  return user ?? undefined;
}

export async function currentSessionUser(): Promise<SessionUser | undefined> {
  const store = await cookies();
  return getUserFromSession(store.get("sessionToken")?.value);
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await currentSessionUser();
  if (!user || !isStaff(user.priv)) redirect("/signin");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await currentSessionUser();
  if (!user || !isAdmin(user.priv)) redirect("/signin");
  return user;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // same scheme as the main frontend ($lib/user.ts):
    // stored hash is bcrypt(md5(plain))
    const md5 = createHash("md5").update(password).digest("hex");
    return await bcrypt.compare(md5, hash);
  } catch {
    return false;
  }
}

export async function createSession(userId: number): Promise<string> {
  const redis = await getRedisClient();
  if (!redis) throw new Error("Redis connection failed");
  const token =
    [...crypto.getRandomValues(new Uint8Array(48))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  // 30 days, same convention as the main frontend
  await redis.set(`user:session:${token}`, String(userId), { EX: 60 * 60 * 24 * 30 });
  return token;
}
