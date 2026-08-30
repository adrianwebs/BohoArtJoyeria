import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await storeService.getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await storeService.updateOrderStatus(
      id,
      body.status,
      body.trackingNumber
    );

    if (!updated) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado del pedido' }, { status: 500 });
  }
}
