import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Heart, Sparkles, Mail, Smartphone } from 'lucide-react';
import { storeService } from '@/lib/storeService';
import { formatPrice, paypalMeLink, PAYPAL_ME_RE } from '@/lib/utils';

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : 'BH-2026-NUEVO';
  const email = typeof params.email === 'string' ? params.email : 'tu correo';

  // Manual-payment orders wait for the money. Amount and payment details are only shown when the email matches the order.
  const order = typeof params.orderNumber === 'string' ? await storeService.getOrderById(params.orderNumber) : null;
  const emailMatches = order && order.customerEmail.toLowerCase() === email.toLowerCase();
  const isPending = Boolean(emailMatches && order!.status === 'PENDING');
  const pendingBizum = isPending && order!.paymentMethod === 'BIZUM';
  const pendingPaypal = isPending && order!.paymentMethod === 'PAYPAL_ME';
  const settings = isPending ? await storeService.getSettings() : null;
  const bizumPhone = pendingBizum ? settings!.bizumPhone : null;
  const paypalLink =
    pendingPaypal && settings!.paypalMeUrl && PAYPAL_ME_RE.test(settings!.paypalMeUrl)
      ? paypalMeLink(settings!.paypalMeUrl, order!.totalAmount)
      : null;

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
            <span>{isPending ? '¡Pedido recibido!' : '¡Pago Confirmado!'}</span>
          </div>
          <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">
            ¡Muchas gracias por tu pedido!
          </h1>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted mt-2">
            {isPending
              ? 'Solo falta que realices el pago para empezar a preparar tus piezas.'
              : 'Hemos recibido tu orden y ya nos encontramos preparando tus piezas artesanales en el taller.'}
          </p>
        </div>

        {pendingBizum && bizumPhone && (
          <div className="p-5 rounded-2xl bg-[#e6f7f9] border border-[#0aa5b7]/30 text-left space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-[#067a88] uppercase tracking-wider text-[11px]">
              <Smartphone className="w-4 h-4" />
              <span>Cómo pagar por Bizum</span>
            </div>
            <p className="text-boho-charcoal">
              Envía <b>{formatPrice(order!.totalAmount)}</b> al número <b className="text-sm">{bizumPhone}</b>
            </p>
            <p className="text-boho-charcoal">
              Concepto: <b>{orderNumber}</b>
            </p>
            <p className="text-boho-charcoal-muted">
              Confirmaremos tu pedido por email en cuanto recibamos el pago.
            </p>
          </div>
        )}

        {paypalLink && (
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2 text-xs">
            <div className="font-bold text-[#003087] uppercase tracking-wider text-[11px]">Cómo pagar con PayPal</div>
            <p className="text-boho-charcoal">
              Importe: <b>{formatPrice(order!.totalAmount)}</b> · Nota del pago: <b>{orderNumber}</b>
            </p>
            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold transition-colors"
            >
              Pagar {formatPrice(order!.totalAmount)} con PayPal
            </a>
            <p className="text-boho-charcoal-muted">Confirmaremos tu pedido por email en cuanto recibamos el pago.</p>
          </div>
        )}

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
