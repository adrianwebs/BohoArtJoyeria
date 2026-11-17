'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatPrice } from '@/lib/utils';
import { api, btnGhost, btnPrimary, inputCls, type AdminWorkshop } from './TalleresAdminClient';

interface Props {
  workshops: AdminWorkshop[];
  reload: () => Promise<void>;
  notify: (m: string) => void;
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date(iso));

/** ISO → valor de <input type="datetime-local"> en hora local del navegador. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

interface FormState {
  id?: string;
  title: string; slug: string; shortDescription: string; description: string;
  price: string; depositType: 'FIXED' | 'PERCENT'; depositValue: string; durationMinutes: string;
  materials: string; faq: { q: string; a: string }[]; image: string[]; photos: string[];
  isActive: boolean; sortOrder: string;
}

const emptyForm = (): FormState => ({
  title: '', slug: '', shortDescription: '', description: '', price: '', depositType: 'FIXED', depositValue: '20',
  durationMinutes: '120', materials: '', faq: [], image: [], photos: [], isActive: true, sortOrder: '0',
});

const fromWorkshop = (w: AdminWorkshop): FormState => {
  let faq: { q: string; a: string }[] = [];
  try { faq = w.faq ? JSON.parse(w.faq) : []; } catch { /* ignore */ }
  return {
    id: w.id, title: w.title, slug: w.slug, shortDescription: w.shortDescription || '', description: w.description,
    price: String(w.price), depositType: w.depositType, depositValue: String(w.depositValue), durationMinutes: String(w.durationMinutes),
    materials: w.materials || '', faq, image: w.image ? [w.image] : [], photos: w.photos.map((p) => p.url), isActive: w.isActive, sortOrder: String(w.sortOrder),
  };
};

export function WorkshopsTab({ workshops, reload, notify }: Props) {
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [sessionsFor, setSessionsFor] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError('');
    const payload = {
      title: form.title, slug: form.slug, shortDescription: form.shortDescription, description: form.description,
      price: Number(form.price), depositType: form.depositType, depositValue: Number(form.depositValue),
      durationMinutes: Number(form.durationMinutes), materials: form.materials, faq: form.faq,
      image: form.image[0] || '', isActive: form.isActive, sortOrder: Number(form.sortOrder) || 0,
      ...(form.id ? { photos: form.photos.map((url) => ({ url })) } : {}),
    };
    const r = form.id ? await api(`/api/admin/workshops/${form.id}`, 'PUT', payload) : await api('/api/admin/workshops', 'POST', payload);
    setSaving(false);
    if (!r.ok) return setFormError(r.error || 'No se pudo guardar');
    notify(form.id ? 'Taller guardado' : 'Taller creado. Ahora añade fechas y fotos de galería.');
    setForm(null);
    await reload();
  };

  const remove = async (w: AdminWorkshop) => {
    if (!confirm(`¿Eliminar el taller "${w.title}"? Esta acción no se puede deshacer.`)) return;
    const r = await api(`/api/admin/workshops/${w.id}`, 'DELETE');
    notify(r.ok ? 'Taller eliminado' : r.error || 'No se pudo eliminar');
    if (r.ok) await reload();
  };

  const toggleActive = async (w: AdminWorkshop) => {
    // Sin `photos`: así la galería existente no se toca.
    const { photos: _photos, ...f } = fromWorkshop(w);
    const r = await api(`/api/admin/workshops/${w.id}`, 'PUT', {
      ...f, price: Number(f.price), depositValue: Number(f.depositValue), durationMinutes: Number(f.durationMinutes), image: f.image[0] || '', isActive: !w.isActive,
    });
    notify(r.ok ? (w.isActive ? 'Taller oculto' : 'Taller visible') : r.error || 'Error');
    if (r.ok) await reload();
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-4">
      <button onClick={() => { setForm(emptyForm()); setFormError(''); }} className={`${btnPrimary} flex items-center space-x-1.5`}>
        <Plus className="w-4 h-4" /><span>Nuevo taller</span>
      </button>

      {workshops.length === 0 && <p className="text-xs text-boho-charcoal-muted">Todavía no hay talleres.</p>}

      <div className="space-y-4">
        {workshops.map((w) => (
          <div key={w.id} className="bg-white rounded-2xl border border-boho-sand-200 shadow-soft p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">{w.title} {!w.isActive && <span className="text-[10px] font-bold uppercase bg-boho-sand-200 text-boho-charcoal-muted px-2 py-0.5 rounded-full align-middle">Oculto</span>}</h3>
                <p className="text-xs text-boho-charcoal-muted">
                  {formatPrice(w.price)} · señal {w.depositType === 'PERCENT' ? `${w.depositValue}%` : formatPrice(w.depositValue)} · {w.durationMinutes} min · /talleres/{w.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className={btnGhost} onClick={() => setSessionsFor(sessionsFor === w.id ? null : w.id)}>Fechas ({w.sessions.length})</button>
                <button className={btnGhost} title={w.isActive ? 'Ocultar' : 'Mostrar'} onClick={() => toggleActive(w)}>{w.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                <button className={btnGhost} title="Editar" onClick={() => { setForm(fromWorkshop(w)); setFormError(''); }}><Edit2 className="w-3.5 h-3.5" /></button>
                <button className={`${btnGhost} text-red-600`} title="Eliminar" onClick={() => remove(w)}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {sessionsFor === w.id && <SessionsManager workshop={w} reload={reload} notify={notify} />}
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4">
          <form onSubmit={save} className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-boho text-xl font-bold text-boho-charcoal">{form.id ? 'Editar taller' : 'Nuevo taller'}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Cerrar"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold sm:col-span-2">Título<input required className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
              <label className="text-xs font-semibold">Slug (URL)<input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="se genera del título" /></label>
              <label className="text-xs font-semibold">Duración (minutos)<input required type="number" min={15} step={15} className={inputCls} value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} /></label>
              <label className="text-xs font-semibold">Precio total por plaza (€)<input required type="number" min={1} step="0.01" className={inputCls} value={form.price} onChange={(e) => set('price', e.target.value)} /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold">Tipo de señal
                  <select className={inputCls} value={form.depositType} onChange={(e) => set('depositType', e.target.value as 'FIXED' | 'PERCENT')}>
                    <option value="FIXED">Importe fijo (€/plaza)</option>
                    <option value="PERCENT">Porcentaje (%)</option>
                  </select>
                </label>
                <label className="text-xs font-semibold">Señal ({form.depositType === 'PERCENT' ? '%' : '€'})<input required type="number" min={0.01} step="0.01" className={inputCls} value={form.depositValue} onChange={(e) => set('depositValue', e.target.value)} /></label>
              </div>
              <p className="text-[11px] text-amber-800 sm:col-span-2">La señal no se devuelve. Se muestra así a la clienta y en el correo de confirmación.</p>
              <label className="text-xs font-semibold sm:col-span-2">Resumen (listado)<input className={inputCls} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} /></label>
              <label className="text-xs font-semibold sm:col-span-2">Descripción<textarea required rows={5} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
              <label className="text-xs font-semibold sm:col-span-2">Materiales incluidos (uno por línea)<textarea rows={4} className={inputCls} value={form.materials} onChange={(e) => set('materials', e.target.value)} /></label>
              <label className="text-xs font-semibold">Orden<input type="number" className={inputCls} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} /></label>
              <label className="text-xs font-semibold flex items-center space-x-2 pt-5"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /><span>Visible en la web</span></label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold block">Preguntas frecuentes</span>
              {form.faq.map((f, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-boho-sand-200 p-3">
                  <input className={inputCls} placeholder="Pregunta" value={f.q} onChange={(e) => set('faq', form.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                  <textarea rows={2} className={inputCls} placeholder="Respuesta" value={f.a} onChange={(e) => set('faq', form.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
                  <button type="button" className="text-[11px] text-red-600 font-semibold justify-self-start" onClick={() => set('faq', form.faq.filter((_, j) => j !== i))}>Quitar</button>
                </div>
              ))}
              <button type="button" className={btnGhost} onClick={() => set('faq', [...form.faq, { q: '', a: '' }])}>+ Añadir pregunta</button>
            </div>

            <ImageUploader label="Imagen principal" value={form.image} onChange={(v) => set('image', v)} />
            {form.id ? (
              <ImageUploader label="Galería de fotos" multiple value={form.photos} onChange={(v) => set('photos', v)} />
            ) : (
              <p className="text-[11px] text-boho-charcoal-muted">Guarda el taller para poder añadir la galería de fotos.</p>
            )}

            {formError && <p role="alert" className="text-xs font-semibold text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SessionsManager({ workshop, reload, notify }: { workshop: AdminWorkshop; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [startsAt, setStartsAt] = useState('');
  const [capacity, setCapacity] = useState('6');

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api(`/api/admin/workshops/${workshop.id}/sessions`, 'POST', { startsAt: new Date(startsAt).toISOString(), capacity: Number(capacity) });
    notify(r.ok ? 'Fecha añadida' : r.error || 'Error');
    if (r.ok) { setStartsAt(''); await reload(); }
  };
  const update = async (s: AdminWorkshop['sessions'][number], patch: Partial<{ capacity: number; isActive: boolean }>) => {
    const r = await api(`/api/admin/workshop-sessions/${s.id}`, 'PUT', { startsAt: s.startsAt, capacity: s.capacity, isActive: s.isActive, ...patch });
    notify(r.ok ? 'Fecha actualizada' : r.error || 'Error');
    if (r.ok) await reload();
  };
  const remove = async (s: AdminWorkshop['sessions'][number]) => {
    if (!confirm('¿Eliminar esta fecha?')) return;
    const r = await api(`/api/admin/workshop-sessions/${s.id}`, 'DELETE');
    notify(r.ok ? 'Fecha eliminada' : r.error || 'Error');
    if (r.ok) await reload();
  };

  return (
    <div className="border-t border-boho-sand-200 pt-3 space-y-3">
      {workshop.sessions.length === 0 && <p className="text-xs text-boho-charcoal-muted">Sin fechas todavía.</p>}
      {workshop.sessions.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-semibold ${s.isActive ? '' : 'line-through text-boho-charcoal-muted'}`}>{fmt(s.startsAt)}</span>
          <span className="text-boho-charcoal-muted">{s.seatsTaken}/{s.capacity} plazas ocupadas (pagadas)</span>
          <span className="flex items-center gap-2">
            <button className={btnGhost} onClick={() => { const c = prompt('Nuevo aforo', String(s.capacity)); if (c) update(s, { capacity: Number(c) }); }}>Aforo</button>
            <button className={btnGhost} onClick={() => update(s, { isActive: !s.isActive })}>{s.isActive ? 'Cerrar' : 'Abrir'}</button>
            <button className={`${btnGhost} text-red-600`} onClick={() => remove(s)}><Trash2 className="w-3.5 h-3.5" /></button>
          </span>
        </div>
      ))}
      <form onSubmit={add} className="flex flex-wrap items-end gap-2">
        <label className="text-[11px] font-semibold">Fecha y hora<input required type="datetime-local" min={toLocalInput(new Date().toISOString())} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls} /></label>
        <label className="text-[11px] font-semibold">Plazas<input required type="number" min={1} max={100} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={`${inputCls} w-20`} /></label>
        <button type="submit" className={btnPrimary}>Añadir fecha</button>
      </form>
    </div>
  );
}
