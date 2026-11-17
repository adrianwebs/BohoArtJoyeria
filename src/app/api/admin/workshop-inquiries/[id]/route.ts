import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(req);
    if (!['NEW', 'ANSWERED', 'ARCHIVED'].includes(body.status)) throw new WorkshopError('Estado no válido');
    await prisma.workshopInquiry.update({ where: { id }, data: { status: body.status } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al actualizar la consulta');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.workshopInquiry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al eliminar la consulta');
  }
}
