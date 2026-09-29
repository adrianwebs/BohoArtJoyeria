'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, X, ExternalLink, ArrowUp, ArrowDown, Search, CalendarDays, Repeat } from 'lucide-react';
import { Collection, CollectionStatus } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { utcToMadridDate } from '@/lib/collectionSchedule';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface PickerProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  isActive: boolean;
}

const STATUS_STYLES: Record<CollectionStatus, { label: string; cls: string }> = {
  live: { label: 'En directo', cls: 'bg-emerald-100 text-emerald-800' },
  scheduled: { label: 'Programada', cls: 'bg-blue-100 text-blue-800' },
  ended: { label: 'Finalizada', cls: 'bg-gray-200 text-gray-700' },
  inactive: { label: 'Desactivada', cls: 'bg-amber-100 text-amber-800' },
};

const fmt = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' }).format(
        new Date(iso)
      )
    : null;

export function CollectionsAdminClient({
  initialCollections,
  products,
}: {
  initialCollections: Collection[];
  products: PickerProduct[];
}) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [accentColor, setAccentColor] = useState('#C2694F');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [repeatYearly, setRepeatYearly] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [productIds, setProductIds] = useState<string[]>([]);

  const productById = new Map(products.map((p) => [p.id, p]));

  const refresh = async () => {
    const res = await fetch('/api/collections?all=true');
    if (res.ok) setCollections(await res.json());
  };

  const resetForm = (c: Collection | null) => {
    setEditing(c);
    setName(c?.name ?? '');
    setSlug(c?.slug ?? '');
    setTagline(c?.tagline ?? '');
    setDescription(c?.description ?? '');
    setHeroImage(c?.heroImage ?? '');
    setAccentColor(c?.accentColor ?? '#C2694F');
    setStartsAt(utcToMadridDate(c?.startsAt));
    setEndsAt(utcToMadridDate(c?.endsAt));
    setRepeatYearly(c?.repeatYearly ?? false);
    setIsActive(c?.isActive ?? true);
    setShowOnHome(c?.showOnHome ?? true);
    setSortOrder(String(c?.sortOrder ?? 0));
    setProductIds(c?.productIds ?? []);
    setProductSearch('');
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleProduct = (id: string) =>
    setProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const move = (index: number, dir: -1 | 1) =>
    setProductIds((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(editing ? `/api/collections/${editing.id}` : '/api/collections', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug ? slugify(slug) : slugify(name),
          tagline,
          description,
          heroImage,
          accentColor,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          repeatYearly,
          isActive,
          showOnHome,
          sortOrder: parseInt(sortOrder, 10) || 0,
          productIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(res.status === 401 ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.' : data.error || 'No se pudo guardar.');
        return;
      }
      setIsModalOpen(false);
      await refresh();
    } catch {
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Collection) => {
    if (!confirm(`¿Eliminar la colección "${c.name}"? Los productos no se borran.`)) return;
    const res = await fetch(`/api/collections/${c.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'No se pudo eliminar la colección.');
      return;
    }
    refresh();
  };

  const q = productSearch.trim().toLowerCase();
  const visibleProducts = products.filter((p) => !q || p.name.toLowerCase().includes(q));

  const inputCls =
    'w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta';
  const labelCls = 'block text-xs font-semibold text-boho-charcoal mb-1';

  return (
    <div className="space-y-6">
      <button
        onClick={() => resetForm(null)}
        className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft flex items-center space-x-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Nueva Colección</span>
      </button>

      {collections.length === 0 && (
        <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-boho-sand-300 text-xs text-boho-charcoal-muted">
          Aún no hay colecciones. Crea la primera (por ejemplo «Feria de Albacete»).
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collections.map((c) => {
          const st = STATUS_STYLES[c.status];
          return (
            <div key={c.id} className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft overflow-hidden flex flex-col justify-between">
              <div>
                <div
                  className="relative aspect-[16/8] w-full"
                  style={{ backgroundColor: c.accentColor }}
                >
                  {c.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                    {st.label}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif-boho text-lg font-bold leading-tight">{c.name}</h3>
                    <span className="text-[11px] opacity-90">/colecciones/{c.slug}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2 text-[11px] text-boho-charcoal-muted">
                  {c.tagline && <p className="text-xs text-boho-charcoal">{c.tagline}</p>}
                  <p className="flex items-center space-x-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-boho-terracotta" />
                    <span>
                      {c.windowStart || c.windowEnd
                        ? `${fmt(c.windowStart) ?? '…'} → ${fmt(c.windowEnd) ?? '…'}`
                        : 'Sin fechas (siempre visible)'}
                    </span>
                    {c.repeatYearly && (
                      <span className="inline-flex items-center space-x-0.5 text-boho-terracotta font-semibold">
                        <Repeat className="w-3 h-3" />
                        <span>cada año</span>
                      </span>
                    )}
                  </p>
                  <p>
                    {c.productCount ?? 0} productos{c.showOnHome ? ' · destacada en portada' : ''}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-boho-sand-100 flex justify-between items-center bg-boho-sand-50/50">
                <Link
                  href={`/colecciones/${c.slug}`}
                  target="_blank"
                  className="p-1.5 hover:bg-boho-sand-200 rounded-lg text-boho-charcoal text-xs font-semibold flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver landing</span>
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() => resetForm(c)}
                    className="p-1.5 hover:bg-boho-sand-200 rounded-lg text-boho-charcoal text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-boho-sand-200 my-4">
            <div className="flex justify-between items-center pb-4 border-b border-boho-sand-200">
              <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal">
                {editing ? 'Editar Colección' : 'Nueva Colección'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Cerrar">
                <X className="w-5 h-5 text-boho-charcoal-muted" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Feria de Albacete" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>URL / Slug (opcional)</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="feria-de-albacete" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Eslogan (bajo el título)</label>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Joyas artesanales para lucir en la Feria" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Texto de la landing</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cuenta la historia de la colección…" className={inputCls} />
              </div>

              <ImageUploader label="Imagen principal (hero)" value={heroImage ? [heroImage] : []} onChange={(u) => setHeroImage(u[0] || '')} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Color de la colección</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value.toUpperCase())} className="h-9 w-12 rounded-lg border border-boho-sand-300 bg-white p-0.5" />
                    <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} maxLength={7} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Visible desde</label>
                  <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Visible hasta (incluido)</label>
                  <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} />
                </div>
              </div>
              <p className="text-[11px] text-boho-charcoal-muted -mt-2">
                Horario de España. Sin fechas, la colección está siempre visible mientras esté activada.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal cursor-pointer">
                  <input type="checkbox" checked={repeatYearly} onChange={(e) => setRepeatYearly(e.target.checked)} className="rounded text-boho-terracotta" />
                  <span>Repetir cada año (mismas fechas)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal cursor-pointer">
                  <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} className="rounded text-boho-terracotta" />
                  <span>Destacar en la portada cuando esté en directo</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-boho-terracotta" />
                  <span>Colección activada</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal">
                  <span>Prioridad</span>
                  <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-16 px-2 py-1 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-lg" />
                </label>
              </div>

              {/* Product picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelCls + ' mb-0'}>Productos de la colección ({productIds.length})</label>
                </div>

                {productIds.length > 0 && (
                  <ol className="space-y-1 max-h-44 overflow-y-auto border border-boho-sand-200 rounded-xl p-2 bg-boho-sand-50/50">
                    {productIds.map((id, i) => {
                      const p = productById.get(id);
                      return (
                        <li key={id} className="flex items-center justify-between text-xs bg-white rounded-lg px-2.5 py-1.5 border border-boho-sand-100">
                          <span className="truncate">
                            <span className="text-boho-charcoal-muted mr-2">{i + 1}.</span>
                            {p?.name ?? 'Producto eliminado'}
                          </span>
                          <span className="flex items-center space-x-1 shrink-0">
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-30" aria-label="Subir">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === productIds.length - 1} className="p-1 disabled:opacity-30" aria-label="Bajar">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => toggleProduct(id)} className="p-1 text-red-600" aria-label="Quitar">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <div className="relative">
                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Buscar producto para añadir…" className={inputCls + ' pl-9'} />
                  <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
                </div>
                <div className="max-h-56 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 border border-boho-sand-200 rounded-xl p-2">
                  {visibleProducts.map((p) => {
                    const on = productIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center space-x-2.5 rounded-lg px-2 py-1.5 cursor-pointer border text-xs ${
                          on ? 'border-boho-terracotta bg-boho-sand-50' : 'border-transparent hover:bg-boho-sand-50'
                        }`}
                      >
                        <input type="checkbox" checked={on} onChange={() => toggleProduct(p.id)} className="rounded text-boho-terracotta" />
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
                        )}
                        <span className="truncate">
                          {p.name}
                          {!p.isActive && <em className="text-amber-700 not-italic ml-1">(oculto)</em>}
                        </span>
                      </label>
                    );
                  })}
                  {visibleProducts.length === 0 && <p className="text-xs text-boho-charcoal-muted p-2">Sin resultados.</p>}
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-boho-sand-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-boho-charcoal-muted">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft transition-colors disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar Colección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
