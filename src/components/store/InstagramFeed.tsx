import React from 'react';
import Image from 'next/image';
import { Instagram, Heart } from 'lucide-react';

const INSTAGRAM_POSTS = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    likes: '248',
    alt: 'Pendientes terracota hechos a mano',
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    likes: '194',
    alt: 'Proceso de moldeado en arcilla',
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    likes: '312',
    alt: 'Medallón solsticio con pan de oro',
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1611591475168-b391d34f0bf6?w=600&auto=format&fit=crop&q=80',
    likes: '175',
    alt: 'Pulseras artesanales con minerales',
  },
  {
    id: 'ig-5',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    likes: '280',
    alt: 'Anillos de arcilla polimérica',
  },
  {
    id: 'ig-6',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
    likes: '420',
    alt: 'Packaging y saquito de lino artesanal',
  },
];

export function InstagramFeed() {
  return (
    <section className="py-16 bg-boho-sand-50/50 border-t border-boho-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <a
            href="https://instagram.com/bohoartjewelry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-boho-terracotta hover:text-boho-terracotta-600 font-bold text-xs uppercase tracking-widest mb-1 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span>@bohoartjewelry en Instagram</span>
          </a>
          <h2 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Síguenos en el Taller
          </h2>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted mt-1">
            Etiquétanos con tus joyas usando el hashtag <span className="font-semibold text-boho-charcoal">#BohoartJewelry</span> para aparecer aquí.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/bohoartjewelry"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-boho-sand-200 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 text-white">
                <Heart className="w-5 h-5 fill-white group-hover:animate-heart-pop text-white" />
                <span className="text-xs font-bold tracking-wider">{post.likes}</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
