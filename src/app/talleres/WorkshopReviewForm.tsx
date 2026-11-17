'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function WorkshopReviewForm({ workshopId }: { workshopId: string }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ authorName: '', authorEmail: '', comment: '' });
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/workshops/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, rating, workshopId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la reseña');
        setState('idle');
        return;
      }
      setState('sent');
    } catch {
      setError('Error de conexión');
      setState('idle');
    }
  };

  if (state === 'sent') return <p className="text-sm text-emerald-700 font-semibold">¡Gracias! Tu reseña se publicará tras revisarla.</p>;
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-bold text-boho-terracotta hover:underline">
        ¿Has venido a este taller? Cuéntanos tu experiencia
      </button>
    );
  }
  const cls = 'w-full px-3 py-2.5 text-sm bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';
  return (
    <form onSubmit={submit} className="space-y-3 bg-white rounded-2xl border border-boho-sand-200 p-4">
      <div className="flex space-x-1" role="radiogroup" aria-label="Valoración">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} estrellas`}>
            <Star className={`w-6 h-6 ${n <= rating ? 'fill-boho-gold text-boho-gold' : 'text-boho-sand-300'}`} />
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input required value={f.authorName} onChange={(e) => setF({ ...f, authorName: e.target.value })} placeholder="Nombre" className={cls} />
        <input required type="email" value={f.authorEmail} onChange={(e) => setF({ ...f, authorEmail: e.target.value })} placeholder="Email (no se publica)" className={cls} />
      </div>
      <textarea required rows={3} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} placeholder="Tu opinión" className={cls} />
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="px-5 py-2 rounded-full bg-boho-terracotta text-white text-xs font-bold disabled:opacity-60">
        Enviar reseña
      </button>
    </form>
  );
}
