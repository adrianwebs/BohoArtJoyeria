import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured') === 'true';
  const categorySlug = searchParams.get('categoria') || undefined;
  const search = searchParams.get('search') || undefined;

  const products = await storeService.getProducts({
    featured,
    categorySlug,
    search,
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const newProduct = await storeService.createProduct({
      name: body.name,
      slug,
      description: body.description || '',
      shortDescription: body.shortDescription || null,
      price: Number(body.price),
      comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
      costPrice: body.costPrice ? Number(body.costPrice) : null,
      stock: Number(body.stock) || 10,
      sku: body.sku || null,
      materials: body.materials || null,
      dimensions: body.dimensions || null,
      weightGrams: body.weightGrams ? Number(body.weightGrams) : 4,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80'],
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      categoryId: body.categoryId,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}
