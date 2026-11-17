import { NextResponse } from 'next/server';
import { WorkshopError } from './workshopService';
import { PaypalError } from './paypal';

/** Mapea errores de talleres/PayPal a una respuesta JSON con mensaje para el usuario. */
export function workshopError(error: unknown, fallback: string) {
  if (error instanceof WorkshopError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof PaypalError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

export function appBaseUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/$/, '');
  return new URL(req.url).origin;
}
