import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedsysConfig, parseRedsysNotification } from '@/lib/redsys';
import { confirmPayment } from '@/lib/workshopService';

export const dynamic = 'force-dynamic';

/**
 * Notificación online de Redsys (webhook, POST x-www-form-urlencoded).
 * Solo se actúa si la firma HMAC-SHA256 es válida; el importe y el pedido se comprueban contra la reserva.
 * Responde 200 cuando la notificación es legítima (aunque el pago fuera denegado) para que Redsys no reintente.
 */
export async function POST(req: Request) {
  const cfg = getRedsysConfig();
  if (!cfg) return NextResponse.json({ error: 'Redsys no configurado' }, { status: 503 });

  let params: string, signature: string;
  try {
    const form = await req.formData();
    params = String(form.get('Ds_MerchantParameters') ?? '');
    signature = String(form.get('Ds_Signature') ?? '');
  } catch {
    return NextResponse.json({ error: 'Formato no válido' }, { status: 400 });
  }

  const n = params && signature ? parseRedsysNotification(cfg, params, signature) : null;
  if (!n) {
    console.warn('Redsys: notificación con firma no válida');
    return NextResponse.json({ error: 'Firma no válida' }, { status: 403 });
  }
  if (!n.approved) return NextResponse.json({ ok: true, approved: false });

  const booking = await prisma.workshopBooking.findFirst({ where: { paymentMethod: 'REDSYS', paymentRef: n.order } });
  if (!booking) {
    console.error(`Redsys: pedido ${n.order} aprobado sin reserva asociada`);
    return NextResponse.json({ error: 'Pedido desconocido' }, { status: 404 });
  }
  const expectedCents = Math.round(Number(booking.depositAmount) * 100);
  if (n.amountCents !== expectedCents) {
    console.error(`Redsys: importe distinto en ${booking.reference}: ${n.amountCents} vs ${expectedCents} céntimos`);
    return NextResponse.json({ error: 'Importe no coincide' }, { status: 409 });
  }

  const r = await confirmPayment(booking.id, { method: 'REDSYS', ref: n.order, amount: n.amountCents / 100 });
  if (!r.ok) console.error(`Redsys: no se pudo confirmar ${booking.reference}: ${r.reason}`);
  return NextResponse.json({ ok: true, approved: true });
}
