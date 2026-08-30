import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { storeService } from '@/lib/storeService';
import { formatPrice, formatDate } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const products = await storeService.getProducts();
  const orders = await storeService.getOrders();
  const reviews = await storeService.getReviews({ approvedOnly: false });
  const pendingReviews = reviews.filter((r) => !r.isApproved);

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'PAID');
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Resumen General
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Panel de Control del Taller
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/productos"
            className="px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-semibold shadow-soft flex items-center space-x-1.5 transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Añadir Producto</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ingresos Totales */}
        <div className="bg-white p-5 rounded-2xl border border-boho-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-boho-charcoal-muted">
            <span className="text-xs font-medium">Ingresos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-boho text-2xl font-bold text-boho-charcoal">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-boho-sage font-medium flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            <span>{orders.length} pedidos procesados</span>
          </p>
        </div>

        {/* KPI 2: Pedidos Activos */}
        <div className="bg-white p-5 rounded-2xl border border-boho-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-boho-charcoal-muted">
            <span className="text-xs font-medium">Pedidos por Enviar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-boho text-2xl font-bold text-boho-charcoal">
            {pendingOrders.length}
          </div>
          <Link
            href="/admin/pedidos"
            className="text-[11px] text-boho-terracotta hover:underline font-semibold flex items-center"
          >
            <span>Gestionar pedidos</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* KPI 3: Joyas en Catálogo */}
        <div className="bg-white p-5 rounded-2xl border border-boho-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-boho-charcoal-muted">
            <span className="text-xs font-medium">Joyas en Catálogo</span>
            <div className="w-8 h-8 rounded-xl bg-boho-sand-100 text-boho-gold flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-boho text-2xl font-bold text-boho-charcoal">
            {products.length}
          </div>
          <p className="text-[11px] text-boho-charcoal-muted">
            {products.filter((p) => p.isActive).length} publicadas en tienda
          </p>
        </div>

        {/* KPI 4: Reviews Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-boho-sand-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-boho-charcoal-muted">
            <span className="text-xs font-medium">Reseñas por Moderar</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif-boho text-2xl font-bold text-boho-charcoal">
            {pendingReviews.length}
          </div>
          <Link
            href="/admin/reviews"
            className="text-[11px] text-purple-700 hover:underline font-semibold flex items-center"
          >
            <span>Revisar opiniones</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders List (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-boho-sand-200">
            <div>
              <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
                Últimos Pedidos Recibidos
              </h2>
              <p className="text-xs text-boho-charcoal-muted">
                Compras realizadas por clientes en la tienda online.
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-boho-terracotta hover:underline"
            >
              Ver todos ({orders.length})
            </Link>
          </div>

          <div className="divide-y divide-boho-sand-100 overflow-x-auto">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-boho-charcoal">{order.orderNumber}</div>
                  <div className="text-boho-charcoal-muted">{order.customerName} • {order.city}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-boho-charcoal">{formatPrice(order.totalAmount)}</div>
                  <div className="text-[10px] text-boho-charcoal-muted">{formatDate(order.createdAt)}</div>
                </div>

                <div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'PAID'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : order.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : order.status === 'SHIPPED'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-boho-sand-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif-boho text-lg font-bold text-boho-charcoal">
              Control de Stock
            </h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-boho-charcoal-muted">Todos los productos cuentan con stock suficiente.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-amber-200">
                      <Image
                        src={p.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-boho-charcoal line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-amber-800 font-bold">
                        Quedan {p.stock} uds en taller
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/admin/productos"
                    className="text-[10px] font-bold text-boho-terracotta hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
