'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Wand2, Save } from 'lucide-react';
import { AttributeGroup, ProductVariant } from '@/lib/types';
import { AttributeSwatch } from '@/components/store/AttributeSwatch';
import { formatPrice } from '@/lib/utils';

interface Props {
  productId: string;
  productPrice: number;
  productImages: string[];
  attributeGroups: AttributeGroup[];
  /** Called after every successful change with the fresh list, to refresh product stock/flags in the list. */
  onChanged: (variants: ProductVariant[]) => void;
}

interface Row {
  id: string;
  label: string;
  sku: string;
  price: string; // '' = product price + adjustment
  priceAdjustment: string;
  stock: string;
  image: string;
  isActive: boolean;
}

const cell = 'w-full px-2 py-1.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-lg focus:outline-none focus:border-boho-terracotta';

const toRow = (v: ProductVariant): Row => ({
  id: v.id,
  label: v.label,
  sku: v.sku ?? '',
  price: v.priceOverride != null ? String(v.priceOverride) : '',
  priceAdjustment: v.priceAdjustment ? String(v.priceAdjustment) : '',
  stock: String(v.stock),
  image: v.image ?? '',
  isActive: v.isActive,
});

export function ProductVariantsEditor({ productId, productPrice, productImages, attributeGroups, onChanged }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Record<string, string[]>>({}); // groupId -> chosen value ids
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const apply = (list: ProductVariant[]) => {
    setVariants(list);
    setRows(list.map(toRow));
    onChanged(list);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/products/${productId}/variants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: ProductVariant[]) => {
        if (!alive) return;
        setVariants(list);
        setRows(list.map(toRow));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId]);

  const call = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(res.status === 401 ? 'Tu sesión ha caducado.' : data.error || 'No se pudo completar la acción.');
    return data;
  };

  const toggle = (groupId: string, valueId: string) =>
    setPicked((prev) => {
      const cur = prev[groupId] ?? [];
      return { ...prev, [groupId]: cur.includes(valueId) ? cur.filter((x) => x !== valueId) : [...cur, valueId] };
    });

  const selectedLists = Object.values(picked).filter((l) => l.length > 0);
  const comboCount = selectedLists.reduce((n, l) => n * l.length, 1);

  const generate = async () => {
    if (selectedLists.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const before = variants.length;
      const list: ProductVariant[] = await call(`/api/products/${productId}/variants`, 'POST', { valueIds: selectedLists });
      apply(list);
      setMsg({ type: 'ok', text: `${list.length - before} combinación(es) nuevas creadas. Ajusta stock y precio abajo.` });
    } catch (e) {
      setMsg({ type: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const list: ProductVariant[] = await call(`/api/products/${productId}/variants`, 'PUT', {
        variants: rows.map((r) => ({
          id: r.id,
          sku: r.sku || null,
          price: r.price === '' ? null : Number(r.price),
          priceAdjustment: Number(r.priceAdjustment) || 0,
          stock: Number(r.stock) || 0,
          image: r.image || null,
          isActive: r.isActive,
        })),
      });
      apply(list);
      setMsg({ type: 'ok', text: 'Combinaciones guardadas.' });
    } catch (e) {
      setMsg({ type: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta combinación? (Si ya está en pedidos se desactivará.)')) return;
    setBusy(true);
    setMsg(null);
    try {
      await call(`/api/products/${productId}/variants?variantId=${id}`, 'DELETE');
      const list: ProductVariant[] = await call(`/api/products/${productId}/variants`, 'GET');
      apply(list);
    } catch (e) {
      setMsg({ type: 'error', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const patch = (id: string, p: Partial<Row>) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const finalPrice = (r: Row) =>
    r.price !== '' ? Number(r.price) || 0 : Math.round((productPrice + (Number(r.priceAdjustment) || 0)) * 100) / 100;

  return (
    <div className="space-y-4 rounded-2xl border border-boho-sand-200 p-4 bg-boho-sand-50/40">
      <div>
        <h4 className="font-bold text-xs uppercase tracking-wider text-boho-charcoal">Combinaciones (variantes)</h4>
        <p className="text-[11px] text-boho-charcoal-muted mt-0.5">
          Si el producto tiene combinaciones, el stock real es el de cada una. Sin combinaciones funciona como siempre.
        </p>
      </div>

      {/* Generator */}
      {attributeGroups.length === 0 ? (
        <p className="text-xs text-boho-charcoal-muted">
          Aún no hay atributos. Créalos en{' '}
          <Link href="/admin/atributos" className="text-boho-terracotta font-semibold underline">
            Atributos &amp; Variantes
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {attributeGroups
            .filter((g) => g.values.length > 0)
            .map((g) => (
              <div key={g.id}>
                <div className="text-[11px] font-semibold text-boho-charcoal mb-1">{g.name}</div>
                <div className="flex flex-wrap gap-2">
                  {g.values.map((v) => {
                    const on = (picked[g.id] ?? []).includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggle(g.id, v.id)}
                        aria-pressed={on}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                          on
                            ? 'border-boho-terracotta bg-boho-terracotta/10 text-boho-terracotta'
                            : 'border-boho-sand-300 bg-white text-boho-charcoal hover:border-boho-terracotta'
                        }`}
                      >
                        {g.type === 'color' && <AttributeSwatch hex={v.hex} isMulticolor={v.isMulticolor} size={14} />}
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          <button
            type="button"
            onClick={generate}
            disabled={busy || selectedLists.length === 0}
            className="px-4 py-2 bg-boho-charcoal text-white rounded-full text-xs font-bold flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generar {selectedLists.length > 0 ? `${comboCount} combinación(es)` : 'combinaciones'}</span>
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-xs text-boho-charcoal-muted">Cargando combinaciones…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-boho-charcoal-muted">Este producto no tiene combinaciones.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="uppercase text-[10px] tracking-wider text-boho-charcoal-muted">
              <tr>
                <th className="py-2 pr-2">Combinación</th>
                <th className="py-2 pr-2 w-24">SKU</th>
                <th className="py-2 pr-2 w-24">Precio propio</th>
                <th className="py-2 pr-2 w-20">+/− €</th>
                <th className="py-2 pr-2 w-20">Stock</th>
                <th className="py-2 pr-2 w-28">Imagen</th>
                <th className="py-2 pr-2">Activa</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-boho-sand-100">
              {rows.map((r) => (
                <tr key={r.id} className={r.isActive ? '' : 'opacity-50'}>
                  <td className="py-2 pr-2 font-medium text-boho-charcoal">
                    {r.label}
                    <span className="block text-[10px] text-boho-charcoal-muted font-normal">{formatPrice(finalPrice(r))}</span>
                  </td>
                  <td className="py-2 pr-2">
                    <input value={r.sku} onChange={(e) => patch(r.id, { sku: e.target.value })} className={cell} />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={r.price}
                      onChange={(e) => patch(r.id, { price: e.target.value })}
                      placeholder="—"
                      className={cell}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="0.01"
                      value={r.priceAdjustment}
                      onChange={(e) => patch(r.id, { priceAdjustment: e.target.value })}
                      disabled={r.price !== ''}
                      placeholder="0"
                      className={`${cell} disabled:opacity-40`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="0" value={r.stock} onChange={(e) => patch(r.id, { stock: e.target.value })} className={cell} />
                  </td>
                  <td className="py-2 pr-2">
                    <select value={r.image} onChange={(e) => patch(r.id, { image: e.target.value })} className={cell}>
                      <option value="">Por defecto</option>
                      {productImages.map((img, i) => (
                        <option key={img} value={img}>
                          Foto {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input type="checkbox" checked={r.isActive} onChange={(e) => patch(r.id, { isActive: e.target.checked })} />
                  </td>
                  <td className="py-2 text-right">
                    <button type="button" onClick={() => remove(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Eliminar combinación">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-boho-charcoal-muted mt-1">
            Precio propio vacío = precio del producto ({formatPrice(productPrice)}) {'+'} ajuste. Stock total:{' '}
            <b>{rows.filter((r) => r.isActive).reduce((s, r) => s + (Number(r.stock) || 0), 0)}</b>
          </p>
        </div>
      )}

      {msg && (
        <p
          role={msg.type === 'error' ? 'alert' : 'status'}
          className={`text-xs font-semibold rounded-xl px-3.5 py-2 border ${
            msg.type === 'error' ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}
        >
          {msg.text}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="px-5 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{busy ? 'Guardando…' : 'Guardar combinaciones'}</span>
        </button>
      )}
    </div>
  );
}
