import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'bohoart_admin_token';
// Read at request time; with no secret configured no admin token is ever accepted.
const getSecret = () => process.env.JWT_SECRET || '';

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Verifies an HS256 JWT signed with JWT_SECRET (Edge-safe, no Node crypto) and checks role/expiry. */
async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(parts[2]) as BufferSource,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
    if (payload.role !== 'ADMIN') return false;
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = await isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);

  // Admin panel requires a valid admin session (API routes enforce their own auth).
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 1. Always allow static assets, Next.js internal paths, favicon, images, and admin/auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api/my-ip') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname === '/logo.png' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. If user is logged in as Admin (valid signed session), ALWAYS allow access to the entire site
  if (isAdmin) {
    return NextResponse.next();
  }

  // 3. Extract all candidate client IPs (accounting for Traefik, reverse proxies, Cloudflare, etc.)
  const candidateIps: string[] = [];

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) candidateIps.push(cfIp.trim());

  const realIp = request.headers.get('x-real-ip');
  if (realIp) candidateIps.push(realIp.trim());

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    forwardedFor.split(',').forEach((ip) => {
      const trimmed = ip.trim();
      if (trimmed) candidateIps.push(trimmed);
    });
  }

  // Clean candidate IPs (strip IPv6 prefix and strip port if present)
  const cleanCandidateIps = candidateIps.map((rawIp) => {
    let ip = rawIp;
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    // If IPv4 with port (e.g. 103.95.126.234:54321), extract only the IP
    if (ip.includes('.') && ip.includes(':')) {
      ip = ip.split(':')[0];
    }
    return ip.trim();
  });

  // Always include localhost as fallback candidate if nothing found
  if (cleanCandidateIps.length === 0) {
    cleanCandidateIps.push('127.0.0.1');
  }

  // 4. Check environment variable override first
  const envMaintenanceActive = process.env.MAINTENANCE_MODE === 'true';
  const envAllowedIps = (process.env.MAINTENANCE_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  let isMaintenance = envMaintenanceActive;
  let allowedIps = [...envAllowedIps];

  // 5. Fetch dynamic store setting using internal localhost port (failsafe inside Docker)
  try {
    const port = process.env.PORT || 3000;
    const internalUrl = `http://127.0.0.1:${port}/api/settings`;
    const res = await fetch(internalUrl, {
      cache: 'no-store',
      headers: { 'x-internal-middleware': getSecret() },
    });
    if (res.ok) {
      const settings = await res.json();
      if (settings?.maintenanceMode !== undefined) {
        isMaintenance = Boolean(settings.maintenanceMode);
        const dynamicIps = (settings.maintenanceAllowedIps || '')
          .split(',')
          .map((ip: string) => ip.trim())
          .filter(Boolean);
        allowedIps.push(...dynamicIps);
      }
    }
  } catch {
    // If internal fetch fails, fallback to environment variable
  }

  // 6. Clean allowed IPs list
  const cleanAllowedIps = allowedIps.map((allowed) => {
    let ip = allowed.trim();
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    if (ip.includes('.') && ip.includes(':')) ip = ip.split(':')[0];
    return ip;
  }).filter(Boolean);

  // 7. Verify if ANY candidate IP is authorized
  const isIpAllowed = cleanAllowedIps.some((allowed) => {
    if (allowed === '*' || allowed.toLowerCase() === 'all') return true;
    
    return cleanCandidateIps.some((clientIp) => {
      if (allowed === clientIp) return true;
      // Localhost variations
      if (
        (allowed === '127.0.0.1' || allowed === '::1' || allowed === 'localhost') &&
        (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost')
      ) {
        return true;
      }
      return false;
    });
  });

  // 8. Maintenance Routing
  if (isMaintenance && !isIpAllowed) {
    if (pathname !== '/mantenimiento') {
      const maintenanceUrl = new URL('/mantenimiento', request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
    return NextResponse.next();
  }

  // If maintenance is turned OFF, redirect away from /mantenimiento
  if (!isMaintenance && pathname === '/mantenimiento') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
