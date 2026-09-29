import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Collection } from '@/lib/types';
import { Countdown } from './Countdown';

/** Home-page banner for the collection that is currently live (seasonal campaign). */
export function CollectionSpotlight({ collection }: { collection: Collection }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <Link
        href={`/colecciones/${collection.slug}`}
        className="group relative block overflow-hidden rounded-3xl shadow-card"
        style={{ backgroundColor: collection.accentColor }}
      >
        {collection.heroImage && (
          <Image
            src={collection.heroImage}
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(100deg, ${collection.accentColor}F2 0%, ${collection.accentColor}A6 50%, rgba(0,0,0,0.25) 100%)` }}
        />
        <div className="relative px-6 py-10 sm:px-12 sm:py-14 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edición especial</span>
            </span>
            <h2 className="font-serif-boho text-3xl sm:text-5xl font-bold leading-tight">{collection.name}</h2>
            {collection.tagline && <p className="text-sm sm:text-lg text-white/90">{collection.tagline}</p>}
            <span className="inline-flex items-center space-x-2 text-sm font-bold pt-1">
              <span>Descubrir la colección</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </div>
          {collection.windowEnd && <Countdown target={collection.windowEnd} label="Termina en" />}
        </div>
      </Link>
    </section>
  );
}
