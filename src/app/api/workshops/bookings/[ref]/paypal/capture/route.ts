import { NextResponse } from 'next/server';
import { capturePaypalOrder, getPaypalPublicConfig } from '@/lib/paypal';
import { confirmPayment, getBookingByReference, hasSeatsFor, WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Captura el pago PayPal aprobado y, si es correcto, marca la reserva como pagada (idempotente). */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    if (!getPaypalPublicConfig()) {
      return NextResponse.json({ error: 'PayPal no está configurado' }, { status: 503 });
    }
    const { ref } = await params;
    const body = await readJson(req);
    const paypalOrderId = typeof body.paypalOrderId === 'string' ? body.paypalOrderId : '';
    if (!/^[A-Za-z0-9-]{6,64}$/.test(paypalOrderId)) throw new WorkshopError('Identificador de pago no válido');

    const b = await getBookingByReference(ref);
    if (!b) throw new WorkshopError('Reserva no encontrada', 404);
    // Solo se puede capturar el pedido PayPal que creamos para ESTA reserva.
    if (b.paymentMethod !== 'PAYPAL' || b.paymentRef !== paypalOrderId) throw new WorkshopError('El pago no corresponde a esta reserva', 409);
    if (b.status === 'PAID' || b.status === 'ATTENDED') return NextResponse.json({ status: 'PAID', reference: b.reference });
    if (b.status === 'CANCELLED') throw new WorkshopError('Esta reserva está cancelada', 409);
    if (!(await hasSeatsFor(b))) throw new WorkshopError('Lo sentimos, esta fecha se acaba de completar. No se ha cobrado nada.', 409);

    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status !== 'COMPLETED') throw new WorkshopError('El pago no se ha completado', 402);

    const expected = Number(b.depositAmount);
    if (capture.currency !== 'EUR' || capture.amount === null || Math.abs(capture.amount - expected) >= 0.01) {
      console.error(`PayPal: importe distinto en reserva ${b.reference}: ${capture.amount} ${capture.currency} vs ${expected} EUR`);
      throw new WorkshopError(`Hemos recibido el pago pero el importe no coincide. Contacta con nosotros indicando la referencia ${b.reference}.`, 500);
    }

    const r = await confirmPayment(b.id, { method: 'PAYPAL', ref: paypalOrderId, amount: capture.amount });
    if (!r.ok) {
      throw new WorkshopError(
        r.reason === 'NO_SEATS'
          ? `La fecha se completó justo ahora. Tu pago (${b.reference}) queda registrado y te contactaremos para reembolsarlo o recolocarte.`
          : 'No se pudo confirmar la reserva. Contacta con nosotros indicando la referencia ' + b.reference,
        409
      );
    }
    return NextResponse.json({ status: 'PAID', reference: b.reference }, { status: 201 });
  } catch (error) {
    return workshopError(error, 'Error al confirmar el pago');
  }
}
