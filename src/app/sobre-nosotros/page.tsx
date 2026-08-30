import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Feather, Shield, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'El Taller Bohoart | Joyería Artesanal Hecha a Mano',
  description: 'Conoce la historia detrás de Bohoart Jewelry. Creamos joyas y pendientes en arcilla polimérica con dedicación, paciencia y amor en cada detalle.',
};

export default function AboutPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-boho-sand-200 text-boho-terracotta text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-boho-terracotta" />
            <span>Nuestra Historia</span>
          </div>
          <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal tracking-tight">
            El Arte de Crear Joyas con Alma y Arcilla
          </h1>
          <p className="text-sm sm:text-base text-boho-charcoal-muted leading-relaxed">
            Bohoart nació de una pasión: demostrar que la joyería puede ser llamativa, artística y a la vez tan ligera que te olvides de que la llevas puesta.
          </p>
        </div>

        {/* Visual Hero Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 relative aspect-square rounded-3xl overflow-hidden shadow-card border-4 border-white">
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
              alt="Proceso artesanal de corte y moldeado en arcilla"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-6 space-y-4 text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
            <h2 className="font-serif-boho text-2xl font-bold text-boho-charcoal">
              Cada pieza pasa por nuestras manos más de 12 veces
            </h2>
            <p>
              Detrás de cada par de pendientes hay horas de acondicionamiento de la arcilla, formulación de paletas de color únicas, corte con cortadores de precisión, texturizado botánico, horneado a temperaturas controladas, lijado al agua para un tacto de seda, ensamblado con acero inoxidable hipoalergénico y pulido final.
            </p>
            <p>
              No producimos en masa ni utilizamos moldes industriales. Cuando eliges Bohoart Jewelry, te llevas una pieza genuinamente irrepetible que lleva un pedacito de nuestra creatividad e ilusión.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              Comodidad Absoluta
            </h3>
            <p className="text-xs text-boho-charcoal-muted leading-relaxed">
              La arcilla polimérica es el material más ligero que existe para pendientes grandes. Dile adiós a los lóbulos doloridos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              Pieles Sensibles
            </h3>
            <p className="text-xs text-boho-charcoal-muted leading-relaxed">
              Trabajamos únicamente con fornituras en acero inoxidable 316L quirúrgico y plata 925, garantizando cero picores ni alergias.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              Packaging Sostenible
            </h3>
            <p className="text-xs text-boho-charcoal-muted leading-relaxed">
              Cada pedido se envía en saquitos de lino reutilizables y cajas de cartón reciclable protegidas con mimo.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-boho-terracotta text-white rounded-full font-bold text-xs hover:bg-boho-terracotta-600 transition-colors shadow-md"
          >
            <span>Ver las Creaciones del Taller</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

      </div>
    </div>
  );
}
