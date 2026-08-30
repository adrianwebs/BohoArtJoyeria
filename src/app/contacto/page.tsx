'use client';

import React, { useState } from 'react';
import { Mail, Instagram, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-boho-sand-200 text-boho-terracotta text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Atención al Cliente</span>
          </div>
          <h1 className="font-serif-boho text-3xl sm:text-4xl font-bold text-boho-charcoal">
            Contacto & Encargos Especiales
          </h1>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted">
            ¿Quieres un diseño exclusivo o tienes una consulta sobre tu pedido? Estamos a un clic.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Info cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif-boho text-base font-bold text-boho-charcoal">
                Correo Electrónico
              </h3>
              <p className="text-xs text-boho-charcoal-muted">
                Respondemos en menos de 24 horas laborables.
              </p>
              <a
                href="mailto:hola@bohoartjoyeria.com"
                className="text-xs font-bold text-boho-terracotta hover:underline block"
              >
                hola@bohoartjoyeria.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </div>
              <h3 className="font-serif-boho text-base font-bold text-boho-charcoal">
                Instagram Direct
              </h3>
              <p className="text-xs text-boho-charcoal-muted">
                Escríbenos un DM para dudas rápidas o ver vídeos del taller.
              </p>
              <a
                href="https://instagram.com/bohoartjewelry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-boho-terracotta hover:underline block"
              >
                @bohoartjewelry
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-boho-sand-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-boho-sand-100 text-boho-terracotta flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif-boho text-base font-bold text-boho-charcoal">
                Taller & Envíos
              </h3>
              <p className="text-xs text-boho-charcoal-muted">
                Diseñado y confeccionado en España con envíos a toda la Península y Baleares.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-boho-sand-200 shadow-soft">
            {sent ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 bg-boho-sage-light text-boho-sage rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal">
                  ¡Mensaje Enviado con Éxito!
                </h3>
                <p className="text-xs text-boho-charcoal-muted">
                  Te responderemos al correo proporcionado en las próximas horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif-boho text-xl font-bold text-boho-charcoal mb-4">
                  Envíanos un Mensaje
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej. Consulta sobre pedido BH-2026-..."
                    className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe aquí tu consulta con todo detalle..."
                    className="w-full px-3.5 py-2 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Enviar Mensaje</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
