import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { createAdminToken, setAdminSessionCookie, KNOWN_INSECURE_VALUES } from '@/lib/auth';

const digest = (v: string) => createHash('sha256').update(v).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword || KNOWN_INSECURE_VALUES.includes(expectedPassword)) {
      console.error('ADMIN_EMAIL / ADMIN_PASSWORD no configurados o usan un valor por defecto conocido.');
      return NextResponse.json(
        { success: false, message: 'El acceso de administración no está configurado en el servidor.' },
        { status: 500 }
      );
    }

    if (
      typeof email === 'string' &&
      typeof password === 'string' &&
      safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
      safeEqual(password, expectedPassword)
    ) {
      const user = {
        id: 'usr-admin-1',
        name: 'Administradora Bohoart',
        email: expectedEmail,
        role: 'ADMIN' as const,
      };

      const token = await createAdminToken(user);
      await setAdminSessionCookie(token);

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, message: 'Credenciales de acceso incorrectas.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno en el servidor.' },
      { status: 500 }
    );
  }
}
