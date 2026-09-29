import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { apiError } from '@/lib/apiError';

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
    });
  } catch (error) {
    return apiError(error, 'Error al cargar la configuración de pago');
  }
}
