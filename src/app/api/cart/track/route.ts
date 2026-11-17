import { NextResponse } from 'next/server';
import { trackCart } from '@/lib/marketing';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (rateLimited(req, 'cart-track', 30)) return NextResponse.json({ ok: false }, { status: 429 });
  try {
    const { email, items } = await req.json();
    const ok = await trackCart(email, items);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
