import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import convertHeic from 'heic-convert';
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
    let buf = Buffer.from(await file.arrayBuffer());
    let ext: 'jpg' | 'png' | 'webp' | 'gif' | 'heic' | null = detectImageExt(buf);

    // Fallback: If magic byte check missed a non-standard brand but extension/MIME says heic/heif:
    if (!ext && (/\.(heic|heif)$/i.test(file.name) || file.type.includes('heic') || file.type.includes('heif'))) {
      if (buf.length >= 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp') {
        ext = 'heic';
      }
    }

    if (!ext) {
      errors.push(`${file.name}: formato no admitido (usa JPG, PNG, WebP, GIF o HEIC)`);
      continue;
    }

    // Convert HEIC/HEIF to JPEG so all browsers and devices can display the images natively
    if (ext === 'heic') {
      try {
        const converted = await convertHeic({
          buffer: buf,
          format: 'JPEG',
          quality: 0.9,
        });
        buf = Buffer.from(converted);
        ext = 'jpg';
      } catch (convErr) {
        console.error('HEIC conversion failed:', convErr);
        errors.push(`${file.name}: no se pudo procesar la imagen HEIC`);
        continue;
      }
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
