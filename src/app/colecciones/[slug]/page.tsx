import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Sparkles, CalendarDays } from 'lucide-react';
import { storeService } from '@/lib/storeService';
import { getCurrentAdmin } from '@/lib/auth';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Countdown } from '@/components/store/Countdown';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const dateFmt = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }).format(new Date(iso))
    : null;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await storeService.getCollectionBySlug(slug);
  if (!collection || collection.status === 'inactive') return { title: 'Colección no encontrada' };

  const description =
    collection.tagline || collection.description?.slice(0, 160) || `Colección ${collection.name} de Bohoart Jewelry.`;
  return {
    title: `${collection.name} | Joyería Artesanal`,
    description,
    alternates: { canonical: `/colecciones/${collection.slug}` },
    // Only live collections should be indexed.
    robots: collection.status === 'live' ? undefined : { index: false, follow: true },
    openGraph: {
      title: collection.name,
      description,
      images: collection.heroImage ? [collection.heroImage] : undefined,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await storeService.getCollectionBySlug(slug);
  if (!collection) notFound();

  const isAdmin = Boolean(await getCurrentAdmin());
  // Deactivated collections are only visible to the admin (preview).
  if (collection.status === 'inactive' && !isAdmin) notFound();

  const { status } = collection;
  const products = collection.products ?? [];
  const accent = collection.accentColor;
  const start = dateFmt(collection.windowStart);
  const end = dateFmt(collection.windowEnd);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.tagline || collection.description || undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bohoartjoyeria.com'}/colecciones/${collection.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bohoartjoyeria.com'}/productos/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="bg-boho-linen min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {isAdmin && status !== 'live' && (
        <div className="bg-amber-100 text-amber-900 text-xs font-semibold text-center py-2 px-4">
          Vista previa de administración: esta colección ahora está{' '}
          {status === 'inactive' ? 'desactivada' : status === 'scheduled' ? 'programada' : 'finalizada'} y el público no la ve.
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: accent }}>
        {collection.heroImage && (
          <Image src={collection.heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accent}E6 0%, ${accent}99 45%, rgba(0,0,0,0.45) 100%)` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <nav className="flex items-center space-x-2 text-xs text-white/80 mb-8">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/colecciones" className="hover:text-white">Colecciones</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold">{collection.name}</span>
          </nav>

          <div className="max-w-2xl space-y-5 text-white">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {status === 'live' ? 'Edición especial' : status === 'scheduled' ? 'Próximamente' : 'Edición finalizada'}
              </span>
            </span>
            <h1 className="font-serif-boho text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
              {collection.name}
            </h1>
            {collection.tagline && <p className="text-base sm:text-xl text-white/90">{collection.tagline}</p>}

            {(start || end) && (
              <p className="inline-flex items-center space-x-2 text-sm text-white/90">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {start && end ? `Del ${start} al ${end}` : start ? `Desde el ${start}` : `Hasta el ${end}`}
                </span>
              </p>
            )}

            {status === 'live' && collection.windowEnd && (
              <div className="pt-1">
                <Countdown target={collection.windowEnd} label="Termina en" />
              </div>
            )}
            {status === 'scheduled' && collection.windowStart && (
              <div className="pt-1">
                <Countdown target={collection.windowStart} label="Se abre en" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {collection.description && (
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: accent }} />
            <p className="text-sm sm:text-base text-boho-charcoal-muted leading-relaxed whitespace-pre-line">
              {collection.description}
            </p>
          </div>
        )}

        {status === 'ended' && (
          <div className="max-w-xl mx-auto text-center bg-white rounded-3xl border border-boho-sand-200 p-8 mb-12 shadow-soft">
            <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-2">Esta colección ya ha terminado</h2>
            <p className="text-xs text-boho-charcoal-muted mb-5">Descubre el resto de nuestras piezas artesanales.</p>
            <Link href="/catalogo" className="inline-block px-6 py-3 rounded-full text-xs font-bold text-white" style={{ backgroundColor: accent }}>
              Ver catálogo completo
            </Link>
          </div>
        )}

        {status === 'scheduled' && (
          <div className="max-w-xl mx-auto text-center bg-white rounded-3xl border border-boho-sand-200 p-8 mb-12 shadow-soft">
            <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-2">Muy pronto</h2>
            <p className="text-xs text-boho-charcoal-muted">
              Estamos terminando las piezas de esta colección. Vuelve el {start ?? 'día del lanzamiento'} para verlas.
            </p>
          </div>
        )}

        {(status === 'live' || (isAdmin && status !== 'ended')) && (
          <>
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-boho-sand-200">
              <h2 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
                Piezas de la colección
              </h2>
              <span className="text-xs font-semibold" style={{ color: accent }}>
                {products.length} {products.length === 1 ? 'diseño' : 'diseños'}
              </span>
            </div>
            <ProductGrid products={products} emptyMessage="Estamos preparando las piezas de esta colección." />
          </>
        )}

        <div className="mt-14 text-center">
          <Link href="/catalogo" className="text-xs font-bold hover:underline" style={{ color: accent }}>
            Ver todo el catálogo →
          </Link>
        </div>
      </div>
    </div>
  );
}
