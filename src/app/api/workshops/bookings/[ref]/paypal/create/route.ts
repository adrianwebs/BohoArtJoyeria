import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaypalOrder, getPaypalPublicConfig } from '@/lib/paypal';
import { getBookingByReference, hasSeatsFor, WorkshopError } from '@/lib/workshopService';
import { workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Crea el pedido PayPal por el importe de la señal (calculado en servidor a partir de la reserva). */
export async function POST(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    if (!getPaypalPublicConfig()) {
      return NextResponse.json({ error: 'PayPal no está configurado' }, { status: 503 });
    }
    const { ref } = await params;
    const b = await getBookingByReference(ref);
    if (!b) throw new WorkshopError('Reserva no encontrada', 404);
    if (b.status !== 'PENDING') throw new WorkshopError('Esta reserva ya no está pendiente de pago', 409);
    if (!(await hasSeatsFor(b))) throw new WorkshopError('Lo sentimos, esta fecha se acaba de completar', 409);

    const id = await createPaypalOrder(Number(b.depositAmount), b.reference, `Señal taller ${b.session.workshop.title}`);
    await prisma.workshopBooking.update({ where: { id: b.id }, data: { paymentMethod: 'PAYPAL', paymentRef: id } });
    return NextResponse.json({ id });
  } catch (error) {
    return workshopError(error, 'Error al iniciar el pago');
  }
}
