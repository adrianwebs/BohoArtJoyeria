'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Sparkles, Tag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 40.0;
  const isFreeShipping = discountedSubtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 3.95;
  const total = discountedSubtotal + shippingCost;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponFeedback(null);
    try {
      const res = await applyCoupon(couponInput);
      if (res.success) {
        setCouponFeedback({ type: 'success', message: res.message });
        setCouponInput('');
      } else {
        setCouponFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-boho-linen min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md bg-white p-10 rounded-3xl border border-boho-sand-200 shadow-soft">
          <div className="w-20 h-20 bg-boho-sand-100 text-boho-terracotta rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 opacity-70" />
          </div>
          <h1 className="font-serif-boho text-2xl font-bold text-boho-charcoal mb-2">
            Tu cesta está vacía
          </h1>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted mb-6">
            Aún no has añadido joyas de arcilla polimérica. Explora nuestro catálogo para encontrar tu próximo flechazo.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-boho-terracotta text-white rounded-full font-semibold text-sm hover:bg-boho-terracotta-600 transition-colors shadow-md"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-boho-linen min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">
            Tu Cesta de Compra ({totalItems} {totalItems === 1 ? 'pieza' : 'piezas'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-boho-sand-200 shadow-soft divide-y divide-boho-sand-200">
              {cart.map((item) => {
                const img = item.product.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={item.product.id}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-boho-sand-100 shrink-0 border border-boho-sand-200">
                        <Image
                          src={img}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        {item.product.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-boho-terracotta">
                            {item.product.category.name}
                          </span>
                        )}
                        <Link
                          href={`/productos/${item.product.slug}`}
                          className="font-serif-boho text-base font-bold text-boho-charcoal hover:text-boho-terracotta transition-colors block"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-boho-charcoal-muted font-sans mt-0.5">
                          Precio unidad: {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-boho-sand-300 rounded-full bg-boho-sand-50/70 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal transition-colors"
                          aria-label="Restar unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-boho-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal transition-colors"
                          aria-label="Sumar unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Line Price */}
                      <div className="text-right min-w-[80px]">
                        <span className="font-bold text-base text-boho-charcoal">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-boho-charcoal-muted hover:text-red-600 transition-colors"
                        title="Eliminar de la cesta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 text-xs font-bold text-boho-terracotta hover:text-boho-terracotta-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Seguir Comprando</span>
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-boho-charcoal-muted hover:text-red-600 transition-colors underline"
              >
                Vaciar Cesta
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-6">
            <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal pb-3 border-b border-boho-sand-200">
              Resumen del Pedido
            </h2>

            {/* Promo Code Input in Cart */}
            <div className="pb-4 border-b border-boho-sand-200">
              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        Cupón {appliedCoupon.code} aplicado
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {appliedCoupon.discountType === 'PERCENTAGE'
                          ? `${appliedCoupon.discountValue}% de descuento`
                          : `${formatPrice(appliedCoupon.discountValue)} de descuento directo`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback(null);
                    }}
                    className="p-1 hover:bg-emerald-200/60 rounded-lg text-emerald-800 transition-colors"
                    title="Eliminar cupón"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="block text-xs font-semibold text-boho-charcoal">
                    Código Promocional
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Ej. BOHO10"
                      className="flex-1 px-3 py-2 text-xs uppercase font-mono tracking-wider bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3.5 py-2 bg-boho-charcoal hover:bg-boho-charcoal/90 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponFeedback && (
                    <div className={`flex items-center space-x-1.5 text-[11px] p-2 rounded-xl ${
                      couponFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {couponFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-boho-charcoal">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Gastos de Envío</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold uppercase text-xs">Gratis</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              {!isFreeShipping && (
                <p className="text-[11px] text-boho-terracotta bg-boho-sand-100 p-2 rounded-xl">
                  💡 Te faltan {formatPrice(freeShippingThreshold - discountedSubtotal)} para conseguir <strong>Envío Gratis</strong>.
                </p>
              )}

              <div className="pt-3 border-t border-boho-sand-200 flex justify-between text-lg font-bold text-boho-charcoal">
                <span>Total</span>
                <span className="text-boho-terracotta">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 px-6 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all group"
            >
              <span>Tramitar Pedido</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="pt-2 border-t border-boho-sand-200 space-y-2 text-[11px] text-boho-charcoal-muted">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-boho-sage shrink-0" />
                <span>Pago protegido con certificado SSL y PayPal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-boho-gold shrink-0" />
                <span>Incluye saquito de lino artesanal y empaquetado de regalo</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
