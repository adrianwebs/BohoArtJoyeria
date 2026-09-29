// Server-side PayPal REST client (Orders v2). The client secret never leaves the server.

function config() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const secret = process.env.PAYPAL_CLIENT_SECRET || '';
  const live = process.env.PAYPAL_MODE === 'live';
  return {
    clientId,
    secret,
    mode: live ? 'live' : 'sandbox',
    base: live ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
  };
}

export function getPaypalPublicConfig(): { clientId: string; mode: string } | null {
  const c = config();
  // 'sb' is PayPal's generic demo id; it cannot be used with server-side order creation.
  if (!c.clientId || c.clientId === 'sb' || !c.secret) return null;
  return { clientId: c.clientId, mode: c.mode };
}

export class PaypalError extends Error {
  constructor(message: string, public status = 502, public code?: string) {
    super(message);
  }
}

async function accessToken(): Promise<string> {
  const c = config();
  const res = await fetch(`${c.base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.clientId}:${c.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('PayPal auth failed', res.status, await res.text().catch(() => ''));
    throw new PaypalError('No se pudo conectar con PayPal');
  }
  return (await res.json()).access_token;
}

export async function createPaypalOrder(total: number, reference: string): Promise<string> {
  const token = await accessToken();
  const res = await fetch(`${config().base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: reference,
          description: 'Pedido Bohoart Jewelry',
          amount: { currency_code: 'EUR', value: total.toFixed(2) },
        },
      ],
      application_context: { shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW', locale: 'es-ES' },
    }),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    console.error('PayPal create order failed', res.status, JSON.stringify(data));
    throw new PaypalError('PayPal no pudo crear el pago');
  }
  return data.id as string;
}

export interface PaypalCapture {
  status: string;
  captureId: string | null;
  amount: number | null;
  currency: string | null;
}

export async function capturePaypalOrder(paypalOrderId: string): Promise<PaypalCapture> {
  const token = await accessToken();
  const res = await fetch(`${config().base}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issue = data?.details?.[0]?.issue as string | undefined;
    console.error('PayPal capture failed', res.status, JSON.stringify(data));
    if (issue === 'INSTRUMENT_DECLINED' || issue === 'PAYER_ACTION_REQUIRED') {
      throw new PaypalError('PayPal rechazó el método de pago. Prueba con otro.', 422, issue);
    }
    throw new PaypalError('No se pudo confirmar el pago con PayPal');
  }
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: capture?.status ?? data.status,
    captureId: capture?.id ?? null,
    amount: capture?.amount?.value != null ? Number(capture.amount.value) : null,
    currency: capture?.amount?.currency_code ?? null,
  };
}
