'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Heart, Sparkles, Shield, RefreshCw, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-boho-sand-100/80 border-t border-boho-sand-300 text-boho-charcoal pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value badges banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-boho-sand-300">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 border border-boho-sand-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-boho-sand-200 text-boho-terracotta flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-boho-charcoal">100% Hecho a Mano</h4>
              <p className="text-xs text-boho-charcoal-muted mt-0.5">
                Modelado en arcilla polimérica con amor, paciencia y máxima atención al detalle.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 border border-boho-sand-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-boho-sand-200 text-boho-terracotta flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-boho-charcoal">Hipoalergénico & Ligero</h4>
              <p className="text-xs text-boho-charcoal-muted mt-0.5">
                Fornituras en acero inoxidable 316L y plata 925. Joyas que no pesan en la oreja.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 border border-boho-sand-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-boho-sand-200 text-boho-terracotta flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-boho-charcoal">Envíos Cuidados</h4>
              <p className="text-xs text-boho-charcoal-muted mt-0.5">
                Packaging de regalo ecológico con saquito de lino. Envío gratis a partir de 40€.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Col 1 & 2: Brand Bio & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Bohoart Jewelry Logo"
                  fill
                  sizes="96px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <span className="font-serif-boho text-2xl font-bold tracking-tight text-boho-charcoal">
                  BOHO ART
                </span>
                <span className="text-[11px] tracking-[0.2em] text-boho-charcoal-muted uppercase block font-sans">
                  Handmade Jewelry
                </span>
              </div>
            </div>

            <p className="text-xs text-boho-charcoal-muted leading-relaxed max-w-sm">
              Piezas artesanales que cuentan historias. Creamos pendientes, collares y pulseras en arcilla polimérica pensados para mujeres auténticas que aprecian los detalles hechos a mano.
            </p>

            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-boho-charcoal mb-2">
                Únete al Club Bohoart (10% Dto. en tu 1º pedido)
              </h5>
              <form onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por suscribirte a Bohoart Jewelry!'); }} className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Tu correo electrónico..."
                  required
                  className="px-3.5 py-2 text-xs bg-white border border-boho-sand-300 rounded-l-full flex-1 focus:outline-none focus:border-boho-terracotta"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-r-full text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Unirme</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 3: Categorías */}
          <div>
            <h5 className="font-serif-boho text-base font-bold text-boho-charcoal mb-4">
              Colecciones
            </h5>
            <ul className="space-y-2.5 text-xs text-boho-charcoal-muted">
              <li>
                <Link href="/categorias/pendientes" className="hover:text-boho-terracotta transition-colors">
                  Pendientes de Arcilla
                </Link>
              </li>
              <li>
                <Link href="/categorias/pulseras" className="hover:text-boho-terracotta transition-colors">
                  Pulseras & Brazaletes
                </Link>
              </li>
              <li>
                <Link href="/categorias/collares" className="hover:text-boho-terracotta transition-colors">
                  Collares & Medallones
                </Link>
              </li>
              <li>
                <Link href="/categorias/anillos" className="hover:text-boho-terracotta transition-colors">
                  Anillos Esculpidos
                </Link>
              </li>
              <li>
                <Link href="/categorias/colecciones" className="hover:text-boho-terracotta transition-colors">
                  Packs de Regalo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Taller & Atención */}
          <div>
            <h5 className="font-serif-boho text-base font-bold text-boho-charcoal mb-4">
              Atención al Cliente
            </h5>
            <ul className="space-y-2.5 text-xs text-boho-charcoal-muted">
              <li>
                <Link href="/sobre-nosotros" className="hover:text-boho-terracotta transition-colors">
                  Sobre el Taller Bohoart
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-boho-terracotta transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/envios-y-devoluciones" className="hover:text-boho-terracotta transition-colors">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-boho-terracotta transition-colors">
                  Contacto & Pedidos Personalizados
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Información Legal & Redes */}
          <div>
            <h5 className="font-serif-boho text-base font-bold text-boho-charcoal mb-4">
              Síguenos
            </h5>
            <div className="space-y-3">
              <a
                href="https://instagram.com/bohoart.jewelry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs text-boho-charcoal hover:text-boho-terracotta transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-boho-sand-300 flex items-center justify-center text-boho-terracotta">
                  <Instagram className="w-4 h-4" />
                </div>
                <span>@bohoart.jewelry</span>
              </a>

              <p className="text-[11px] text-boho-charcoal-muted pt-2">
                ¿Dudas sobre tu pedido? Escríbenos a{' '}
                <a href="mailto:hola@bohoartjoyeria.com" className="text-boho-terracotta font-medium underline">
                  hola@bohoartjoyeria.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-boho-sand-300 flex flex-col sm:flex-row items-center justify-between text-xs text-boho-charcoal-muted space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <span>© {new Date().getFullYear()} Bohoart Jewelry. Creado a mano con</span>
            <Heart className="w-3.5 h-3.5 text-boho-terracotta fill-boho-terracotta" />
            <span>en España.</span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
            <Link href="/aviso-legal" className="hover:text-boho-terracotta transition-colors">
              Aviso Legal
            </Link>
            <Link href="/privacidad" className="hover:text-boho-terracotta transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-boho-terracotta transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
