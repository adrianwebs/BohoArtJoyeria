'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Mail, Send, Trash2, Save } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  status: 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED';
  source: string;
  createdAt: string;
  confirmedAt: string | null;
}

interface PopupCfg {
  isEnabled: boolean;
  title: string;
  message: string;
  discountPercent: number;
  delaySeconds: number;
  exitIntent: boolean;
  couponValidDays: number;
}

const STATUS_LABEL = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', UNSUBSCRIBED: 'Baja' } as const;
const inputCls = 'w-full px-3 py-2 text-sm bg-white border border-boho-sand-300 rounded-lg focus:outline-none focus:border-boho-terracotta';
const cardCls = 'bg-white border border-boho-sand-200 rounded-2xl p-5 shadow-soft space-y-4';

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [filter, setFilter] = useState<'ALL' | Subscriber['status']>('ALL');
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupCfg | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<h2>Novedades Bohoart</h2>\n<p>Escribe aquí tu mensaje…</p>');
  const [testTo, setTestTo] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([fetch('/api/admin/newsletter'), fetch('/api/admin/popup')]);
    if (s.ok) setSubs(await s.json());
    if (p.ok) setPopup(await p.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      CONFIRMED: subs.filter((s) => s.status === 'CONFIRMED').length,
      PENDING: subs.filter((s) => s.status === 'PENDING').length,
      UNSUBSCRIBED: subs.filter((s) => s.status === 'UNSUBSCRIBED').length,
    }),
    [subs]
  );
  const visible = filter === 'ALL' ? subs : subs.filter((s) => s.status === filter);

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este suscriptor definitivamente?')) return;
    await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
    load();
  };

  const savePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popup) return;
    const res = await fetch('/api/admin/popup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(popup),
    });
    setStatus(res.ok ? 'Pop-up guardado.' : 'Error al guardar el pop-up.');
    if (res.ok) setPopup(await res.json());
  };

  const post = (body: object) =>
    fetch('/api/admin/newsletter/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const sendTest = async () => {
    setStatus('Enviando prueba…');
    const res = await post({ subject, html, testTo });
    const d = await res.json();
    setStatus(res.ok ? (d.sent ? 'Prueba enviada.' : 'No se pudo enviar (¿SMTP configurado?).') : d.error);
  };

  const sendCampaign = async () => {
    if (!subject.trim() || !html.trim()) return setStatus('Asunto y contenido son obligatorios.');
    if (!confirm(`Se enviará a ${counts.CONFIRMED} suscriptores confirmados. ¿Continuar?`)) return;
    setSending(true);
    let offset = 0;
    let sent = 0;
    let failed = 0;
    try {
      for (;;) {
        const res = await post({ subject, html, offset });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Error de envío');
        sent += d.sent;
        failed += d.failed;
        setStatus(`Enviando… ${Math.min(d.next, d.total)}/${d.total}`);
        if (d.done) break;
        offset = d.next;
      }
      setStatus(`Campaña terminada: ${sent} enviados, ${failed} fallidos.`);
    } catch (e) {
      setStatus(`Interrumpido tras ${sent} envíos: ${e instanceof Error ? e.message : 'error'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-boho text-2xl font-bold text-boho-charcoal flex items-center gap-2">
            <Mail className="w-6 h-6 text-boho-terracotta" /> Newsletter
          </h1>
          <p className="text-sm text-boho-charcoal-muted">
            {counts.CONFIRMED} confirmados · {counts.PENDING} pendientes · {counts.UNSUBSCRIBED} bajas
          </p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-boho-sand-300 bg-white text-sm font-semibold hover:bg-boho-sand-100"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </a>
      </header>

      {status && (
        <p role="status" className="text-sm bg-boho-sand-100 rounded-lg px-4 py-2">
          {status}
        </p>
      )}

      {/* Pop-up */}
      <section className={cardCls}>
        <h2 className="font-bold text-boho-charcoal">Pop-up de descuento</h2>
        {popup && (
          <form onSubmit={savePopup} className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={popup.isEnabled} onChange={(e) => setPopup({ ...popup, isEnabled: e.target.checked })} />
              Activado
            </label>
            <div>
              <label className="text-xs font-semibold" htmlFor="pp-title">Título</label>
              <input id="pp-title" className={inputCls} value={popup.title} onChange={(e) => setPopup({ ...popup, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold" htmlFor="pp-msg">Texto</label>
              <textarea id="pp-msg" rows={2} className={inputCls} value={popup.message} onChange={(e) => setPopup({ ...popup, message: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold" htmlFor="pp-pct">Descuento (%)</label>
                <input id="pp-pct" type="number" min={1} max={90} className={inputCls} value={popup.discountPercent} onChange={(e) => setPopup({ ...popup, discountPercent: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold" htmlFor="pp-delay">Mostrar tras (seg.)</label>
                <input id="pp-delay" type="number" min={0} max={600} className={inputCls} value={popup.delaySeconds} onChange={(e) => setPopup({ ...popup, delaySeconds: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold" htmlFor="pp-days">Validez cupón (días)</label>
                <input id="pp-days" type="number" min={1} max={365} className={inputCls} value={popup.couponValidDays} onChange={(e) => setPopup({ ...popup, couponValidDays: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={popup.exitIntent} onChange={(e) => setPopup({ ...popup, exitIntent: e.target.checked })} />
              Mostrar también con intención de salida (ratón sale por arriba)
            </label>
            <p className="text-xs text-boho-charcoal-muted">
              El cupón (un solo uso) se genera y se envía por correo cuando el suscriptor confirma su email. Mismo descuento para el formulario del pie de página.
            </p>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-boho-terracotta text-white text-sm font-semibold">
              <Save className="w-4 h-4" /> Guardar pop-up
            </button>
          </form>
        )}
      </section>

      {/* Campaign */}
      <section className={cardCls}>
        <h2 className="font-bold text-boho-charcoal">Enviar campaña</h2>
        <div>
          <label className="text-xs font-semibold" htmlFor="c-subject">Asunto</label>
          <input id="c-subject" className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold" htmlFor="c-html">Contenido (HTML)</label>
          <textarea id="c-html" rows={8} className={`${inputCls} font-mono`} value={html} onChange={(e) => setHtml(e.target.value)} />
          <p className="text-xs text-boho-charcoal-muted mt-1">Se añade automáticamente el enlace de baja al pie. Se envía en lotes de 20.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="email" placeholder="Correo de prueba" aria-label="Correo de prueba" className={`${inputCls} !w-64`} value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          <button type="button" onClick={sendTest} disabled={!testTo || sending} className="px-4 py-2 rounded-full border border-boho-sand-300 text-sm font-semibold disabled:opacity-50">
            Enviar prueba
          </button>
          <button type="button" onClick={sendCampaign} disabled={sending || counts.CONFIRMED === 0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-boho-terracotta text-white text-sm font-semibold disabled:opacity-50">
            <Send className="w-4 h-4" /> {sending ? 'Enviando…' : `Enviar a ${counts.CONFIRMED} suscriptores`}
          </button>
        </div>
      </section>

      {/* List */}
      <section className={cardCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-boho-charcoal">Suscriptores</h2>
          <select aria-label="Filtrar por estado" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="text-sm border border-boho-sand-300 rounded-lg px-2 py-1">
            <option value="ALL">Todos</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="PENDING">Pendientes</option>
            <option value="UNSUBSCRIBED">Bajas</option>
          </select>
        </div>
        {loading ? (
          <p className="text-sm text-boho-charcoal-muted">Cargando…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-boho-charcoal-muted">No hay suscriptores.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-boho-charcoal-muted border-b border-boho-sand-200">
                  <th className="py-2">Email</th>
                  <th>Estado</th>
                  <th>Origen</th>
                  <th>Alta</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-b border-boho-sand-100">
                    <td className="py-2">{s.email}</td>
                    <td>{STATUS_LABEL[s.status]}</td>
                    <td>{s.source}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString('es-ES')}</td>
                    <td className="text-right">
                      <button onClick={() => remove(s.id)} aria-label={`Eliminar ${s.email}`} className="p-1.5 text-boho-charcoal-muted hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
