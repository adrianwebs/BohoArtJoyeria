import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { storeService } from '@/lib/storeService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Colecciones de temporada | Bohoart Jewelry',
  description: 'Ediciones especiales de joyería artesanal para ferias, fiestas y celebraciones del año.',
  alternates: { canonical: '/colecciones' },
};

export default async function CollectionsIndexPage() {
  const collections = await storeService.getCollections();
  const live = collections.filter((c) => c.status === 'live');
  const upcoming = collections.filter((c) => c.status === 'scheduled');

  const Card = ({ c, soon }: { c: (typeof collections)[number]; soon?: boolean }) => (
    <Link
      href={`/colecciones/${c.slug}`}
      className="group relative block aspect-[4/3] rounded-3xl overflow-hidden shadow-soft"
      style={{ backgroundColor: c.accentColor }}
    >
      {c.heroImage && (
        <Image src={c.heroImage} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.accentColor}F2, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {soon && <span className="text-[10px] font-bold uppercase tracking-widest bg-white/25 px-2.5 py-1 rounded-full">Próximamente</span>}
        <h2 className="font-serif-boho text-2xl font-bold mt-2">{c.name}</h2>
        {c.tagline && <p className="text-sm text-white/90 line-clamp-2">{c.tagline}</p>}
      </div>
    </Link>
  );

  return (
    <div className="bg-boho-linen min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-boho-terracotta">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ediciones especiales</span>
          </span>
          <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal mt-2">Colecciones de temporada</h1>
        </div>

        {live.length === 0 && upcoming.length === 0 && (
          <p className="text-center text-sm text-boho-charcoal-muted py-16">
            Ahora mismo no hay colecciones especiales. Mientras tanto, echa un vistazo al{' '}
            <Link href="/catalogo" className="text-boho-terracotta font-semibold">catálogo completo</Link>.
          </p>
        )}

        {live.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {live.map((c) => <Card key={c.id} c={c} />)}
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-5">Próximas colecciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((c) => <Card key={c.id} c={c} soon />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
