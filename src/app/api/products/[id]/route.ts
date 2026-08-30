import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { slugify } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await storeService.getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { ...body };
    if (body.price) updateData.price = Number(body.price);
    if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice ? Number(body.comparePrice) : null;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.slug) updateData.slug = slugify(body.slug);

    const updated = await storeService.updateProduct(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await storeService.deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
  }
}
