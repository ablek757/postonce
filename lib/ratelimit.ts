// 内存版限流：按 IP 每日 N 次（M1 够用；重启进程计数清零）
const DAILY_LIMIT = Number(process.env.RATE_LIMIT_PER_DAY ?? 50) || 50;

interface Bucket {
  date: string;
  count: number;
}

const buckets = new Map<string, Bucket>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const date = todayKey();
  let bucket = buckets.get(ip);
  if (!bucket || bucket.date !== date) {
    bucket = { date, count: 0 };
    buckets.set(ip, bucket);
  }

  if (bucket.count >= DAILY_LIMIT) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return {
      ok: false,
      limit: DAILY_LIMIT,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - bucket.count };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
