'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Feather, ShieldCheck } from 'lucide-react';

const HIGHLIGHT_WORDS = [
  'amor y detalle',
  'arcilla pura',
  'alma bohemia',
  'diseño propio',
  'texturas de tierra',
];

export function HeroBanner() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % HIGHLIGHT_WORDS.length);
        setFadeState('in');
      }, 350);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-boho-sand-100 via-boho-sand-50 to-boho-linen py-12 md:py-20 lg:py-24 border-b border-boho-sand-200">
      {/* Dynamic Animated Ambient Glows & Drifting Particles */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[28rem] h-[28rem] rounded-full bg-boho-terracotta/15 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-boho-gold/20 blur-3xl pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-boho-sand-300/30 blur-2xl pointer-events-none animate-pulse-subtle" />

      {/* Floating micro particles */}
      <div className="absolute top-12 left-10 w-3 h-3 rounded-full bg-boho-gold/40 blur-[1px] animate-float-slow pointer-events-none hidden sm:block" />
      <div className="absolute bottom-20 left-1/4 w-4 h-4 rounded-full bg-boho-terracotta/30 blur-[1px] animate-float-reverse pointer-events-none hidden sm:block" />
      <div className="absolute top-24 right-1/4 w-2.5 h-2.5 rounded-full bg-boho-sage/40 blur-[1px] animate-float-slow pointer-events-none hidden sm:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Brand Story & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-boho-sand-300 text-boho-terracotta text-xs font-semibold shadow-soft hover:shadow-card hover:scale-105 transition-all duration-300 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-boho-sage animate-ping" />
              <span className="w-2 h-2 rounded-full bg-boho-sage -ml-4" />
              <Sparkles className="w-3.5 h-3.5 text-boho-gold" />
              <span>Joyería de autor en arcilla polimérica</span>
            </div>

            {/* Headline with Live Word Morpher */}
            <h1 className="font-serif-boho text-3xl sm:text-5xl lg:text-6xl font-extrabold text-boho-charcoal tracking-tight leading-[1.15] animate-slide-up">
              Diseños únicos, esculpidos a mano con{' '}
              <span
                className={`inline-block text-boho-terracotta font-normal italic transition-all duration-300 transform ${
                  fadeState === 'in'
                    ? 'opacity-100 translate-y-0 filter blur-0 scale-100'
                    : 'opacity-0 -translate-y-3 filter blur-sm scale-95'
                }`}
              >
                {HIGHLIGHT_WORDS[currentWordIndex]}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-boho-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up">
              Descubre piezas exclusivas y ultraligeras que combinan la calidez de los tonos tierra con la elegancia bohemia contemporánea. No pesan, no dañan tus orejas y elevan cualquier look.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up">
              <Link
                href="/catalogo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-boho-terracotta text-white rounded-full font-semibold text-sm hover:bg-boho-terracotta-600 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl group shimmer-mask"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>

              <Link
                href="/categorias/pendientes"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-boho-charcoal border border-boho-sand-300 hover:border-boho-terracotta hover:text-boho-terracotta active:scale-95 rounded-full font-semibold text-sm transition-all duration-200 shadow-soft hover:shadow-md hover:bg-boho-sand-50"
              >
                <span>Pendientes Destacados</span>
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-6 border-t border-boho-sand-300/60 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div className="group cursor-default p-2 rounded-2xl hover:bg-white/80 hover:shadow-soft transition-all duration-300">
                <span className="block font-serif-boho text-xl sm:text-2xl font-bold text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                  100%
                </span>
                <span className="text-[11px] text-boho-charcoal-muted">Hecho a mano</span>
              </div>
              <div className="group cursor-default p-2 rounded-2xl hover:bg-white/80 hover:shadow-soft transition-all duration-300">
                <span className="block font-serif-boho text-xl sm:text-2xl font-bold text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                  &lt;4g
                </span>
                <span className="text-[11px] text-boho-charcoal-muted">Ultraligeros</span>
              </div>
              <div className="group cursor-default p-2 rounded-2xl hover:bg-white/80 hover:shadow-soft transition-all duration-300">
                <span className="block font-serif-boho text-xl sm:text-2xl font-bold text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                  316L
                </span>
                <span className="text-[11px] text-boho-charcoal-muted">Acero Hipoalergénico</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Artistic Showcase with Floating Badges */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Background Layer 1: Warm Decorative Frame */}
            <div className="absolute inset-0 max-w-md aspect-square sm:aspect-[4/5] bg-gradient-to-tr from-boho-terracotta/20 to-boho-gold/30 rounded-3xl transform rotate-3 scale-98 translate-x-2 translate-y-2 pointer-events-none transition-transform duration-700 group-hover:rotate-6" />

            {/* Main Visual Image Card */}
            <div className="group relative w-full max-w-md aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated border-4 border-white transition-all duration-500 hover:scale-[1.01]">
              <Image
                src="https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1000&auto=format&fit=crop&q=85"
                alt="Pendientes artesanales Bohoart en arcilla polimérica"
                fill
                priority
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Floating Top Badge 1 */}
              <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-boho-sand-200 text-boho-charcoal text-[11px] font-semibold shadow-soft animate-float-slow">
                <Feather className="w-3.5 h-3.5 text-boho-terracotta" />
                <span>Peso pluma (&lt;4g)</span>
              </div>

              {/* Floating Top Badge 2 */}
              <div className="absolute top-4 right-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-boho-charcoal/85 backdrop-blur-md text-white text-[11px] font-medium shadow-soft animate-float-reverse">
                <Sparkles className="w-3.5 h-3.5 text-boho-gold" />
                <span>Edición Limitada</span>
              </div>

              {/* Floating Bottom Brand Card */}
              <div className="absolute bottom-5 inset-x-5 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-boho-sand-200 shadow-elevated flex items-center space-x-3 transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-boho-terracotta shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Bohoart Logo"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-boho-sage animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-boho-sage font-bold">
                      En el taller ahora
                    </span>
                  </div>
                  <span className="font-serif-boho text-sm font-bold text-boho-charcoal block truncate">
                    Colección Tierra & Solsticio
                  </span>
                </div>
                <Link
                  href="/catalogo"
                  className="p-2.5 bg-boho-sand-100 hover:bg-boho-terracotta hover:text-white rounded-full text-boho-charcoal transition-all duration-200 hover:rotate-12 shadow-sm shrink-0"
                  aria-label="Ver colección"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
