import nodemailer, { type Transporter } from 'nodemailer';
import type { Order } from './types';
import { formatPrice, paypalMeLink, PAYPAL_ME_RE } from './utils';

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/**
 * Sends an email; never throws (a mail failure must not break an order). Returns true when delivered.
 * Without SMTP configured nothing is sent: outside production the message is logged to the console instead.
 */
export async function sendMail(
  to: string | undefined | null,
  subject: string,
  html: string,
  headers?: Record<string, string>
): Promise<boolean> {
  if (!to) return false;
  const t = getTransporter();
  if (!t) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[mail:dev] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    }
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER || 'Bohoart Jewelry <no-reply@bohoartjoyeria.com>',
      to,
      subject,
      html,
      headers,
    });
    return true;
  } catch (err) {
    console.error('Error enviando email:', err);
    return false;
  }
}

export function layout(title: string, body: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3a3330;padding:24px">
  <h2 style="color:#b8583f;margin:0 0 12px">${esc(title)}</h2>${body}
  <p style="font-size:12px;color:#8a7f79;margin-top:28px">Bohoart Jewelry · Joyería artesanal hecha a mano</p></div>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0">${esc(i.productName)}${i.variantLabel ? ` <span style="color:#8a7f79;font-size:12px">(${esc(i.variantLabel)})</span>` : ''} × ${i.quantity}</td><td style="text-align:right">${formatPrice(i.unitPrice * i.quantity)}</td></tr>`
    )
    .join('');
  return `<table style="width:100%;font-size:14px;border-collapse:collapse">${rows}
  <tr><td style="padding-top:8px;color:#8a7f79">Envío</td><td style="text-align:right;padding-top:8px">${order.shippingCost ? formatPrice(order.shippingCost) : 'Gratis'}</td></tr>
  <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="text-align:right;font-weight:bold;padding-top:6px">${formatPrice(order.totalAmount)}</td></tr></table>`;
}

export async function sendOrderReceivedEmails(
  order: Order,
  opts: { bizumPhone?: string | null; paypalMeUrl?: string | null; notifyEmail?: string | null }
) {
  const pending = order.status === 'PENDING';
  let intro: string;
  if (pending && order.paymentMethod === 'BIZUM') {
    intro = `<p>Hemos recibido tu pedido <b>${esc(order.orderNumber)}</b>. Para confirmarlo, envía <b>${formatPrice(order.totalAmount)}</b> por Bizum al <b>${esc(opts.bizumPhone || '')}</b> indicando como concepto <b>${esc(order.orderNumber)}</b>. Prepararemos tu pedido en cuanto veamos el pago.</p>`;
  } else if (pending && order.paymentMethod === 'PAYPAL_ME' && opts.paypalMeUrl && PAYPAL_ME_RE.test(opts.paypalMeUrl)) {
    const link = paypalMeLink(opts.paypalMeUrl, order.totalAmount);
    intro = `<p>Hemos recibido tu pedido <b>${esc(order.orderNumber)}</b>. Para confirmarlo, paga <b>${formatPrice(order.totalAmount)}</b> por PayPal aquí: <a href="${esc(link)}">${esc(link)}</a><br>Escribe <b>${esc(order.orderNumber)}</b> como nota del pago. Prepararemos tu pedido en cuanto veamos el pago.</p>`;
  } else {
    intro = `<p>¡Gracias, ${esc(order.customerName)}! Hemos recibido tu pago y ya estamos preparando tu pedido <b>${esc(order.orderNumber)}</b> con mucho mimo.</p>`;
  }
  const addr = `<p style="font-size:13px;color:#8a7f79">Envío a: ${esc(order.shippingAddress)}, ${esc(order.postalCode)} ${esc(order.city)} (${esc(order.province)})</p>`;

  await Promise.all([
    sendMail(
      order.customerEmail,
      pending ? `Pedido ${order.orderNumber}: pendiente de tu pago` : `Pedido ${order.orderNumber} confirmado`,
      layout(pending ? 'Falta solo tu pago' : 'Pedido confirmado', intro + itemsTable(order) + addr)
    ),
    sendMail(
      opts.notifyEmail,
      `Nuevo pedido ${order.orderNumber} (${order.paymentMethod}, ${order.status})`,
      layout('Nuevo pedido', `<p>${esc(order.customerName)} · ${esc(order.customerEmail)} · ${esc(order.customerPhone || '')}</p>${pending ? `<p><b>Pendiente de cobro (${esc(order.paymentMethod)}):</b> comprueba ${formatPrice(order.totalAmount)} con concepto ${esc(order.orderNumber)} y márcalo como PAID en el admin.</p>` : ''}${itemsTable(order)}${addr}${order.notes ? `<p>Notas: ${esc(order.notes)}</p>` : ''}`)
    ),
  ]);
}

export async function sendOrderPaidEmail(order: Order) {
  await sendMail(
    order.customerEmail,
    `Pago recibido - pedido ${order.orderNumber}`,
    layout('Pago recibido', `<p>Hemos recibido tu pago del pedido <b>${esc(order.orderNumber)}</b>. ¡Ya lo estamos preparando!</p>${itemsTable(order)}`)
  );
}

export async function sendOrderShippedEmail(order: Order) {
  await sendMail(
    order.customerEmail,
    `Tu pedido ${order.orderNumber} está en camino`,
    layout(
      'Tu pedido está en camino',
      `<p>Tu pedido <b>${esc(order.orderNumber)}</b> ha sido enviado.</p>${order.trackingNumber ? `<p>Número de seguimiento: <b>${esc(order.trackingNumber)}</b></p>` : ''}`
    )
  );
}
