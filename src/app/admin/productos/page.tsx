import React from 'react';
import { storeService } from '@/lib/storeService';
import { ProductsAdminClient } from './ProductsAdminClient';

export default async function AdminProductsPage() {
  const products = await storeService.getProducts({ activeOnly: false });
  const categories = await storeService.getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Inventario & Catálogo
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Gestión de Joyas y Productos
          </h1>
        </div>
      </div>

      <ProductsAdminClient initialProducts={products} categories={categories} />
    </div>
  );
}
