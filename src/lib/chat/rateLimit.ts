// Per-IP sliding-window rate limit plus a global daily budget cap, so a
// flood (distributed or not) can't drain the Groq API key.
//
// This is an in-memory Map, which is per-serverless-instance on Vercel —
// limits are therefore approximate across instances, not exact. That's an
// acceptable tradeoff for a portfolio site's chat widget: zero dependencies,
// zero cost. If exact global limits are ever needed, swap this module for
// @upstash/ratelimit + Vercel KV; callers only depend on `checkRateLimit`.

interface Window {
  count: number;
  resetAt: number;
}

const PER_IP_LIMIT = 10;
const PER_IP_WINDOW_MS = 60_000; // 10 req / 60s
const PER_IP_HOURLY_LIMIT = 60;
const PER_IP_HOURLY_WINDOW_MS = 60 * 60_000;
const GLOBAL_DAILY_LIMIT = 500;
const GLOBAL_DAILY_WINDOW_MS = 24 * 60 * 60_000;

const perIpMinute = new Map<string, Window>();
const perIpHour = new Map<string, Window>();
let globalDay: Window = { count: 0, resetAt: Date.now() + GLOBAL_DAILY_WINDOW_MS };

function hit(map: Map<string, Window>, key: string, windowMs: number, limit: number): boolean {
  const now = Date.now();
  const w = map.get(key);
  if (!w || now >= w.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (w.count >= limit) return false;
  w.count += 1;
  return true;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  if (now >= globalDay.resetAt) {
    globalDay = { count: 0, resetAt: now + GLOBAL_DAILY_WINDOW_MS };
  }
  if (globalDay.count >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, retryAfterSeconds: Math.ceil((globalDay.resetAt - now) / 1000) };
  }

  if (!hit(perIpMinute, ip, PER_IP_WINDOW_MS, PER_IP_LIMIT)) {
    const w = perIpMinute.get(ip)!;
    return { allowed: false, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
  }
  if (!hit(perIpHour, ip, PER_IP_HOURLY_WINDOW_MS, PER_IP_HOURLY_LIMIT)) {
    const w = perIpHour.get(ip)!;
    return { allowed: false, retryAfterSeconds: Math.ceil((w.resetAt - now) / 1000) };
  }

  globalDay.count += 1;
  return { allowed: true };
}

// Vercel sets x-forwarded-for as "client, proxy1, proxy2, ...". The first
// entry is the real client IP; trusting the whole header (or the last
// entry) lets a client spoof extra entries to rotate their apparent IP.
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}
