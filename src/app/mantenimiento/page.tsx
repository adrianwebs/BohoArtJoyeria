import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail, Sparkles, Heart, Clock, Lock } from 'lucide-react';
import { storeService } from '@/lib/storeService';

export const metadata = {
  title: 'En Mantenimiento | Bohoart Jewelry',
  description: 'Estamos renovando nuestro taller y preparando nuevas colecciones de joyería artesanal en arcilla polimérica.',
};

export default async function MaintenancePage() {
  const settings = await storeService.getSettings();

  return (
    <div className="min-h-screen bg-boho-linen flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-boho-terracotta/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-boho-gold/15 blur-3xl pointer-events-none" />

      {/* Top Bar with brand logo */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-boho-terracotta/40 shadow-soft">
            <Image
              src="/logo.png"
              alt="Bohoart Jewelry Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-serif-boho text-xl font-bold tracking-tight text-boho-charcoal block">
              BOHO ART
            </span>
            <span className="text-[10px] tracking-[0.25em] text-boho-charcoal-muted uppercase block font-sans">
              Handmade Jewelry
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white border border-boho-sand-300 text-xs font-semibold text-boho-charcoal hover:text-boho-terracotta hover:border-boho-terracotta transition-colors shadow-soft"
        >
          <Lock className="w-3.5 h-3.5 text-boho-terracotta" />
          <span>Acceso Taller</span>
        </Link>
      </div>

      {/* Center Card */}
      <div className="max-w-2xl mx-auto w-full text-center my-12 relative z-10">
        <div className="bg-white p-8 sm:p-14 rounded-3xl border border-boho-sand-200 shadow-card space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-boho-sand-200 text-boho-terracotta text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-boho-gold animate-spin" />
            <span>Taller en Preparación</span>
          </div>

          <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal tracking-tight leading-tight">
            {settings.maintenanceTitle || '✨ Estamos horneando novedades en el taller ✨'}
          </h1>

          <p className="text-sm sm:text-base text-boho-charcoal-muted leading-relaxed max-w-lg mx-auto">
            {settings.maintenanceMessage || 'Nuestra tienda online se encuentra temporalmente en pausa para incorporar nuevas piezas únicas modeladas en arcilla polimérica. ¡Volvemos en muy poco tiempo!'}
          </p>

          {/* Value highlights */}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-boho-sand-200 max-w-md mx-auto text-xs">
            <div className="flex items-center justify-center space-x-1.5 text-boho-charcoal font-medium">
              <Clock className="w-4 h-4 text-boho-terracotta" />
              <span>Apertura en breve</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 text-boho-charcoal font-medium">
              <Sparkles className="w-4 h-4 text-boho-gold" />
              <span>Nuevas Colecciones</span>
            </div>
          </div>

          {/* Social connections */}
          <div className="pt-2 space-y-3">
            <p className="text-xs text-boho-charcoal font-semibold">
              Mientras tanto, puedes seguir nuestro día a día y adelantos en:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={settings.instagramUrl || 'https://instagram.com/bohoartjewelry'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold transition-all shadow-md"
              >
                <Instagram className="w-4 h-4" />
                <span>@bohoartjewelry en Instagram</span>
              </a>

              <a
                href={`mailto:${settings.contactEmail || 'hola@bohoartjoyeria.com'}`}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-boho-sand-100 hover:bg-boho-sand-200 border border-boho-sand-300 text-boho-charcoal rounded-full text-xs font-semibold transition-colors"
              >
                <Mail className="w-4 h-4 text-boho-terracotta" />
                <span>Contactar por Email</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-boho-charcoal-muted relative z-10">
        <div className="flex items-center justify-center space-x-1">
          <span>Bohoart Jewelry © {new Date().getFullYear()} • Creado con amor y detalle en España</span>
          <Heart className="w-3.5 h-3.5 text-boho-terracotta fill-boho-terracotta ml-1" />
        </div>
      </div>

    </div>
  );
}
