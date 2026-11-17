import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseSessionInput } from '@/lib/workshopAdmin';
import { WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const data = parseSessionInput(await readJson(req));
    const current = await prisma.workshopSession.findUnique({ where: { id } });
    if (!current) throw new WorkshopError('Sesión no encontrada', 404);
    if (data.capacity < current.seatsTaken) {
      throw new WorkshopError(`Ya hay ${current.seatsTaken} plazas pagadas: el aforo no puede ser menor`, 409);
    }
    await prisma.workshopSession.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al guardar la sesión');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const bookings = await prisma.workshopBooking.count({ where: { sessionId: id } });
    if (bookings > 0) throw new WorkshopError('Esta sesión tiene reservas. Desactívala en lugar de eliminarla.', 409);
    await prisma.workshopSession.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al eliminar la sesión');
  }
}
