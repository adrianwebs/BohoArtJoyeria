'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Star,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos & Joyas', href: '/admin/productos', icon: Package },
  { name: 'Categorías', href: '/admin/categorias', icon: Layers },
  { name: 'Colecciones & Landings', href: '/admin/colecciones', icon: Sparkles },
  { name: 'Pedidos & Ventas', href: '/admin/pedidos', icon: ShoppingBag },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Reseñas & Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Configuración Tienda', href: '/admin/configuracion', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-boho-sand-50/60 flex flex-col lg:flex-row">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-boho-sand-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-boho-charcoal hover:bg-boho-sand-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-serif-boho font-bold text-base text-boho-charcoal">
            Bohoart Admin
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="text-xs font-semibold text-boho-terracotta flex items-center space-x-1"
        >
          <Store className="w-4 h-4" />
          <span>Ver Tienda</span>
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-boho-sand-200 shadow-sm flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-boho-sand-200 flex items-center space-x-3">
            <div className="relative w-14 h-14 shrink-0">
              <Image
                src="/logo.png"
                alt="Bohoart Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <span className="font-serif-boho font-bold text-sm text-boho-charcoal block">
                BOHO ART
              </span>
              <span className="text-[10px] uppercase tracking-wider text-boho-terracotta font-semibold block">
                Panel de Control
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-boho-terracotta text-white shadow-soft'
                      : 'text-boho-charcoal-muted hover:text-boho-charcoal hover:bg-boho-sand-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-boho-terracotta'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-boho-sand-200 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-boho-charcoal hover:bg-boho-sand-100 transition-colors"
          >
            <Store className="w-4 h-4 text-boho-terracotta" />
            <span>Ver Tienda Online</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>

    </div>
  );
}
