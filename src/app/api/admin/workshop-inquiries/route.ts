import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await prisma.workshopInquiry.findMany({
      include: { workshop: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return NextResponse.json(
      rows.map((i) => ({ ...i, workshopTitle: i.workshop?.title ?? null, workshop: undefined, createdAt: i.createdAt.toISOString() }))
    );
  } catch (error) {
    return workshopError(error, 'Error al cargar las consultas');
  }
}
