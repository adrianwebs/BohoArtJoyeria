import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { ...body };
    if (body.slug) updateData.slug = slugify(body.slug);
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);

    const updated = await storeService.updateCategory(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await storeService.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error al eliminar la categoría' }, { status: 500 });
  }
}
