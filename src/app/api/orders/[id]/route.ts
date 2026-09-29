import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import { sendOrderPaidEmail, sendOrderShippedEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const order = await storeService.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return apiError(error, 'Error al cargar el pedido');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    const before = await storeService.getOrderById(id);
    const updated = await storeService.updateOrderStatus(id, body.status, body.trackingNumber);
    if (!updated) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Notify the customer only on real transitions (not when just saving a tracking number).
    if (before && before.status !== updated.status) {
      if (updated.status === 'PAID' && before.status === 'PENDING') void sendOrderPaidEmail(updated);
      if (updated.status === 'SHIPPED') void sendOrderShippedEmail(updated);
    }
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Error al actualizar el estado del pedido');
  }
}
