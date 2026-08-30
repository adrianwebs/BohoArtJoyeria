import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal | Bohoart Jewelry',
};

export default function LegalPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-boho-sand-200 shadow-soft space-y-6 text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
        <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal mb-4">
          Aviso Legal
        </h1>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios que el titular del sitio web <strong>https://bohoartjoyeria.com</strong> es <strong>Bohoart Jewelry</strong>, con domicilio en España y correo de contacto <strong>hola@bohoartjoyeria.com</strong>.
        </p>
        <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal pt-4">
          Propiedad Intelectual
        </h2>
        <p>
          Todos los contenidos de esta web, incluyendo diseños de piezas de joyería, imágenes, logotipos, textos, ilustraciones y código fuente, son propiedad exclusiva de Bohoart Jewelry y están protegidos por las leyes de propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización previa.
        </p>
      </div>
    </div>
  );
}
