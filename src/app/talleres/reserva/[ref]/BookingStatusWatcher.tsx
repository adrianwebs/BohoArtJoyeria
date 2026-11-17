'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Mientras el pago está pendiente (la notificación de Redsys puede tardar unos segundos), consulta el estado y refresca. */
export function BookingStatusWatcher({ reference }: { reference: string }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/workshops/bookings/${reference}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.status && data.status !== 'PENDING') {
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        /* reintenta en el siguiente ciclo */
      }
      if (tries >= 20) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [reference, router]);
  return null;
}
