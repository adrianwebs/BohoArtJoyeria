import { prisma } from './prisma';
import { slugify } from './utils';
import { clean, WorkshopError } from './workshopService';

/** Valida y normaliza el cuerpo de creación/edición de un taller. */
export function parseWorkshopInput(body: Record<string, any>) {
  const title = clean(body.title, 160);
  if (title.length < 3) throw new WorkshopError('El título es obligatorio');
  const description = String(body.description ?? '').trim();
  if (!description) throw new WorkshopError('La descripción es obligatoria');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) throw new WorkshopError('El precio debe ser mayor que 0');
  const depositType = body.depositType === 'PERCENT' ? 'PERCENT' : 'FIXED';
  const depositValue = Number(body.depositValue);
  if (!Number.isFinite(depositValue) || depositValue <= 0) throw new WorkshopError('La señal debe ser mayor que 0');
  if (depositType === 'PERCENT' && depositValue > 100) throw new WorkshopError('El porcentaje de señal no puede superar 100');
  if (depositType === 'FIXED' && depositValue > price) throw new WorkshopError('La señal no puede ser mayor que el precio');
  const durationMinutes = Math.floor(Number(body.durationMinutes));
  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) throw new WorkshopError('La duración no es válida');

  let faq: string | null = null;
  if (Array.isArray(body.faq)) {
    const items = body.faq
      .map((f: any) => ({ q: clean(f?.q, 300), a: clean(f?.a, 2000) }))
      .filter((f: { q: string; a: string }) => f.q && f.a);
    faq = items.length ? JSON.stringify(items) : null;
  }
  return {
    title,
    slug: slugify(clean(body.slug, 160) || title),
    shortDescription: clean(body.shortDescription, 300) || null,
    description,
    price,
    depositType,
    depositValue,
    durationMinutes,
    materials: String(body.materials ?? '').trim() || null,
    faq,
    image: clean(body.image, 1000) || null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sortOrder: Math.floor(Number(body.sortOrder)) || 0,
  };
}

export async function assertSlugFree(slug: string, exceptId?: string) {
  if (!slug) throw new WorkshopError('El slug no es válido');
  const other = await prisma.workshop.findUnique({ where: { slug } });
  if (other && other.id !== exceptId) throw new WorkshopError(`Ya existe un taller con el slug "${slug}"`, 409);
}

export function parseSessionInput(body: Record<string, any>) {
  const startsAt = new Date(String(body.startsAt ?? ''));
  if (isNaN(startsAt.getTime())) throw new WorkshopError('La fecha y hora no son válidas');
  const capacity = Math.floor(Number(body.capacity));
  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 100) throw new WorkshopError('Las plazas deben estar entre 1 y 100');
  return { startsAt, capacity, isActive: body.isActive === undefined ? true : Boolean(body.isActive) };
}
