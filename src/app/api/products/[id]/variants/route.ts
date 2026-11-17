import { NextResponse } from 'next/server';
import { storeService, StoreError } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** undefined = leave as is, null = clear, number = set. */
const optNum = (v: unknown): number | null | undefined => {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new StoreError('Precio no válido', 400);
  return n;
};

/** All combinations of the product (admin). */
export async function GET(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    return NextResponse.json(await storeService.getVariants(id));
  } catch (error) {
    return apiError(error, 'Error al cargar las combinaciones');
  }
}

/** Generator: body { valueIds: string[][] } (one list of value ids per attribute group). */
export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    const valueIds: string[][] = Array.isArray(body.valueIds)
      ? body.valueIds.map((g: unknown) => (Array.isArray(g) ? g.filter((x) => typeof x === 'string') : []))
      : [];
    return NextResponse.json(await storeService.generateVariants(id, valueIds), { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al generar las combinaciones');
  }
}

/** Bulk edit: body { variants: [{ id, price, priceAdjustment, stock, sku, image, isActive }] }. */
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    if (!Array.isArray(body.variants)) return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
    const updates = body.variants.map((v: Record<string, unknown>) => ({
      id: String(v.id),
      price: optNum(v.price),
      priceAdjustment: v.priceAdjustment === undefined ? undefined : Number(v.priceAdjustment) || 0,
      stock: v.stock === undefined ? undefined : Math.max(0, Math.floor(Number(v.stock) || 0)),
      sku: v.sku === undefined ? undefined : (v.sku as string | null),
      image: v.image === undefined ? undefined : (v.image as string | null),
      isActive: v.isActive === undefined ? undefined : Boolean(v.isActive),
    }));
    return NextResponse.json(await storeService.updateVariants(id, updates));
  } catch (error) {
    return apiError(error, 'Error al guardar las combinaciones');
  }
}

/** DELETE ?variantId=... */
export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const variantId = new URL(req.url).searchParams.get('variantId');
    if (!variantId) return NextResponse.json({ error: 'Falta variantId' }, { status: 400 });
    const ok = await storeService.deleteVariant(id, variantId);
    if (!ok) return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar la combinación');
  }
}
