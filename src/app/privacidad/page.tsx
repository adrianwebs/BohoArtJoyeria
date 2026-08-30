import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad (RGPD) | Bohoart Jewelry',
};

export default function PrivacyPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-boho-sand-200 shadow-soft space-y-6 text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
        <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal mb-4">
          Política de Privacidad (RGPD)
        </h1>
        <p>
          En <strong>Bohoart Jewelry</strong> nos comprometemos a garantizar que tu información personal esté protegida y no se utilice indebidamente, conforme al Reglamento General de Protección de Datos (RGPD UE 2016/679) y la LOPDGDD 3/2018.
        </p>
        <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal pt-2">
          Finalidad del tratamiento
        </h2>
        <p>
          Los datos personales facilitados (nombre, correo electrónico, dirección física y teléfono) se recopilan con la única finalidad de gestionar la tramitación de pedidos, realizar los envíos postales de tus joyas artesanales y responder a tus consultas de atención al cliente.
        </p>
        <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal pt-2">
          Derechos ARCO
        </h2>
        <p>
          Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, limitación y oposición enviando un email a <strong>hola@bohoartjoyeria.com</strong>.
        </p>
      </div>
    </div>
  );
}
