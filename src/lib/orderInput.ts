import type { Order } from './types';

export interface ParsedOrderInput {
  data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'paymentMethod' | 'paypalOrderId' | 'items' | 'subtotal' | 'shippingCost' | 'totalAmount' | 'trackingNumber'>;
  items: { productId: string; quantity: number }[];
}

const clean = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Validates customer/shipping data and cart lines from a request body. Returns an error string when invalid. */
export function parseOrderInput(body: any): ParsedOrderInput | string {
  const customerName = clean(body?.customerName, 120);
  const customerEmail = clean(body?.customerEmail, 200);
  const shippingAddress = clean(body?.shippingAddress, 300);
  const city = clean(body?.city, 120);
  const postalCode = clean(body?.postalCode, 20);

  if (!customerName || !shippingAddress || !city || !postalCode) return 'Faltan datos de envío obligatorios';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return 'Email no válido';
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 50) return 'La cesta está vacía';

  const merged = new Map<string, number>();
  for (const i of body.items) {
    const productId = clean(i?.productId, 64);
    const quantity = Math.floor(Number(i?.quantity));
    if (!productId || !Number.isFinite(quantity) || quantity < 1 || quantity > 99) return 'Línea de pedido no válida';
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  return {
    data: {
      customerName,
      customerEmail,
      customerPhone: clean(body.customerPhone, 40) || null,
      shippingAddress,
      city,
      postalCode,
      province: clean(body.province, 120) || city,
      country: clean(body.country, 60) || 'España',
      notes: clean(body.notes, 1000) || null,
    },
    items: [...merged].map(([productId, quantity]) => ({ productId, quantity })),
  };
}

/** Adapts parsed input to the storeService.createOrder signature (prices are recomputed server-side). */
export function toCreateOrder(
  parsed: ParsedOrderInput,
  extra: Pick<Order, 'status' | 'paymentMethod'> & { paypalOrderId?: string | null; notes?: string | null }
): Omit<Order, 'id' | 'orderNumber' | 'createdAt'> {
  return {
    ...parsed.data,
    subtotal: 0,
    shippingCost: 0,
    totalAmount: 0,
    trackingNumber: null,
    status: extra.status,
    paymentMethod: extra.paymentMethod,
    paypalOrderId: extra.paypalOrderId ?? null,
    notes: extra.notes ?? parsed.data.notes,
    items: parsed.items.map((i) => ({
      id: '',
      orderId: '',
      productId: i.productId,
      productName: '',
      unitPrice: 0,
      quantity: i.quantity,
    })),
  };
}
