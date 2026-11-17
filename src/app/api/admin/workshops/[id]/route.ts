import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { assertSlugFree, parseWorkshopInput } from '@/lib/workshopAdmin';
import { clean, WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Edita el taller. Si el cuerpo trae `photos` ([{url, caption}]) se reemplaza la galería completa. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(req);
    const data = parseWorkshopInput(body);
    await assertSlugFree(data.slug, id);
    if (!(await prisma.workshop.findUnique({ where: { id }, select: { id: true } }))) throw new WorkshopError('Taller no encontrado', 404);

    await prisma.$transaction(async (tx) => {
      await tx.workshop.update({ where: { id }, data });
      if (Array.isArray(body.photos)) {
        await tx.workshopPhoto.deleteMany({ where: { workshopId: id } });
        const photos = body.photos
          .map((p: any, i: number) => ({ workshopId: id, url: clean(p?.url, 1000), caption: clean(p?.caption, 200) || null, sortOrder: i }))
          .filter((p: { url: string }) => p.url);
        if (photos.length) await tx.workshopPhoto.createMany({ data: photos });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al guardar el taller');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const bookings = await prisma.workshopBooking.count({ where: { session: { workshopId: id } } });
    if (bookings > 0) {
      throw new WorkshopError('Este taller tiene reservas. Desactívalo en lugar de eliminarlo para conservar el historial.', 409);
    }
    await prisma.workshop.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al eliminar el taller');
  }
}
