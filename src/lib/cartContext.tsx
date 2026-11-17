'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CartVariant, Product, DiscountType } from './types';

/** Unique key of a cart line: the same product with different variants are separate lines. */
export const cartLineKey = (item: Pick<CartItem, 'product' | 'variant'>) =>
  `${item.product.id}:${item.variant?.id ?? ''}`;

/** Unit price of a cart line (the chosen variant's price, or the product price). */
export const cartUnitPrice = (item: Pick<CartItem, 'product' | 'variant'>) =>
  item.variant ? item.variant.price : item.product.price;

export interface AppliedCouponState {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, variant?: CartVariant | null) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: AppliedCouponState | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('bohoart_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Error reading cart from localStorage', e);
      }
    }
    const savedCoupon = localStorage.getItem('bohoart_coupon');
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Error reading coupon from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bohoart_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (appliedCoupon) {
        localStorage.setItem('bohoart_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('bohoart_coupon');
      }
    }
  }, [appliedCoupon, isMounted]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, quantity: number = 1, variant: CartVariant | null = null) => {
    const key = cartLineKey({ product, variant });
    setCart((prev) => {
      const existing = prev.find((item) => cartLineKey(item) === key);
      if (existing) {
        return prev.map((item) =>
          cartLineKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, variant, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (lineKey: string) => {
    setCart((prev) => prev.filter((item) => cartLineKey(item) !== lineKey));
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (cartLineKey(item) === lineKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + cartUnitPrice(item) * item.quantity, 0);

  // Recalculate discount based on current subtotal
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, message: data.message || 'Código no válido' };
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        discountAmount: data.discountAmount || 0,
      });

      return { success: true, message: data.message };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: 'Error de conexión al validar el código' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
