'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Sparkles, Check, Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-boho-sand-200/80 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-boho-sand-100/50">
        <Link href={`/productos/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />
          {secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} detalle`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
            />
          )}
        </Link>

        {/* Wishlist Quick Button */}
        <button
          onClick={toggleLike}
          aria-label="Añadir a favoritos"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-boho-charcoal hover:text-boho-terracotta transition-all shadow-soft active:scale-90 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isLiked
                ? 'fill-boho-terracotta text-boho-terracotta scale-110 animate-heart-pop'
                : 'text-boho-charcoal/70 hover:text-boho-terracotta'
            }`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-boho-gold text-white shadow-sm shimmer-mask">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-300 backdrop-blur-sm">
              ¡Últimas {product.stock} uds!
            </span>
          )}
        </div>

        {/* Quick Add Button Hover overlay */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-95 ${
              justAdded
                ? 'bg-boho-sage text-white'
                : 'bg-white/95 backdrop-blur-sm text-boho-charcoal hover:bg-boho-terracotta hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 animate-badge-bounce" />
                <span>¡Añadido a la Cesta!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Añadir a la Cesta</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          {product.category && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-boho-terracotta block mb-1">
              {product.category.name}
            </span>
          )}

          {/* Title */}
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-serif-boho text-sm sm:text-base font-bold text-boho-charcoal hover:text-boho-terracotta transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description / materials hint */}
          <p className="text-xs text-boho-charcoal-muted mt-1 line-clamp-1">
            {product.shortDescription || 'Joyería artesanal en arcilla polimérica.'}
          </p>
        </div>

        {/* Price & Rating */}
        <div className="mt-3 pt-2 border-t border-boho-sand-200/60 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-bold text-base text-boho-charcoal">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-boho-charcoal-muted line-through">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-boho-gold">
            <Star className="w-3.5 h-3.5 fill-boho-gold text-boho-gold" />
            <span className="text-xs font-semibold text-boho-charcoal">
              {product.rating || 5}.0
            </span>
            {product.reviewCount ? (
              <span className="text-[10px] text-boho-charcoal-muted">
                ({product.reviewCount})
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
