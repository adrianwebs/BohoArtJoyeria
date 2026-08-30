'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, ArrowLeft, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'CARD_MOCK'>('PAYPAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const freeShippingThreshold = 40.0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 3.95;
  const totalAmount = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="bg-boho-linen min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-boho-sand-200 shadow-soft">
          <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-2">
            No tienes productos para tramitar
          </h2>
          <p className="text-xs text-boho-charcoal-muted mb-6">
            Añade al menos una joya artesanal a tu cesta para continuar.
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-6 py-3 bg-boho-terracotta text-white rounded-full text-xs font-semibold"
          >
            Ir al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
      setErrorMsg('Por favor completa todos los datos obligatorios de envío.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        province: province || city,
        country: 'España',
        subtotal,
        shippingCost,
        totalAmount,
        paymentMethod,
        paypalOrderId: paymentMethod === 'PAYPAL' ? `PAYPAL-SANDBOX-${Date.now()}` : null,
        status: 'PAID', // In sandbox / test flow it marks as paid immediately
        notes,
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0] || null,
          unitPrice: item.product.price,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        throw new Error('Error al procesar el pedido en el servidor');
      }

      const createdOrder = await res.json();
      clearCart();
      router.push(`/checkout/exito?orderNumber=${createdOrder.orderNumber}&email=${encodeURIComponent(customerEmail)}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado al tramitar tu pedido.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-boho-linen min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/carrito"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-boho-charcoal-muted hover:text-boho-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la cesta</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Column */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Datos de Contacto & Envío */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-boho-sand-200">
                <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-boho-terracotta text-white text-xs flex items-center justify-center font-sans">
                    1
                  </span>
                  <span>Datos de Envío & Entrega</span>
                </h2>
                <span className="text-[11px] text-boho-charcoal-muted">* Campos obligatorios</span>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Carmen Navarro"
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Email de Confirmación *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="carmen@ejemplo.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Teléfono de Contacto (para el transportista)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Dirección de Envío *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Calle, número, piso, puerta..."
                  className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Madrid"
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="28001"
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Madrid"
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Notas para la entrega o dedicatoria de regalo (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Si es para regalo, escribe aquí el mensaje para la tarjeta..."
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta resize-none"
                />
              </div>
            </div>

            {/* Step 2: Método de Pago (PayPal & Tarjeta) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-boho-sand-200">
                <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-boho-terracotta text-white text-xs flex items-center justify-center font-sans">
                    2
                  </span>
                  <span>Método de Pago Seguro</span>
                </h2>
                <div className="flex items-center space-x-1 text-xs text-boho-sage font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit SSL</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* PayPal option */}
                <label
                  onClick={() => setPaymentMethod('PAYPAL')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'PAYPAL'
                      ? 'border-boho-terracotta bg-boho-sand-50/80 shadow-soft'
                      : 'border-boho-sand-300 hover:border-boho-sand-400 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'PAYPAL'}
                      onChange={() => setPaymentMethod('PAYPAL')}
                      className="text-boho-terracotta focus:ring-boho-terracotta"
                    />
                    <div>
                      <span className="font-bold text-xs text-boho-charcoal block">
                        PayPal (Saldo, Tarjeta o Pago en 3 plazos)
                      </span>
                      <span className="text-[11px] text-boho-charcoal-muted">
                        Paga de forma rápida y 100% segura con tu cuenta de PayPal o tarjeta asociada.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#003087] bg-white px-2.5 py-1 rounded-lg border border-boho-sand-300 shadow-xs">
                    PayPal
                  </span>
                </label>

                {/* Card option */}
                <label
                  onClick={() => setPaymentMethod('CARD_MOCK')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CARD_MOCK'
                      ? 'border-boho-terracotta bg-boho-sand-50/80 shadow-soft'
                      : 'border-boho-sand-300 hover:border-boho-sand-400 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'CARD_MOCK'}
                      onChange={() => setPaymentMethod('CARD_MOCK')}
                      className="text-boho-terracotta focus:ring-boho-terracotta"
                    />
                    <div>
                      <span className="font-bold text-xs text-boho-charcoal block">
                        Tarjeta de Débito / Crédito
                      </span>
                      <span className="text-[11px] text-boho-charcoal-muted">
                        Visa, Mastercard, Maestro y Bizum.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-boho-charcoal-muted uppercase tracking-wider font-semibold">
                    Visa / MC
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Procesando pago seguro...</span>
                  ) : (
                    <span>Confirmar y Pagar {formatPrice(totalAmount)} con {paymentMethod === 'PAYPAL' ? 'PayPal' : 'Tarjeta'}</span>
                  )}
                </button>
              </div>
            </div>

          </form>

          {/* Right Column: Order Items Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-6">
            <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal pb-3 border-b border-boho-sand-200">
              Tu Pedido ({cart.reduce((s, i) => s + i.quantity, 0)} artículos)
            </h3>

            {/* Products preview */}
            <div className="space-y-3 divide-y divide-boho-sand-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-boho-sand-100 shrink-0 border border-boho-sand-200">
                      <Image
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-boho-charcoal line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-boho-charcoal-muted">
                        Cant: {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-xs text-boho-charcoal">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-boho-sand-200 space-y-2 text-xs">
              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-boho-charcoal">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Envío</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-boho-sage font-bold uppercase text-[11px]">Gratis</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-boho-sand-200 flex justify-between text-base font-bold text-boho-charcoal">
                <span>Total a pagar</span>
                <span className="text-boho-terracotta">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-boho-sand-100/70 space-y-2 text-[11px] text-boho-charcoal-muted">
              <div className="flex items-center space-x-2 font-medium text-boho-charcoal">
                <Sparkles className="w-4 h-4 text-boho-gold shrink-0" />
                <span>Empaquetado Artesanal Incluido</span>
              </div>
              <p>Cada pieza se envía en saquito de lino protegido con tarjetita y envoltorio para regalo.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
