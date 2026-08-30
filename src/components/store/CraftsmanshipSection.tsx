import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Feather, Heart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export function CraftsmanshipSection() {
  return (
    <section className="py-16 md:py-24 bg-boho-sand-50/70 border-y border-boho-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images Grid Showcase */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card border-2 border-white hover:shadow-elevated transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
                  alt="Taller de modelado de arcilla polimérica"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-soft border-2 border-white bg-boho-sand-200 hover:shadow-card transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80"
                  alt="Detalles de texturas y minerales"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-soft border-2 border-white bg-boho-sand-200 hover:shadow-card transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80"
                  alt="Colgante y fornituras doradas"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card border-2 border-white hover:shadow-elevated transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"
                  alt="Anillos y piezas artesanales"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </div>

          {/* Editorial Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-boho-terracotta/10 text-boho-terracotta text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-boho-terracotta animate-pulse" />
              <span>El Secreto de la Arcilla Polimérica</span>
            </div>

            <h2 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal tracking-tight leading-tight">
              ¿Por qué elegir joyas en arcilla polimérica?
            </h2>

            <p className="text-sm sm:text-base text-boho-charcoal-muted leading-relaxed">
              A diferencia de las joyas de metal pesado o resinas industriales, la <strong className="text-boho-charcoal font-semibold">arcilla polimérica de calidad artística</strong> horneada ofrece propiedades mágicas para la joyería contemporánea:
            </p>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2">
              <div className="group flex items-start space-x-4 p-3 rounded-2xl hover:bg-white/80 border border-transparent hover:border-boho-sand-200/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white text-boho-terracotta flex items-center justify-center shrink-0 shadow-soft border border-boho-sand-300 group-hover:scale-110 group-hover:bg-boho-terracotta group-hover:text-white transition-all duration-300">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                    Ultraligera como una pluma
                  </h4>
                  <p className="text-xs text-boho-charcoal-muted mt-0.5">
                    Un par de pendientes grandes pesa menos de 4-5 gramos. Puedes lucir pendientes maxi todo el día sin que se deforme o duela el lóbulo de la oreja.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-3 rounded-2xl hover:bg-white/80 border border-transparent hover:border-boho-sand-200/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white text-boho-terracotta flex items-center justify-center shrink-0 shadow-soft border border-boho-sand-300 group-hover:scale-110 group-hover:bg-boho-terracotta group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                    Hipoalergénico Garantizado
                  </h4>
                  <p className="text-xs text-boho-charcoal-muted mt-0.5">
                    Utilizamos pernos, aros y cadenas de acero inoxidable quirúrgico 316L y plata de ley 925, libres de níquel y plomo.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 p-3 rounded-2xl hover:bg-white/80 border border-transparent hover:border-boho-sand-200/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white text-boho-terracotta flex items-center justify-center shrink-0 shadow-soft border border-boho-sand-300 group-hover:scale-110 group-hover:bg-boho-terracotta group-hover:text-white transition-all duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-boho-charcoal group-hover:text-boho-terracotta transition-colors">
                    Piezas Irrepetibles
                  </h4>
                  <p className="text-xs text-boho-charcoal-muted mt-0.5">
                    Al modelarse y cortarse a mano, no existen dos piezas idénticas. Cada joya lleva una impronta única de artesanía.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/sobre-nosotros"
                className="inline-flex items-center space-x-2 text-sm font-bold text-boho-terracotta hover:text-boho-terracotta-600 active:scale-95 transition-all group"
              >
                <span>Conoce el paso a paso en nuestro taller</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
