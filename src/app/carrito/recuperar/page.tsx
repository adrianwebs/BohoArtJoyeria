'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function RecuperarContent() {
  const token = useSearchParams().get('token') || '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) {
      setFailed(true);
      return;
    }
    fetch(`/api/cart/recover?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const { items } = await r.json();
        if (!Array.isArray(items) || items.length === 0) throw new Error();
        // The cart provider reads this key on mount, so a full navigation restores it.
        localStorage.setItem('bohoart_cart', JSON.stringify(items));
        window.location.replace('/carrito');
      })
      .catch(() => setFailed(true));
  }, [token]);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      {failed ? (
        <>
          <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal mb-4">No hemos podido recuperar tu carrito</h1>
          <p className="text-boho-charcoal-muted mb-8">
            El enlace ha caducado o las piezas ya no están disponibles. Echa un vistazo al catálogo.
          </p>
          <Link href="/catalogo" className="inline-block px-6 py-3 rounded-full bg-boho-terracotta text-white font-semibold text-sm">
            Ver el catálogo
          </Link>
        </>
      ) : (
        <p role="status" className="text-boho-charcoal-muted">
          Recuperando tu carrito…
        </p>
      )}
    </div>
  );
}

export default function RecuperarCarritoPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarContent />
    </Suspense>
  );
}
