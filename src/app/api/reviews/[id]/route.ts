import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const approved = await storeService.approveReview(id);
    if (!approved) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }
    return NextResponse.json(approved);
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json({ error: 'Error al aprobar la reseña' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await storeService.deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Error al eliminar la reseña' }, { status: 500 });
  }
}
