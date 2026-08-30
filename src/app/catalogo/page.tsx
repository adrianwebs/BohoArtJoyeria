import React from 'react';
import { Metadata } from 'next';
import { storeService } from '@/lib/storeService';
import { CatalogClient } from './CatalogClient';

export const metadata: Metadata = {
  title: 'Catálogo de Joyería Artesanal en Arcilla Polimérica',
  description: 'Explora toda nuestra colección de pendientes, pulseras, collares y accesorios hechos a mano. Piezas únicas, ultraligeras y diseñadas con amor.',
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialCategory = typeof params.categoria === 'string' ? params.categoria : undefined;
  const initialSearch = typeof params.search === 'string' ? params.search : undefined;

  const categories = await storeService.getCategories();
  const products = await storeService.getProducts();

  return (
    <div className="bg-boho-linen min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-1">
            Colección Completa
          </span>
          <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal">
            Catálogo Bohoart
          </h1>
          <p className="text-sm text-boho-charcoal-muted mt-2">
            Modelados uno a uno en nuestro taller. Filtrados por estilo, precio y categoría.
          </p>
        </div>

        {/* Interactive Catalog Client */}
        <CatalogClient
          categories={categories}
          initialProducts={products}
          initialCategory={initialCategory}
          initialSearch={initialSearch}
        />

      </div>
    </div>
  );
}
