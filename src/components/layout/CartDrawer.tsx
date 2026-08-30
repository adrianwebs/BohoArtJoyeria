'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  const freeShippingThreshold = 40.0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="p-5 border-b border-boho-sand-200 flex items-center justify-between bg-boho-sand-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-boho-terracotta" />
              <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
                Tu Cesta Artesanal ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-boho-sand-200 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
              aria-label="Cerrar cesta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="px-5 py-3 bg-boho-sand-100/60 border-b border-boho-sand-200">
            <div className="flex items-center justify-between text-xs font-medium text-boho-charcoal mb-1.5">
              <span>
                {remainingForFreeShipping > 0
                  ? `¡Añade ${formatPrice(remainingForFreeShipping)} más para ENVÍO GRATIS!`
                  : '🎉 ¡Enhorabuena! Tienes ENVÍO GRATIS'}
              </span>
              <span className="font-bold text-boho-terracotta">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-boho-sand-300 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-boho-gold to-boho-terracotta h-full rounded-full transition-all duration-500 shimmer-mask"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4 animate-slide-up">
                <div className="w-16 h-16 bg-boho-sand-100 text-boho-terracotta rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-subtle">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal mb-1">
                  Tu cesta está vacía
                </h3>
                <p className="text-sm text-boho-charcoal-muted mb-6">
                  Descubre nuestras piezas moldeadas a mano con arcilla polimérica.
                </p>
                <Link
                  href="/catalogo"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-boho-terracotta text-white rounded-full font-medium text-sm hover:bg-boho-terracotta-600 active:scale-95 transition-all shadow-sm"
                >
                  Explorar Colección
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const img = item.product.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={item.product.id}
                    className="flex space-x-4 p-3 rounded-2xl border border-boho-sand-200 bg-white hover:border-boho-sand-300 hover:shadow-soft transition-all duration-200"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-boho-sand-100 shrink-0">
                      <Image
                        src={img}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/productos/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-medium text-sm text-boho-charcoal hover:text-boho-terracotta transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-boho-charcoal-muted hover:text-red-600 active:scale-90 p-1 transition-all"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-boho-charcoal-muted font-sans mt-0.5">
                          {formatPrice(item.product.price)} / ud.
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-boho-sand-300 rounded-full bg-boho-sand-50/70 px-1.5 py-0.5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
                            aria-label="Restar una unidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-boho-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
                            aria-label="Añadir una unidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-sm text-boho-charcoal">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-boho-sand-200 bg-boho-sand-50/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-boho-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-boho-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-boho-charcoal-muted">
                  <span>Envío estimado</span>
                  <span>
                    {remainingForFreeShipping <= 0 ? (
                      <span className="text-boho-sage font-semibold uppercase text-xs">Gratis</span>
                    ) : (
                      formatPrice(3.95)
                    )}
                  </span>
                </div>
                <div className="border-t border-boho-sand-200 pt-2 flex justify-between text-base font-bold text-boho-charcoal">
                  <span>Total</span>
                  <span className="text-boho-terracotta">
                    {formatPrice(subtotal + (remainingForFreeShipping <= 0 ? 0 : 3.95))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-boho-terracotta text-white rounded-full font-semibold text-sm hover:bg-boho-terracotta-600 transition-all shadow-md group"
                >
                  <span>Tramitar Pedido</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="w-full block text-center py-2 text-xs font-medium text-boho-charcoal-muted hover:text-boho-terracotta transition-colors"
                >
                  Ver resumen de carrito completo
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-boho-charcoal-muted pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-boho-sage" />
                <span>Pago 100% seguro con PayPal y Tarjeta</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
