import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { storeService } from '@/lib/storeService';
import { ProductGrid } from '@/components/store/ProductGrid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await storeService.getCategoryBySlug(slug);
  if (!category) return { title: 'Categoría no encontrada' };

  return {
    title: `${category.name} | Joyería Artesanal en Arcilla Polimérica`,
    description: category.description || `Descubre nuestra colección de ${category.name.toLowerCase()} hechos a mano con arcilla polimérica. Diseños únicos y ultraligeros.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await storeService.getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await storeService.getProducts({ categorySlug: slug });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bohoartjoyeria.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${baseUrl}/catalogo` },
          { '@type': 'ListItem', position: 3, name: category.name, item: `${baseUrl}/categorias/${category.slug}` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description || undefined,
        url: `${baseUrl}/categorias/${category.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${baseUrl}/productos/${p.slug}`,
            name: p.name,
          })),
        },
      },
    ],
  };

  return (
    <div className="bg-boho-linen min-h-screen py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-boho-charcoal-muted mb-6">
          <Link href="/" className="hover:text-boho-terracotta transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalogo" className="hover:text-boho-terracotta transition-colors">
            Catálogo
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-boho-charcoal font-semibold">{category.name}</span>
        </nav>

        {/* Category Header Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-boho-sand-200 shadow-soft mb-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-2">
              Colección Artesanal
            </span>
            <h1 className="font-serif-boho text-3xl sm:text-5xl font-bold text-boho-charcoal tracking-tight mb-3">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-boho-charcoal-muted leading-relaxed">
              {category.description}
            </p>
            <div className="mt-4 flex items-center space-x-4 text-xs font-semibold text-boho-terracotta">
              <span>{products.length} diseños disponibles</span>
              <span>•</span>
              <span>100% Hechos a mano en España</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <ProductGrid
          products={products}
          emptyMessage={`Próximamente añadiremos nuevos diseños a la colección de ${category.name}.`}
        />

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 text-xs font-bold text-boho-terracotta hover:text-boho-terracotta-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explorar todas las categorías</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
