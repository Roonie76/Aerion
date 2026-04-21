import { EVENT_TYPES } from './eventTypes.js';
import { sendEmail } from '../integrations/emailService.js';
import { pushCrmEvent } from '../integrations/crmService.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const BRAND = 'Aerion';
const SUPPORT_EMAIL = 'aerionsports@gmail.com';

function money(amount, currency) {
  const sym = currency === 'INR' ? '₹' : (currency ? currency + ' ' : '');
  const n = Number(amount) || 0;
  return sym + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderAddressBlock(address) {
  if (!address || typeof address !== 'object') return '';
  const lines = [
    address.recipientName || address.name || address.fullName,
    address.line1 || address.addressLine1,
    address.line2 || address.addressLine2,
    [address.city, address.state, address.postalCode || address.pincode].filter(Boolean).join(', '),
    address.country,
    address.phone,
  ].filter(Boolean);
  if (!lines.length) return '';
  return lines.map((l) => `<div>${escapeHtml(String(l))}</div>`).join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function itemsRows(items, currency) {
  if (!items || !items.length) return '';
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(it.name || '')}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${Number(it.quantity) || 0}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${money(it.unitPrice, currency)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${money(it.lineTotal, currency)}</td>
      </tr>`
    )
    .join('');
}

function totalsBlock(p) {
  const c = p.currency || 'INR';
  const rows = [];
  if (p.subtotalAmount != null) rows.push(['Subtotal', money(p.subtotalAmount, c)]);
  if (p.discountAmount && Number(p.discountAmount) > 0) rows.push(['Discount', '-' + money(p.discountAmount, c)]);
  if (p.shippingAmount != null) rows.push(['Shipping', Number(p.shippingAmount) === 0 ? 'Free' : money(p.shippingAmount, c)]);
  if (p.taxAmount && Number(p.taxAmount) > 0) rows.push(['Tax', money(p.taxAmount, c)]);
  const total = p.totalAmount != null ? p.totalAmount : p.amount;
  rows.push(['<strong>Total</strong>', '<strong>' + money(total, c) + '</strong>']);
  return rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:6px 8px;text-align:right;color:#555;">${k}</td>
        <td style="padding:6px 8px;text-align:right;width:140px;">${v}</td>
      </tr>`
    )
    .join('');
}

function shell(innerHtml, heading) {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ece9e0;">
        <tr><td style="background:#0b0b0d;color:#c9a84c;padding:20px 28px;letter-spacing:0.3em;font-size:14px;font-weight:800;">${escapeHtml(BRAND)}</td></tr>
        <tr><td style="padding:28px;">
          <h2 style="margin:0 0 16px 0;font-size:20px;color:#0b0b0d;">${escapeHtml(heading)}</h2>
          ${innerHtml}
          <p style="margin:28px 0 0 0;font-size:12px;color:#888;">Questions? Reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a84c;">${SUPPORT_EMAIL}</a>.</p>
        </td></tr>
        <tr><td style="background:#0b0b0d;color:#888;padding:14px 28px;font-size:11px;letter-spacing:0.2em;">&copy; ${new Date().getFullYear()} AERION</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildOrderCreatedCustomer(p) {
  const c = p.currency || 'INR';
  const addr = renderAddressBlock(p.shippingAddress);
  const inner = `
    <p style="margin:0 0 14px 0;color:#333;">Hi ${escapeHtml(p.customerName || 'there')},</p>
    <p style="margin:0 0 14px 0;color:#333;">We've received your order <strong>${escapeHtml(p.orderNumber)}</strong>. You'll receive another email once payment is confirmed and we start preparing it for dispatch.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left"  style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Item</th>
          <th align="center" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Qty</th>
          <th align="right" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Unit</th>
          <th align="right" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Line</th>
        </tr>
      </thead>
      <tbody>${itemsRows(p.items, c)}</tbody>
    </table>

    <table cellpadding="0" cellspacing="0" style="margin-left:auto;">${totalsBlock(p)}</table>

    ${addr ? `<div style="margin-top:24px;padding:14px;border:1px solid #eee;background:#fafafa;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#888;margin-bottom:6px;">SHIPPING TO</div>
      ${addr}
    </div>` : ''}
  `;
  return {
    subject: `Order received - ${p.orderNumber} | Aerion`,
    html: shell(inner, 'Order Received'),
    text: `We received your order ${p.orderNumber} for ${money(p.totalAmount || p.amount, c)}. You'll hear from us once payment is confirmed.`,
  };
}

function buildPaymentSuccessCustomer(p) {
  const c = p.currency || 'INR';
  const addr = renderAddressBlock(p.shippingAddress);
  const inner = `
    <p style="margin:0 0 14px 0;color:#333;">Hi ${escapeHtml(p.customerName || 'there')},</p>
    <p style="margin:0 0 14px 0;color:#333;">Your payment for order <strong>${escapeHtml(p.orderNumber)}</strong> has been confirmed. We're preparing your shuttles now.</p>

    ${p.items && p.items.length ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left"  style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Item</th>
          <th align="center" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Qty</th>
          <th align="right" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Unit</th>
          <th align="right" style="padding:10px 8px;border-bottom:2px solid #0b0b0d;font-size:12px;letter-spacing:0.1em;">Line</th>
        </tr>
      </thead>
      <tbody>${itemsRows(p.items, c)}</tbody>
    </table>` : ''}

    <table cellpadding="0" cellspacing="0" style="margin-left:auto;">${totalsBlock(p)}</table>

    ${p.providerPaymentId ? `<p style="margin:18px 0 0 0;font-size:12px;color:#888;">Razorpay payment id: <code>${escapeHtml(p.providerPaymentId)}</code></p>` : ''}

    ${addr ? `<div style="margin-top:24px;padding:14px;border:1px solid #eee;background:#fafafa;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#888;margin-bottom:6px;">SHIPPING TO</div>
      ${addr}
    </div>` : ''}
  `;
  return {
    subject: `Payment confirmed - ${p.orderNumber} | Aerion`,
    html: shell(inner, 'Payment Confirmed'),
    text: `Payment confirmed for order ${p.orderNumber}. Total: ${money(p.totalAmount || p.amount, c)}.`,
  };
}

function buildOpsNotification(eventType, p) {
  const c = p.currency || 'INR';
  const title = eventType === EVENT_TYPES.PAYMENT_SUCCESS ? 'Paid order - action needed' : 'New order received';
  const itemsFlat = (p.items || [])
    .map((it) => `- ${it.quantity} x ${it.name} (${money(it.unitPrice, c)})`)
    .join('\n');
  const addr = renderAddressBlock(p.shippingAddress);
  const inner = `
    <p style="margin:0 0 14px 0;color:#333;">Event: <strong>${escapeHtml(eventType)}</strong></p>
    <p style="margin:0 0 14px 0;color:#333;">Order: <strong>${escapeHtml(p.orderNumber)}</strong> &middot; Customer: ${escapeHtml(p.customerName || '-')} &lt;${escapeHtml(p.customerEmail || '-')}&gt;</p>
    ${p.items && p.items.length ? `<pre style="background:#fafafa;border:1px solid #eee;padding:12px;white-space:pre-wrap;font-family:Menlo,Consolas,monospace;font-size:12px;">${escapeHtml(itemsFlat)}</pre>` : ''}
    <table cellpadding="0" cellspacing="0" style="margin-left:auto;">${totalsBlock(p)}</table>
    ${addr ? `<div style="margin-top:20px;padding:12px;border:1px solid #eee;background:#fafafa;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#888;margin-bottom:6px;">SHIPPING TO</div>
      ${addr}
    </div>` : ''}
  `;
  return {
    subject: `[Aerion Ops] ${title} - ${p.orderNumber}`,
    html: shell(inner, title),
    text: `${title}\nOrder ${p.orderNumber}\nCustomer: ${p.customerName || '-'} <${p.customerEmail || '-'}>\nTotal: ${money(p.totalAmount || p.amount, c)}\n\n${itemsFlat}`,
  };
}

async function notifyOps(eventType, payload) {
  if (!env.OPS_EMAIL) return;
  try {
    const msg = buildOpsNotification(eventType, payload);
    await sendEmail({ to: env.OPS_EMAIL, ...msg });
  } catch (err) {
    logger.warn('Ops notification failed', { eventType, error: err?.message });
  }
}

export async function handleOutboxEvent(event) {
  const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

  switch (event.event_type) {
    case EVENT_TYPES.ORDER_CREATED: {
      if (payload.customerEmail) {
        const email = buildOrderCreatedCustomer(payload);
        await sendEmail({ to: payload.customerEmail, ...email });
      }
      await notifyOps(EVENT_TYPES.ORDER_CREATED, payload);
      await pushCrmEvent(EVENT_TYPES.ORDER_CREATED, payload);
      break;
    }
    case EVENT_TYPES.PAYMENT_SUCCESS: {
      if (payload.customerEmail) {
        const email = buildPaymentSuccessCustomer(payload);
        await sendEmail({ to: payload.customerEmail, ...email });
      }
      await notifyOps(EVENT_TYPES.PAYMENT_SUCCESS, payload);
      await pushCrmEvent(EVENT_TYPES.PAYMENT_SUCCESS, payload);
      break;
    }
    case EVENT_TYPES.ORDER_CANCELLED:
    case EVENT_TYPES.ORDER_STATUS_UPDATED: {
      await pushCrmEvent(event.event_type, payload);
      break;
    }
    default:
      break;
  }
}
