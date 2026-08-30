import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies | Bohoart Jewelry',
};

export default function CookiesPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-boho-sand-200 shadow-soft space-y-6 text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
        <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal mb-4">
          Política de Cookies
        </h1>
        <p>
          Este sitio web utiliza cookies técnicas estrictamente necesarias para el funcionamiento de la cesta de compras y la sesión segura de usuario.
        </p>
      </div>
    </div>
  );
}
