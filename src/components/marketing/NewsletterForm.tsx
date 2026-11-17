'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

/** Alta en la newsletter con casilla de consentimiento (RGPD). Usado en el footer y en el pop-up. */
export function NewsletterForm({
  source = 'footer',
  onDone,
  emailId,
}: {
  source?: 'footer' | 'popup';
  onDone?: () => void;
  emailId?: string;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al suscribirte');
      setState('ok');
      setMsg(data.message);
      onDone?.();
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Error al suscribirte');
    }
  };

  if (state === 'ok') {
    return (
      <p role="status" className="text-xs font-medium text-boho-sage-600 bg-white/70 rounded-lg p-3 max-w-sm">
        {msg} Revisa tu bandeja de entrada (y el spam).
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-2">
      <div className="flex">
        <label htmlFor={emailId || `nl-email-${source}`} className="sr-only">
          Correo electrónico
        </label>
        <input
          id={emailId || `nl-email-${source}`}
          type="email"
          placeholder="Tu correo electrónico..."
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3.5 py-2 text-xs bg-white border border-boho-sand-300 rounded-l-full flex-1 min-w-0 focus:outline-none focus:border-boho-terracotta"
        />
        <button
          type="submit"
          disabled={state === 'loading' || !consent}
          className="px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-r-full text-xs font-semibold flex items-center space-x-1 transition-colors disabled:opacity-60"
        >
          <span>{state === 'loading' ? 'Enviando…' : 'Unirme'}</span>
          <Send className="w-3 h-3" />
        </button>
      </div>
      <label className="flex items-start gap-2 text-[11px] text-boho-charcoal-muted leading-snug">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 accent-boho-terracotta"
        />
        <span>
          Acepto recibir novedades por email y la{' '}
          <Link href="/privacidad" className="underline">
            política de privacidad
          </Link>
          . Podrás darte de baja cuando quieras.
        </span>
      </label>
      {state === 'error' && (
        <p role="alert" className="text-[11px] text-red-600">
          {msg}
        </p>
      )}
    </form>
  );
}
