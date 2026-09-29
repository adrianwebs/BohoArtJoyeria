'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X, User, Sparkles, Heart } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { Category } from '@/lib/types';

interface NavbarProps {
  categories?: Category[];
  /** Collections currently live (seasonal landings); shown as highlighted links. */
  collections?: { name: string; slug: string }[];
}

export function Navbar({ categories = [], collections = [] }: NavbarProps) {
  const { openCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalogo?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-boho-sand-300/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 sm:h-28">
          
          {/* Mobile menu trigger */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
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
              Catálogo Completo
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
            {collections.slice(0, 2).map((c) => (
              <Link
                key={c.slug}
                href={`/colecciones/${c.slug}`}
                className="inline-flex items-center space-x-1 py-1 text-sm font-bold text-boho-terracotta hover:text-boho-terracotta-600 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{c.name}</span>
              </Link>
            ))}
            <Link
              href="/sobre-nosotros"
              className="relative py-1 text-sm font-medium text-boho-charcoal hover:text-boho-terracotta transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-boho-terracotta after:transition-all after:duration-300"
            >
              El Taller
            </Link>
          </nav>

          {/* Brand Logo in Center */}
          <div className="flex-shrink-0 flex items-center justify-center py-2">
            <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="Bohoart Jewelry Logo"
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="font-serif-boho text-2xl sm:text-3xl font-bold tracking-tight text-boho-charcoal block group-hover:text-boho-terracotta transition-colors duration-300">
                  BOHO ART
                </span>
                <span className="text-[11px] sm:text-xs tracking-[0.25em] text-boho-charcoal-muted uppercase block font-sans">
                  Handmade Jewelry
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pendientes, collares..."
                className="w-48 lg:w-60 pl-9 pr-3 py-1.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-full focus:outline-none focus:border-boho-terracotta focus:w-72 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 pointer-events-none" />
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
          <div className="lg:hidden border-t border-boho-sand-200 py-4 px-2 space-y-2 animate-slide-down bg-white">
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
            <Link
              href="/categorias/colecciones"
              onClick={() => setMobileMenuOpen(false)}
              className="block pl-6 pr-3 py-1.5 text-sm text-boho-charcoal hover:text-boho-terracotta"
            >
              • Packs de Regalo & Colecciones
            </Link>
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/colecciones/${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-boho-terracotta"
              >
                ✨ {c.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-boho-sand-200">
              <Link
                href="/sobre-nosotros"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-boho-charcoal hover:text-boho-terracotta"
              >
                Conoce Nuestro Taller
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
