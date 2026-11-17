import { NextResponse } from 'next/server';
import { isValidCronRequest, sendAbandonedCartReminders } from '@/lib/marketing';

export const dynamic = 'force-dynamic';

// Protected with CRON_SECRET: `Authorization: Bearer <CRON_SECRET>` (see README, "Carrito abandonado").
async function handle(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 });
  }
  if (!isValidCronRequest(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    return NextResponse.json(await sendAbandonedCartReminders());
  } catch (e) {
    console.error('cron abandoned-carts', e);
    return NextResponse.json({ error: 'Error procesando carritos' }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
