import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AdminUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'bohoart_super_secret_jwt_key_2026_handmade_jewelry';
const COOKIE_NAME = 'bohoart_admin_token';

export async function createAdminToken(user: AdminUser): Promise<string> {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
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
