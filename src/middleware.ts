import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // 2. If user is logged in as Admin (cookie present), ALWAYS allow access to the entire site
  const adminToken = request.cookies.get('bohoart_admin_session')?.value;
  if (adminToken) {
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
      headers: { 'x-internal-middleware': 'true' },
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
