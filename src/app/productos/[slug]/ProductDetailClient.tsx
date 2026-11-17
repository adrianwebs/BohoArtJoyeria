'use client';

import React, { useMemo, useState } from 'react';
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
import { Product, ProductVariant, VariantValue } from '@/lib/types';
import { AttributeSwatch } from '@/components/store/AttributeSwatch';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';
import { StockNotifyForm } from '@/components/marketing/StockNotifyForm';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'materials' | 'shipping' | 'care'>('materials');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // --- Variants: one selector per attribute group; the chosen combination drives price, stock and image ---
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const groups = useMemo(() => {
    const map = new Map<string, { id: string; name: string; type: VariantValue['groupType']; values: VariantValue[] }>();
    for (const v of variants) {
      for (const val of v.values) {
        let g = map.get(val.groupId);
        if (!g) {
          g = { id: val.groupId, name: val.groupName, type: val.groupType, values: [] };
          map.set(val.groupId, g);
        }
        if (!g.values.some((x) => x.id === val.id)) g.values.push(val);
      }
    }
    for (const g of map.values()) g.values.sort((a, b) => a.sortOrder - b.sortOrder);
    return [...map.values()];
  }, [variants]);

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first = variants.find((v) => v.stock > 0) ?? variants[0];
    return first ? Object.fromEntries(first.values.map((x) => [x.groupId, x.id])) : {};
  });
  const [imageOverride, setImageOverride] = useState(true);

  const selectedVariant: ProductVariant | undefined = variants.find(
    (v) => groups.length > 0 && groups.every((g) => v.values.some((x) => x.id === selection[g.id]))
  );
  const hasVariants = variants.length > 0;

  /** A value is selectable when some in-stock combination contains it together with the other chosen values. */
  const isValueAvailable = (groupId: string, valueId: string) =>
    variants.some(
      (v) =>
        v.stock > 0 &&
        v.values.some((x) => x.id === valueId) &&
        Object.entries(selection).every(
          ([gid, vid]) => gid === groupId || v.values.some((x) => x.id === vid)
        )
    );

  const selectValue = (groupId: string, valueId: string) => {
    setSelection((prev) => {
      const next = { ...prev, [groupId]: valueId };
      // If the new combination does not exist / is out of stock, move the other groups to the closest in-stock one.
      const ok = variants.some((v) => v.stock > 0 && groups.every((g) => v.values.some((x) => x.id === next[g.id])));
      if (ok) return next;
      const fallback = variants.find((v) => v.stock > 0 && v.values.some((x) => x.id === valueId));
      return fallback ? Object.fromEntries(fallback.values.map((x) => [x.groupId, x.id])) : next;
    });
    setImageOverride(true);
  };

  const currentPrice = hasVariants ? (selectedVariant?.price ?? product.price) : product.price;
  const currentStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const variantImage = hasVariants && imageOverride ? selectedVariant?.image : null;

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'];

  const hasDiscount = product.comparePrice && product.comparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - currentPrice) / product.comparePrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (hasVariants) {
      if (!selectedVariant || selectedVariant.stock <= 0) return;
      addToCart(product, quantity, {
        id: selectedVariant.id,
        label: selectedVariant.label,
        price: selectedVariant.price,
        stock: selectedVariant.stock,
        image: selectedVariant.image ?? null,
      });
    } else {
      addToCart(product, quantity);
    }
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
            src={variantImage || images[selectedImageIndex] || images[0]}
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
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setImageOverride(false);
                }}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all shadow-soft ${
                  !variantImage && selectedImageIndex === idx
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
              {formatPrice(currentPrice)}
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

        {/* Variant selectors */}
        {hasVariants && (
          <div className="space-y-4">
            {groups.map((g) => {
              const chosen = g.values.find((x) => x.id === selection[g.id]);
              return (
                <div key={g.id}>
                  <div className="text-xs font-bold uppercase tracking-wider text-boho-charcoal mb-2">
                    {g.name}
                    {chosen && <span className="ml-1.5 font-medium normal-case tracking-normal text-boho-charcoal-muted">{chosen.name}</span>}
                  </div>
                  {g.type === 'select' ? (
                    <select
                      value={selection[g.id] ?? ''}
                      onChange={(e) => selectValue(g.id, e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                    >
                      {g.values.map((val) => (
                        <option key={val.id} value={val.id} disabled={!isValueAvailable(g.id, val.id)}>
                          {val.name}
                          {!isValueAvailable(g.id, val.id) ? ' (agotado)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {g.values.map((val) => {
                        const active = selection[g.id] === val.id;
                        const available = isValueAvailable(g.id, val.id);
                        return g.type === 'color' ? (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => selectValue(g.id, val.id)}
                            disabled={!available}
                            title={available ? val.name : `${val.name} (agotado)`}
                            aria-label={val.name}
                            aria-pressed={active}
                            className={`relative p-1 rounded-full border-2 transition-all ${
                              active ? 'border-boho-terracotta' : 'border-transparent hover:border-boho-sand-300'
                            } ${available ? '' : 'opacity-40 cursor-not-allowed'}`}
                          >
                            <AttributeSwatch hex={val.hex} isMulticolor={val.isMulticolor} size={28} />
                            {!available && (
                              <span className="absolute inset-1 flex items-center justify-center">
                                <span className="block w-full h-px bg-boho-charcoal rotate-45" />
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => selectValue(g.id, val.id)}
                            disabled={!available}
                            aria-pressed={active}
                            className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
                              active
                                ? 'border-boho-terracotta bg-boho-terracotta/10 text-boho-terracotta'
                                : 'border-boho-sand-300 bg-white text-boho-charcoal hover:border-boho-terracotta'
                            } ${available ? '' : 'opacity-40 line-through cursor-not-allowed'}`}
                          >
                            {val.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stock & Delivery Alerts */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-boho-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-boho-sage animate-pulse" />
            <span>
              {currentStock > 0
                ? `En stock para envío inmediato (${currentStock} disponibles)`
                : 'Agotado temporalmente'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-boho-charcoal-muted">
            <Truck className="w-4 h-4 text-boho-terracotta" />
            <span>Entrega estimada en 24-48 horas con número de seguimiento.</span>
          </div>
        </div>

        {product.stock <= 0 && <StockNotifyForm productId={product.id} />}

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
                onClick={() => setQuantity(currentStock > 0 ? Math.min(quantity + 1, currentStock) : quantity + 1)}
                className="p-1 text-boho-charcoal-muted hover:text-boho-charcoal active:scale-90 transition-all"
                aria-label="Sumar unidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0 || (hasVariants && !selectedVariant)}
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
                  <span>Añadir a la Cesta • {formatPrice(currentPrice * quantity)}</span>
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
                {(selectedVariant?.sku || product.sku) && (
                  <p>
                    <strong className="text-boho-charcoal">Referencia / SKU:</strong> {selectedVariant?.sku || product.sku}
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
