import crypto from 'crypto';
import { prisma } from './prisma';
import { sendMail, layout, esc } from './mailer';
import { formatPrice } from './utils';

export class WorkshopError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const BOOKING_STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'ATTENDED'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
/** Estados que ocupan plaza. Las plazas solo se descuentan con la reserva pagada. */
const HOLDING: string[] = ['PAID', 'ATTENDED'];
export const MAX_SEATS_PER_BOOKING = 6;
export const TIMEZONE = 'Europe/Madrid';

const num = (v: unknown) => Number(v ?? 0);
const money = (n: number) => Math.round(n * 100) / 100;

export function formatSessionDate(d: Date | string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE,
  }).format(new Date(d));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m} min`;
  return h ? `${h} ${h === 1 ? 'hora' : 'horas'}` : `${m} min`;
}

export interface FaqItem { q: string; a: string }
export function parseFaq(raw: string | null | undefined): FaqItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v)
      ? v.filter((x) => x && typeof x.q === 'string' && typeof x.a === 'string' && x.q.trim()).map((x) => ({ q: x.q, a: x.a }))
      : [];
  } catch {
    return [];
  }
}

/** Señal por plaza y total, según la configuración del taller. La señal nunca supera el total. */
export function calcAmounts(w: { price: unknown; depositType: string; depositValue: unknown }, seats: number) {
  const price = num(w.price);
  const total = money(price * seats);
  const perSeat = w.depositType === 'PERCENT' ? price * (num(w.depositValue) / 100) : num(w.depositValue);
  const deposit = Math.min(total, money(perSeat * seats));
  return { total, deposit, remaining: money(total - deposit) };
}

const newReference = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'TAL-' + Array.from(crypto.randomBytes(6), (b) => alphabet[b % alphabet.length]).join('');
};

// ───────────────────────── Lectura pública ─────────────────────────

export function mapWorkshopCard(w: any) {
  const now = Date.now();
  const upcoming = (w.sessions ?? [])
    .filter((s: any) => s.isActive && new Date(s.startsAt).getTime() > now)
    .sort((a: any, b: any) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const per = calcAmounts(w, 1);
  return {
    id: w.id as string,
    title: w.title as string,
    slug: w.slug as string,
    shortDescription: (w.shortDescription as string | null) ?? null,
    image: (w.image as string | null) ?? null,
    price: num(w.price),
    deposit: per.deposit,
    durationMinutes: w.durationMinutes as number,
    nextSession: upcoming[0] ? new Date(upcoming[0].startsAt).toISOString() : null,
    hasAvailability: upcoming.some((s: any) => s.capacity - s.seatsTaken > 0),
  };
}

export async function getPublicWorkshops() {
  const rows = await prisma.workshop.findMany({
    where: { isActive: true },
    include: { sessions: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapWorkshopCard);
}

export async function getPublicWorkshop(slug: string) {
  const w = await prisma.workshop.findFirst({
    where: { slug, isActive: true },
    include: {
      sessions: { where: { isActive: true, startsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      photos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });
  if (!w) return null;
  const per = calcAmounts(w, 1);
  return {
    id: w.id,
    title: w.title,
    slug: w.slug,
    shortDescription: w.shortDescription,
    description: w.description,
    image: w.image,
    price: num(w.price),
    depositPerSeat: per.deposit,
    durationMinutes: w.durationMinutes,
    materials: (w.materials || '').split('\n').map((x) => x.trim()).filter(Boolean),
    faq: parseFaq(w.faq),
    sessions: w.sessions.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      capacity: s.capacity,
      seatsLeft: Math.max(0, s.capacity - s.seatsTaken),
    })),
    reviews: w.reviews.map((r) => ({
      id: r.id, authorName: r.authorName, rating: r.rating, comment: r.comment, createdAt: r.createdAt.toISOString(),
    })),
    photos: w.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption })),
  };
}

export async function getRoomInfo() {
  const r = await prisma.workshopRoomInfo.findUnique({ where: { id: 'main' } });
  let photos: string[] = [];
  try { photos = r ? JSON.parse(r.photos) : []; } catch { /* ignore */ }
  return { title: r?.title || 'Nuestra sala de talleres', text: r?.text || '', photos: Array.isArray(photos) ? photos : [] };
}

// ───────────────────────── Reservas ─────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (v: string) => EMAIL_RE.test(v);
export const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

export async function createBooking(input: {
  sessionId: string; name: string; email: string; phone: string; seats: number; notes?: string;
}) {
  const name = clean(input.name, 120);
  const email = clean(input.email, 200).toLowerCase();
  const phone = clean(input.phone, 40);
  const seats = Math.floor(Number(input.seats));
  if (name.length < 2) throw new WorkshopError('Indica tu nombre');
  if (!isEmail(email)) throw new WorkshopError('El email no es válido');
  if (phone.replace(/\D/g, '').length < 9) throw new WorkshopError('Indica un teléfono válido');
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS_PER_BOOKING) {
    throw new WorkshopError(`Puedes reservar entre 1 y ${MAX_SEATS_PER_BOOKING} plazas`);
  }

  const session = await prisma.workshopSession.findUnique({
    where: { id: String(input.sessionId) },
    include: { workshop: true },
  });
  if (!session || !session.isActive || !session.workshop.isActive || session.startsAt.getTime() <= Date.now()) {
    throw new WorkshopError('Esta fecha ya no está disponible', 404);
  }
  const left = session.capacity - session.seatsTaken;
  if (left <= 0) throw new WorkshopError('Esta fecha está completa', 409);
  if (seats > left) throw new WorkshopError(`Solo quedan ${left} ${left === 1 ? 'plaza' : 'plazas'} en esta fecha`, 409);

  const amounts = calcAmounts(session.workshop, seats);
  if (amounts.deposit <= 0) throw new WorkshopError('Este taller no tiene la señal configurada', 500);

  return prisma.workshopBooking.create({
    data: {
      reference: newReference(),
      sessionId: session.id,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      seats,
      totalAmount: amounts.total,
      depositAmount: amounts.deposit,
      notes: clean(input.notes, 1000) || null,
    },
  });
}

export async function getBookingByReference(reference: string) {
  return prisma.workshopBooking.findUnique({
    where: { reference },
    include: { session: { include: { workshop: true } } },
  });
}

type BookingFull = NonNullable<Awaited<ReturnType<typeof getBookingByReference>>>;

/** Reclama plazas de forma atómica: solo incrementa si todavía caben. */
async function claimSeats(tx: any, sessionId: string, seats: number, capacity: number): Promise<boolean> {
  const r = await tx.workshopSession.updateMany({
    where: { id: sessionId, seatsTaken: { lte: capacity - seats } },
    data: { seatsTaken: { increment: seats } },
  });
  return r.count === 1;
}

/** ¿Quedan plazas ahora mismo? Comprobación previa para no cobrar una reserva que no cabe. */
export async function hasSeatsFor(booking: { sessionId: string; seats: number }): Promise<boolean> {
  const s = await prisma.workshopSession.findUnique({ where: { id: booking.sessionId } });
  return !!s && s.capacity - s.seatsTaken >= booking.seats;
}

/**
 * Marca la reserva como pagada y descuenta las plazas. Idempotente (un reintento no duplica plazas).
 * Si el pago ya se cobró pero no quedan plazas, la reserva queda PENDING con una nota para reembolsar/gestionar.
 */
export async function confirmPayment(
  bookingId: string,
  pay: { method: 'PAYPAL' | 'REDSYS'; ref: string; amount: number }
): Promise<{ ok: true; alreadyPaid: boolean } | { ok: false; reason: 'NO_SEATS' | 'NOT_FOUND' | 'CANCELLED' }> {
  const result = await prisma.$transaction(async (tx) => {
    const b = await tx.workshopBooking.findUnique({ where: { id: bookingId }, include: { session: true } });
    if (!b) return { ok: false as const, reason: 'NOT_FOUND' as const };
    if (HOLDING.includes(b.status)) return { ok: true as const, alreadyPaid: true };
    if (b.status === 'CANCELLED') return { ok: false as const, reason: 'CANCELLED' as const };
    const claimed = await claimSeats(tx, b.sessionId, b.seats, b.session.capacity);
    if (!claimed) {
      await tx.workshopBooking.update({
        where: { id: b.id },
        data: {
          paymentMethod: pay.method,
          paymentRef: pay.ref,
          notes: `${b.notes ? b.notes + ' | ' : ''}REVISAR: pago de ${pay.amount.toFixed(2)} EUR recibido (${pay.method} ${pay.ref}) pero sin plazas libres. Reembolsar o recolocar.`,
        },
      });
      return { ok: false as const, reason: 'NO_SEATS' as const };
    }
    await tx.workshopBooking.update({
      where: { id: b.id },
      data: { status: 'PAID', amountPaid: pay.amount, paymentMethod: pay.method, paymentRef: pay.ref },
    });
    return { ok: true as const, alreadyPaid: false };
  });

  if (result.ok && !result.alreadyPaid) void sendBookingEmails(bookingId);
  if (!result.ok && result.reason === 'NO_SEATS') void sendNoSeatsAlert(bookingId);
  return result;
}

/** Cambio de estado desde el admin, manteniendo el contador de plazas coherente. */
export async function setBookingStatus(bookingId: string, status: BookingStatus) {
  if (!BOOKING_STATUSES.includes(status)) throw new WorkshopError('Estado no válido');
  return prisma.$transaction(async (tx) => {
    const b = await tx.workshopBooking.findUnique({ where: { id: bookingId }, include: { session: true } });
    if (!b) throw new WorkshopError('Reserva no encontrada', 404);
    const was = HOLDING.includes(b.status);
    const will = HOLDING.includes(status);
    if (!was && will) {
      if (!(await claimSeats(tx, b.sessionId, b.seats, b.session.capacity))) {
        throw new WorkshopError('No quedan plazas suficientes en esa fecha', 409);
      }
    } else if (was && !will) {
      await tx.workshopSession.update({ where: { id: b.sessionId }, data: { seatsTaken: { decrement: b.seats } } });
    }
    const data: { status: string; amountPaid?: number } = { status };
    // Marcada como pagada a mano (p. ej. transferencia): se considera abonada la señal.
    if (!was && will && num(b.amountPaid) === 0) data.amountPaid = num(b.depositAmount);
    return tx.workshopBooking.update({ where: { id: bookingId }, data });
  });
}

// ───────────────────────── Correos ─────────────────────────

const notifyEmail = async () => {
  if (process.env.ORDER_NOTIFY_EMAIL) return process.env.ORDER_NOTIFY_EMAIL;
  const s = await prisma.storeSetting.findFirst();
  return s?.contactEmail || null;
};

function bookingSummary(b: BookingFull) {
  const total = num(b.totalAmount), deposit = num(b.depositAmount);
  return `<table style="width:100%;font-size:14px;border-collapse:collapse">
  <tr><td style="padding:3px 0;color:#8a7f79">Taller</td><td style="text-align:right"><b>${esc(b.session.workshop.title)}</b></td></tr>
  <tr><td style="padding:3px 0;color:#8a7f79">Fecha</td><td style="text-align:right">${esc(formatSessionDate(b.session.startsAt))}</td></tr>
  <tr><td style="padding:3px 0;color:#8a7f79">Plazas</td><td style="text-align:right">${b.seats}</td></tr>
  <tr><td style="padding:3px 0;color:#8a7f79">Precio total</td><td style="text-align:right">${formatPrice(total)}</td></tr>
  <tr><td style="padding:3px 0;color:#8a7f79">Señal pagada</td><td style="text-align:right">${formatPrice(deposit)}</td></tr>
  <tr><td style="padding:3px 0;font-weight:bold">A pagar el día del taller</td><td style="text-align:right;font-weight:bold">${formatPrice(total - deposit)}</td></tr></table>`;
}

export async function sendBookingEmails(bookingId: string) {
  const b = await getBookingById(bookingId);
  if (!b) return;
  await Promise.all([
    sendMail(
      b.customerEmail,
      `Reserva confirmada: ${b.session.workshop.title} (${b.reference})`,
      layout(
        'Reserva confirmada',
        `<p>¡Gracias, ${esc(b.customerName)}! Hemos recibido tu señal y tu plaza está reservada. Referencia: <b>${esc(b.reference)}</b>.</p>${bookingSummary(b)}
        <p style="background:#fbf3ee;border-radius:8px;padding:10px 12px;font-size:13px"><b>Importante:</b> la señal <b>no se devuelve</b> en caso de cancelación o de no asistir. El resto (${formatPrice(num(b.totalAmount) - num(b.depositAmount))}) se paga el día del taller.</p>
        <p style="font-size:13px;color:#8a7f79">Si necesitas cambiar de fecha, escríbenos respondiendo a este correo y haremos lo posible por ayudarte.</p>`
      )
    ),
    notifyEmail().then((to) =>
      sendMail(
        to,
        `Nueva reserva de taller ${b.reference}: ${b.session.workshop.title}`,
        layout(
          'Nueva reserva de taller',
          `<p>${esc(b.customerName)} · ${esc(b.customerEmail)} · ${esc(b.customerPhone)}</p>${bookingSummary(b)}<p style="font-size:13px">Pago: ${esc(b.paymentMethod)} (${esc(b.paymentRef)})</p>${b.notes ? `<p>Notas: ${esc(b.notes)}</p>` : ''}`
        )
      )
    ),
  ]);
}

const getBookingById = (id: string) =>
  prisma.workshopBooking.findUnique({ where: { id }, include: { session: { include: { workshop: true } } } });

async function sendNoSeatsAlert(bookingId: string) {
  const b = await getBookingById(bookingId);
  if (!b) return;
  await sendMail(
    await notifyEmail(),
    `Pago sin plazas: reserva ${b.reference}`,
    layout('Pago recibido sin plazas libres', `<p>${esc(b.customerName)} (${esc(b.customerEmail)}, ${esc(b.customerPhone)}) pagó la señal de <b>${esc(b.reference)}</b> (${esc(b.paymentMethod)} ${esc(b.paymentRef)}) pero la fecha del ${esc(formatSessionDate(b.session.startsAt))} se llenó. Reembolsa el pago o recoloca a la persona en otra fecha.</p>`)
  );
}

export async function sendInquiryEmails(i: { name: string; email: string; phone?: string | null; preferredDate?: string | null; message: string; workshopTitle?: string | null }) {
  await Promise.all([
    sendMail(
      i.email,
      'Hemos recibido tu consulta sobre talleres',
      layout('Consulta recibida', `<p>Hola, ${esc(i.name)}. Hemos recibido tu petición${i.workshopTitle ? ` sobre «${esc(i.workshopTitle)}»` : ''} y te responderemos en cuanto podamos con una propuesta de fecha y horario.</p><p style="font-size:13px;color:#8a7f79">Tu mensaje: ${esc(i.message)}</p>`)
    ),
    notifyEmail().then((to) =>
      sendMail(
        to,
        `Nueva consulta de taller de ${i.name}`,
        layout('Nueva consulta de taller', `<p>${esc(i.name)} · ${esc(i.email)} · ${esc(i.phone || '')}</p>${i.workshopTitle ? `<p>Taller: <b>${esc(i.workshopTitle)}</b></p>` : ''}${i.preferredDate ? `<p>Fecha/horario preferido: ${esc(i.preferredDate)}</p>` : ''}<p>${esc(i.message)}</p>`)
      )
    ),
  ]);
}
