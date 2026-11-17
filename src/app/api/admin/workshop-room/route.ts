import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { clean, getRoomInfo } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await getRoomInfo());
  } catch (error) {
    return workshopError(error, 'Error al cargar la sala');
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await readJson(req);
    const photos = (Array.isArray(body.photos) ? body.photos : []).map((p: unknown) => clean(p, 1000)).filter(Boolean).slice(0, 20);
    const data = {
      title: clean(body.title, 160) || 'Nuestra sala de talleres',
      text: String(body.text ?? '').slice(0, 5000),
      photos: JSON.stringify(photos),
    };
    await prisma.workshopRoomInfo.upsert({ where: { id: 'main' }, update: data, create: { id: 'main', ...data } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return workshopError(error, 'Error al guardar la sala');
  }
}
