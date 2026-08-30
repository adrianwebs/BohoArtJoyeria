'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, Send, Sparkles } from 'lucide-react';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ReviewSectionProps {
  productId?: string;
  productName?: string;
  initialReviews: Review[];
}

export function ReviewSection({
  productId,
  productName,
  initialReviews,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showModal, setShowModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !authorName) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId || 'general',
          productName: productName || 'Bohoart Jewelry',
          authorName,
          authorEmail,
          rating,
          title,
          comment,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setComment('');
          setTitle('');
        }, 2000);
      }
    } catch (e) {
      console.error('Error enviando reseña', e);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-boho-sand-300">
          <div>
            <div className="flex items-center space-x-2 text-boho-gold mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-boho-gold text-boho-gold" />
              ))}
              <span className="text-xs font-bold text-boho-charcoal ml-1">5.0 / 5.0</span>
            </div>
            <h2 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
              Opiniones de Nuestras Clientas
            </h2>
            <p className="text-xs sm:text-sm text-boho-charcoal-muted mt-1">
              Experiencias reales de amantes de la joyería artesanal.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-boho-sand-100 hover:bg-boho-terracotta hover:text-white border border-boho-sand-300 text-boho-charcoal rounded-full text-xs font-semibold active:scale-95 transition-all duration-200 shadow-soft hover:shadow-md group"
            >
              <MessageSquare className="w-3.5 h-3.5 text-boho-terracotta group-hover:text-white transition-colors" />
              <span>Dejar una Valoración</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-boho-sand-50/70 hover:bg-white border border-boho-sand-200 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center space-x-1 text-boho-gold mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-boho-gold text-boho-gold" />
                  ))}
                </div>

                {rev.title && (
                  <h4 className="font-serif-boho text-sm font-bold text-boho-charcoal mb-1">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                )}

                <p className="text-xs text-boho-charcoal-muted leading-relaxed line-clamp-4">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-boho-sand-200 flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-semibold text-boho-charcoal block">
                    {rev.authorName}
                  </span>
                  <span className="text-boho-charcoal-muted text-[10px]">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                {rev.isVerifiedBuyer && (
                  <span className="inline-flex items-center text-boho-sage font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Compradora Verificada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Review Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-boho-sand-200 animate-slide-up">
              <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-2">
                Comparte tu experiencia con Bohoart
              </h3>
              <p className="text-xs text-boho-charcoal-muted mb-6">
                Tu opinión nos ayuda a seguir creando piezas únicas con arcilla polimérica.
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-boho-sage-light text-boho-sage flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-boho-charcoal">¡Muchas gracias por tu reseña!</h4>
                  <p className="text-xs text-boho-charcoal-muted mt-1">
                    Será visible una vez aprobada por nuestro equipo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star picker */}
                  <div>
                    <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                      Puntuación
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-boho-gold hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'fill-boho-gold text-boho-gold'
                                : 'text-boho-sand-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                        Tu Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ej. María Gómez"
                        className="w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                        Tu Email
                      </label>
                      <input
                        type="email"
                        required
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="maria@ejemplo.com"
                        className="w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. ¡Me encantan, son súper ligeros!"
                      className="w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                      Tu Opinión
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Cuéntanos qué te pareció el acabado, los colores, el peso..."
                      className="w-full px-3 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-medium text-boho-charcoal-muted hover:text-boho-charcoal"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Publicar Reseña</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
