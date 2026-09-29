import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import { parseOrderInput, toCreateOrder } from '@/lib/orderInput';
import { sendOrderReceivedEmails } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    // Without `page` the full list is returned (used by the clients page); with it, a filtered page.
    if (searchParams.has('page')) {
      return NextResponse.json(
        await storeService.getOrdersPaged({
          page: Number(searchParams.get('page')) || 1,
          pageSize: Number(searchParams.get('pageSize')) || 20,
          status: searchParams.get('status') || undefined,
          q: searchParams.get('q') || undefined,
        })
      );
    }
    return NextResponse.json(await storeService.getOrders());
  } catch (error) {
    return apiError(error, 'Error al cargar los pedidos');
  }
}

/**
 * Public order creation for MANUAL payment methods (Bizum, PayPal.Me). The order is created as PENDING and the
 * shop confirms the payment by hand from the admin. Prices are recomputed server-side.
 * (The automatic PayPal flow lives in /api/payments/paypal/* and is currently not used by the checkout.)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const method = body.paymentMethod;
    if (method !== 'BIZUM' && method !== 'PAYPAL_ME') {
      return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 });
    }

    const settings = await storeService.getSettings();
    if ((method === 'BIZUM' && !settings.bizumPhone) || (method === 'PAYPAL_ME' && !settings.paypalMeUrl)) {
      return NextResponse.json({ error: 'Este método de pago no está disponible ahora mismo' }, { status: 400 });
    }

    const parsed = parseOrderInput(body);
    if (typeof parsed === 'string') {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const order = await storeService.createOrder(
      toCreateOrder(parsed, { status: 'PENDING', paymentMethod: method })
    );

    void sendOrderReceivedEmails(order, {
      bizumPhone: settings.bizumPhone,
      paypalMeUrl: settings.paypalMeUrl,
      notifyEmail: process.env.ORDER_NOTIFY_EMAIL || settings.contactEmail,
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, 'Error al procesar el pedido');
  }
}
