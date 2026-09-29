import React from 'react';
import { storeService } from '@/lib/storeService';
import { CollectionsAdminClient } from './CollectionsAdminClient';

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    storeService.getCollections({ admin: true }),
    storeService.getProducts({ activeOnly: false }),
  ]);

  const pickerProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images[0] || null,
    price: p.price,
    isActive: p.isActive,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
          Campañas & Temporadas
        </span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
          Colecciones y Landings
        </h1>
        <p className="text-xs text-boho-charcoal-muted mt-1 max-w-2xl">
          Crea landings para ferias y fiestas (Feria de Albacete, Virgen del Pilar, Halloween, Navidad…). Se publican y
          se retiran solas según las fechas que indiques.
        </p>
      </div>

      <CollectionsAdminClient initialCollections={collections} products={pickerProducts} />
    </div>
  );
}
