'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'materials' | 'shipping' | 'care'>('materials');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'];

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      
      {/* Left Column: Gallery */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main large image */}
        <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-white border border-boho-sand-200 shadow-card">
          <Image
            src={images[selectedImageIndex] || images[0]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover object-center transition-all duration-500"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-boho-gold text-white shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Destacado
              </span>
            )}
            {hasDiscount && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md">
                -{discountPercent}% Descuento
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all shadow-soft ${
                  selectedImageIndex === idx
                    ? 'border-boho-terracotta ring-2 ring-boho-terracotta/20 scale-105'
                    : 'border-boho-sand-300 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} miniatura ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Purchasing & Product Info */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Category & Title */}
        <div>
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-1.5">
              {product.category.name}
            </span>
          )}
          <h1 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Reviews Rating Header */}
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-boho-gold">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-boho-gold text-boho-gold" />
              ))}
            </div>
            <span className="text-xs font-semibold text-boho-charcoal">
              {product.rating || 5}.0
            </span>
            <span className="text-xs text-boho-charcoal-muted">
              ({product.reviewCount || 1} valoraciones de clientas)
            </span>
          </div>
        </div>

        {/* Price Box */}
        <div className="p-4 rounded-2xl bg-white border border-boho-sand-200 shadow-soft flex items-baseline justify-between">
          <div className="flex items-baseline space-x-3">
            <span className="font-serif-boho text-3xl font-extrabold text-boho-charcoal">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-boho-charcoal-muted line-through">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>
          <span className="text-xs text-boho-sage font-semibold uppercase tracking-wider">
            IVA Incluido
          </span>
        </div>

        {/* Short Description */}
        <div className="text-sm text-boho-charcoal-muted leading-relaxed whitespace-pre-line">
          {product.description}
        </div>

        {/* Stock & Delivery Alerts */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-boho-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-boho-sage animate-pulse" />
            <span>
              {product.stock > 0
                ? `En stock para envío inmediato (${product.stock} disponibles en taller)`
                : 'Agotado temporalmente'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-boho-charcoal-muted">
            <Truck className="w-4 h-4 text-boho-terracotta" />
            <span>Entrega estimada en 24-48 horas con número de seguimiento.</span>
          </div>
        </div>

        {/* Quantity and Add to Cart Button */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-boho-sand-300 rounded-full bg-white px-3 py-2 shadow-soft">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
                aria-label="Restar unidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-boho-charcoal">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
                aria-label="Sumar unidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-4 px-6 rounded-full font-bold text-sm shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-all duration-300 ${
                addedAnimation
                  ? 'bg-boho-sage text-white scale-[1.02]'
                  : 'bg-boho-terracotta hover:bg-boho-terracotta-600 text-white hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5 animate-badge-bounce" />
                  <span>¡Añadido a la Cesta!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Añadir a la Cesta • {formatPrice(product.price * quantity)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Accordion Specs */}
        <div className="pt-6 border-t border-boho-sand-200 space-y-3">
          {/* Item 1: Materiales */}
          <div className="border border-boho-sand-200 rounded-2xl bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
            <button
              onClick={() => setActiveTab(activeTab === 'materials' ? ('' as any) : 'materials')}
              className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-boho-charcoal flex justify-between items-center hover:text-boho-terracotta transition-colors"
            >
              <span>Materiales & Especificaciones</span>
              <span className={`transform transition-transform duration-300 ${activeTab === 'materials' ? 'rotate-180 text-boho-terracotta' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {activeTab === 'materials' && (
              <div className="px-4 pb-4 text-xs text-boho-charcoal-muted space-y-2 border-t border-boho-sand-100 pt-3 animate-slide-down">
                <p>
                  <strong className="text-boho-charcoal">Composición:</strong> {product.materials || 'Arcilla polimérica horneada artesanalmente con fornituras hipoalergénicas.'}
                </p>
                {product.dimensions && (
                  <p>
                    <strong className="text-boho-charcoal">Dimensiones:</strong> {product.dimensions}
                  </p>
                )}
                <p>
                  <strong className="text-boho-charcoal">Peso ultraligero:</strong> ~{product.weightGrams || 4} gramos por pieza (no deforma el lóbulo).
                </p>
                {product.sku && (
                  <p>
                    <strong className="text-boho-charcoal">Referencia / SKU:</strong> {product.sku}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Item 2: Cuidados */}
          <div className="border border-boho-sand-200 rounded-2xl bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
            <button
              onClick={() => setActiveTab(activeTab === 'care' ? ('' as any) : 'care')}
              className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-boho-charcoal flex justify-between items-center hover:text-boho-terracotta transition-colors"
            >
              <span>Cuidados de la Arcilla Polimérica</span>
              <span className={`transform transition-transform duration-300 ${activeTab === 'care' ? 'rotate-180 text-boho-terracotta' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {activeTab === 'care' && (
              <div className="px-4 pb-4 text-xs text-boho-charcoal-muted space-y-1.5 border-t border-boho-sand-100 pt-3 animate-slide-down">
                <p>• La arcilla cocida es duradera y flexible, pero evita doblarla con fuerza innecesaria.</p>
                <p>• No apliques colonias, perfumes o lacas directamente sobre la pieza.</p>
                <p>• Para limpiar el polvo o maquillaje superficial, usa un paño suave ligeramente humedecido.</p>
              </div>
            )}
          </div>

          {/* Item 3: Envíos y Garantía */}
          <div className="border border-boho-sand-200 rounded-2xl bg-white overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
            <button
              onClick={() => setActiveTab(activeTab === 'shipping' ? ('' as any) : 'shipping')}
              className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-boho-charcoal flex justify-between items-center hover:text-boho-terracotta transition-colors"
            >
              <span>Envíos, Packaging & Devoluciones</span>
              <span className={`transform transition-transform duration-300 ${activeTab === 'shipping' ? 'rotate-180 text-boho-terracotta' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {activeTab === 'shipping' && (
              <div className="px-4 pb-4 text-xs text-boho-charcoal-muted space-y-1.5 border-t border-boho-sand-100 pt-3 animate-slide-down">
                <p>• <strong>Envío Gratis:</strong> En compras superiores a 40€ en Península y Baleares.</p>
                <p>• <strong>Packaging de Regalo:</strong> Todas las piezas viajan en saquito de tela natural y caja protegida con flores secas.</p>
                <p>• <strong>Garantía:</strong> 14 días naturales para cambios y devoluciones sin complicaciones.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
