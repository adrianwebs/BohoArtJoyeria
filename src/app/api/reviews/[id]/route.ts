import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
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
    const approved = await storeService.approveReview(id);
    if (!approved) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }
    return NextResponse.json(approved);
  } catch (error) {
    return apiError(error, 'Error al aprobar la reseña');
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
    const deleted = await storeService.deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar la reseña');
  }
}
