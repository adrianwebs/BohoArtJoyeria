import React from 'react';
import Image from 'next/image';
import { Instagram, Mail, Sparkles, Heart, Clock } from 'lucide-react';
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

      {/* Top Bar with brand logo (centered) */}
      <div className="max-w-4xl mx-auto w-full flex justify-center items-center relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <Image
              src="/logo.png"
              alt="Bohoart Jewelry Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <div>
            <span className="font-serif-boho text-2xl font-bold tracking-tight text-boho-charcoal block">
              BOHO ART
            </span>
            <span className="text-[11px] tracking-[0.25em] text-boho-charcoal-muted uppercase block font-sans">
              Handmade Jewelry
            </span>
          </div>
        </div>
      </div>

      {/* Center Card */}
      <div className="max-w-2xl mx-auto w-full text-center my-10 relative z-10">
        <div className="bg-white p-8 sm:p-14 rounded-3xl border border-boho-sand-200 shadow-card space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-boho-sand-200 text-boho-terracotta text-xs font-bold uppercase tracking-wider">
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
                href={settings.instagramUrl || 'https://instagram.com/bohoart.jewelry'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>@bohoart.jewelry en Instagram</span>
              </a>

              <a
                href={`mailto:${settings.contactEmail || 'hola@bohoartjoyeria.com'}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-boho-sand-100 hover:bg-boho-sand-200 border border-boho-sand-300 text-boho-charcoal rounded-full text-xs font-semibold transition-colors active:scale-95"
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
