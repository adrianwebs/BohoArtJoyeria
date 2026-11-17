import { NextResponse } from 'next/server';
import { subscribeStockNotification } from '@/lib/marketing';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (rateLimited(req, 'stock-notify')) {
    return NextResponse.json({ error: 'Demasiados intentos, espera un minuto.' }, { status: 429 });
  }
  try {
    const { productId, email } = await req.json();
    const r = await subscribeStockNotification(String(productId || ''), email);
    if (r === 'invalid') return NextResponse.json({ error: 'Correo o producto no válido.' }, { status: 400 });
    if (r === 'in-stock') return NextResponse.json({ error: 'Este producto ya tiene stock.' }, { status: 409 });
    return NextResponse.json({ ok: true, message: 'Listo, te avisaremos en cuanto vuelva a estar disponible.' });
  } catch (e) {
    console.error('stock notification', e);
    return NextResponse.json({ error: 'No se pudo guardar el aviso.' }, { status: 500 });
  }
}
