import { slugify } from './utils';
import { madridDateToUtc } from './collectionSchedule';
import type { CollectionInput } from './storeService';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Validates a collection request body. Returns an error message string when invalid. */
export function parseCollectionInput(body: any): CollectionInput | string {
  const name = clean(body?.name, 120);
  if (!name) return 'El nombre es obligatorio';
  const slug = slugify(clean(body?.slug, 120) || name);
  if (!slug) return 'Slug no válido';

  const startsAt = body.startsAt ? madridDateToUtc(String(body.startsAt).slice(0, 10)) : null;
  const endsAt = body.endsAt ? madridDateToUtc(String(body.endsAt).slice(0, 10), true) : null;
  if (body.startsAt && !startsAt) return 'Fecha de inicio no válida';
  if (body.endsAt && !endsAt) return 'Fecha de fin no válida';
  if (startsAt && endsAt && endsAt.getTime() < startsAt.getTime()) return 'La fecha de fin es anterior a la de inicio';

  const repeatYearly = Boolean(body.repeatYearly);
  if (repeatYearly && (!startsAt || !endsAt)) return 'Para repetir cada año indica fecha de inicio y de fin';

  const accent = clean(body.accentColor, 7);
  const productIds: string[] = Array.isArray(body.productIds)
    ? [
        ...new Set<string>(
          body.productIds.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0)
        ),
      ].slice(0, 500)
    : [];

  return {
    name,
    slug,
    tagline: clean(body.tagline, 200) || null,
    description: clean(body.description, 5000) || null,
    heroImage: clean(body.heroImage, 1000) || null,
    accentColor: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#C2694F',
    startsAt,
    endsAt,
    repeatYearly,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    showOnHome: body.showOnHome === undefined ? true : Boolean(body.showOnHome),
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.floor(Number(body.sortOrder)) : 0,
    productIds,
  };
}
