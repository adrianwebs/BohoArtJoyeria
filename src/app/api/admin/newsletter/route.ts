import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, status: true, source: true, createdAt: true, confirmedAt: true },
    });
    return NextResponse.json(subscribers);
  } catch (e) {
    return apiError(e, 'Error al cargar los suscriptores');
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 });
    await prisma.newsletterSubscriber.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e, 'Error al eliminar el suscriptor');
  }
}
