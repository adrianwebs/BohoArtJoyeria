import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { apiError } from '@/lib/apiError';
import { getPaypalPublicConfig } from '@/lib/paypal';
import { isRedsysConfigured } from '@/lib/redsys';

export const dynamic = 'force-dynamic';

/** Public checkout configuration: manual payment methods (PayPal.Me link, Bizum) and shipping rules. */
export async function GET() {
  try {
    const settings = await storeService.getSettings();
    return NextResponse.json({
      paypalMeUrl: settings.paypalMeUrl || null,
      bizumPhone: settings.bizumPhone || null,
      freeShippingThreshold: settings.freeShippingThreshold,
      standardShippingCost: settings.standardShippingCost,
      paypal: getPaypalPublicConfig(), // { clientId, mode } o null si PayPal automático no está configurado
      redsysEnabled: isRedsysConfigured(),
    });
  } catch (error) {
    return apiError(error, 'Error al cargar la configuración de pago');
  }
}
