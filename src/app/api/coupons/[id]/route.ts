import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { ...body };
    if (body.code) updateData.code = body.code.trim().toUpperCase();
    if (body.discountValue !== undefined) updateData.discountValue = Math.max(0, Number(body.discountValue));
    if (body.minOrderAmount !== undefined) {
      updateData.minOrderAmount = body.minOrderAmount ? Math.max(0, Number(body.minOrderAmount)) : null;
    }
    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses ? Math.max(1, parseInt(body.maxUses, 10)) : null;
    }
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await storeService.updateCoupon(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Error al actualizar el cupón' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await storeService.deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Error al eliminar el cupón' }, { status: 500 });
  }
}
