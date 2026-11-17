'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertTriangle, CalendarDays, CreditCard, Loader2, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface PanelSession {
  id: string;
  startsAt: string;
  seatsLeft: number;
}

interface PayConfig {
  paypal: { clientId: string; mode: string } | null;
  redsysEnabled: boolean;
}

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
});

interface Props {
  workshopTitle: string;
  price: number;
  depositPerSeat: number;
  sessions: PanelSession[];
}

export function BookingPanel({ workshopTitle, price, depositPerSeat, sessions }: Props) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(sessions.find((s) => s.seatsLeft > 0)?.id ?? '');
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<{ reference: string; depositAmount: number; totalAmount: number } | null>(null);
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);
  const redsysForm = useRef<HTMLFormElement>(null);
  const [redsysFields, setRedsysFields] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const selected = sessions.find((s) => s.id === sessionId);
  const maxSeats = Math.max(1, Math.min(6, selected?.seatsLeft ?? 1));
  const effectiveSeats = Math.min(seats, maxSeats);
  const total = useMemo(() => Math.round(price * effectiveSeats * 100) / 100, [price, effectiveSeats]);
  const deposit = useMemo(() => Math.min(total, Math.round(depositPerSeat * effectiveSeats * 100) / 100), [total, depositPerSeat, effectiveSeats]);

  useEffect(() => {
    fetch('/api/payments/config').then((r) => r.json()).then(setPayConfig).catch(() => setPayConfig({ paypal: null, redsysEnabled: false }));
  }, []);

  // Cuando Redsys devuelve los campos firmados, el formulario se envía por POST al TPV.
  useEffect(() => {
    if (redsysFields) redsysForm.current?.submit();
  }, [redsysFields]);

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl bg-boho-sand-100 p-5 text-sm text-boho-charcoal-muted">
        Ahora mismo no hay fechas abiertas para este taller. Usa el formulario de abajo para pedirnos una fecha u horario.
      </div>
    );
  }

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) return setError('Elige una fecha');
    if (!accepted) return setError('Debes aceptar que la señal no se devuelve para continuar');
    setBusy(true);
    try {
      const res = await fetch('/api/workshops/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, seats: effectiveSeats, name, email, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || 'No se pudo crear la reserva');
      setBooking(data);
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const payWithRedsys = async () => {
    if (!booking) return;
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/workshops/bookings/${booking.reference}/redsys`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo iniciar el pago con tarjeta');
        setBusy(false);
        return;
      }
      setRedsysFields(data);
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';

  return (
    <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft p-5 sm:p-6 space-y-5" id="reservar">
      <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal">Reserva tu plaza</h2>

      {/* Fecha */}
      <fieldset disabled={!!booking} className="space-y-2">
        <legend className="text-xs font-semibold text-boho-charcoal flex items-center space-x-1.5 mb-1">
          <CalendarDays className="w-4 h-4 text-boho-terracotta" /> <span>Elige fecha</span>
        </legend>
        {sessions.map((s) => {
          const full = s.seatsLeft <= 0;
          return (
            <label
              key={s.id}
              className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border text-sm cursor-pointer transition-colors ${
                full ? 'opacity-50 cursor-not-allowed bg-boho-sand-100 border-boho-sand-200' : sessionId === s.id ? 'border-boho-terracotta bg-boho-sand-50' : 'border-boho-sand-300 hover:border-boho-terracotta'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <input type="radio" name="session" disabled={full} checked={sessionId === s.id} onChange={() => setSessionId(s.id)} className="accent-[#C2694F]" />
                <span className="capitalize">{dateFmt.format(new Date(s.startsAt))}</span>
              </span>
              <span className={`text-[11px] font-bold shrink-0 ${full ? 'text-red-600' : s.seatsLeft <= 2 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {full ? 'Completo' : `${s.seatsLeft} ${s.seatsLeft === 1 ? 'plaza libre' : 'plazas libres'}`}
              </span>
            </label>
          );
        })}
      </fieldset>

      {/* Plazas + datos */}
      <form onSubmit={createBooking} className="space-y-3">
        <fieldset disabled={!!booking} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-boho-charcoal flex items-center space-x-1.5 mb-1">
              <Users className="w-4 h-4 text-boho-terracotta" /> <span>Plazas</span>
            </label>
            <select value={effectiveSeats} onChange={(e) => setSeats(Number(e.target.value))} className={inputCls}>
              {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellidos" autoComplete="name" className={inputCls} />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={inputCls} />
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" autoComplete="tel" className={inputCls} />
        </fieldset>

        {/* Resumen de importes */}
        <div className="rounded-2xl bg-boho-sand-50 border border-boho-sand-200 p-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-boho-charcoal-muted">Precio total</span><span>{formatPrice(total)}</span></div>
          <div className="flex justify-between font-bold text-boho-charcoal"><span>Señal a pagar ahora</span><span>{formatPrice(deposit)}</span></div>
          <div className="flex justify-between text-boho-charcoal-muted"><span>Resto, el día del taller</span><span>{formatPrice(total - deposit)}</span></div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <label className="cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={!!booking} className="mr-2 accent-[#C2694F]" />
            Entiendo que la <b>señal ({formatPrice(deposit)}) no se devuelve</b> si cancelo o no asisto, y que el resto se paga en efectivo o con tarjeta el día del taller.
          </label>
        </div>

        {!booking && (
          <button
            type="submit"
            disabled={busy || !selected || selected.seatsLeft <= 0}
            className="w-full py-3 rounded-full bg-boho-terracotta hover:bg-boho-terracotta-600 text-white text-sm font-bold shadow-soft disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Continuar al pago de la señal ({formatPrice(deposit)})</span>
          </button>
        )}
      </form>

      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

      {/* Pago */}
      {booking && (
        <div className="space-y-3 border-t border-boho-sand-200 pt-4">
          <p className="text-xs text-boho-charcoal-muted">
            Reserva <b>{booking.reference}</b> creada. Tu plaza queda confirmada cuando se complete el pago de la señal (<b>{formatPrice(booking.depositAmount)}</b>).
          </p>

          {payConfig === null && <p className="text-xs text-boho-charcoal-muted">Cargando métodos de pago…</p>}

          {payConfig?.paypal && (
            <PayPalScriptProvider options={{ clientId: payConfig.paypal.clientId, currency: 'EUR', intent: 'capture', locale: 'es_ES' }}>
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'pill' }}
                disabled={busy}
                createOrder={async () => {
                  setError('');
                  const res = await fetch(`/api/workshops/bookings/${booking.reference}/paypal/create`, { method: 'POST' });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok || !data.id) {
                    setError(data.error || 'No se pudo iniciar el pago con PayPal');
                    throw new Error('create failed');
                  }
                  return data.id as string;
                }}
                onApprove={async (data) => {
                  const res = await fetch(`/api/workshops/bookings/${booking.reference}/paypal/capture`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paypalOrderId: data.orderID }),
                  });
                  const out = await res.json().catch(() => ({}));
                  if (!res.ok) return setError(out.error || 'No se pudo confirmar el pago');
                  router.push(`/talleres/reserva/${booking.reference}?pago=ok`);
                }}
                onError={() => setError((cur) => cur || 'PayPal ha devuelto un error. Inténtalo de nuevo.')}
              />
            </PayPalScriptProvider>
          )}

          {payConfig?.redsysEnabled && (
            <button
              type="button"
              onClick={payWithRedsys}
              disabled={busy}
              className="w-full py-3 rounded-full border-2 border-boho-charcoal text-boho-charcoal text-sm font-bold hover:bg-boho-sand-100 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>Pagar con tarjeta ({formatPrice(booking.depositAmount)})</span>
            </button>
          )}

          {payConfig && !payConfig.paypal && !payConfig.redsysEnabled && (
            <p className="text-xs font-semibold text-red-600">El pago online no está disponible ahora mismo. Escríbenos indicando la referencia {booking.reference}.</p>
          )}
        </div>
      )}

      {redsysFields && (
        <form ref={redsysForm} action={redsysFields.url} method="POST" className="hidden">
          {Object.entries(redsysFields.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}
      <span className="sr-only">{workshopTitle}</span>
    </div>
  );
}
