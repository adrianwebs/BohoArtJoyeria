import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const products = await storeService.getProducts({
      featured: searchParams.get('featured') === 'true',
      categorySlug: searchParams.get('categoria') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return NextResponse.json(products);
  } catch (error) {
    return apiError(error, 'Error al cargar los productos');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const price = Number(body.price);
    if (!body.name?.trim() || !body.categoryId || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Nombre, categoría y precio válidos son obligatorios' }, { status: 400 });
    }
    const slug = slugify(body.slug || body.name);
    if (!slug) return NextResponse.json({ error: 'Slug no válido' }, { status: 400 });

    const images: string[] = Array.isArray(body.images)
      ? body.images.filter((i: unknown) => typeof i === 'string' && i)
      : [];

    const newProduct = await storeService.createProduct({
      name: body.name.trim(),
      slug,
      description: body.description || '',
      shortDescription: body.shortDescription || null,
      price,
      comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
      costPrice: body.costPrice ? Number(body.costPrice) : null,
      stock: body.stock !== undefined && body.stock !== '' ? Math.max(0, Number(body.stock) || 0) : 10,
      sku: body.sku || null,
      materials: body.materials || null,
      dimensions: body.dimensions || null,
      weightGrams: body.weightGrams ? Number(body.weightGrams) : 4,
      images:
        images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'],
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      categoryId: body.categoryId,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al crear el producto');
  }
}
