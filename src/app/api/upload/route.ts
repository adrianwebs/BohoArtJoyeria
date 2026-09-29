import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import {
  detectImageExt,
  getUploadDir,
  MAX_FILES_PER_REQUEST,
  MAX_UPLOAD_BYTES,
} from '@/lib/uploads';

export const dynamic = 'force-dynamic';

/** Admin-only multi-image upload. Field name: "files" (one or many). Returns { urls: string[] }. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Formato de subida no válido' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => typeof f !== 'string');
  if (files.length === 0) {
    return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: `Máximo ${MAX_FILES_PER_REQUEST} imágenes por subida` }, { status: 400 });
  }

  const dir = getUploadDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Upload dir not writable:', err);
    return NextResponse.json({ error: 'El servidor no puede escribir en la carpeta de imágenes' }, { status: 500 });
  }

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      errors.push(`${file.name}: supera los ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`);
      continue;
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = detectImageExt(buf);
    if (!ext) {
      errors.push(`${file.name}: formato no admitido (usa JPG, PNG, WebP o GIF)`);
      continue;
    }
    const name = `${randomUUID()}.${ext}`;
    try {
      await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf);
      urls.push(`/api/uploads/${name}`);
    } catch (err) {
      console.error('Upload write failed:', err);
      errors.push(`${file.name}: no se pudo guardar`);
    }
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: errors.join('; ') || 'No se pudo subir' }, { status: 400 });
  }
  return NextResponse.json({ urls, errors }, { status: 201 });
}
