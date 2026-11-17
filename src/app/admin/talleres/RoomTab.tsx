'use client';

import React, { useEffect, useState } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { api, btnPrimary, inputCls } from './TalleresAdminClient';

/** Bloque informativo de la sala donde se dan los talleres (se muestra en cada ficha de taller). No es reservable. */
export function RoomTab({ notify }: { notify: (m: string) => void }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ title: string; text: string; photos: string[] }>('/api/admin/workshop-room').then((r) => {
      if (r.ok) { setTitle(r.data.title); setText(r.data.text); setPhotos(r.data.photos); }
      setLoaded(true);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const r = await api('/api/admin/workshop-room', 'PUT', { title, text, photos });
    setSaving(false);
    notify(r.ok ? 'Sala guardada' : r.error || 'Error al guardar');
  };

  if (!loaded) return <p className="text-xs text-boho-charcoal-muted">Cargando…</p>;
  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-boho-sand-200 p-5 space-y-4 max-w-2xl">
      <p className="text-xs text-boho-charcoal-muted">Sección informativa que aparece en la página de cada taller (cómo es la sala, dónde está, cómo llegar…). No se puede reservar.</p>
      <label className="text-xs font-semibold block">Título<input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="text-xs font-semibold block">Texto<textarea rows={6} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} /></label>
      <ImageUploader label="Fotos de la sala" multiple value={photos} onChange={setPhotos} />
      <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Guardando…' : 'Guardar'}</button>
    </form>
  );
}
