'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  /** Single image mode (categories, collection hero) vs. gallery (products). */
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({ value, onChange, multiple = false, label }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      Array.from(fileList)
        .slice(0, multiple ? 10 : 1)
        .forEach((f) => form.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 401 ? 'Tu sesión ha caducado.' : data.error || 'No se pudo subir la imagen.');
        return;
      }
      if (data.errors?.length) setError(data.errors.join(' · '));
      onChange(multiple ? [...value, ...data.urls] : [data.urls[0]]);
    } catch {
      setError('Error de conexión al subir la imagen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) {
      setError('La URL debe empezar por https://');
      return;
    }
    setError('');
    onChange(multiple ? [...value, u] : [u]);
    setUrlInput('');
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const makeCover = (i: number) => onChange([value[i], ...value.filter((_, idx) => idx !== i)]);

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-boho-charcoal">{label}</label>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-boho-sand-300 bg-boho-sand-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {multiple && i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-boho-terracotta text-white px-1.5 py-0.5 rounded-full">
                  Portada
                </span>
              )}
              <div className="absolute top-1 right-1 flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {multiple && i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    title="Usar como portada"
                    className="w-6 h-6 rounded-full bg-white/90 text-boho-terracotta flex items-center justify-center shadow"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title="Quitar"
                  className="w-6 h-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-dashed border-boho-terracotta text-boho-terracotta text-xs font-bold hover:bg-boho-sand-50 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          <span>{uploading ? 'Subiendo...' : multiple ? 'Subir fotos' : 'Subir foto'}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…o pega una URL https://"
            className="flex-1 px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-boho-sand-200 hover:bg-boho-sand-300"
          >
            Añadir
          </button>
        </div>
      </div>

      <p className="text-[10px] text-boho-charcoal-muted">JPG, PNG, WebP o GIF · máx. 5 MB por imagen</p>
      {error && (
        <p role="alert" className="text-[11px] font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
