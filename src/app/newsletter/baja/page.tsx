'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function BajaContent() {
  const token = useSearchParams().get('token') || '';
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const unsubscribe = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal mb-4">
        {state === 'done' ? 'Te has dado de baja' : 'Darme de baja de la newsletter'}
      </h1>
      {state === 'done' ? (
        <p className="text-boho-charcoal-muted mb-8">No volverás a recibir nuestros correos. ¡Gracias por haber estado!</p>
      ) : (
        <>
          <p className="text-boho-charcoal-muted mb-6">
            {token ? 'Confirma que quieres dejar de recibir novedades de Bohoart Jewelry.' : 'El enlace de baja no es válido.'}
          </p>
          {state === 'error' && (
            <p role="alert" className="text-sm text-red-600 mb-4">
              No se pudo procesar la baja: el enlace no es válido. Escríbenos a hola@bohoartjoyeria.com.
            </p>
          )}
          {token && (
            <button
              onClick={unsubscribe}
              disabled={state === 'loading'}
              className="px-6 py-3 rounded-full bg-boho-terracotta text-white font-semibold text-sm disabled:opacity-60"
            >
              {state === 'loading' ? 'Procesando…' : 'Confirmar baja'}
            </button>
          )}
        </>
      )}
      <div className="mt-8">
        <Link href="/" className="text-sm underline text-boho-charcoal-muted">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function BajaPage() {
  return (
    <Suspense fallback={null}>
      <BajaContent />
    </Suspense>
  );
}
