import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Collection } from '@/lib/types';

/** Home-page grid with the live (and upcoming) collections, separate from categories. */
export function CollectionsShowcase({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-boho-sand-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-boho-terracotta text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ediciones especiales</span>
            </div>
            <h2 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">Colecciones</h2>
          </div>
          <Link
            href="/colecciones"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-boho-terracotta hover:text-boho-terracotta-600 transition-colors group"
          >
            <span>Ver todas las colecciones</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/colecciones/${c.slug}`}
              className="group relative block aspect-[4/3] rounded-3xl overflow-hidden shadow-soft"
              style={{ backgroundColor: c.accentColor }}
            >
              {c.coverImage && (
                <Image
                  src={c.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${c.accentColor}F2, transparent 70%)` }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {c.status === 'scheduled' && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/25 px-2.5 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
                <h3 className="font-serif-boho text-2xl font-bold mt-2">{c.name}</h3>
                {c.tagline && <p className="text-sm text-white/90 line-clamp-2">{c.tagline}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
