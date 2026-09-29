import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import { parseCollectionInput } from '@/lib/collectionInput';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const collection = await storeService.getCollectionById(id);
    if (!collection) return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
    return NextResponse.json(collection);
  } catch (error) {
    return apiError(error, 'Error al cargar la colección');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const input = parseCollectionInput(await req.json());
    if (typeof input === 'string') return NextResponse.json({ error: input }, { status: 400 });
    const updated = await storeService.updateCollection(id, input);
    if (!updated) return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Error al actualizar la colección');
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const deleted = await storeService.deleteCollection(id);
    if (!deleted) return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar la colección');
  }
}
