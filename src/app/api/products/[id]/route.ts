import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await storeService.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return apiError(error, 'Error al cargar el producto');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: Partial<Product> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.slug) data.slug = slugify(body.slug);
    if (body.description !== undefined) data.description = body.description;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Precio no válido' }, { status: 400 });
      }
      data.price = price;
    }
    if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice ? Number(body.comparePrice) : null;
    if (body.costPrice !== undefined) data.costPrice = body.costPrice ? Number(body.costPrice) : null;
    if (body.stock !== undefined) data.stock = Math.max(0, Number(body.stock) || 0);
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.materials !== undefined) data.materials = body.materials;
    if (body.dimensions !== undefined) data.dimensions = body.dimensions;
    if (body.weightGrams !== undefined) data.weightGrams = body.weightGrams ? Number(body.weightGrams) : null;
    if (Array.isArray(body.images)) data.images = body.images.filter((i: unknown) => typeof i === 'string' && i);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.categoryId) data.categoryId = body.categoryId;

    const updated = await storeService.updateProduct(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Error al actualizar el producto');
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const deleted = await storeService.deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar el producto');
  }
}
