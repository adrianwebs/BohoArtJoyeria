import { NextResponse } from 'next/server';
import { storeService } from '@/lib/storeService';

export async function GET() {
  const settings = await storeService.getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await storeService.updateSettings({
      announcementText: body.announcementText,
      freeShippingThreshold: body.freeShippingThreshold !== undefined ? Number(body.freeShippingThreshold) : undefined,
      standardShippingCost: body.standardShippingCost !== undefined ? Number(body.standardShippingCost) : undefined,
      paypalClientId: body.paypalClientId,
      contactEmail: body.contactEmail,
      instagramUrl: body.instagramUrl,
      maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : undefined,
      maintenanceAllowedIps: body.maintenanceAllowedIps,
      maintenanceTitle: body.maintenanceTitle,
      maintenanceMessage: body.maintenanceMessage,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
