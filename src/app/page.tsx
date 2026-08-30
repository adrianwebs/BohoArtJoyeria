import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroBanner } from '@/components/store/HeroBanner';
import { FeaturedCategories } from '@/components/store/FeaturedCategories';
import { ProductGrid } from '@/components/store/ProductGrid';
import { CraftsmanshipSection } from '@/components/store/CraftsmanshipSection';
import { ReviewSection } from '@/components/store/ReviewSection';
import { InstagramFeed } from '@/components/store/InstagramFeed';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { storeService } from '@/lib/storeService';

export default async function HomePage() {
  const categories = await storeService.getCategories();
  const featuredProducts = await storeService.getProducts({ featured: true });
  const allProducts = await storeService.getProducts();
  const reviews = await storeService.getReviews({ approvedOnly: true });

  return (
    <div>
      {/* Hero */}
      <HeroBanner />

      {/* Featured Categories */}
      <ScrollReveal delay={100}>
        <FeaturedCategories categories={categories} />
      </ScrollReveal>

      {/* Best Sellers / Featured Section */}
      <section className="py-16 md:py-20 bg-boho-sand-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-boho-sand-200">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-boho-terracotta text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Top Ventas & Novedades</span>
                </div>
                <h2 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal">
                  Piezas Más Deseadas
                </h2>
              </div>

              <Link
                href="/catalogo"
                className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-boho-terracotta hover:text-boho-terracotta-600 transition-colors group"
              >
                <span>Ver catálogo completo ({allProducts.length} diseños)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <ProductGrid products={featuredProducts.slice(0, 8)} />
          </ScrollReveal>
        </div>
      </section>

      {/* Craftsmanship value prop */}
      <ScrollReveal delay={100}>
        <CraftsmanshipSection />
      </ScrollReveal>

      {/* Customer Reviews */}
      <ScrollReveal delay={100}>
        <ReviewSection initialReviews={reviews} />
      </ScrollReveal>

      {/* Instagram UGC Feed */}
      <ScrollReveal delay={100}>
        <InstagramFeed />
      </ScrollReveal>
    </div>
  );
}
