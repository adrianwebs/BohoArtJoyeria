import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clean, isEmail, WorkshopError } from '@/lib/workshopService';
import { readJson, workshopError } from '@/lib/workshopApi';

export const dynamic = 'force-dynamic';

/** Envía una reseña de un taller; queda pendiente de moderación. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const workshop = await prisma.workshop.findUnique({ where: { id: String(body.workshopId ?? '') }, select: { id: true } });
    if (!workshop) throw new WorkshopError('Taller no encontrado', 404);
    const authorName = clean(body.authorName, 120);
    const authorEmail = clean(body.authorEmail, 200).toLowerCase();
    const comment = clean(body.comment, 2000);
    const rating = Math.floor(Number(body.rating));
    if (authorName.length < 2) throw new WorkshopError('Indica tu nombre');
    if (!isEmail(authorEmail)) throw new WorkshopError('El email no es válido');
    if (comment.length < 5) throw new WorkshopError('Escribe un comentario');
    if (!(rating >= 1 && rating <= 5)) throw new WorkshopError('La valoración debe estar entre 1 y 5');
    await prisma.workshopReview.create({ data: { workshopId: workshop.id, authorName, authorEmail, rating, comment } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return workshopError(error, 'No se pudo enviar la reseña');
  }
}
