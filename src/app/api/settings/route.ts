import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';
import { getCurrentAdmin, requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/apiError';
import { PAYPAL_ME_RE } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const settings = await storeService.getSettings();

    // The maintenance allow-list is only exposed to admins and to the internal middleware call.
    const secret = process.env.JWT_SECRET;
    const isInternal = Boolean(secret) && req.headers.get('x-internal-middleware') === secret;
    if (isInternal || (await getCurrentAdmin())) {
      return NextResponse.json(settings);
    }
    const { maintenanceAllowedIps: _ips, ...publicSettings } = settings;
    return NextResponse.json(publicSettings);
  } catch (error) {
    return apiError(error, 'Error al cargar la configuración');
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();

    const paypalMeUrl = body.paypalMeUrl === undefined ? undefined : String(body.paypalMeUrl ?? '').trim() || null;
    if (paypalMeUrl && !PAYPAL_ME_RE.test(paypalMeUrl)) {
      return NextResponse.json(
        { error: 'El enlace de PayPal debe tener la forma https://www.paypal.me/tu-usuario' },
        { status: 400 }
      );
    }

    const updated = await storeService.updateSettings({
      announcementText: body.announcementText,
      freeShippingThreshold: body.freeShippingThreshold !== undefined ? Number(body.freeShippingThreshold) : undefined,
      standardShippingCost: body.standardShippingCost !== undefined ? Number(body.standardShippingCost) : undefined,
      paypalMeUrl,
      bizumPhone: body.bizumPhone === undefined ? undefined : (String(body.bizumPhone ?? '').trim() || null),
      contactEmail: body.contactEmail,
      instagramUrl: body.instagramUrl,
      maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : undefined,
      maintenanceAllowedIps: body.maintenanceAllowedIps,
      maintenanceTitle: body.maintenanceTitle,
      maintenanceMessage: body.maintenanceMessage,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Error al actualizar configuración');
  }
}
