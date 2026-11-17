'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';

/** "Avísame cuando haya stock" para productos agotados. */
export function StockNotifyForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el aviso');
      setState('ok');
      setMsg(data.message);
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'No se pudo guardar el aviso');
    }
  };

  if (state === 'ok') {
    return (
      <p role="status" className="text-sm font-medium text-boho-sage-600 bg-white rounded-xl border border-boho-sand-200 p-4">
        {msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-boho-sand-200 bg-white p-4 space-y-2">
      <p className="flex items-center gap-2 text-sm font-bold text-boho-charcoal">
        <Bell className="w-4 h-4 text-boho-terracotta" /> Avísame cuando haya stock
      </p>
      <p className="text-xs text-boho-charcoal-muted">
        Te escribiremos una sola vez, solo para avisarte de que esta pieza vuelve a estar disponible.
      </p>
      <div className="flex">
        <label htmlFor="stock-email" className="sr-only">
          Correo electrónico
        </label>
        <input
          id="stock-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Tu correo electrónico..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3.5 py-2 text-sm bg-white border border-boho-sand-300 rounded-l-full flex-1 min-w-0 focus:outline-none focus:border-boho-terracotta"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-r-full text-sm font-semibold disabled:opacity-60"
        >
          {state === 'loading' ? 'Guardando…' : 'Avisarme'}
        </button>
      </div>
      {state === 'error' && (
        <p role="alert" className="text-xs text-red-600">
          {msg}
        </p>
      )}
    </form>
  );
}
