import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { assertSlugFree, parseWorkshopInput } from '@/lib/workshopAdmin';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await prisma.workshop.findMany({
      include: { sessions: { orderBy: { startsAt: 'asc' } }, photos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(
      rows.map((w) => ({
        ...w,
        price: Number(w.price),
        depositValue: Number(w.depositValue),
        sessions: w.sessions.map((s) => ({ ...s, startsAt: s.startsAt.toISOString() })),
      }))
    );
  } catch (error) {
    return workshopError(error, 'Error al cargar los talleres');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const data = parseWorkshopInput(await readJson(req));
    await assertSlugFree(data.slug);
    const w = await prisma.workshop.create({ data });
    return NextResponse.json({ id: w.id }, { status: 201 });
  } catch (error) {
    return workshopError(error, 'Error al crear el taller');
  }
}
