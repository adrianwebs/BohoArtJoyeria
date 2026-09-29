import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await storeService.updateCategory(id, {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.slug ? { slug: slugify(body.slug) } : {}),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
    });
    if (!updated) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Error al actualizar la categoría');
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
    const deleted = await storeService.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar la categoría');
  }
}
