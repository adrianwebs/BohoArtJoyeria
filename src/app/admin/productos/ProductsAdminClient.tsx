'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  X,
  Eye,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface ProductsAdminClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsAdminClient({
  initialProducts,
  categories,
}: ProductsAdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [materials, setMaterials] = useState('Arcilla polimérica, fornituras hipoalergénicas en acero inoxidable');
  const [dimensions, setDimensions] = useState('5.0 cm x 2.5 cm');
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openNewModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setPrice('');
    setComparePrice('');
    setStock('10');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setShortDescription('');
    setMaterials('Arcilla polimérica premium, fornituras hipoalergénicas en acero inoxidable');
    setDimensions('5.0 cm x 2.5 cm');
    setImages([]);
    setIsFeatured(false);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setPrice(String(p.price));
    setComparePrice(p.comparePrice ? String(p.comparePrice) : '');
    setStock(String(p.stock));
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setShortDescription(p.shortDescription || '');
    setMaterials(p.materials || '');
    setDimensions(p.dimensions || '');
    setImages(p.images);
    setIsFeatured(p.isFeatured);
    setIsActive(p.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;

    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || undefined,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock, 10) || 0,
        categoryId,
        description,
        shortDescription,
        materials,
        dimensions,
        images,
        isFeatured,
        isActive,
      };

      const res = await fetch(
        editingProduct ? `/api/products/${editingProduct.id}` : '/api/products',
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          res.status === 401
            ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
            : data.error || 'No se pudo guardar el producto.'
        );
        return;
      }
      setProducts((prev) =>
        editingProduct
          ? prev.map((item) => (item.id === data.id ? { ...item, ...data } : item))
          : [data, ...prev]
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este producto del catálogo?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Products that appear in past orders are archived (hidden) instead of deleted; refetch to reflect that.
        const fresh = await fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null));
        setProducts((prev) =>
          fresh ? prev.map((p) => (p.id === id ? { ...p, ...fresh } : p)) : prev.filter((p) => p.id !== id)
        );
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'No se pudo eliminar el producto.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-boho-sand-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
            />
            <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-boho-sand-50 border border-boho-sand-300 rounded-xl text-xs font-medium text-boho-charcoal focus:outline-none focus:border-boho-terracotta"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft flex items-center justify-center space-x-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Nueva Joya</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-boho-charcoal">
            <thead className="bg-boho-sand-50/80 border-b border-boho-sand-200 uppercase text-[10px] font-bold tracking-wider text-boho-charcoal-muted">
              <tr>
                <th className="py-3.5 px-4">Joya / Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-boho-sand-100 font-sans">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-boho-sand-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-boho-sand-100 shrink-0 border border-boho-sand-200">
                          <Image
                            src={p.images[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-boho-charcoal flex items-center space-x-1.5">
                            <span>{p.name}</span>
                            {p.isFeatured && (
                              <Sparkles className="w-3 h-3 text-boho-gold fill-boho-gold" />
                            )}
                          </div>
                          <span className="text-[11px] text-boho-charcoal-muted">
                            Ref: {p.sku || p.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-boho-charcoal-muted font-medium">
                      {cat?.name || 'General'}
                    </td>

                    <td className="py-3 px-4 font-bold text-boho-charcoal">
                      {formatPrice(p.price)}
                      {p.comparePrice && (
                        <span className="block text-[10px] text-boho-charcoal-muted line-through font-normal">
                          {formatPrice(p.comparePrice)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stock <= 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.stock} uds
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.isActive
                            ? 'bg-boho-sand-100 text-boho-charcoal'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Activo en Tienda' : 'Oculto'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 hover:bg-boho-sand-200 rounded-lg text-boho-charcoal transition-colors"
                        title="Editar joya"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Eliminar joya"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-boho-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-boho-sand-200">
              <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal">
                {editingProduct ? 'Editar Joya Artesanal' : 'Añadir Nueva Joya al Catálogo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-boho-sand-100 rounded-full text-boho-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Nombre de la Joya *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Pendientes Terracota Arch"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Precio Venta (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="24.90"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Precio Anterior / Rebaja
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="29.90"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Stock en Taller *
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              <ImageUploader
                multiple
                label="Fotos del producto (la primera es la portada)"
                value={images}
                onChange={setImages}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Materiales & Fornituras
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Arcilla polimérica, acero 316L"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Dimensiones
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="5.5 cm x 3.0 cm"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la pieza, su inspiración y textura..."
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              {/* Switches */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-boho-terracotta focus:ring-boho-terracotta"
                  />
                  <span>Destacar en Portada</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-boho-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-boho-terracotta focus:ring-boho-terracotta"
                  />
                  <span>Producto Visible y Activo</span>
                </label>
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
                  className="px-4 py-2 text-xs font-medium text-boho-charcoal-muted hover:text-boho-charcoal"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Joya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
