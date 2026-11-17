import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (body.hex && !HEX_RE.test(body.hex)) {
      return NextResponse.json({ error: 'Color no válido (usa #RRGGBB)' }, { status: 400 });
    }
    const value = await storeService.createAttributeValue(id, {
      name: body.name.trim(),
      hex: body.hex || null,
      isMulticolor: Boolean(body.isMulticolor),
      sortOrder: Number(body.sortOrder) || 0,
    });
    return NextResponse.json(value, { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al crear el valor');
  }
}
