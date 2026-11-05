'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Layers, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?all=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const openNew = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setSortOrder('0');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(String(cat.sortOrder || 0));
    setIsActive(cat.isActive !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (cat: Category) => {
    const nextStatus = cat.isActive === false ? true : false;

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar estado');
      }

      showNotification(
        nextStatus
          ? `✓ Categoría "${cat.name}" ahora está ACTIVA y visible en la tienda.`
          : `✕ Categoría "${cat.name}" ahora está INACTIVA y oculta para clientes.`
      );
    } catch (err) {
      console.error(err);
      // Revert if error
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !nextStatus } : c))
      );
      alert('Hubo un error al cambiar el estado de la categoría.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const payload = {
        name,
        slug: slug ? slugify(slug) : slugify(name),
        description,
        image,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
      };

      setSaving(true);
      const res = await fetch(
        editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories',
        {
          method: editingCategory ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          res.status === 401
            ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
            : data.error || 'No se pudo guardar la categoría.'
        );
        return;
      }

      showNotification(
        editingCategory
          ? `✓ Categoría "${name}" actualizada correctamente.`
          : `✓ Nueva categoría "${name}" creada exitosamente.`
      );

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'No se pudo eliminar la categoría.');
        return;
      }
      showNotification('✓ Categoría eliminada correctamente.');
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (filterStatus === 'active') return c.isActive !== false;
      if (filterStatus === 'inactive') return c.isActive === false;
      return true;
    });
  }, [categories, filterStatus]);

  const activeCount = useMemo(() => categories.filter((c) => c.isActive !== false).length, [categories]);
  const inactiveCount = useMemo(() => categories.filter((c) => c.isActive === false).length, [categories]);

  return (
    <div className="space-y-6">
      
      {actionMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold shadow-soft flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Organización del Catálogo
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Categorías de Joyería
          </h1>
          <p className="text-xs text-boho-charcoal-muted mt-1">
            Activa o desactiva categorías para mostrar u ocultar sus productos de la tienda y el menú.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft flex items-center space-x-1.5 transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-boho-sand-200 pb-3 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-boho-terracotta text-white shadow-soft'
              : 'bg-white text-boho-charcoal-muted hover:text-boho-charcoal border border-boho-sand-200'
          }`}
        >
          Todas ({categories.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
            filterStatus === 'active'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'bg-white text-boho-charcoal-muted hover:text-boho-charcoal border border-boho-sand-200'
          }`}
        >
          Activas en tienda ({activeCount})
        </button>
        <button
          onClick={() => setFilterStatus('inactive')}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
            filterStatus === 'inactive'
              ? 'bg-amber-600 text-white shadow-soft'
              : 'bg-white text-boho-charcoal-muted hover:text-boho-charcoal border border-boho-sand-200'
          }`}
        >
          Inactivas / Ocultas ({inactiveCount})
        </button>
      </div>

      {/* Grid of categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-boho-sand-300 text-xs text-boho-charcoal-muted">
          No se encontraron categorías en esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const isCatActive = cat.isActive !== false;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-3xl border shadow-soft overflow-hidden flex flex-col justify-between transition-all ${
                  isCatActive ? 'border-boho-sand-200' : 'border-amber-200/80 bg-amber-50/20 opacity-90'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-boho-sand-100">
                    <Image
                      src={cat.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                      alt={cat.name}
                      fill
                      className={`object-cover ${!isCatActive ? 'grayscale-[40%]' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm ${
                          isCatActive
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}
                      >
                        {isCatActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{isCatActive ? 'Activa en tienda' : 'Inactiva (Oculta)'}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="font-serif-boho text-lg font-bold">{cat.name}</h3>
                      <span className="text-[11px] text-boho-sand-200">
                        URL: /categorias/{cat.slug}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <p className="text-xs text-boho-charcoal-muted line-clamp-2">
                      {cat.description || 'Sin descripción.'}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-boho-terracotta font-semibold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{cat.productCount || 0} productos vinculados</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-boho-sand-100 flex items-center justify-between bg-boho-sand-50/50">
                  {/* Quick Toggle Action */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`p-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                      isCatActive
                        ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title={isCatActive ? 'Desactivar y ocultar de la tienda' : 'Activar y mostrar en la tienda'}
                  >
                    {isCatActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isCatActive ? 'Desactivar' : 'Activar'}</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 hover:bg-boho-sand-200 rounded-lg text-boho-charcoal transition-colors text-xs font-semibold flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors text-xs font-semibold flex items-center space-x-1"
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
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 py-8 sm:py-12">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-boho-sand-200">
            <div className="flex justify-between items-center pb-4 border-b border-boho-sand-200">
              <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-boho-charcoal-muted" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Pendientes de Arcilla"
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    URL / Slug (opcional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="pendientes"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Orden de visualización
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              {/* Active Toggle Switch in Modal */}
              <div className="p-3.5 bg-boho-sand-50 rounded-2xl border border-boho-sand-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-boho-charcoal block">
                      Categoría Activa (Visible en la Tienda)
                    </span>
                    <span className="text-[11px] text-boho-charcoal-muted block mt-0.5">
                      Si está activa, los clientes podrán verla en navegación y catálogo. Si se desactiva, quedará oculta.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded text-boho-terracotta focus:ring-boho-terracotta cursor-pointer accent-boho-terracotta shrink-0"
                  />
                </label>
              </div>

              <ImageUploader
                label="Imagen de portada"
                value={image ? [image] : []}
                onChange={(urls) => setImage(urls[0] || '')}
              />

              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Descripción (para SEO y encabezado)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la colección..."
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-boho-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-boho-charcoal-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft transition-colors disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
