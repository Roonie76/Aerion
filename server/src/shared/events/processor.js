import { EVENT_TYPES } from './eventTypes.js';
import { sendEmail } from '../integrations/emailService.js';
import { pushCrmEvent } from '../integrations/crmService.js';

function buildOrderCreatedEmail(payload) {
  return {
    subject: `Order ${payload.orderNumber} received`,
    text: `We received your order ${payload.orderNumber} for ${payload.totalAmount} ${payload.currency}.`,
    html: `<p>We received your order <strong>${payload.orderNumber}</strong> for ${payload.totalAmount} ${payload.currency}.</p>`,
  };
}

function buildPaymentSuccessEmail(payload) {
  return {
    subject: `Payment confirmed for ${payload.orderNumber}`,
    text: `Payment was confirmed for order ${payload.orderNumber}.`,
    html: `<p>Payment was confirmed for order <strong>${payload.orderNumber}</strong>.</p>`,
  };
}

export async function handleOutboxEvent(event) {
  const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

  switch (event.event_type) {
    case EVENT_TYPES.ORDER_CREATED: {
      if (payload.customerEmail) {
        const email = buildOrderCreatedEmail(payload);
        await sendEmail({ to: payload.customerEmail, ...email });
      }
      await pushCrmEvent(EVENT_TYPES.ORDER_CREATED, payload);
      break;
    }
    case EVENT_TYPES.PAYMENT_SUCCESS: {
      if (payload.customerEmail) {
        const email = buildPaymentSuccessEmail(payload);
        await sendEmail({ to: payload.customerEmail, ...email });
      }
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
