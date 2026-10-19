import path from 'path';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 10;

/** Directory where uploaded images live. In Docker this is the mounted volume. */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads');
}

export const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
]);

/** Detects the real image type from magic bytes (the client-provided type/extension is never trusted). */
export function detectImageExt(buf: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | 'heic' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';

  // HEIC/HEIF: ISO base media file format starts with ftyp box at offset 4
  if (buf.length >= 16 && buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const majorBrand = buf.subarray(8, 12).toString('ascii').toLowerCase();
    if (HEIC_BRANDS.has(majorBrand)) return 'heic';
    const boxLength = Math.min(buf.readUInt32BE(0), buf.length, 64);
    for (let offset = 16; offset + 4 <= boxLength; offset += 4) {
      const compBrand = buf.subarray(offset, offset + 4).toString('ascii').toLowerCase();
      if (HEIC_BRANDS.has(compBrand)) return 'heic';
    }
  }

  return null;
}

export const UPLOAD_NAME_RE = /^[a-f0-9-]{36}\.(jpg|png|webp|gif|heic|heif)$/;

