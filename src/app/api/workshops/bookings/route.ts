import { NextResponse } from 'next/server';
import { createBooking } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Crea una reserva PENDING (no ocupa plaza hasta que se pague la señal). */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const b = await createBooking({
      sessionId: String(body.sessionId ?? ''),
      name: body.name,
      email: body.email,
      phone: body.phone,
      seats: body.seats,
      notes: body.notes,
    });
    return NextResponse.json(
      { reference: b.reference, seats: b.seats, totalAmount: Number(b.totalAmount), depositAmount: Number(b.depositAmount) },
      { status: 201 }
    );
  } catch (error) {
    return workshopError(error, 'No se pudo crear la reserva');
  }
}
