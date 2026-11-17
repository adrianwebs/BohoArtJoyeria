'use client';

import { useEffect } from 'react';
import type { CartItem } from './types';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

/** Saves the cart on the server (debounced) once the checkout email looks valid, for abandoned-cart reminders. */
export function useCartTracking(email: string, cart: CartItem[]) {
  useEffect(() => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean) || cart.length === 0) return;
    const t = window.setTimeout(() => {
      fetch('/api/cart/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clean,
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      }).catch(() => {});
    }, 1500);
    return () => window.clearTimeout(t);
  }, [email, cart]);
}
