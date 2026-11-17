'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

interface PopupConfig {
  isEnabled: boolean;
  title: string;
  message: string;
  discountPercent: number;
  delaySeconds: number;
  exitIntent: boolean;
}

const SEEN_KEY = 'bohoart_popup_seen';
const EXCLUDED = ['/admin', '/checkout', '/mantenimiento', '/login', '/newsletter'];

const safeGet = () => {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};
const safeSet = () => {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* storage unavailable: popup may show again next visit */
  }
};

/** Modal de descuento: una vez por visitante, por tiempo o intención de salida. Esc cierra y el foco queda atrapado. */
export function DiscountPopup() {
  const pathname = usePathname();
  const [cfg, setCfg] = useState<PopupConfig | null>(null);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const excluded = EXCLUDED.some((p) => pathname.startsWith(p));

  const close = useCallback(() => {
    setOpen(false);
    safeSet();
    previouslyFocused.current?.focus?.();
  }, []);

  // Load config once (skipped when the visitor already saw it, or on excluded routes).
  useEffect(() => {
    if (excluded || safeGet()) return;
    let cancelled = false;
    fetch('/api/popup')
      .then((r) => r.json())
      .then((c: PopupConfig) => !cancelled && c.isEnabled && setCfg(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excluded]);

  // Triggers: timer and exit intent (mouse leaving through the top of the viewport).
  useEffect(() => {
    if (!cfg || excluded || open || safeGet()) return;
    const show = () => {
      if (safeGet()) return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const timer = window.setTimeout(show, Math.max(0, cfg.delaySeconds) * 1000);
    const onLeave = (e: MouseEvent) => {
      if (cfg.exitIntent && e.clientY <= 0) show();
    };
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [cfg, excluded, open]);

  // Esc to close + focus trap.
  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    const focusables = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []
      ).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!open || !cfg || excluded) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        aria-describedby="popup-desc"
        className="relative w-full max-w-md rounded-2xl bg-boho-linen border border-boho-sand-300 shadow-xl p-7 text-center"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1.5 rounded-full text-boho-charcoal-muted hover:bg-boho-sand-200"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="font-serif-boho text-5xl font-bold text-boho-terracotta mb-2" aria-hidden="true">
          {cfg.discountPercent}%
        </p>
        <h2 id="popup-title" className="font-serif-boho text-xl font-bold text-boho-charcoal mb-2">
          {cfg.title}
        </h2>
        <p id="popup-desc" className="text-sm text-boho-charcoal-muted mb-5">
          {cfg.message}
        </p>
        <div className="flex justify-center text-left">
          <NewsletterForm source="popup" emailId="popup-email" onDone={safeSet} />
        </div>
        <button type="button" onClick={close} className="mt-4 text-xs text-boho-charcoal-muted underline">
          No, gracias
        </button>
      </div>
    </div>
  );
}
