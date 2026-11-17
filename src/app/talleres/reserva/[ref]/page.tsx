import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookingByReference, formatSessionDate } from '@/lib/workshopService';
import { formatPrice } from '@/lib/utils';
import { BookingStatusWatcher } from './BookingStatusWatcher';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Tu reserva | Talleres Bohoart', robots: { index: false } };

export default async function BookingResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { ref } = await params;
  const { pago } = await searchParams;
  const b = await getBookingByReference(ref);
  if (!b) notFound();

  const paid = b.status === 'PAID' || b.status === 'ATTENDED';
  const total = Number(b.totalAmount);
  const deposit = Number(b.depositAmount);

  return (
    <div className="bg-boho-linen min-h-screen py-16">
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft p-6 sm:p-8 space-y-4 text-center">
          {paid ? (
            <>
              <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal">¡Plaza reservada!</h1>
              <p className="text-sm text-boho-charcoal-muted">Te hemos enviado un correo de confirmación con todos los detalles.</p>
            </>
          ) : b.status === 'CANCELLED' ? (
            <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal">Reserva cancelada</h1>
          ) : pago === 'ko' ? (
            <>
              <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal">El pago no se ha completado</h1>
              <p className="text-sm text-boho-charcoal-muted">No se ha cobrado nada. Puedes volver al taller e intentarlo de nuevo.</p>
            </>
          ) : (
            <>
              <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal">Estamos confirmando tu pago…</h1>
              <p className="text-sm text-boho-charcoal-muted">Puede tardar unos segundos. Esta página se actualizará sola.</p>
              <BookingStatusWatcher reference={b.reference} />
            </>
          )}

          <div className="text-left rounded-2xl bg-boho-sand-50 border border-boho-sand-200 p-4 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-boho-charcoal-muted">Referencia</span><b>{b.reference}</b></div>
            <div className="flex justify-between gap-4"><span className="text-boho-charcoal-muted">Taller</span><span className="text-right">{b.session.workshop.title}</span></div>
            <div className="flex justify-between gap-4"><span className="text-boho-charcoal-muted">Fecha</span><span className="text-right capitalize">{formatSessionDate(b.session.startsAt)}</span></div>
            <div className="flex justify-between"><span className="text-boho-charcoal-muted">Plazas</span><span>{b.seats}</span></div>
            <div className="flex justify-between"><span className="text-boho-charcoal-muted">Señal</span><span>{formatPrice(deposit)}</span></div>
            <div className="flex justify-between font-bold"><span>A pagar el día del taller</span><span>{formatPrice(total - deposit)}</span></div>
          </div>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">La señal no se devuelve en caso de cancelación o de no asistir.</p>
          <a href={`/talleres/${b.session.workshop.slug}`} className="inline-block text-xs font-bold text-boho-terracotta">← Volver al taller</a>
        </div>
      </div>
    </div>
  );
}
