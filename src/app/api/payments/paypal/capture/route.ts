import { NextResponse } from 'next/server';
import { storeService, StoreError } from '@/lib/storeService';
import { capturePaypalOrder, getPaypalPublicConfig, PaypalError } from '@/lib/paypal';
import { apiError } from '@/lib/apiError';
import { parseOrderInput, toCreateOrder } from '@/lib/orderInput';
import { sendOrderReceivedEmails } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/**
 * Captures an approved PayPal payment and, only if the capture is COMPLETED, creates the PAID order.
 * Idempotent per PayPal order id (a retried request returns the existing order).
 */
export async function POST(req: Request) {
  try {
    if (!getPaypalPublicConfig()) {
      return NextResponse.json({ error: 'PayPal no está configurado' }, { status: 503 });
    }
    const body = await req.json();
    const paypalOrderId = typeof body.paypalOrderId === 'string' ? body.paypalOrderId : '';
    if (!/^[A-Za-z0-9-]{6,64}$/.test(paypalOrderId)) {
      return NextResponse.json({ error: 'Identificador de pago no válido' }, { status: 400 });
    }

    const parsed = parseOrderInput(body);
    if (typeof parsed === 'string') {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const existing = await storeService.getOrderByPaypalId(paypalOrderId);
    if (existing) {
      return NextResponse.json({ orderNumber: existing.orderNumber, totalAmount: existing.totalAmount });
    }

    // Validate stock/price before taking the money.
    const quote = await storeService.quoteCart(parsed.items);

    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'El pago no se ha completado' }, { status: 402 });
    }

    // The PayPal order amount was set by our server at creation; if it still differs (prices changed in between)
    // keep the order PENDING for manual review instead of marking it paid.
    const amountOk = capture.currency === 'EUR' && capture.amount !== null && Math.abs(capture.amount - quote.totalAmount) < 0.01;
    let notes = parsed.data.notes;
    if (!amountOk) {
      console.error(`PayPal amount mismatch for ${paypalOrderId}: captured ${capture.amount} ${capture.currency}, expected ${quote.totalAmount}`);
      notes = `${notes ? notes + ' | ' : ''}REVISAR: importe cobrado ${capture.amount} ${capture.currency} distinto del calculado ${quote.totalAmount} EUR (capture ${capture.captureId}).`;
    }

    let order;
    try {
      order = await storeService.createOrder(
        toCreateOrder(parsed, {
          status: amountOk ? 'PAID' : 'PENDING',
          paymentMethod: 'PAYPAL',
          paypalOrderId,
          notes,
        })
      );
    } catch (err) {
      // Money was captured but the order could not be stored (e.g. stock ran out in the last seconds).
      console.error(`CRITICAL: PayPal capture ${capture.captureId} (order ${paypalOrderId}) succeeded but order creation failed`, err);
      const msg = err instanceof StoreError ? err.message : 'Error al registrar el pedido';
      return NextResponse.json(
        { error: `${msg} Tu pago (${paypalOrderId}) se ha cobrado: contacta con nosotros y lo resolveremos o reembolsaremos.` },
        { status: 500 }
      );
    }

    const settings = await storeService.getSettings();
    void sendOrderReceivedEmails(order, { notifyEmail: process.env.ORDER_NOTIFY_EMAIL || settings.contactEmail });

    return NextResponse.json({ orderNumber: order.orderNumber, totalAmount: order.totalAmount }, { status: 201 });
  } catch (error) {
    if (error instanceof PaypalError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return apiError(error, 'Error al confirmar el pago');
  }
}
