import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { storeService } from '@/lib/storeService';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ReviewSection } from '@/components/store/ReviewSection';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await storeService.getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado' };

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80';

  return {
    title: `${product.name} | Joyería Artesanal Bohoart`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || 'Joyería artesanal en arcilla polimérica hecha a mano.',
      images: [{ url: primaryImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription || 'Joyería artesanal en arcilla polimérica hecha a mano.',
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await storeService.getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await storeService.getProducts({
    categorySlug: product.category?.slug,
    activeOnly: true,
  });
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const reviews = await storeService.getReviews({
    productId: product.id,
    approvedOnly: true,
  });

  // Schema.org Structured Data (JSON-LD) for Google SEO Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Bohoart Jewelry',
    },
    offers: {
      '@type': 'Offer',
      url: `https://bohoartjoyeria.com/productos/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5,
      reviewCount: reviews.length || 1,
    },
  };

  return (
    <div className="bg-boho-linen min-h-screen py-8">
      {/* Google JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-boho-charcoal-muted mb-8">
          <Link href="/" className="hover:text-boho-terracotta transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalogo" className="hover:text-boho-terracotta transition-colors">
            Catálogo
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/categorias/${product.category.slug}`}
                className="hover:text-boho-terracotta transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-boho-charcoal font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Interactive Main View */}
        <ProductDetailClient product={product} />

        {/* Reviews Section */}
        <div className="mt-16 border-t border-boho-sand-200">
          <ReviewSection
            productId={product.id}
            productName={product.name}
            initialReviews={reviews}
          />
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <section className="py-16 border-t border-boho-sand-200">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-1">
                Completa tu estilo
              </span>
              <h2 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
                También te Puede Enamorar
              </h2>
            </div>

            <ProductGrid products={filteredRelated} />
          </section>
        )}

      </div>
    </div>
  );
}
