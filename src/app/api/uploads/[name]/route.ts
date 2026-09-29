import { promises as fs } from 'fs';
import path from 'path';
import { EXT_TO_MIME, getUploadDir, UPLOAD_NAME_RE } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

/** Serves uploaded images from the upload volume (files added after build are not served from /public). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  // Strict allow-list of names prevents path traversal.
  if (!UPLOAD_NAME_RE.test(name)) return new Response('Not found', { status: 404 });

  try {
    const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ getUploadDir(), name));
    const ext = name.split('.').pop() as string;
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': EXT_TO_MIME[ext],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
