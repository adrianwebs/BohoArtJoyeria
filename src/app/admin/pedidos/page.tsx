'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  Package,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingInput || selectedOrder?.trackingNumber,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (selectedOrder?.id === updated.id) {
          setSelectedOrder(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
          Ventas & Logística
        </span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
          Gestión de Pedidos
        </h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-boho-sand-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nº pedido o cliente..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
          />
          <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-boho-terracotta text-white shadow-xs'
                  : 'bg-boho-sand-50 text-boho-charcoal-muted hover:bg-boho-sand-100 hover:text-boho-charcoal border border-boho-sand-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-boho-charcoal">
            <thead className="bg-boho-sand-50/80 border-b border-boho-sand-200 uppercase text-[10px] font-bold tracking-wider text-boho-charcoal-muted">
              <tr>
                <th className="py-3.5 px-4">Nº Pedido & Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Pago</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-boho-sand-100 font-sans">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-boho-sand-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-boho-charcoal">{order.orderNumber}</div>
                    <span className="text-[11px] text-boho-charcoal-muted">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-boho-charcoal">{order.customerName}</div>
                    <span className="text-[11px] text-boho-charcoal-muted">
                      {order.city} ({order.province})
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-boho-charcoal">
                    {formatPrice(order.totalAmount)}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-[#003087] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'PAID'
                          ? 'bg-blue-50 text-blue-700'
                          : order.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-700'
                          : order.status === 'SHIPPED'
                          ? 'bg-purple-50 text-purple-700'
                          : order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setTrackingInput(order.trackingNumber || '');
                      }}
                      className="px-3 py-1.5 bg-boho-sand-100 hover:bg-boho-terracotta hover:text-white rounded-full text-xs font-semibold text-boho-charcoal transition-colors"
                    >
                      Ver Pedido
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-boho-sand-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex justify-between items-start pb-4 border-b border-boho-sand-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-boho-terracotta block">
                  Detalle del Pedido
                </span>
                <h3 className="font-serif-boho text-2xl font-bold text-boho-charcoal">
                  {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-boho-charcoal-muted">
                  Fecha: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-boho-sand-100 rounded-full text-boho-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status changer buttons */}
            <div className="p-4 rounded-2xl bg-boho-sand-50 border border-boho-sand-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-boho-charcoal">
                Actualizar Estado de Preparación / Envío
              </label>
              <div className="flex flex-wrap gap-2">
                {(['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedOrder.status === st
                        ? 'bg-boho-terracotta text-white shadow-soft'
                        : 'bg-white text-boho-charcoal hover:bg-boho-sand-200 border border-boho-sand-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-boho-sand-200 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-boho-charcoal">
                  Cliente & Contacto
                </h4>
                <div className="text-xs text-boho-charcoal-muted space-y-1">
                  <p className="font-semibold text-boho-charcoal">{selectedOrder.customerName}</p>
                  <p className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-boho-terracotta" />
                    <span>{selectedOrder.customerEmail}</span>
                  </p>
                  {selectedOrder.customerPhone && (
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-boho-terracotta" />
                      <span>{selectedOrder.customerPhone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-boho-sand-200 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-boho-charcoal">
                  Dirección de Entrega
                </h4>
                <div className="text-xs text-boho-charcoal-muted space-y-1">
                  <p className="flex items-start space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-boho-terracotta shrink-0 mt-0.5" />
                    <span>{selectedOrder.shippingAddress}</span>
                  </p>
                  <p>{selectedOrder.postalCode} - {selectedOrder.city}, {selectedOrder.province}</p>
                  <p>{selectedOrder.country}</p>
                </div>
              </div>
            </div>

            {/* Tracking number input */}
            <div className="p-4 rounded-2xl bg-white border border-boho-sand-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-boho-charcoal">
                Número de Seguimiento (Tracking)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ej. CORREOS-ES-998811"
                  className="flex-1 px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)}
                  className="px-4 py-2 bg-boho-sand-200 hover:bg-boho-terracotta hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Guardar Tracking
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-boho-charcoal">
                Piezas del Pedido
              </h4>
              <div className="divide-y divide-boho-sand-100 border border-boho-sand-200 rounded-2xl overflow-hidden p-3 bg-white">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-boho-sand-100 shrink-0">
                        <Image
                          src={item.productImage || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-boho-charcoal">{item.productName}</div>
                        <span className="text-boho-charcoal-muted">
                          {item.quantity} ud(s) x {formatPrice(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-boho-charcoal">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-bold text-boho-charcoal px-2">
                <span>Total Cobrado:</span>
                <span className="text-boho-terracotta text-lg">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
