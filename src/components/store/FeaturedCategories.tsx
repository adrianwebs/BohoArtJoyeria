import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-boho-terracotta block mb-1">
            Explora por Estilo
          </span>
          <h2 className="font-serif-boho text-2xl sm:text-4xl font-bold text-boho-charcoal tracking-tight">
            Nuestras Colecciones de Arcilla
          </h2>
          <p className="text-sm text-boho-charcoal-muted mt-2">
            Cada pieza nace de un bloque de arcilla polimérica cruda, combinando colores exclusivos y formas esculpidas a mano.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-boho-sand-100 border border-boho-sand-200/80 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={category.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80'}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                
                <div className="absolute inset-x-3 bottom-3 text-white text-center transform transition-transform duration-300 group-hover:-translate-y-0.5">
                  <h3 className="font-serif-boho text-sm sm:text-base font-bold tracking-tight mb-0.5">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-medium text-boho-sand-200 group-hover:text-white flex items-center justify-center space-x-1 transition-colors">
                    <span>Ver colección</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
