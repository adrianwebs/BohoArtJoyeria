'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bohoartjoyeria.com');
  const [password, setPassword] = useState('adminpassword123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.message || 'Credenciales incorrectas');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-boho-linen min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-boho-sand-200 shadow-card space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
            <Image
              src="/logo.png"
              alt="Bohoart Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <h1 className="font-serif-boho text-2xl font-bold text-boho-charcoal">
            Panel de Administración
          </h1>
          <p className="text-xs text-boho-charcoal-muted">
            Acceso seguro para gestión de catálogo, pedidos y reseñas de Bohoart Jewelry.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-boho-charcoal mb-1">
              Email Administrador
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bohoartjoyeria.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
              <Mail className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-boho-charcoal mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
              <Lock className="w-4 h-4 text-boho-charcoal-muted absolute left-3 top-3" />
            </div>
          </div>

          {/* Preset hint box */}
          <div className="p-3 bg-boho-sand-100 rounded-xl border border-boho-sand-200 text-[11px] text-boho-charcoal-muted space-y-1">
            <span className="font-semibold text-boho-charcoal block">🔑 Credenciales de prueba:</span>
            <p><strong>Email:</strong> admin@bohoartjoyeria.com</p>
            <p><strong>Clave:</strong> adminpassword123</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <span>Entrar al Panel de Control</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-boho-sand-200 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-boho-terracotta hover:underline"
          >
            ← Volver a la Tienda Pública
          </Link>
        </div>

      </div>
    </div>
  );
}
