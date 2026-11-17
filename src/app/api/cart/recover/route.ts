import { NextResponse } from 'next/server';
import { getCartByToken } from '@/lib/marketing';
import { storeService } from '@/lib/storeService';
import { rateLimited } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/** Returns the cart as [{product, quantity}] (same shape the browser cart uses) for a recovery token. */
export async function GET(req: Request) {
  if (rateLimited(req, 'cart-recover', 20)) return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 });
  const token = new URL(req.url).searchParams.get('token') || '';
  const data = await getCartByToken(token);
  if (!data) return NextResponse.json({ error: 'Enlace no válido o caducado' }, { status: 404 });

  const items: { product: unknown; quantity: number }[] = [];
  for (const l of data.lines) {
    const product = await storeService.getProductById(l.productId);
    if (product && product.isActive !== false && product.stock > 0) {
      items.push({ product, quantity: Math.min(l.quantity, product.stock) });
    }
  }
  return NextResponse.json({ items });
}
