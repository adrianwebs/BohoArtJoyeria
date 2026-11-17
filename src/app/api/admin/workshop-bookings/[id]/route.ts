import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { BookingStatus, setBookingStatus } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Cambia el estado (PENDING | PAID | CANCELLED | ATTENDED). Cancelar libera las plazas; la señal no se devuelve. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(req);
    const b = await setBookingStatus(id, String(body.status) as BookingStatus);
    return NextResponse.json({ id: b.id, status: b.status });
  } catch (error) {
    return workshopError(error, 'Error al actualizar la reserva');
  }
}
