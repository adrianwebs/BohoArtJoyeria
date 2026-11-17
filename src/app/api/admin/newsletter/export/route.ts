import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Prevents CSV/formula injection when the file is opened in a spreadsheet.
const cell = (v: unknown) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
    const csv = [
      'email,estado,origen,alta,confirmado,baja',
      ...rows.map((r) =>
        [r.email, r.status, r.source, r.createdAt, r.confirmedAt ?? '', r.unsubscribedAt ?? ''].map(cell).join(',')
      ),
    ].join('\r\n');
    return new Response('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="suscriptores-bohoart.csv"',
      },
    });
  } catch (e) {
    return apiError(e, 'Error al exportar');
  }
}
