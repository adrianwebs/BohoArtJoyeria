import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Envíos y Devoluciones | Bohoart Jewelry',
};

export default function ShippingReturnsPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-boho-sand-200 shadow-soft space-y-8">
        
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-1">
            Información de Compra
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">
            Envíos y Devoluciones
          </h1>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              1. Plazos de Preparación y Envío
            </h2>
            <p>
              Todas nuestras piezas se elaboran y revisan a mano en nuestro taller. Los pedidos con stock disponible se procesan y empaquetan en 24 horas laborables.
            </p>
            <p>
              Los envíos a España peninsular se entregan mediante mensajería urgente en 24 a 48 horas desde la salida del taller. Recibirás un enlace con el número de seguimiento para monitorear el paquete.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              2. Costes de Envío
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Península Ibérica:</strong> 3,95€ (Tarifa plana).</li>
              <li><strong>Envío Gratuito:</strong> En todas las compras superiores a 40,00€.</li>
              <li><strong>Islas Baleares:</strong> 5,95€ (Entrega en 48-72h).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              3. Política de Devoluciones (14 Días)
            </h2>
            <p>
              Dispones de 14 días naturales desde la recepción de tu pedido para solicitar un cambio o devolución si la pieza no cumple tus expectativas.
            </p>
            <p>
              Para iniciar una devolución, el producto debe encontrarse sin usar, en perfecto estado y en su empaquetado original. Escríbenos a <a href="mailto:hola@bohoartjoyeria.com" className="text-boho-terracotta underline font-semibold">hola@bohoartjoyeria.com</a> indicando tu número de pedido.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
