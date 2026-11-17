'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { api, btnGhost } from './TalleresAdminClient';

interface Review { id: string; workshopTitle: string; authorName: string; authorEmail: string; rating: number; comment: string; isApproved: boolean; createdAt: string }
interface Inquiry { id: string; workshopTitle: string | null; name: string; email: string; phone: string | null; preferredDate: string | null; message: string; status: string; createdAt: string }

const fmt = (iso: string) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

function useList<T>(url: string, notify: (m: string) => void) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const r = await api<T[]>(url);
    if (r.ok) setRows(r.data);
    else notify(r.error || 'Error al cargar');
    setLoading(false);
  }, [url, notify]);
  useEffect(() => { load(); }, [load]);
  return { rows, loading, load };
}

export function ReviewsTab({ notify }: { notify: (m: string) => void }) {
  const { rows, loading, load } = useList<Review>('/api/admin/workshop-reviews', notify);
  const act = async (id: string, method: 'PUT' | 'DELETE', body?: unknown) => {
    if (method === 'DELETE' && !confirm('¿Eliminar esta reseña?')) return;
    const r = await api(`/api/admin/workshop-reviews/${id}`, method, body);
    notify(r.ok ? 'Hecho' : r.error || 'Error');
    if (r.ok) await load();
  };
  if (loading) return <p className="text-xs text-boho-charcoal-muted">Cargando…</p>;
  if (rows.length === 0) return <p className="text-xs text-boho-charcoal-muted">No hay reseñas de talleres.</p>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-boho-sand-200 p-4 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><b className="text-sm text-boho-charcoal">{r.authorName}</b> <span className="text-boho-charcoal-muted">· {r.authorEmail} · {r.workshopTitle} · {fmt(r.createdAt)}</span></span>
            <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-boho-gold text-boho-gold' : 'text-boho-sand-300'}`} />)}</span>
          </div>
          <p className="whitespace-pre-line">{r.comment}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full font-bold ${r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{r.isApproved ? 'Publicada' : 'Pendiente'}</span>
            <button className={btnGhost} onClick={() => act(r.id, 'PUT', { isApproved: !r.isApproved })}>{r.isApproved ? 'Ocultar' : 'Aprobar'}</button>
            <button className={`${btnGhost} text-red-600`} onClick={() => act(r.id, 'DELETE')}><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

const INQ_LABEL: Record<string, string> = { NEW: 'Nueva', ANSWERED: 'Respondida', ARCHIVED: 'Archivada' };

export function InquiriesTab({ notify }: { notify: (m: string) => void }) {
  const { rows, loading, load } = useList<Inquiry>('/api/admin/workshop-inquiries', notify);
  const [filter, setFilter] = useState('');
  const setStatus = async (id: string, status: string) => {
    const r = await api(`/api/admin/workshop-inquiries/${id}`, 'PUT', { status });
    notify(r.ok ? 'Hecho' : r.error || 'Error');
    if (r.ok) await load();
  };
  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta consulta?')) return;
    const r = await api(`/api/admin/workshop-inquiries/${id}`, 'DELETE');
    notify(r.ok ? 'Consulta eliminada' : r.error || 'Error');
    if (r.ok) await load();
  };
  if (loading) return <p className="text-xs text-boho-charcoal-muted">Cargando…</p>;
  const shown = rows.filter((i) => !filter || i.status === filter);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['', 'NEW', 'ANSWERED', 'ARCHIVED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`${btnGhost} ${filter === s ? '!bg-boho-terracotta !text-white' : ''}`}>{s ? INQ_LABEL[s] : 'Todas'}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-xs text-boho-charcoal-muted">No hay consultas.</p>}
      {shown.map((i) => (
        <div key={i.id} className="bg-white rounded-2xl border border-boho-sand-200 p-4 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><b className="text-sm text-boho-charcoal">{i.name}</b> <span className="text-boho-charcoal-muted">· {fmt(i.createdAt)}</span></span>
            <span className={`px-2.5 py-1 rounded-full font-bold ${i.status === 'NEW' ? 'bg-amber-100 text-amber-800' : 'bg-boho-sand-200 text-boho-charcoal-muted'}`}>{INQ_LABEL[i.status]}</span>
          </div>
          <p className="text-boho-charcoal-muted"><a href={`mailto:${i.email}`} className="text-boho-terracotta font-semibold">{i.email}</a>{i.phone ? ` · ${i.phone}` : ''}{i.workshopTitle ? ` · Taller: ${i.workshopTitle}` : ''}</p>
          {i.preferredDate && <p>Fecha/horario preferido: <b>{i.preferredDate}</b></p>}
          <p className="whitespace-pre-line">{i.message}</p>
          <div className="flex gap-2 pt-1">
            {i.status !== 'ANSWERED' && <button className={btnGhost} onClick={() => setStatus(i.id, 'ANSWERED')}>Marcar respondida</button>}
            {i.status !== 'ARCHIVED' && <button className={btnGhost} onClick={() => setStatus(i.id, 'ARCHIVED')}>Archivar</button>}
            {i.status !== 'NEW' && <button className={btnGhost} onClick={() => setStatus(i.id, 'NEW')}>Marcar nueva</button>}
            <button className={`${btnGhost} text-red-600`} onClick={() => remove(i.id)}><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
