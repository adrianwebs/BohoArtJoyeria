'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Sparkles, CreditCard, AlertTriangle, Globe, Lock } from 'lucide-react';
import { StoreSetting } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('40.00');
  const [standardShippingCost, setStandardShippingCost] = useState('3.95');
  const [paypalClientId, setPaypalClientId] = useState('sb');
  const [bizumPhone, setBizumPhone] = useState('');
  const [paypalMeUrl, setPaypalMeUrl] = useState('');
  const [saveError, setSaveError] = useState('');
  const [contactEmail, setContactEmail] = useState('hola@bohoartjoyeria.com');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/bohoart.jewelry');
  
  // Maintenance states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceAllowedIps, setMaintenanceAllowedIps] = useState('127.0.0.1, ::1');
  const [maintenanceTitle, setMaintenanceTitle] = useState('✨ Estamos horneando novedades en el taller ✨');
  const [maintenanceMessage, setMaintenanceMessage] = useState('Nuestra tienda online se encuentra en mantenimiento durante unas horas para añadir nuevas colecciones artesanales en arcilla polimérica. ¡Volvemos muy pronto!');

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIp, setCurrentIp] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setAnnouncementText(data.announcementText || '');
        setFreeShippingThreshold(String(data.freeShippingThreshold || '40.00'));
        setStandardShippingCost(String(data.standardShippingCost || '3.95'));
        setPaypalClientId(data.paypalClientId || 'sb');
        setBizumPhone(data.bizumPhone || '');
        setPaypalMeUrl(data.paypalMeUrl || '');
        setContactEmail(data.contactEmail || 'hola@bohoartjoyeria.com');
        setInstagramUrl(data.instagramUrl || 'https://instagram.com/bohoart.jewelry');
        setMaintenanceMode(Boolean(data.maintenanceMode));
        setMaintenanceAllowedIps(data.maintenanceAllowedIps || '127.0.0.1, ::1');
        if (data.maintenanceTitle) setMaintenanceTitle(data.maintenanceTitle);
        if (data.maintenanceMessage) setMaintenanceMessage(data.maintenanceMessage);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    fetch('/api/my-ip')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) setCurrentIp(data.ip);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementText,
          freeShippingThreshold: parseFloat(freeShippingThreshold),
          standardShippingCost: parseFloat(standardShippingCost),
          bizumPhone: bizumPhone.trim() || null,
          paypalMeUrl: paypalMeUrl.trim() || null,
          contactEmail,
          instagramUrl,
          maintenanceMode,
          maintenanceAllowedIps,
          maintenanceTitle,
          maintenanceMessage,
        }),
      });

      if (res.ok) {
        setSaveError('');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'No se pudo guardar la configuración.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-boho-charcoal-muted">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-boho-terracotta block">
          Ajustes Generales
        </span>
        <h1 className="font-serif-boho text-2xl sm:text-3xl font-bold text-boho-charcoal">
          Configuración de la Tienda Online
        </h1>
      </div>

      {saveError && (
        <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-medium">
          {saveError}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center space-x-2 text-xs font-medium animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Ajustes actualizados correctamente en tiempo real!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 0: Modo Mantenimiento & Control de IPs */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-soft space-y-4 transition-all ${
          maintenanceMode ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-boho-sand-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal flex items-center space-x-2">
              <AlertTriangle className={`w-5 h-5 ${maintenanceMode ? 'text-amber-600 animate-pulse' : 'text-boho-charcoal-muted'}`} />
              <span>Modo Mantenimiento & Acceso por IPs</span>
            </h3>

            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
              maintenanceMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-boho-sand-100 text-boho-charcoal-muted'
            }`}>
              {maintenanceMode ? '⚠️ MANTENIMIENTO ACTIVO' : '✅ TIENDA PÚBLICA ACTIVA'}
            </span>
          </div>

          <p className="text-xs text-boho-charcoal-muted leading-relaxed">
            Cuando el modo mantenimiento está activado, todos los visitantes no autorizados verán una página estética de mantenimiento. Solo las direcciones IP añadidas abajo y las rutas de administración tendrán acceso a la tienda.
          </p>

          {/* Maintenance Toggle */}
          <div className="p-4 rounded-2xl bg-white border border-boho-sand-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-boho-charcoal block cursor-pointer" htmlFor="toggleMaintenance">
                Activar Modo Mantenimiento
              </label>
              <span className="text-[11px] text-boho-charcoal-muted block">
                Pone la tienda en modo privado temporalmente.
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggleMaintenance"
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-boho-terracotta"></div>
            </label>
          </div>

          {/* Current IP Detector Widget */}
          <div className="p-3 bg-boho-sand-100 rounded-xl border border-boho-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-boho-charcoal-muted font-medium">🌐 Tu IP actual detectada por el servidor:</span>{' '}
              <strong className="font-mono text-boho-charcoal font-bold">{currentIp || 'Detectando...'}</strong>
            </div>
            {currentIp && (
              <button
                type="button"
                onClick={() => {
                  const ips = maintenanceAllowedIps.split(',').map((s) => s.trim()).filter(Boolean);
                  if (!ips.includes(currentIp)) {
                    setMaintenanceAllowedIps(ips.concat(currentIp).join(', '));
                  }
                }}
                className="px-3 py-1 bg-white hover:bg-boho-sand-50 border border-boho-sand-300 rounded-lg text-[11px] font-semibold text-boho-terracotta transition-colors shadow-2xs self-start sm:self-auto"
              >
                + Añadir mi IP a la lista
              </button>
            )}
          </div>

          {/* Allowed IPs input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-boho-charcoal">
              Direcciones IP Autorizadas (separadas por comas)
            </label>
            <input
              type="text"
              value={maintenanceAllowedIps}
              onChange={(e) => setMaintenanceAllowedIps(e.target.value)}
              placeholder="Ej: 127.0.0.1, 88.12.34.56"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta font-mono"
            />
            <span className="text-[11px] text-boho-charcoal-muted block">
              💡 <strong>Cómo probar que funciona:</strong> Si dejas este campo vacío o pones una IP inventada como <code>1.2.3.4</code> y guardas, al recargar la tienda verás la pantalla de mantenimiento. Para seguir navegando tú, añade tu IP actual mostrada arriba.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                Título del Mantenimiento
              </label>
              <input
                type="text"
                value={maintenanceTitle}
                onChange={(e) => setMaintenanceTitle(e.target.value)}
                placeholder="Ej. ✨ Estamos preparando nuevas joyas en el taller ✨"
                className="w-full px-3.5 py-2 text-xs bg-white border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                Mensaje para los Visitantes
              </label>
              <input
                type="text"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Mensaje descriptivo..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Section 1: Promociones y Banner Superior */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4">
          <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-boho-gold" />
            <span>Barra de Avisos & Promoción Superior</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-boho-charcoal mb-1">
              Texto del Banner de Cabecera
            </label>
            <input
              type="text"
              required
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="✨ Envíos gratis a toda España en pedidos a partir de 40€..."
              className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
            />
          </div>
        </div>

        {/* Section 2: Logística y Tarifas de Envío */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4">
          <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-boho-terracotta" />
            <span>Tarifas de Envío & Umbral Gratuito</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                Gasto Mínimo para Envío Gratis (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="40.00"
                className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
              <span className="text-[11px] text-boho-charcoal-muted mt-1 block">
                Por encima de este importe en el carrito, el envío se marca gratis automáticamente.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                Coste de Envío Estándar (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={standardShippingCost}
                onChange={(e) => setStandardShippingCost(e.target.value)}
                placeholder="3.95"
                className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Métodos de pago */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-5">
          <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#003087]" />
            <span>Métodos de Pago</span>
          </h3>

          <p className="text-xs text-boho-charcoal-muted">
            Los pagos se comprueban a mano: el cliente hace el pedido (queda como <b>PENDING</b>), paga por el método elegido y,
            cuando veas el dinero, lo marcas como <b>PAID</b> en Pedidos (se avisa al cliente por email). Deja un campo vacío para
            desactivar ese método.
          </p>

          <div>
            <label className="block text-xs font-semibold text-boho-charcoal mb-1">Enlace PayPal.Me</label>
            <input
              type="url"
              value={paypalMeUrl}
              onChange={(e) => setPaypalMeUrl(e.target.value)}
              placeholder="https://www.paypal.me/tu-usuario"
              className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
            />
            <span className="text-[11px] text-boho-charcoal-muted mt-1 block">
              Al cliente se le muestra este enlace con el importe del pedido ya rellenado.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-boho-charcoal mb-1">
              Teléfono para recibir Bizum
            </label>
            <input
              type="tel"
              value={bizumPhone}
              onChange={(e) => setBizumPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
            />
            <span className="text-[11px] text-boho-charcoal-muted mt-1 block">
              Se muestra al cliente para que envíe el Bizum con el nº de pedido como concepto.
            </span>
          </div>
        </div>

        {/* Section 4: Contacto & Redes */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-boho-sand-200 shadow-soft space-y-4">
          <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">
            Contacto & Instagram
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                Email de Atención al Cliente
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hola@bohoartjoyeria.com"
                className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-boho-charcoal mb-1">
                URL del Perfil de Instagram
              </label>
              <input
                type="text"
                required
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/bohoart.jewelry"
                className="w-full px-3.5 py-2.5 text-xs bg-boho-sand-50 border border-boho-sand-300 rounded-xl focus:outline-none focus:border-boho-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-boho-terracotta hover:bg-boho-terracotta-600 text-white rounded-full font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Ajustes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
