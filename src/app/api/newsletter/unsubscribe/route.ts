import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/marketing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const ok = await unsubscribeByToken(String(token || ''));
    if (!ok) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('newsletter unsubscribe', e);
    return NextResponse.json({ error: 'No se pudo procesar la baja.' }, { status: 500 });
  }
}
