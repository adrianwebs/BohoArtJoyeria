'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Palette, Star, MessageSquare, Home, Users } from 'lucide-react';
import { WorkshopsTab } from './WorkshopsTab';
import { BookingsTab } from './BookingsTab';
import { ReviewsTab, InquiriesTab } from './ModerationTabs';
import { RoomTab } from './RoomTab';

const TABS = [
  { id: 'talleres', label: 'Talleres y fechas', icon: Palette },
  { id: 'reservas', label: 'Reservas', icon: Users },
  { id: 'resenas', label: 'Reseñas', icon: Star },
  { id: 'consultas', label: 'Consultas', icon: MessageSquare },
  { id: 'sala', label: 'Sala', icon: Home },
] as const;
type TabId = (typeof TABS)[number]['id'];

export interface AdminWorkshop {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  price: number;
  depositType: 'FIXED' | 'PERCENT';
  depositValue: number;
  durationMinutes: number;
  materials: string | null;
  faq: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  sessions: { id: string; startsAt: string; capacity: number; seatsTaken: number; isActive: boolean }[];
  photos: { id: string; url: string; caption: string | null }[];
}

/** fetch con JSON; devuelve { ok, data } y nunca lanza. */
export async function api<T = any>(url: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; data: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data: data as T, error: res.ok ? undefined : (data as any).error || `Error ${res.status}` };
  } catch {
    return { ok: false, data: {} as T, error: 'Error de conexión' };
  }
}

export const inputCls = 'w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';
export const btnPrimary = 'px-4 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft disabled:opacity-60';
export const btnGhost = 'px-3 py-1.5 rounded-full border border-boho-sand-300 text-xs font-semibold text-boho-charcoal hover:bg-boho-sand-100 disabled:opacity-60';

export function TalleresAdminClient() {
  const [tab, setTab] = useState<TabId>('talleres');
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? '' : cur)), 3500);
  }, []);

  const loadWorkshops = useCallback(async () => {
    const r = await api<AdminWorkshop[]>('/api/admin/workshops');
    if (r.ok) setWorkshops(r.data);
    else notify(r.error || 'No se pudieron cargar los talleres');
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  return (
    <div className="space-y-6">
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 bg-boho-charcoal text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">Experiencias</span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">Talleres</h1>
        <p className="text-xs text-boho-charcoal-muted mt-1">Gestiona talleres, fechas, reservas, reseñas y consultas. Las plazas solo se descuentan cuando la reserva está pagada.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                tab === t.id ? 'bg-boho-terracotta text-white shadow-soft' : 'bg-white border border-boho-sand-200 text-boho-charcoal hover:bg-boho-sand-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-xs text-boho-charcoal-muted">Cargando…</p>
      ) : (
        <>
          {tab === 'talleres' && <WorkshopsTab workshops={workshops} reload={loadWorkshops} notify={notify} />}
          {tab === 'reservas' && <BookingsTab workshops={workshops} notify={notify} />}
          {tab === 'resenas' && <ReviewsTab notify={notify} />}
          {tab === 'consultas' && <InquiriesTab notify={notify} />}
          {tab === 'sala' && <RoomTab notify={notify} />}
        </>
      )}
    </div>
  );
}
