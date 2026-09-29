import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await storeService.getCategories());
  } catch (error) {
    return apiError(error, 'Error al cargar las categorías');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    const slug = slugify(body.slug || body.name);
    if (!slug) return NextResponse.json({ error: 'Slug no válido' }, { status: 400 });

    const category = await storeService.createCategory({
      name: body.name.trim(),
      slug,
      description: body.description || null,
      image: body.image || null,
      sortOrder: Number(body.sortOrder) || 0,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al crear la categoría');
  }
}
