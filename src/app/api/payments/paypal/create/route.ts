import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { createPaypalOrder, getPaypalPublicConfig, PaypalError } from '@/lib/paypal';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

/** Creates the PayPal order for the cart. The amount is computed from the database, never from the client. */
export async function POST(req: Request) {
  try {
    if (!getPaypalPublicConfig()) {
      return NextResponse.json({ error: 'PayPal no está configurado' }, { status: 503 });
    }
    const body = await req.json();
    const items = Array.isArray(body.items)
      ? body.items.map((i: { productId?: string; quantity?: number }) => ({
          productId: String(i.productId),
          quantity: Math.floor(Number(i.quantity)) || 0,
        }))
      : [];
    if (items.length === 0 || items.some((i: { quantity: number }) => i.quantity < 1 || i.quantity > 99)) {
      return NextResponse.json({ error: 'La cesta no es válida' }, { status: 400 });
    }

    const quote = await storeService.quoteCart(items);
    const id = await createPaypalOrder(quote.totalAmount, `cart-${Date.now()}`);
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof PaypalError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return apiError(error, 'Error al iniciar el pago');
  }
}
