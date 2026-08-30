'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check, Trash2, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'PUT' });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'PENDING') return !r.isApproved;
    if (filter === 'APPROVED') return r.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
            Reputación & Testimonios
          </span>
          <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
            Moderación de Valoraciones ({reviews.length})
          </h1>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          {(['ALL', 'PENDING', 'APPROVED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-boho-terracotta text-white shadow-soft'
                  : 'bg-white text-boho-charcoal hover:bg-boho-sand-100 border border-boho-sand-200'
              }`}
            >
              {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendientes de Aprobar' : 'Aprobadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className={`bg-white p-6 rounded-3xl border shadow-soft flex flex-col justify-between space-y-4 ${
              !rev.isApproved ? 'border-amber-300 ring-2 ring-amber-100' : 'border-boho-sand-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-boho-gold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-boho-gold text-boho-gold" />
                  ))}
                </div>

                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rev.isApproved
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rev.isApproved ? 'Pública en Tienda' : 'Pendiente de Aprobación'}
                </span>
              </div>

              {rev.title && (
                <h4 className="font-serif-boho text-base font-bold text-boho-charcoal mb-1">
                  &ldquo;{rev.title}&rdquo;
                </h4>
              )}

              <p className="text-xs text-boho-charcoal-muted leading-relaxed">
                {rev.comment}
              </p>

              <div className="mt-3 pt-3 border-t border-boho-sand-100 flex items-center justify-between text-[11px] text-boho-charcoal-muted">
                <div>
                  <span className="font-semibold text-boho-charcoal">{rev.authorName}</span>
                  {rev.authorEmail && <span> ({rev.authorEmail})</span>}
                </div>
                <span>{formatDate(rev.createdAt)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-boho-sand-100 flex justify-end space-x-2">
              {!rev.isApproved && (
                <button
                  onClick={() => handleApprove(rev.id)}
                  className="px-4 py-1.5 bg-boho-sage hover:bg-boho-sage-dark text-white rounded-full text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aprobar Reseña</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(rev.id)}
                className="px-3 py-1.5 hover:bg-red-50 text-red-600 rounded-full text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
