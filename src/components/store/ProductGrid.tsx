import React from 'react';
import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No se encontraron piezas artesanales con estos criterios.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-boho-sand-50 rounded-2xl border border-dashed border-boho-sand-300">
        <p className="text-base text-boho-charcoal-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
