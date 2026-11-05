import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Introduce un código de descuento.' },
        { status: 400 }
      );
    }

    const currentSubtotal = Math.max(0, Number(subtotal) || 0);
    const result = await storeService.validateCoupon(code, currentSubtotal);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, message: 'Error interno al validar el cupón.' },
      { status: 500 }
    );
  }
}
