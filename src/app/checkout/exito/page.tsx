import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Heart, Sparkles, Mail } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : 'BH-2026-NUEVO';
  const email = typeof params.email === 'string' ? params.email : 'tu correo';

  return (
    <div className="bg-boho-linen min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-boho-sand-200 shadow-card text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-boho-sand-100 text-boho-sage flex items-center justify-center mx-auto shadow-soft">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <div className="inline-flex items-center space-x-1 text-boho-terracotta text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¡Pago Confirmado!</span>
          </div>
          <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">
            ¡Muchas gracias por tu pedido!
          </h1>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted mt-2">
            Hemos recibido tu orden y ya nos encontramos preparando tus piezas artesanales en el taller.
          </p>
        </div>

        {/* Order Card Detail */}
        <div className="p-5 rounded-2xl bg-boho-sand-50 border border-boho-sand-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-boho-sand-200 font-medium">
            <span className="text-boho-charcoal-muted">Número de Pedido:</span>
            <span className="font-bold text-boho-charcoal text-sm">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-boho-charcoal-muted flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Confirmación enviada a:</span>
            </span>
            <span className="font-semibold text-boho-charcoal">{email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-boho-charcoal-muted flex items-center space-x-1">
              <Package className="w-3.5 h-3.5" />
              <span>Plazo de entrega:</span>
            </span>
            <span className="font-semibold text-boho-sage">24-48 horas laborables</span>
          </div>
        </div>

        <div className="text-xs text-boho-charcoal-muted leading-relaxed">
          Te enviaremos un email con el número de seguimiento de la agencia de transporte tan pronto como el paquete salga de nuestro taller.
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-boho-terracotta text-white rounded-full font-bold text-xs hover:bg-boho-terracotta-600 transition-colors shadow-md"
          >
            <span>Volver a la Tienda</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="pt-4 border-t border-boho-sand-200 flex items-center justify-center space-x-1 text-xs text-boho-charcoal-muted">
          <span>Gracias por apoyar el trabajo artesanal y hecho a mano con</span>
          <Heart className="w-3.5 h-3.5 text-boho-terracotta fill-boho-terracotta" />
        </div>

      </div>
    </div>
  );
}
