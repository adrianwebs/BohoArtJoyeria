import { NextResponse } from 'next/server';
import { getPopupSettings } from '@/lib/marketing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s = await getPopupSettings();
    return NextResponse.json({
      isEnabled: s.isEnabled,
      title: s.title,
      message: s.message,
      discountPercent: s.discountPercent,
      delaySeconds: s.delaySeconds,
      exitIntent: s.exitIntent,
    });
  } catch {
    return NextResponse.json({ isEnabled: false });
  }
}
