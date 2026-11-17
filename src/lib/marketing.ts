import { randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from './prisma';
import { esc, layout, sendMail } from './mailer';
import { formatPrice } from './utils';

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
export const normalizeEmail = (v: unknown) => String(v ?? '').trim().toLowerCase().slice(0, 254);

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const newToken = () => randomBytes(24).toString('hex');

const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#b8583f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;display:inline-block">${esc(label)}</a></p>`;

// ---------------------------------------------------------------- Pop-up settings

export async function getPopupSettings() {
  return prisma.popupSetting.upsert({ where: { id: 'popup-default' }, update: {}, create: {} });
}

// ---------------------------------------------------------------- Newsletter

export type SubscribeResult = 'pending' | 'already';

/** Creates (or re-opens) a subscription and sends the double opt-in email. */
export async function subscribeToNewsletter(emailRaw: unknown, source: string): Promise<SubscribeResult> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RE.test(email)) throw new Error('INVALID_EMAIL');

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.status === 'CONFIRMED') return 'already';

  const sub = existing
    ? await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: 'PENDING', unsubscribedAt: null, source },
      })
    : await prisma.newsletterSubscriber.create({ data: { email, token: newToken(), source } });

  const link = `${appUrl()}/newsletter/confirmar?token=${sub.token}`;
  await sendMail(
    email,
    'Confirma tu suscripción al Club Bohoart',
    layout(
      'Confirma tu suscripción',
      `<p>¡Gracias por querer formar parte del Club Bohoart! Para empezar a recibir novedades y tu regalo de bienvenida, confirma tu correo:</p>
      ${button(link, 'Confirmar suscripción')}
      <p style="font-size:12px;color:#8a7f79">Si no has sido tú, ignora este mensaje y no recibirás nada más. Puedes darte de baja en cualquier momento.</p>`
    )
  );
  return 'pending';
}

/** Creates a single-use welcome coupon for the subscriber and returns its code. */
async function createWelcomeCoupon(email: string): Promise<{ code: string; percent: number; days: number }> {
  const cfg = await getPopupSettings();
  const percent = Math.min(90, Math.max(1, cfg.discountPercent));
  const days = Math.max(1, cfg.couponValidDays);
  for (let i = 0; i < 5; i++) {
    const code = `BIENVENIDA-${randomBytes(3).toString('hex').toUpperCase()}`;
    try {
      await prisma.coupon.create({
        data: {
          code,
          description: `Bienvenida newsletter (${email})`,
          discountType: 'PERCENTAGE',
          discountValue: percent,
          maxUses: 1,
          expiresAt: new Date(Date.now() + days * 86400000),
          isActive: true,
        },
      });
      return { code, percent, days };
    } catch {
      /* code collision: retry */
    }
  }
  throw new Error('No se pudo generar el cupón');
}

/** Confirms the subscription. First confirmation generates + emails the welcome coupon. */
export async function confirmSubscription(token: string): Promise<'ok' | 'invalid'> {
  if (!token) return 'invalid';
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { token } });
  if (!sub) return 'invalid';

  const updated = await prisma.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { status: 'CONFIRMED', confirmedAt: sub.confirmedAt ?? new Date(), unsubscribedAt: null },
  });

  if (!updated.couponCode) {
    try {
      const { code, percent, days } = await createWelcomeCoupon(sub.email);
      await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { couponCode: code } });
      await sendMail(
        sub.email,
        `Tu ${percent}% de descuento de bienvenida`,
        layout(
          '¡Bienvenida al Club Bohoart!',
          `<p>Gracias por confirmar tu suscripción. Aquí tienes tu regalo: <b>${percent}% de descuento</b> en tu primer pedido.</p>
          <p style="font-size:24px;letter-spacing:2px;font-weight:bold;color:#b8583f;background:#f6efe9;padding:14px;text-align:center;border-radius:8px">${esc(code)}</p>
          <p style="font-size:13px;color:#8a7f79">Válido ${days} días, un solo uso. Introdúcelo en el carrito antes de pagar.</p>
          ${button(appUrl() + '/catalogo', 'Ver el catálogo')}`
        )
      );
    } catch (e) {
      console.error('Error generando cupón de bienvenida', e);
    }
  }
  return 'ok';
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token) return false;
  const res = await prisma.newsletterSubscriber.updateMany({
    where: { token },
    data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
  });
  return res.count > 0;
}

/** Sends one batch of a campaign to CONFIRMED subscribers; the caller loops until `done`. */
export async function sendCampaignBatch(subject: string, html: string, offset: number, limit: number) {
  const where = { status: 'CONFIRMED' };
  const total = await prisma.newsletterSubscriber.count({ where });
  const batch = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    skip: offset,
    take: limit,
  });
  let sent = 0;
  let failed = 0;
  await Promise.all(
    batch.map(async (s) => {
      const unsub = `${appUrl()}/newsletter/baja?token=${s.token}`;
      const body = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#3a3330">${html}
        <p style="font-size:11px;color:#8a7f79;margin-top:28px;border-top:1px solid #eee;padding-top:12px">Recibes este correo porque te suscribiste al Club Bohoart. <a href="${esc(unsub)}">Darme de baja</a></p></div>`;
      const ok = await sendMail(s.email, subject, body, {
        'List-Unsubscribe': `<${unsub}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      });
      if (ok) sent++;
      else failed++;
    })
  );
  const next = offset + batch.length;
  return { total, sent, failed, next, done: next >= total || batch.length === 0 };
}

// ---------------------------------------------------------------- Abandoned carts

interface CartLine {
  productId: string;
  quantity: number;
}

/** Stores/refreshes the server-side cart for a known email. Prices come from the DB, never from the client. */
export async function trackCart(emailRaw: unknown, rawItems: unknown): Promise<boolean> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RE.test(email) || !Array.isArray(rawItems)) return false;

  const lines: CartLine[] = rawItems
    .map((i: any) => ({ productId: String(i?.productId ?? ''), quantity: Math.floor(Number(i?.quantity)) }))
    .filter((i) => i.productId && i.quantity > 0 && i.quantity <= 99)
    .slice(0, 50);

  if (lines.length === 0) {
    await prisma.abandonedCart.deleteMany({ where: { email } });
    return true;
  }

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
    select: { id: true, price: true },
  });
  const price = new Map(products.map((p) => [p.id, Number(p.price)]));
  const valid = lines.filter((l) => price.has(l.productId));
  if (valid.length === 0) return false;
  const total = valid.reduce((s, l) => s + price.get(l.productId)! * l.quantity, 0);
  const items = JSON.stringify(valid);

  const existing = await prisma.abandonedCart.findUnique({ where: { email } });
  if (!existing) {
    await prisma.abandonedCart.create({ data: { email, items, total, token: newToken() } });
  } else {
    // A cart that already ended in an order starts a fresh reminder cycle.
    const reset = existing.orderedAt ? { orderedAt: null, remindersSent: 0, lastReminderAt: null } : {};
    await prisma.abandonedCart.update({ where: { email }, data: { items, total, ...reset } });
  }
  return true;
}

/** Called after an order is created so the customer is not reminded of a cart they already bought. */
export async function markCartOrdered(emailRaw: string): Promise<void> {
  try {
    await prisma.abandonedCart.updateMany({
      where: { email: normalizeEmail(emailRaw) },
      data: { orderedAt: new Date() },
    });
  } catch (e) {
    console.error('markCartOrdered', e);
  }
}

export async function getCartByToken(token: string) {
  if (!token) return null;
  const cart = await prisma.abandonedCart.findUnique({ where: { token } });
  if (!cart) return null;
  const lines: CartLine[] = JSON.parse(cart.items);
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
    include: { category: true },
  });
  return { cart, lines, products };
}

/** Constant-time check of the cron bearer secret. */
export function isValidCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.get('authorization') || '';
  const given = Buffer.from(header.startsWith('Bearer ') ? header.slice(7) : '');
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Sends reminders. First one after ABANDONED_CART_HOURS (default 4h) of inactivity,
 * second one ABANDONED_CART_SECOND_REMINDER_HOURS (default 48h) after the first. Never more than 2.
 * Carts older than 14 days are not reminded.
 */
export async function sendAbandonedCartReminders() {
  const hours = Number(process.env.ABANDONED_CART_HOURS) || 4;
  const secondHours = Number(process.env.ABANDONED_CART_SECOND_REMINDER_HOURS) || 48;
  const now = Date.now();
  const candidates = await prisma.abandonedCart.findMany({
    where: {
      orderedAt: null,
      remindersSent: { lt: 2 },
      updatedAt: { lt: new Date(now - hours * 3600000), gt: new Date(now - 14 * 86400000) },
    },
    take: 200,
  });

  let sent = 0;
  let skipped = 0;
  for (const c of candidates) {
    if (c.remindersSent === 1 && (!c.lastReminderAt || c.lastReminderAt.getTime() > now - secondHours * 3600000)) {
      skipped++;
      continue;
    }
    // Do not email people who already ordered with this address since the cart was last touched.
    const ordered = await prisma.order.count({
      where: { customerEmail: c.email, createdAt: { gt: c.updatedAt }, status: { not: 'CANCELLED' } },
    });
    if (ordered > 0) {
      await prisma.abandonedCart.update({ where: { id: c.id }, data: { orderedAt: new Date() } });
      skipped++;
      continue;
    }
    const data = await getCartByToken(c.token);
    if (!data || data.products.length === 0) {
      skipped++;
      continue;
    }
    const byId = new Map(data.products.map((p) => [p.id, p]));
    const rows = data.lines
      .filter((l) => byId.has(l.productId))
      .map((l) => {
        const p = byId.get(l.productId)!;
        return `<tr><td style="padding:4px 0">${esc(p.name)} × ${l.quantity}</td><td style="text-align:right">${formatPrice(Number(p.price) * l.quantity)}</td></tr>`;
      })
      .join('');
    const link = `${appUrl()}/carrito/recuperar?token=${c.token}`;
    const second = c.remindersSent === 1;
    const ok = await sendMail(
      c.email,
      second ? 'Tus joyas siguen esperándote' : 'Te has dejado algo en el carrito',
      layout(
        second ? 'Tus joyas siguen esperándote' : '¿Te lo has pensado mejor?',
        `<p>${second ? 'Solo un último recordatorio: ' : ''}tu selección sigue guardada. Las piezas son artesanales y las unidades son limitadas.</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse">${rows}</table>
        ${button(link, 'Recuperar mi carrito')}
        <p style="font-size:12px;color:#8a7f79">Si ya has comprado o no te interesa, ignora este mensaje: no te escribiremos más por este carrito.</p>`
      )
    );
    if (ok) {
      sent++;
      await prisma.abandonedCart.update({
        where: { id: c.id },
        data: { remindersSent: { increment: 1 }, lastReminderAt: new Date() },
      });
    } else {
      skipped++;
    }
  }
  return { candidates: candidates.length, sent, skipped };
}

// ---------------------------------------------------------------- Stock notifications

export async function subscribeStockNotification(productId: string, emailRaw: unknown): Promise<'ok' | 'invalid' | 'in-stock'> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RE.test(email) || !productId) return 'invalid';
  const p = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { stock: true } });
  if (!p) return 'invalid';
  if (p.stock > 0) return 'in-stock';
  await prisma.stockNotification.upsert({
    where: { productId_email: { productId, email } },
    update: { notifiedAt: null },
    create: { productId, email },
  });
  return 'ok';
}

/** Emails everyone waiting for this product and marks them as notified. */
export async function notifyStockAvailable(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive || product.stock <= 0) return 0;
  const waiting = await prisma.stockNotification.findMany({ where: { productId, notifiedAt: null } });
  let n = 0;
  for (const w of waiting) {
    const ok = await sendMail(
      w.email,
      `¡Ya hay stock de ${product.name}!`,
      layout(
        '¡Vuelve a estar disponible!',
        `<p>La pieza que estabas esperando, <b>${esc(product.name)}</b>, ya está de nuevo disponible. Al ser artesanal, las unidades son limitadas.</p>
        ${button(`${appUrl()}/productos/${product.slug}`, 'Verla ahora')}
        <p style="font-size:12px;color:#8a7f79">Es un aviso de un solo uso: no te escribiremos más por este producto.</p>`
      )
    );
    if (ok || process.env.NODE_ENV !== 'production') {
      // In dev without SMTP the mail is only logged; still mark it so the flow can be verified end to end.
      await prisma.stockNotification.update({ where: { id: w.id }, data: { notifiedAt: new Date() } });
      n++;
    }
  }
  return n;
}
