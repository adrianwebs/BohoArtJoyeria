import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getPopupSettings } from '@/lib/marketing';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await getPopupSettings());
  } catch (e) {
    return apiError(e, 'Error al cargar el pop-up');
  }
}

const clamp = (v: unknown, min: number, max: number, def: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const b = await req.json();
    const data = {
      isEnabled: Boolean(b.isEnabled),
      title: String(b.title ?? '').trim().slice(0, 150) || '¡Te regalamos un 10% en tu primer pedido!',
      message: String(b.message ?? '').trim().slice(0, 600),
      discountPercent: clamp(b.discountPercent, 1, 90, 10),
      delaySeconds: clamp(b.delaySeconds, 0, 600, 15),
      exitIntent: Boolean(b.exitIntent),
      couponValidDays: clamp(b.couponValidDays, 1, 365, 30),
    };
    const s = await prisma.popupSetting.upsert({ where: { id: 'popup-default' }, update: data, create: data });
    return NextResponse.json(s);
  } catch (e) {
    return apiError(e, 'Error al guardar el pop-up');
  }
}
