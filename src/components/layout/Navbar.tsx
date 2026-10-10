'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { Category } from '@/lib/types';

interface NavbarProps {
  categories?: Category[];
  /** Collections currently live (seasonal landings); grouped in dropdown. */
  collections?: { name: string; slug: string }[];
}

export function Navbar({ categories = [], collections = [] }: NavbarProps) {
  const { openCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close collections dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCollectionsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-boho-sand-300/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Mobile menu triggers (hidden on desktop) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-boho-charcoal hover:text-boho-terracotta transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 ml-1 text-boho-charcoal hover:text-boho-terracotta transition-colors"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo (Left on desktop, centered on mobile) */}
          <div className="flex-shrink-0 flex items-center justify-center lg:justify-start">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3.5 group">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="Bohoart Jewelry Logo"
                  fill
                  sizes="(max-width: 640px) 56px, 72px"
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div className="text-left">
                <span className="font-serif-boho text-xl sm:text-2xl font-bold tracking-tight text-boho-charcoal block group-hover:text-boho-terracotta transition-colors duration-300">
                  BOHO ART
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-boho-charcoal-muted uppercase block font-sans">
                  Handmade Jewelry
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Center, clean spacing, no wrapping) */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 whitespace-nowrap">
            <Link
              href="/"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Catálogo
            </Link>
            <Link
              href="/categorias/pendientes"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Pendientes
            </Link>
            <Link
              href="/categorias/pulseras"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Pulseras
            </Link>
            <Link
              href="/categorias/collares"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Collares
            </Link>

            {/* Colecciones Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCollectionsDropdownOpen(true)}
              onMouseLeave={() => setCollectionsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCollectionsDropdownOpen(!collectionsDropdownOpen)}
                className="inline-flex items-center space-x-1 py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors"
                aria-expanded={collectionsDropdownOpen}
              >
                <span>Colecciones</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180 text-boho-terracotta' : 'text-boho-charcoal-muted'}`} />
              </button>

              {collectionsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-boho-sand-300/80 py-2 z-50 animate-slide-down">
                  <Link
                    href="/colecciones"
                    onClick={() => setCollectionsDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-boho-terracotta hover:bg-boho-sand-50 transition-colors"
                  >
                    <span>Ver todas las colecciones</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  {collections.length > 0 && <div className="h-px bg-boho-sand-200 my-1" />}
                  <div className="max-h-64 overflow-y-auto">
                    {collections.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/colecciones/${c.slug}`}
                        onClick={() => setCollectionsDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-boho-charcoal hover:bg-boho-sand-50 hover:text-boho-terracotta transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-boho-terracotta flex-shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/sobre-nosotros"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              Sobre Nosotros
            </Link>
          </nav>

          {/* Right Action Icons (Desktop Search & Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar joyas..."
                className="w-40 lg:w-48 xl:w-56 pl-8 pr-3 py-1.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-full focus:outline-none focus:border-boho-terracotta focus:w-60 transition-all duration-300"
              />
              <Search className="w-3.5 h-3.5 text-boho-charcoal-muted absolute left-3 pointer-events-none" />
            </form>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 bg-boho-sand-100 hover:bg-boho-sand-200 text-boho-charcoal rounded-full transition-all duration-200 group flex items-center justify-center shadow-sm active:scale-95 hover:shadow-md"
              aria-label="Abrir carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 text-boho-charcoal group-hover:text-boho-terracotta group-hover:scale-105 transition-all duration-200" />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute -top-1 -right-1 bg-boho-terracotta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-badge-bounce shadow"
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Expandable) */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-boho-sand-200 lg:hidden animate-slide-down">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar joyas en arcilla polimérica..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-boho-sand-50 border border-boho-sand-300 rounded-full focus:outline-none focus:border-boho-terracotta"
                autoFocus
              />
              <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3.5" />
            </form>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-boho-sand-200 py-4 px-2 space-y-2 animate-slide-down bg-white max-h-[calc(100vh-6rem)] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-boho-charcoal hover:bg-boho-sand-50 rounded-md"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-boho-charcoal hover:bg-boho-sand-50 rounded-md"
            >
              Catálogo Completo
            </Link>
            <div className="pt-2 pb-1 px-3 text-xs uppercase tracking-wider text-boho-charcoal-muted font-semibold">
              Categorías
            </div>
            <Link
              href="/categorias/pendientes"
              onClick={() => setMobileMenuOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-sm text-boho-charcoal hover:text-boho-terracotta"
            >
              • Pendientes de Arcilla
            </Link>
            <Link
              href="/categorias/pulseras"
              onClick={() => setMobileMenuOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-sm text-boho-charcoal hover:text-boho-terracotta"
            >
              • Pulseras & Brazaletes
            </Link>
            <Link
              href="/categorias/collares"
              onClick={() => setMobileMenuOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-sm text-boho-charcoal hover:text-boho-terracotta"
            >
              • Collares & Colgantes
            </Link>
            <Link
              href="/categorias/anillos"
              onClick={() => setMobileMenuOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-sm text-boho-charcoal hover:text-boho-terracotta"
            >
              • Anillos Esculpidos
            </Link>
            
            {/* Colecciones en mobile */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-3 pb-1">
                <span className="text-xs uppercase tracking-wider text-boho-charcoal-muted font-semibold">
                  Colecciones
                </span>
                <Link
                  href="/colecciones"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-boho-terracotta font-medium hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/colecciones/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block pl-6 pr-3 py-1.5 text-sm font-medium text-boho-terracotta"
                >
                  ✨ {c.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-boho-sand-200">
              <Link
                href="/sobre-nosotros"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-boho-charcoal hover:text-boho-terracotta"
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-boho-charcoal hover:text-boho-terracotta"
              >
                Preguntas Frecuentes & Envíos
              </Link>
              <Link
                href="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-boho-charcoal hover:text-boho-terracotta"
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

