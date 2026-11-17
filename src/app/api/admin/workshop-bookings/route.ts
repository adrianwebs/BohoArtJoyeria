import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { BOOKING_STATUSES } from '@/lib/workshopService';
import { workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Filtros opcionales: ?status=PAID&workshopId=...&q=texto (nombre, email, teléfono o referencia) */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const sp = new URL(req.url).searchParams;
    const status = sp.get('status') || '';
    const workshopId = sp.get('workshopId') || '';
    const q = (sp.get('q') || '').trim();
    const rows = await prisma.workshopBooking.findMany({
      where: {
        ...(status && (BOOKING_STATUSES as readonly string[]).includes(status) ? { status } : {}),
        ...(workshopId ? { session: { workshopId } } : {}),
        ...(q
          ? { OR: [{ customerName: { contains: q } }, { customerEmail: { contains: q } }, { customerPhone: { contains: q } }, { reference: { contains: q } }] }
          : {}),
      },
      include: { session: { include: { workshop: { select: { id: true, title: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return NextResponse.json(
      rows.map((b) => ({
        id: b.id,
        reference: b.reference,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        seats: b.seats,
        totalAmount: Number(b.totalAmount),
        depositAmount: Number(b.depositAmount),
        amountPaid: Number(b.amountPaid),
        paymentMethod: b.paymentMethod,
        paymentRef: b.paymentRef,
        status: b.status,
        notes: b.notes,
        createdAt: b.createdAt.toISOString(),
        startsAt: b.session.startsAt.toISOString(),
        workshopId: b.session.workshop.id,
        workshopTitle: b.session.workshop.title,
      }))
    );
  } catch (error) {
    return workshopError(error, 'Error al cargar las reservas');
  }
}
