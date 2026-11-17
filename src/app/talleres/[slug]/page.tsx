import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Check, Clock, HelpCircle, Package, Star, Home } from 'lucide-react';
import { getPublicWorkshop, getRoomInfo, formatDuration } from '@/lib/workshopService';
import { formatPrice } from '@/lib/utils';
import { BookingPanel } from '../BookingPanel';
import { InquiryForm } from '../InquiryForm';
import { WorkshopReviewForm } from '../WorkshopReviewForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = await getPublicWorkshop(slug);
  if (!w) return { title: 'Taller no encontrado' };
  return {
    title: `${w.title} | Talleres Bohoart`,
    description: w.shortDescription || w.description.slice(0, 160),
    alternates: { canonical: `/talleres/${w.slug}` },
  };
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [w, room] = await Promise.all([getPublicWorkshop(slug), getRoomInfo()]);
  if (!w) notFound();

  const avg = w.reviews.length ? w.reviews.reduce((s, r) => s + r.rating, 0) / w.reviews.length : 0;

  return (
    <div className="bg-boho-linen min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          {/* Contenido */}
          <div className="space-y-10 min-w-0">
            <header className="space-y-4">
              {w.image && (
                <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-boho-sand-100">
                  <Image src={w.image} alt={w.title} fill unoptimized priority sizes="(max-width: 1024px) 100vw, 700px" className="object-cover" />
                </div>
              )}
              <h1 className="font-serif-boho text-3xl sm:text-4xl font-bold text-boho-charcoal">{w.title}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-boho-charcoal-muted">
                <span className="font-serif-boho text-2xl font-bold text-boho-charcoal">{formatPrice(w.price)}</span>
                <span className="flex items-center space-x-1.5"><Clock className="w-4 h-4 text-boho-terracotta" /><span>{formatDuration(w.durationMinutes)}</span></span>
                {w.reviews.length > 0 && (
                  <span className="flex items-center space-x-1.5"><Star className="w-4 h-4 fill-boho-gold text-boho-gold" /><span>{avg.toFixed(1)} ({w.reviews.length})</span></span>
                )}
              </div>
              <p className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5">
                Para reservar se paga una <b>señal de {formatPrice(w.depositPerSeat)} por plaza que no se devuelve</b>. El resto ({formatPrice(w.price - w.depositPerSeat)}) se paga el día del taller.
              </p>
              <div className="text-sm text-boho-charcoal leading-relaxed whitespace-pre-line">{w.description}</div>
            </header>

            {w.materials.length > 0 && (
              <section>
                <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-3 flex items-center space-x-2"><Package className="w-5 h-5 text-boho-terracotta" /><span>Materiales incluidos</span></h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {w.materials.map((m, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-boho-charcoal"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>{m}</span></li>
                  ))}
                </ul>
              </section>
            )}

            {w.photos.length > 0 && (
              <section>
                <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-3">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {w.photos.map((p) => (
                    <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden bg-boho-sand-100">
                      <Image src={p.url} alt={p.caption || w.title} fill unoptimized sizes="(max-width: 640px) 50vw, 220px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(room.text || room.photos.length > 0) && (
              <section className="bg-white rounded-3xl border border-boho-sand-200 p-5 sm:p-6">
                <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-3 flex items-center space-x-2"><Home className="w-5 h-5 text-boho-terracotta" /><span>{room.title}</span></h2>
                {room.text && <p className="text-sm text-boho-charcoal leading-relaxed whitespace-pre-line">{room.text}</p>}
                {room.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {room.photos.map((u, i) => (
                      <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-boho-sand-100">
                        <Image src={u} alt={`${room.title} ${i + 1}`} fill unoptimized sizes="(max-width: 640px) 50vw, 220px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {w.faq.length > 0 && (
              <section>
                <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-3 flex items-center space-x-2"><HelpCircle className="w-5 h-5 text-boho-terracotta" /><span>Preguntas frecuentes</span></h2>
                <div className="space-y-2">
                  {w.faq.map((f, i) => (
                    <details key={i} className="group bg-white rounded-2xl border border-boho-sand-200 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-semibold text-boho-charcoal list-none flex justify-between items-center">
                        {f.q}<span className="text-boho-terracotta group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                      </summary>
                      <p className="text-sm text-boho-charcoal-muted mt-2 whitespace-pre-line">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-3">Reseñas</h2>
              {w.reviews.length === 0 ? (
                <p className="text-sm text-boho-charcoal-muted mb-3">Todavía no hay reseñas de este taller.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {w.reviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl border border-boho-sand-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-boho-charcoal">{r.authorName}</span>
                        <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-boho-gold text-boho-gold' : 'text-boho-sand-300'}`} />)}</span>
                      </div>
                      <p className="text-sm text-boho-charcoal-muted mt-1.5 whitespace-pre-line">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              <WorkshopReviewForm workshopId={w.id} />
            </section>

            <section className="bg-white rounded-3xl border border-boho-sand-200 p-5 sm:p-6">
              <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal">¿Te viene mal alguna fecha?</h2>
              <p className="text-sm text-boho-charcoal-muted mt-1 mb-4">Pídenos otra fecha u horario (también fuera de nuestro horario de atención) y te proponemos una opción.</p>
              <InquiryForm workshopId={w.id} />
            </section>
          </div>

          {/* Reserva */}
          <aside className="lg:sticky lg:top-24">
            <BookingPanel
              workshopTitle={w.title}
              price={w.price}
              depositPerSeat={w.depositPerSeat}
              sessions={w.sessions.map((s) => ({ id: s.id, startsAt: s.startsAt, seatsLeft: s.seatsLeft }))}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
