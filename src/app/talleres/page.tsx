import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, Palette } from 'lucide-react';
import { getPublicWorkshops, formatDuration, TIMEZONE } from '@/lib/workshopService';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Talleres de joyería artesanal | Bohoart Jewelry',
  description: 'Aprende a crear tu propia joyería en nuestros talleres. Reserva tu plaza con una señal y paga el resto el día del taller.',
  alternates: { canonical: '/talleres' },
};

export default async function WorkshopsPage() {
  const workshops = await getPublicWorkshops();
  const dateFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE });

  return (
    <div className="bg-boho-linen min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-boho-terracotta">
            <Palette className="w-3.5 h-3.5" />
            <span>Aprende con nosotras</span>
          </span>
          <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal mt-2">Talleres</h1>
          <p className="text-sm text-boho-charcoal-muted mt-3">
            Crea tu propia joya paso a paso. Reservas tu plaza con una pequeña señal (no reembolsable) y el resto se paga el día del taller.
          </p>
        </div>

        {workshops.length === 0 ? (
          <p className="text-center text-sm text-boho-charcoal-muted py-16">
            Estamos preparando nuevos talleres. Vuelve pronto o <Link href="/contacto" className="text-boho-terracotta font-semibold">escríbenos</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <Link key={w.id} href={`/talleres/${w.slug}`} className="group bg-white rounded-3xl overflow-hidden border border-boho-sand-200 shadow-soft flex flex-col">
                <div className="relative aspect-[4/3] bg-boho-sand-100">
                  {w.image && <Image src={w.image} alt={w.title} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                  {!w.hasAvailability && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-boho-charcoal px-2.5 py-1 rounded-full">
                      {w.nextSession ? 'Completo' : 'Sin fechas'}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal">{w.title}</h2>
                  {w.shortDescription && <p className="text-sm text-boho-charcoal-muted mt-1 line-clamp-3">{w.shortDescription}</p>}
                  <div className="mt-4 space-y-1.5 text-xs text-boho-charcoal-muted">
                    <div className="flex items-center space-x-1.5"><Clock className="w-3.5 h-3.5 text-boho-terracotta" /><span>{formatDuration(w.durationMinutes)}</span></div>
                    {w.nextSession && (
                      <div className="flex items-center space-x-1.5"><CalendarDays className="w-3.5 h-3.5 text-boho-terracotta" /><span>Próxima fecha: {dateFmt.format(new Date(w.nextSession))}</span></div>
                    )}
                  </div>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      <span className="font-serif-boho text-2xl font-bold text-boho-charcoal">{formatPrice(w.price)}</span>
                      <span className="block text-[11px] text-boho-charcoal-muted">Señal {formatPrice(w.deposit)} · resto el día del taller</span>
                    </div>
                    <span className="text-xs font-bold text-boho-terracotta">Ver y reservar →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
