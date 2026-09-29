import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { getCurrentAdmin, requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import { parseCollectionInput } from '@/lib/collectionInput';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Admins can list everything (drafts, ended, inactive); the public only sees live/upcoming collections.
    const admin = searchParams.get('all') === 'true' && Boolean(await getCurrentAdmin());
    return NextResponse.json(await storeService.getCollections({ admin }));
  } catch (error) {
    return apiError(error, 'Error al cargar las colecciones');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = parseCollectionInput(await req.json());
    if (typeof input === 'string') return NextResponse.json({ error: input }, { status: 400 });
    return NextResponse.json(await storeService.createCollection(input), { status: 201 });
  } catch (error) {
    return apiError(error, 'Error al crear la colección');
  }
}
