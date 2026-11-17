import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const TYPES = ['select', 'color', 'radio'] as const;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await storeService.getAttributeGroups());
  } catch (error) {
    return apiError(error, 'Error al cargar los atributos');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    const type = TYPES.includes(body.type) ? body.type : 'select';
    const group = await storeService.createAttributeGroup({
      name: body.name.trim(),
      type,
      sortOrder: Number(body.sortOrder) || 0,
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al crear el grupo de atributos');
  }
}
