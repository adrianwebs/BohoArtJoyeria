import { NextResponse } from 'next/server';
import { getBookingByReference } from '@/lib/workshopService';
import { workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Estado público de una reserva (para la página de confirmación). No expone datos personales. */
export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const b = await getBookingByReference(ref);
    if (!b) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    return NextResponse.json({
      reference: b.reference,
      status: b.status,
      workshopTitle: b.session.workshop.title,
      startsAt: b.session.startsAt.toISOString(),
      seats: b.seats,
      totalAmount: Number(b.totalAmount),
      depositAmount: Number(b.depositAmount),
    });
  } catch (error) {
    return workshopError(error, 'Error al consultar la reserva');
  }
}
