'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { api, btnGhost, inputCls, type AdminWorkshop } from './TalleresAdminClient';

interface Booking {
  id: string; reference: string; customerName: string; customerEmail: string; customerPhone: string;
  seats: number; totalAmount: number; depositAmount: number; amountPaid: number;
  paymentMethod: string | null; paymentRef: string | null; status: string; notes: string | null;
  createdAt: string; startsAt: string; workshopId: string; workshopTitle: string;
}

const STATUS_LABEL: Record<string, string> = { PENDING: 'Pendiente', PAID: 'Pagada', CANCELLED: 'Cancelada', ATTENDED: 'Asistió' };
const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800', PAID: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-700', ATTENDED: 'bg-sky-100 text-sky-800',
};
const fmt = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date(iso));

export function BookingsTab({ workshops, notify }: { workshops: AdminWorkshop[]; notify: (m: string) => void }) {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (workshopId) params.set('workshopId', workshopId);
    if (q.trim()) params.set('q', q.trim());
    const r = await api<Booking[]>(`/api/admin/workshop-bookings?${params}`);
    if (r.ok) setRows(r.data);
    else notify(r.error || 'Error al cargar reservas');
    setLoading(false);
  }, [status, workshopId, q, notify]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const change = async (b: Booking, next: string) => {
    if (next === 'CANCELLED' && !confirm(`¿Cancelar la reserva ${b.reference}? Se liberan las plazas. La señal NO se devuelve automáticamente.`)) return;
    const r = await api(`/api/admin/workshop-bookings/${b.id}`, 'PUT', { status: next });
    notify(r.ok ? `Reserva ${b.reference}: ${STATUS_LABEL[next]}` : r.error || 'No se pudo cambiar el estado');
    if (r.ok) await load();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-boho-sand-200 p-4 grid sm:grid-cols-3 gap-3">
        <input className={inputCls} placeholder="Buscar nombre, email, teléfono o referencia…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={inputCls} value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
          <option value="">Todos los talleres</option>
          {workshops.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </div>

      {loading ? <p className="text-xs text-boho-charcoal-muted">Cargando…</p> : rows.length === 0 ? <p className="text-xs text-boho-charcoal-muted">No hay reservas con estos filtros.</p> : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-boho-sand-200 p-4 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-boho-charcoal">{b.customerName}</span>
                  <span className="text-boho-charcoal-muted"> · {b.reference} · {b.seats} {b.seats === 1 ? 'plaza' : 'plazas'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold ${STATUS_STYLE[b.status] || ''}`}>{STATUS_LABEL[b.status] || b.status}</span>
              </div>
              <p className="text-boho-charcoal-muted">{b.workshopTitle} · {fmt(b.startsAt)}</p>
              <p className="text-boho-charcoal-muted">{b.customerEmail} · {b.customerPhone}</p>
              <p>Total {formatPrice(b.totalAmount)} · señal {formatPrice(b.depositAmount)} · pagado {formatPrice(b.amountPaid)}{b.paymentMethod ? ` (${b.paymentMethod})` : ''}</p>
              {b.notes && <p className="text-amber-800 bg-amber-50 rounded-lg px-2.5 py-1.5">{b.notes}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {b.status !== 'PAID' && b.status !== 'CANCELLED' && <button className={btnGhost} onClick={() => change(b, 'PAID')}>Marcar pagada</button>}
                {b.status === 'PAID' && <button className={btnGhost} onClick={() => change(b, 'ATTENDED')}>Marcar asistió</button>}
                {b.status !== 'PENDING' && b.status !== 'CANCELLED' && <button className={btnGhost} onClick={() => change(b, 'PENDING')}>Volver a pendiente</button>}
                {b.status !== 'CANCELLED' && <button className={`${btnGhost} text-red-600`} onClick={() => change(b, 'CANCELLED')}>Cancelar</button>}
                {b.status === 'CANCELLED' && <button className={btnGhost} onClick={() => change(b, 'PENDING')}>Reabrir</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
