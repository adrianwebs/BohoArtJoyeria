import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const TYPES = ['select', 'color', 'radio'] as const;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.name !== undefined && !String(body.name).trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    const group = await storeService.updateAttributeGroup(id, {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(TYPES.includes(body.type) && { type: body.type }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
    });
    if (!group) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    return NextResponse.json(group);
  } catch (error) {
    return apiError(error, 'Error al actualizar el grupo');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const ok = await storeService.deleteAttributeGroup(id);
    if (!ok) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar el grupo');
  }
}
