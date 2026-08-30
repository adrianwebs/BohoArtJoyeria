import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';

export async function GET() {
  const categories = await storeService.getCategories();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const category = await storeService.createCategory({
      name: body.name,
      slug,
      description: body.description || null,
      image: body.image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
      sortOrder: Number(body.sortOrder) || 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}
