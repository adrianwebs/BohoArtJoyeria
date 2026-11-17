import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildRedsysForm, getRedsysConfig, newRedsysOrder } from '@/lib/redsys';
import { getBookingByReference, hasSeatsFor, WorkshopError } from '@/lib/workshopService';
import { appBaseUrl, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Devuelve los campos firmados del formulario de pago de Redsys (el navegador los envía por POST al TPV). */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const cfg = getRedsysConfig();
    if (!cfg) return NextResponse.json({ error: 'El pago con tarjeta (Redsys) no está configurado' }, { status: 503 });

    const { ref } = await params;
    const b = await getBookingByReference(ref);
    if (!b) throw new WorkshopError('Reserva no encontrada', 404);
    if (b.status !== 'PENDING') throw new WorkshopError('Esta reserva ya no está pendiente de pago', 409);
    if (!(await hasSeatsFor(b))) throw new WorkshopError('Lo sentimos, esta fecha se acaba de completar', 409);

    // Un nº de pedido nuevo por intento: Redsys rechaza repetir pedidos ya procesados.
    const order = newRedsysOrder();
    await prisma.workshopBooking.update({ where: { id: b.id }, data: { paymentMethod: 'REDSYS', paymentRef: order } });

    const base = appBaseUrl(req);
    const form = buildRedsysForm(cfg, {
      order,
      amountEur: Number(b.depositAmount),
      description: `Señal taller ${b.session.workshop.title}`,
      holder: b.customerName,
      merchantUrl: `${base}/api/payments/redsys/notify`,
      urlOk: `${base}/talleres/reserva/${b.reference}?pago=ok`,
      urlKo: `${base}/talleres/reserva/${b.reference}?pago=ko`,
    });
    return NextResponse.json(form);
  } catch (error) {
    return workshopError(error, 'Error al iniciar el pago con tarjeta');
  }
}
