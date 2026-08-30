import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow static files, Next internals, assets and auth/admin routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname === '/logo.png' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Extract Client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  let clientIp = '127.0.0.1';
  if (cfIp) {
    clientIp = cfIp.trim();
  } else if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp.trim();
  }

  // 3. Check environment variable hardcoded override first
  const envMaintenanceActive = process.env.MAINTENANCE_MODE === 'true';
  const envAllowedIps = (process.env.MAINTENANCE_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  // 4. Fetch dynamic store setting if not hardcoded in env
  let isMaintenance = envMaintenanceActive;
  let allowedIps = [...envAllowedIps];

  try {
    // If not forced by env, check store settings API internally
    if (!envMaintenanceActive) {
      const url = new URL('/api/settings', request.url);
      const res = await fetch(url.toString(), { next: { revalidate: 10 } });
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
    }
  } catch {
    // Fallback gracefully to env setting
  }

  // Normalize allowed IPs list
  const isIpAllowed = allowedIps.some((allowed) => {
    if (allowed === '*' || allowed === 'all') return true;
    if (allowed === clientIp) return true;
    // Handle localhost variations
    if ((allowed === '127.0.0.1' || allowed === '::1' || allowed === 'localhost') &&
        (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp === 'localhost')) {
      return true;
    }
    return false;
  });

  // 5. Handle Maintenance Routing
  if (isMaintenance && !isIpAllowed) {
    if (pathname !== '/mantenimiento') {
      const maintenanceUrl = new URL('/mantenimiento', request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
    return NextResponse.next();
  }

  // If maintenance is OFF but user is on /mantenimiento, redirect to home
  if (!isMaintenance && pathname === '/mantenimiento') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
