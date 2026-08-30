'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import { Category, Product } from '@/lib/types';
import { ProductGrid } from '@/components/store/ProductGrid';

interface CatalogClientProps {
  categories: Category[];
  initialProducts: Product[];
  initialCategory?: string;
  initialSearch?: string;
}

export function CatalogClient({
  categories,
  initialProducts,
  initialCategory,
  initialSearch,
}: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [showOnlyInStock, setShowOnlyInStock] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && product.categoryId !== cat.id) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesMat = product.materials?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesMat) return false;
      }

      // Price filter
      if (product.price > maxPrice) return false;

      // Stock filter
      if (showOnlyInStock && product.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [initialProducts, selectedCategory, searchQuery, maxPrice, showOnlyInStock, sortBy, categories]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-2">
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border border-boho-sand-300 rounded-xl text-xs font-semibold text-boho-charcoal shadow-soft"
        >
          <SlidersHorizontal className="w-4 h-4 text-boho-terracotta" />
          <span>Filtros ({filteredProducts.length} piezas)</span>
        </button>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2.5 px-3 bg-white border border-boho-sand-300 rounded-xl text-xs font-medium text-boho-charcoal focus:outline-none focus:border-boho-terracotta shadow-soft"
          >
            <option value="featured">Destacados</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="newest">Más Recientes</option>
            <option value="rating">Mejor Valorados</option>
          </select>
        </div>
      </div>

      {/* Sidebar Filters */}
      <aside
        className={`bg-white p-6 rounded-2xl border border-boho-sand-200 shadow-soft space-y-6 ${
          showFiltersMobile ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-boho-sand-200">
          <h3 className="font-serif-boho text-base font-bold text-boho-charcoal flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-boho-terracotta" />
            <span>Filtrar Piezas</span>
          </h3>
          {(selectedCategory !== 'all' || searchQuery || maxPrice < 50 || showOnlyInStock) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setMaxPrice(50);
                setShowOnlyInStock(false);
              }}
              className="text-[11px] text-boho-terracotta hover:underline font-semibold"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-boho-charcoal mb-2">
            Buscador
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pendientes, aros..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
            />
            <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-boho-charcoal-muted hover:text-boho-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-boho-charcoal mb-2">
            Categoría
          </label>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
                selectedCategory === 'all'
                  ? 'bg-boho-terracotta text-white font-bold shadow-sm'
                  : 'text-boho-charcoal hover:bg-boho-sand-100 hover:text-boho-terracotta'
              }`}
            >
              <span>Todas las Colecciones</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-black/10">{initialProducts.length}</span>
            </button>

            {categories.map((cat) => {
              const count = initialProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
                    selectedCategory === cat.slug
                      ? 'bg-boho-terracotta text-white font-bold shadow-sm'
                      : 'text-boho-charcoal hover:bg-boho-sand-100 hover:text-boho-terracotta'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-boho-charcoal">
              Precio Máximo
            </label>
            <span className="text-xs font-bold text-boho-terracotta">{maxPrice} €</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-boho-terracotta cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-boho-charcoal-muted mt-1">
            <span>10 €</span>
            <span>60 €</span>
          </div>
        </div>

        {/* Stock Toggle */}
        <div className="pt-2 border-t border-boho-sand-200">
          <label className="flex items-center space-x-2 text-xs text-boho-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyInStock}
              onChange={(e) => setShowOnlyInStock(e.target.checked)}
              className="rounded text-boho-terracotta focus:ring-boho-terracotta w-4 h-4"
            />
            <span>Mostrar sólo piezas con stock disponible</span>
          </label>
        </div>
      </aside>

      {/* Main Catalog View */}
      <main className="lg:col-span-3 space-y-6">
        
        {/* Top desktop sort & count bar */}
        <div className="hidden lg:flex items-center justify-between bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
          <div className="text-xs text-boho-charcoal-muted">
            Mostrando <span className="font-bold text-boho-charcoal">{filteredProducts.length}</span> joyas artesanales
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-boho-charcoal font-medium">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 bg-boho-sand-50 border border-boho-sand-300 rounded-xl text-xs font-semibold text-boho-charcoal focus:outline-none focus:border-boho-terracotta"
            >
              <option value="featured">Destacados</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="newest">Más Recientes</option>
              <option value="rating">Mejor Valorados</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          emptyMessage="No hay productos que coincidan con estos filtros. Prueba ampliando el rango de precio o buscando otro término."
        />

      </main>

    </div>
  );
}
