// Tiny in-memory limiter (per process) to blunt form spam on public endpoints.
const hits = new Map<string, number[]>();

export function rateLimited(req: Request, bucket: string, max = 8, windowMs = 60_000): boolean {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}
