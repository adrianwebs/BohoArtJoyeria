import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clean, isEmail, sendInquiryEmails, WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** "Pedir otra fecha u horario" / contacto fuera de horario. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const message = clean(body.message, 2000);
    if (name.length < 2) throw new WorkshopError('Indica tu nombre');
    if (!isEmail(email)) throw new WorkshopError('El email no es válido');
    if (message.length < 5) throw new WorkshopError('Cuéntanos qué fecha u horario te vendría bien');

    let workshop: { id: string; title: string } | null = null;
    if (body.workshopId) {
      workshop = await prisma.workshop.findUnique({ where: { id: String(body.workshopId) }, select: { id: true, title: true } });
    }
    const inquiry = await prisma.workshopInquiry.create({
      data: {
        workshopId: workshop?.id ?? null,
        name,
        email,
        phone: clean(body.phone, 40) || null,
        preferredDate: clean(body.preferredDate, 200) || null,
        message,
      },
    });
    void sendInquiryEmails({ ...inquiry, workshopTitle: workshop?.title ?? null });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return workshopError(error, 'No se pudo enviar la consulta');
  }
}
