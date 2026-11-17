import { NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/marketing';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (rateLimited(req, 'newsletter')) {
    return NextResponse.json({ error: 'Demasiados intentos, espera un minuto.' }, { status: 429 });
  }
  try {
    const body = await req.json();
    if (body.consent !== true) {
      return NextResponse.json({ error: 'Debes aceptar la política de privacidad.' }, { status: 400 });
    }
    const source = ['footer', 'popup'].includes(body.source) ? body.source : 'footer';
    await subscribeToNewsletter(body.email, source);
    // Same answer whether or not the address was already subscribed (no account enumeration).
    return NextResponse.json({ ok: true, message: 'Te hemos enviado un correo para confirmar tu suscripción.' });
  } catch (e) {
    if (e instanceof Error && e.message === 'INVALID_EMAIL') {
      return NextResponse.json({ error: 'Introduce un correo válido.' }, { status: 400 });
    }
    console.error('newsletter subscribe', e);
    return NextResponse.json({ error: 'No se pudo completar la suscripción.' }, { status: 500 });
  }
}
