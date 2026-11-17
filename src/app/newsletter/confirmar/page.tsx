import type { Metadata } from 'next';
import Link from 'next/link';
import { confirmSubscription } from '@/lib/marketing';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Confirmar suscripción', robots: { index: false } };

export default async function ConfirmarPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = await confirmSubscription(token || '').catch(() => 'invalid' as const);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif-boho text-3xl font-bold text-boho-charcoal mb-4">
        {result === 'ok' ? '¡Suscripción confirmada!' : 'Enlace no válido'}
      </h1>
      <p className="text-boho-charcoal-muted mb-8">
        {result === 'ok'
          ? 'Ya formas parte del Club Bohoart. Te hemos enviado tu código de bienvenida por correo.'
          : 'Este enlace de confirmación no es válido o ha caducado. Puedes volver a suscribirte desde el pie de la web.'}
      </p>
      <Link href="/catalogo" className="inline-block px-6 py-3 rounded-full bg-boho-terracotta text-white font-semibold text-sm">
        Ver el catálogo
      </Link>
    </div>
  );
}
