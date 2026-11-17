import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sendCampaignBatch, normalizeEmail, EMAIL_RE } from '@/lib/marketing';
import { sendMail } from '@/lib/mailer';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const BATCH = 20;

/**
 * Body: { subject, html, offset?: number, testTo?: string }
 * With testTo, sends a single test message. Otherwise sends one batch (BATCH recipients) starting at
 * `offset`; the admin UI calls it repeatedly with the returned `next` until `done` is true.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const b = await req.json();
    const subject = String(b.subject ?? '').trim().slice(0, 200);
    const html = String(b.html ?? '').trim();
    if (!subject || !html) return NextResponse.json({ error: 'Asunto y contenido son obligatorios' }, { status: 400 });

    if (b.testTo) {
      const to = normalizeEmail(b.testTo);
      if (!EMAIL_RE.test(to)) return NextResponse.json({ error: 'Correo de prueba no válido' }, { status: 400 });
      const ok = await sendMail(to, `[PRUEBA] ${subject}`, html);
      return NextResponse.json({ test: true, sent: ok ? 1 : 0 });
    }

    const offset = Math.max(0, Math.floor(Number(b.offset) || 0));
    return NextResponse.json(await sendCampaignBatch(subject, html, offset, BATCH));
  } catch (e) {
    return apiError(e, 'Error al enviar la campaña');
  }
}
