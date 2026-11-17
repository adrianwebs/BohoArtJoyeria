import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.name !== undefined && !String(body.name).trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    if (body.hex && !HEX_RE.test(body.hex)) {
      return NextResponse.json({ error: 'Color no válido (usa #RRGGBB)' }, { status: 400 });
    }
    const value = await storeService.updateAttributeValue(id, {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.hex !== undefined && { hex: body.hex || null }),
      ...(body.isMulticolor !== undefined && { isMulticolor: Boolean(body.isMulticolor) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
    });
    if (!value) return NextResponse.json({ error: 'Valor no encontrado' }, { status: 404 });
    return NextResponse.json(value);
  } catch (error) {
    return apiError(error, 'Error al actualizar el valor');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const ok = await storeService.deleteAttributeValue(id);
    if (!ok) return NextResponse.json({ error: 'Valor no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Error al eliminar el valor');
  }
}
