// Redsys (TPV virtual) — redirección con firma HMAC_SHA256_V1. Credenciales solo por variables de entorno:
// REDSYS_MERCHANT_CODE, REDSYS_TERMINAL, REDSYS_SECRET_KEY (clave SHA-256 en base64), REDSYS_ENV=test|live.
import crypto from 'crypto';

export interface RedsysConfig {
  merchantCode: string;
  terminal: string;
  secretKey: string;
  live: boolean;
}

export function getRedsysConfig(): RedsysConfig | null {
  const merchantCode = process.env.REDSYS_MERCHANT_CODE || '';
  const terminal = process.env.REDSYS_TERMINAL || '';
  const secretKey = process.env.REDSYS_SECRET_KEY || '';
  if (!merchantCode || !terminal || !secretKey) return null;
  return { merchantCode, terminal, secretKey, live: process.env.REDSYS_ENV === 'live' };
}

export const isRedsysConfigured = () => getRedsysConfig() !== null;

export function redsysUrl(cfg: RedsysConfig): string {
  return cfg.live ? 'https://sis.redsys.es/sis/realizarPago' : 'https://sis-t.redsys.es:25443/sis/realizarPago';
}

/** Clave de operación: 3DES-CBC (IV a cero, sin padding automático) del nº de pedido relleno con ceros, con la clave del comercio. */
function deriveKey(secretB64: string, order: string): Buffer {
  const key = Buffer.from(secretB64, 'base64');
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, Buffer.alloc(8, 0));
  cipher.setAutoPadding(false);
  const padded = Buffer.alloc(Math.ceil(Buffer.byteLength(order) / 8) * 8, 0);
  Buffer.from(order).copy(padded);
  return Buffer.concat([cipher.update(padded), cipher.final()]);
}

export function signParameters(secretB64: string, order: string, merchantParametersB64: string): string {
  return crypto.createHmac('sha256', deriveKey(secretB64, order)).update(merchantParametersB64).digest('base64');
}

/** Redsys devuelve la firma en base64 "url-safe" en las notificaciones: se normaliza antes de comparar. */
const normalizeB64 = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');

export function signaturesMatch(a: string, b: string): boolean {
  const x = Buffer.from(normalizeB64(a));
  const y = Buffer.from(normalizeB64(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Nº de pedido Redsys: 12 caracteres, los 4 primeros numéricos. */
export function newRedsysOrder(): string {
  const n = String(Date.now()).slice(-8);
  const r = crypto.randomInt(0, 10000).toString().padStart(4, '0');
  return `${r}${n}`;
}

export interface RedsysPaymentInput {
  order: string;
  amountEur: number;
  description: string;
  holder?: string;
  merchantUrl: string; // URL de notificación (webhook)
  urlOk: string;
  urlKo: string;
}

export function buildRedsysForm(cfg: RedsysConfig, p: RedsysPaymentInput) {
  const params = {
    DS_MERCHANT_AMOUNT: String(Math.round(p.amountEur * 100)),
    DS_MERCHANT_ORDER: p.order,
    DS_MERCHANT_MERCHANTCODE: cfg.merchantCode,
    DS_MERCHANT_CURRENCY: '978',
    DS_MERCHANT_TRANSACTIONTYPE: '0',
    DS_MERCHANT_TERMINAL: cfg.terminal,
    DS_MERCHANT_MERCHANTURL: p.merchantUrl,
    DS_MERCHANT_URLOK: p.urlOk,
    DS_MERCHANT_URLKO: p.urlKo,
    DS_MERCHANT_PRODUCTDESCRIPTION: p.description.slice(0, 125),
    DS_MERCHANT_TITULAR: (p.holder || '').slice(0, 60),
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
  };
  const merchantParameters = Buffer.from(JSON.stringify(params)).toString('base64');
  return {
    url: redsysUrl(cfg),
    fields: {
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: merchantParameters,
      Ds_Signature: signParameters(cfg.secretKey, p.order, merchantParameters),
    },
  };
}

export interface RedsysNotification {
  order: string;
  amountCents: number;
  response: number;
  approved: boolean;
  authCode: string | null;
}

/** Valida la firma de una notificación y devuelve sus datos; null si la firma o el formato no son válidos. */
export function parseRedsysNotification(
  cfg: RedsysConfig,
  merchantParametersB64: string,
  signature: string
): RedsysNotification | null {
  try {
    const decoded = JSON.parse(Buffer.from(normalizeB64(merchantParametersB64), 'base64').toString('utf8'));
    // Los nombres de los parámetros de respuesta varían de mayúsculas (Ds_Order / DS_ORDER).
    const get = (k: string) => {
      const key = Object.keys(decoded).find((x) => x.toLowerCase() === k.toLowerCase());
      return key ? String(decoded[key]) : '';
    };
    const order = get('Ds_Order');
    if (!order || !signature) return null;
    // Se firma sobre la cadena recibida tal cual (base64 estándar).
    const expected = signParameters(cfg.secretKey, order, merchantParametersB64);
    if (!signaturesMatch(expected, signature)) return null;
    const response = parseInt(get('Ds_Response'), 10);
    return {
      order,
      amountCents: parseInt(get('Ds_Amount'), 10),
      response,
      approved: Number.isFinite(response) && response >= 0 && response <= 99,
      authCode: get('Ds_AuthorisationCode') || null,
    };
  } catch {
    return null;
  }
}
