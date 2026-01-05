import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function getIp(req: any) {
  // Vercel manda IP en headers
  const h = req?.headers;
  return (
    h?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    h?.get?.("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimitLogin(username: string, req: any) {
  const ip = getIp(req);
  const key = `login:${username}:${ip}`;

  // 5 intentos cada 10 minutos
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 600);
  }

  if (current > 5) {
    throw new Error("TOO_MANY_ATTEMPTS");
  }
}
