import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Aprueba (por defecto) o desaprueba una reseña: { isApproved: boolean }. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(req);
    await prisma.workshopReview.update({ where: { id }, data: { isApproved: body.isApproved === undefined ? true : Boolean(body.isApproved) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al moderar la reseña');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.workshopReview.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al eliminar la reseña');
  }
}
