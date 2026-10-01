import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | undefined;
let isRedisConnected = false;

export const getRedisClient = async (): Promise<RedisClientType | null> => {
  if (redisClient && isRedisConnected) return redisClient;

  const host = process.env.REDIS_HOST ?? "127.0.0.1";
  const port = process.env.REDIS_PORT ?? "6379";
  const db = process.env.REDIS_DB ?? "0";
  const user = process.env.REDIS_USER;
  const password = process.env.REDIS_PASSWORD;

  if (!/^\d+$/.test(String(db))) return null;

  let url = "redis://";
  if (user && password) url += `${user}:${password}@`;
  url += `${host}:${port}`;

  try {
    const client = createClient({ url, database: parseInt(String(db)) });
    client.on("error", () => {
      isRedisConnected = false;
    });
    await client.connect();
    await client.ping();
    isRedisConnected = true;
    return (redisClient = client as RedisClientType);
  } catch {
    isRedisConnected = false;
    return null;
  }
};
