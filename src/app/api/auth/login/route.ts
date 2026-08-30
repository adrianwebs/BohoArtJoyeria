import { NextResponse } from 'next/server';
import { createAdminToken, setAdminSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@bohoartjoyeria.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    // Verify credentials
    if (email === expectedEmail && password === expectedPassword) {
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
