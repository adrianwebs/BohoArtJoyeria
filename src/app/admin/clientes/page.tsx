'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((e) => console.error(e));
  }, []);

  // Aggregate customers from orders
  const customersMap = new Map<string, {
    name: string;
    email: string;
    phone?: string | null;
    city: string;
    province: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  }>();

  for (const o of orders) {
    const existing = customersMap.get(o.customerEmail);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += o.totalAmount;
    } else {
      customersMap.set(o.customerEmail, {
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        city: o.city,
        province: o.province,
        totalOrders: 1,
        totalSpent: o.totalAmount,
        lastOrderDate: o.createdAt,
      });
    }
  }

  const customers = Array.from(customersMap.values()).filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
          Directorio & Clientes
        </span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
          Clientes de Bohoart Jewelry
        </h1>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o ciudad..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
          />
          <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.email}
            className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-boho-sand-100 text-boho-terracotta font-serif-boho text-base font-bold flex items-center justify-center border border-boho-sand-300">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif-boho font-bold text-base text-boho-charcoal">
                    {c.name}
                  </h3>
                  <span className="text-xs text-boho-charcoal-muted">{c.city}, {c.province}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-boho-charcoal-muted pt-2 border-t border-boho-sand-100">
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-boho-terracotta" />
                  <a href={`mailto:${c.email}`} className="hover:underline text-boho-charcoal">
                    {c.email}
                  </a>
                </p>
                {c.phone && (
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-boho-terracotta" />
                    <span>{c.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-boho-sand-50 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-boho-charcoal-muted block text-[10px]">Pedidos</span>
                <span className="font-bold text-boho-charcoal">{c.totalOrders}</span>
              </div>
              <div className="text-right">
                <span className="text-boho-charcoal-muted block text-[10px]">Total Gastado</span>
                <span className="font-bold text-boho-terracotta">{formatPrice(c.totalSpent)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
