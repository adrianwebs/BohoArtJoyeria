'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Coupon, DiscountType } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Filters & search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired_inactive'>('all');

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    showToast(`✓ Código "${couponCode}" copiado al portapapeles`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const openNew = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('10');
    setMinOrderAmount('');
    setMaxUses('');
    setExpiresAt('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (coup: Coupon) => {
    setEditingCoupon(coup);
    setCode(coup.code);
    setDescription(coup.description || '');
    setDiscountType(coup.discountType);
    setDiscountValue(String(coup.discountValue));
    setMinOrderAmount(coup.minOrderAmount ? String(coup.minOrderAmount) : '');
    setMaxUses(coup.maxUses ? String(coup.maxUses) : '');
    
    // Format expiresAt for input datetime-local or date
    if (coup.expiresAt) {
      const d = new Date(coup.expiresAt);
      if (!isNaN(d.getTime())) {
        const iso = d.toISOString().split('T')[0];
        setExpiresAt(iso);
      } else {
        setExpiresAt('');
      }
    } else {
      setExpiresAt('');
    }
    
    setIsActive(coup.isActive);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (coup: Coupon) => {
    const nextStatus = !coup.isActive;

    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coup.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      const res = await fetch(`/api/coupons/${coup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      showToast(
        nextStatus
          ? `✓ Cupón "${coup.code}" activado`
          : `✕ Cupón "${coup.code}" desactivado`
      );
    } catch (e) {
      console.error(e);
      // Revert
      setCoupons((prev) =>
        prev.map((c) => (c.id === coup.id ? { ...c, isActive: !nextStatus } : c))
      );
      alert('Error al cambiar el estado del cupón.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.000Z`).toISOString() : null,
        isActive,
      };

      if (editingCoupon) {
        const res = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al actualizar cupón');
        }
        showToast(`✓ Cupón "${payload.code}" actualizado con éxito`);
      } else {
        const res = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error al crear cupón');
        }
        showToast(`✓ Nuevo cupón "${payload.code}" creado con éxito`);
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar el cupón');
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`¿Eliminar el cupón promocional "${couponCode}" permanentemente?`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Cupón "${couponCode}" eliminado.`);
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper check for expiration
  const isCouponExpired = (coup: Coupon) => {
    if (!coup.expiresAt) return false;
    const t = new Date(coup.expiresAt).getTime();
    return !isNaN(t) && t < Date.now();
  };

  // Statistics
  const activeCount = useMemo(
    () => coupons.filter((c) => c.isActive && !isCouponExpired(c)).length,
    [coupons]
  );
  const expiredOrInactiveCount = useMemo(
    () => coupons.filter((c) => !c.isActive || isCouponExpired(c)).length,
    [coupons]
  );
  const totalUsesCount = useMemo(
    () => coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0),
    [coupons]
  );

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const expired = isCouponExpired(c);
      if (statusFilter === 'active' && (!c.isActive || expired)) return false;
      if (statusFilter === 'expired_inactive' && c.isActive && !expired) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [coupons, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-boho-charcoal text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-slide-down border border-white/10">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Marketing & Promociones
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Cupones y Códigos de Descuento
          </h1>
          <p className="text-xs text-boho-charcoal-muted mt-1">
            Crea promociones para premiar a clientes, aplicar rebajas de temporada o campañas de influencers con fecha de caducidad.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft flex items-center space-x-1.5 transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
          <span className="text-[11px] font-semibold text-boho-charcoal-muted block">
            Total Cupones
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-serif-boho text-2xl font-bold text-boho-charcoal">
              {coupons.length}
            </span>
            <Tag className="w-5 h-5 text-boho-terracotta opacity-80" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            Cupones Activos
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-serif-boho text-2xl font-bold text-emerald-700">
              {activeCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
          <span className="text-[11px] font-semibold text-amber-800 block">
            Caducados / Inactivos
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-serif-boho text-2xl font-bold text-amber-700">
              {expiredOrInactiveCount}
            </span>
            <Clock className="w-5 h-5 text-amber-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft">
          <span className="text-[11px] font-semibold text-boho-charcoal-muted block">
            Usos Acumulados
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-serif-boho text-2xl font-bold text-boho-charcoal">
              {totalUsesCount}
            </span>
            <Sparkles className="w-5 h-5 text-boho-gold opacity-80" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-boho-sand-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o descripción..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
          />
          <Search className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-boho-charcoal text-white'
                : 'bg-boho-sand-100 text-boho-charcoal hover:bg-boho-sand-200'
            }`}
          >
            Todos ({coupons.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Activos ({activeCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('expired_inactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'expired_inactive'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Caducados / Pausados ({expiredOrInactiveCount})</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-boho-sand-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-boho-charcoal-muted">
            Cargando cupones...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-semibold text-sm text-boho-charcoal">
              No se encontraron códigos de descuento con estos criterios.
            </p>
            <p className="text-xs text-boho-charcoal-muted">
              Crea tu primer código promocional haciendo clic en &quot;Nuevo Cupón&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-boho-charcoal">
              <thead className="bg-boho-sand-50/80 border-b border-boho-sand-200 uppercase text-[10px] font-bold tracking-wider text-boho-charcoal-muted">
                <tr>
                  <th className="py-3.5 px-4">Código Promocional</th>
                  <th className="py-3.5 px-4">Descuento</th>
                  <th className="py-3.5 px-4">Condición</th>
                  <th className="py-3.5 px-4">Caducidad</th>
                  <th className="py-3.5 px-4">Usos</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-boho-sand-100">
                {filteredCoupons.map((c) => {
                  const expired = isCouponExpired(c);
                  const isEffectiveActive = c.isActive && !expired;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-boho-sand-50/50 transition-colors ${
                        !isEffectiveActive ? 'opacity-75 bg-boho-sand-50/20' : ''
                      }`}
                    >
                      {/* Code and Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="font-mono font-bold text-xs bg-boho-sand-100 hover:bg-boho-sand-200 text-boho-charcoal px-2.5 py-1 rounded-lg border border-boho-sand-300 flex items-center space-x-1.5 transition-colors group cursor-pointer"
                            title="Copiar código"
                          >
                            <span>{c.code}</span>
                            {copiedCode === c.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-boho-charcoal-muted group-hover:text-boho-charcoal" />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-boho-charcoal-muted mt-1 max-w-xs line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-xs text-boho-terracotta bg-boho-sand-100/60 px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
                          {c.discountType === 'PERCENTAGE' ? (
                            <>
                              <Percent className="w-3 h-3" />
                              <span>{c.discountValue}% Dto.</span>
                            </>
                          ) : (
                            <>
                              <span>{formatPrice(c.discountValue)} Dto.</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Minimum Order */}
                      <td className="py-3.5 px-4">
                        {c.minOrderAmount && c.minOrderAmount > 0 ? (
                          <span className="text-boho-charcoal font-medium">
                            Mín. {formatPrice(c.minOrderAmount)}
                          </span>
                        ) : (
                          <span className="text-boho-charcoal-muted">Sin mínimo</span>
                        )}
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        {c.expiresAt ? (
                          <div>
                            <span
                              className={`inline-flex items-center space-x-1 font-medium ${
                                expired ? 'text-red-600' : 'text-boho-charcoal'
                              }`}
                            >
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>
                                {new Date(c.expiresAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </span>
                            {expired && (
                              <span className="block text-[10px] text-red-600 font-bold uppercase tracking-wider">
                                Caducado
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-boho-charcoal-muted text-[11px]">
                            Sin caducidad
                          </span>
                        )}
                      </td>

                      {/* Uses */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-boho-charcoal">
                            {c.usedCount || 0}
                            {c.maxUses ? ` / ${c.maxUses}` : ' usos'}
                          </span>
                          {c.maxUses && (
                            <div className="w-20 bg-boho-sand-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-boho-terracotta h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((c.usedCount || 0) / c.maxUses) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {expired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Caducado
                          </span>
                        ) : c.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.isActive
                              ? 'hover:bg-amber-50 text-amber-700'
                              : 'hover:bg-emerald-50 text-emerald-700'
                          }`}
                          title={c.isActive ? 'Pausar cupón' : 'Activar cupón'}
                        >
                          {c.isActive ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 hover:bg-boho-sand-200 rounded-lg text-boho-charcoal transition-colors"
                          title="Editar cupón"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Eliminar cupón"
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
        )}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-boho-sand-200">
            <div className="flex justify-between items-center pb-4 border-b border-boho-sand-200">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-boho-terracotta" />
                <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal">
                  {editingCoupon ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-boho-charcoal-muted" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {/* Código Promocional */}
              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Código del Cupón *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej. BOHO15 o BIENVENIDA"
                  className="w-full px-3.5 py-2 text-xs uppercase font-mono tracking-wider bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
                <span className="text-[10px] text-boho-charcoal-muted mt-0.5 block">
                  El cliente escribirá este texto exacto en el carrito o en el checkout.
                </span>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                  Descripción / Campaña (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. 10% bienvenida o Promoción Instagram"
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
              </div>

              {/* Tipo de Descuento & Valor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Tipo de Descuento *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta font-medium"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Importe Fijo (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    {discountType === 'PERCENTAGE' ? 'Porcentaje (%) *' : 'Importe (€) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'PERCENTAGE' ? '15' : '5.00'}
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              {/* Pedido Mínimo & Límite de Usos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Pedido Mínimo (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0.00 (sin mínimo)"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Ilimitados"
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>
              </div>

              {/* Fecha de Caducidad */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-boho-charcoal">
                    Fecha de Caducidad (opcional)
                  </label>
                  {expiresAt && (
                    <button
                      type="button"
                      onClick={() => setExpiresAt('')}
                      className="text-[10px] text-boho-terracotta hover:underline"
                    >
                      Quitar fecha (sin caducidad)
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                />
                <span className="text-[10px] text-boho-charcoal-muted mt-0.5 block">
                  El cupón dejará de funcionar automáticamente a las 23:59 del día seleccionado.
                </span>
              </div>

              {/* Activo / Inactivo Switch */}
              <div className="p-3.5 bg-boho-sand-50 rounded-2xl border border-boho-sand-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-boho-charcoal block">
                      Cupón Activo
                    </span>
                    <span className="text-[11px] text-boho-charcoal-muted block mt-0.5">
                      Si está activo, los clientes podrán canjearlo en el carrito y en el proceso de pago.
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

              {/* Actions */}
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
                  className="px-6 py-2.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-bold shadow-soft transition-colors"
                >
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
