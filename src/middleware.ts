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

  // 2. Extract real client IP (accounting for Traefik / reverse proxies / Cloudflare)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  let clientIp = '127.0.0.1';
  if (cfIp) {
    clientIp = cfIp.trim();
  } else if (forwardedFor) {
    // In multi-proxy setups, x-forwarded-for contains "client, proxy1, proxy2"
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp.trim();
  }

  // Strip IPv6 prefix if present (e.g. ::ffff:192.168.1.1)
  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.replace('::ffff:', '');
  }

  // 3. Check environment variable override first
  const envMaintenanceActive = process.env.MAINTENANCE_MODE === 'true';
  const envAllowedIps = (process.env.MAINTENANCE_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  let isMaintenance = envMaintenanceActive;
  let allowedIps = [...envAllowedIps];

  // 4. Fetch dynamic store setting if not hardcoded in env
  if (!envMaintenanceActive) {
    try {
      const origin = request.nextUrl.origin;
      const res = await fetch(`${origin}/api/settings`, {
        cache: 'no-store',
        headers: { 'x-internal-middleware': 'true' },
      });
      if (res.ok) {
        const settings = await res.json();
        if (settings?.maintenanceMode) {
          isMaintenance = true;
          const dynamicIps = (settings.maintenanceAllowedIps || '')
            .split(',')
            .map((ip: string) => ip.trim())
            .filter(Boolean);
          allowedIps.push(...dynamicIps);
        }
      }
    } catch {
      // Fallback safely to env
    }
  }

  // 5. Verify if client IP is authorized
  const isIpAllowed = allowedIps.some((allowed) => {
    const cleanAllowed = allowed.trim();
    if (!cleanAllowed) return false;
    if (cleanAllowed === '*' || cleanAllowed.toLowerCase() === 'all') return true;
    if (cleanAllowed === clientIp) return true;
    
    // Localhost variations
    if (
      (cleanAllowed === '127.0.0.1' || cleanAllowed === '::1' || cleanAllowed === 'localhost') &&
      (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost')
    ) {
      return true;
    }
    return false;
  });

  // 6. Maintenance Routing
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
