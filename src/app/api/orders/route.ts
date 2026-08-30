import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function GET() {
  const orders = await storeService.getOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.customerEmail || !body.shippingAddress || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Datos de pedido incompletos' }, { status: 400 });
    }

    const order = await storeService.createOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || null,
      shippingAddress: body.shippingAddress,
      city: body.city,
      postalCode: body.postalCode,
      province: body.province || body.city,
      country: body.country || 'España',
      subtotal: Number(body.subtotal),
      shippingCost: Number(body.shippingCost),
      totalAmount: Number(body.totalAmount),
      status: body.status || 'PAID',
      paymentMethod: body.paymentMethod || 'PAYPAL',
      paypalOrderId: body.paypalOrderId || null,
      trackingNumber: body.trackingNumber || null,
      notes: body.notes || null,
      items: body.items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 });
  }
}
