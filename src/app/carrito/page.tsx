'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
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
  } = useCart();

  const freeShippingThreshold = 40.0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 3.95;
  const total = subtotal + shippingCost;

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

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-boho-charcoal">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-boho-charcoal-muted">
                <span>Gastos de Envío</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-boho-sage font-bold uppercase text-xs">Gratis</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {!isFreeShipping && (
                <p className="text-[11px] text-boho-terracotta bg-boho-sand-100 p-2 rounded-xl">
                  💡 Te faltan {formatPrice(freeShippingThreshold - subtotal)} para conseguir <strong>Envío Gratis</strong>.
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
