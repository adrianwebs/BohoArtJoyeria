import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function GET() {
  try {
    const coupons = await storeService.getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Error al obtener cupones' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.code || body.discountValue === undefined) {
      return NextResponse.json(
        { error: 'El código y el valor del descuento son obligatorios' },
        { status: 400 }
      );
    }

    const cleanCode = body.code.trim().toUpperCase();
    const existing = await storeService.getCouponByCode(cleanCode);
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un cupón con el código "${cleanCode}"` },
        { status: 409 }
      );
    }

    const coupon = await storeService.createCoupon({
      code: cleanCode,
      description: body.description || null,
      discountType: body.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
      discountValue: Math.max(0, Number(body.discountValue)),
      minOrderAmount: body.minOrderAmount ? Math.max(0, Number(body.minOrderAmount)) : null,
      maxUses: body.maxUses ? Math.max(1, parseInt(body.maxUses, 10)) : null,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Error al crear el cupón' }, { status: 500 });
  }
}
