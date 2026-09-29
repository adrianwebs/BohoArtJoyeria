import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AdminUser } from './types';

// Values that shipped in the repo/docs in the past: never accepted as real secrets.
export const KNOWN_INSECURE_VALUES = [
  'bohoart_super_secret_jwt_key_2026_handmade_jewelry',
  'adminpassword123',
  'genera_una_clave_aleatoria_larga_de_64_caracteres_aqui',
  'TuClaveAdminMuySegura2026!',
];

/** Read lazily so `next build` works without secrets; fails loudly at request time if missing/insecure. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || KNOWN_INSECURE_VALUES.includes(secret) || secret.startsWith('CHANGE_ME')) {
    throw new Error('JWT_SECRET no está configurado o es inseguro (mínimo 32 caracteres aleatorios). Genera uno con: openssl rand -hex 32');
  }
  return secret;
}
const COOKIE_NAME = 'bohoart_admin_token';

export async function createAdminToken(user: AdminUser): Promise<string> {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminUser;
    if (decoded && decoded.role === 'ADMIN') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Guard for API route handlers: returns a 401 response when there is no valid admin session, otherwise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getCurrentAdmin();
  if (admin) return null;
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
