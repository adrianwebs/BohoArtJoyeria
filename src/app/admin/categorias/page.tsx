'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Layers, X, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
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

  const openNew = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80');
    setSortOrder('0');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(String(cat.sortOrder || 0));
    setIsModalOpen(true);
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
      };

      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Organización del Catálogo
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Categorías de Joyería
          </h1>
        </div>

        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft flex items-center space-x-1.5 transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-boho-sand-100">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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

            <div className="p-4 border-t border-boho-sand-100 flex justify-end space-x-2 bg-boho-sand-50/50">
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
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
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
                  Imagen de Portada (URL)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

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
                  className="px-6 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft transition-colors"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
