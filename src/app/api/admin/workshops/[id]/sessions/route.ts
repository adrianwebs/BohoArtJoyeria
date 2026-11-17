import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseSessionInput } from '@/lib/workshopAdmin';
import { WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!(await prisma.workshop.findUnique({ where: { id }, select: { id: true } }))) throw new WorkshopError('Taller no encontrado', 404);
    const s = await prisma.workshopSession.create({ data: { workshopId: id, ...parseSessionInput(await readJson(req)) } });
    return NextResponse.json({ id: s.id }, { status: 201 });
  } catch (error) {
    return workshopError(error, 'Error al crear la sesión');
  }
}
