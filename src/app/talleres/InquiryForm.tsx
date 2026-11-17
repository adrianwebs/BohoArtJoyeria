'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export function InquiryForm({ workshopId }: { workshopId?: string }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', preferredDate: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/workshops/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, workshopId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar. Inténtalo de nuevo.');
        setState('idle');
        return;
      }
      setState('sent');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm text-emerald-900">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p>¡Recibido! Te responderemos por email en cuanto podamos con una propuesta de fecha y horario.</p>
      </div>
    );
  }

  const cls = 'w-full px-3 py-2.5 text-sm bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input required value={f.name} onChange={set('name')} placeholder="Nombre" className={cls} />
        <input required type="email" value={f.email} onChange={set('email')} placeholder="Email" className={cls} />
        <input value={f.phone} onChange={set('phone')} placeholder="Teléfono (opcional)" className={cls} />
        <input value={f.preferredDate} onChange={set('preferredDate')} placeholder="Fecha u horario que te vendría bien" className={cls} />
      </div>
      <textarea required rows={4} value={f.message} onChange={set('message')} placeholder="Cuéntanos qué día, horario o cuántas personas sois…" className={cls} />
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="px-6 py-2.5 rounded-full bg-boho-terracotta hover:bg-boho-terracotta-600 text-white text-sm font-bold shadow-soft disabled:opacity-60 inline-flex items-center space-x-2"
      >
        {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        <span>Pedir otra fecha u horario</span>
      </button>
    </form>
  );
}
