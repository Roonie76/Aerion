import { addOutboxEvent } from '../../shared/events/outbox.repository.js';
import { EVENT_TYPES } from '../../shared/events/eventTypes.js';
import { withTransaction } from '../../shared/db/transaction.js';
import { env } from '../../shared/config/env.js';
import { AppError } from '../../shared/utils/AppError.js';
import { randomId, signHmacSha256 } from '../../shared/utils/crypto.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../../shared/utils/orderStateMachine.js';
import { getRazorpayClient, isRazorpayConfigured } from '../../shared/integrations/razorpayClient.js';
import { consumeOrderReservations } from '../inventory/inventory.service.js';
import { addOrderHistory, getOrderForUpdate, updateOrder } from '../orders/orders.repository.js';
import {
  countAttemptsForOrder,
  createPaymentAttempt,
  findAttemptByOrderAndKey,
  findAttemptByProviderOrderId,
  insertWebhookEvent,
  updatePaymentAttempt,
} from './payments.repository.js';

async function finalizeSuccessfulPayment(client, attempt, providerPaymentId, responsePayload) {
  const order = await getOrderForUpdate(attempt.orderId, client);

  if (!order) {
    throw new AppError('Order not found for payment.', 404, 'ORDER_NOT_FOUND');
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return order;
  }

  await updatePaymentAttempt(client, attempt.id, {
    providerPaymentId,
    status: PAYMENT_STATUS.PAID,
    responsePayload,
  });

  await consumeOrderReservations(client, order.id);
  await updateOrder(client, order.id, {
    status: ORDER_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentConfirmedAt: new Date(),
  });

  await addOrderHistory(client, {
    orderId: order.id,
    fromStatus: order.status,
    toStatus: ORDER_STATUS.CONFIRMED,
    actorUserId: null,
    note: 'Payment confirmed',
  });

  await addOutboxEvent(client, {
    aggregateType: 'order',
    aggregateId: order.id,
    eventType: EVENT_TYPES.PAYMENT_SUCCESS,
    payload: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      amount: order.totalAmount,
      currency: order.currency,
    },
  });

  return getOrderForUpdate(order.id, client);
}

export function getPaymentConfiguration() {
  return {
    keyId: env.RAZORPAY_KEY_ID || 'mock_key',
    mode: env.PAYMENTS_MOCK || !isRazorpayConfigured() ? 'mock' : 'live',
  };
}

export async function createPaymentIntent(userId, payload) {
  return withTransaction(async (client) => {
    const order = await getOrderForUpdate(payload.orderId, client);

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new AppError('Order is already paid.', 409, 'ORDER_ALREADY_PAID');
    }

    const idempotencyKey = payload.idempotencyKey || randomId('pay_');
    const existingAttempt = await findAttemptByOrderAndKey(order.id, idempotencyKey, client);

    if (existingAttempt) {
      return {
        mode: env.PAYMENTS_MOCK || !isRazorpayConfigured() ? 'mock' : 'live',
        attempt: existingAttempt,
        data: {
          id: existingAttempt.providerOrderId,
          amount: Math.round(existingAttempt.amount * 100),
          currency: existingAttempt.currency,
        },
      };
    }

    const amountInMinor = Math.round(Number(order.totalAmount) * 100);
    const attemptNumber = (await countAttemptsForOrder(order.id, client)) + 1;

    let providerOrder;
    if (env.PAYMENTS_MOCK || !isRazorpayConfigured()) {
      providerOrder = {
        id: randomId('mock_order_'),
        amount: amountInMinor,
        currency: order.currency,
        receipt: order.orderNumber,
      };
    } else {
      providerOrder = await getRazorpayClient().orders.create({
        amount: amountInMinor,
        currency: order.currency,
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
        },
      });
    }

    const attempt = await createPaymentAttempt(client, {
      orderId: order.id,
      provider: 'razorpay',
      attemptNumber,
      idempotencyKey,
      providerOrderId: providerOrder.id,
      amount: Number(order.totalAmount),
      currency: order.currency,
      status: 'created',
      requestPayload: {
        amount: amountInMinor,
        currency: order.currency,
      },
      responsePayload: providerOrder,
    });

    return {
      mode: env.PAYMENTS_MOCK || !isRazorpayConfigured() ? 'mock' : 'live',
      attempt,
      data: providerOrder,
    };
  });
}

export async function verifyPaymentSignature(payload) {
  const secret = env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new AppError('Razorpay secret is not configured.', 500, 'PAYMENT_PROVIDER_NOT_CONFIGURED');
  }

  const expectedSignature = signHmacSha256(
    `${payload.razorpayOrderId}|${payload.razorpayPaymentId}`,
    secret
  );

  if (expectedSignature !== payload.razorpaySignature) {
    throw new AppError('Payment signature verification failed.', 400, 'INVALID_PAYMENT_SIGNATURE');
  }

  return withTransaction(async (client) => {
    const attempt = await findAttemptByProviderOrderId(payload.razorpayOrderId, client);

    if (!attempt) {
      throw new AppError('Payment attempt not found.', 404, 'PAYMENT_ATTEMPT_NOT_FOUND');
    }

    const order = await finalizeSuccessfulPayment(client, attempt, payload.razorpayPaymentId, payload);

    return {
      verified: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
    };
  });
}

function extractWebhookDetails(event) {
  const paymentEntity = event?.payload?.payment?.entity;

  return {
    providerOrderId: paymentEntity?.order_id,
    providerPaymentId: paymentEntity?.id,
  };
}

export async function handleRazorpayWebhook(rawBody, signature, headers) {
  if (env.RAZORPAY_WEBHOOK_SECRET) {
    const expected = signHmacSha256(rawBody.toString(), env.RAZORPAY_WEBHOOK_SECRET);

    if (expected !== signature) {
      throw new AppError('Invalid webhook signature.', 400, 'INVALID_WEBHOOK_SIGNATURE');
    }
  }

  const event = JSON.parse(rawBody.toString());
  const providerEventId = headers['x-razorpay-event-id'] || `${event.event}:${extractWebhookDetails(event).providerPaymentId}`;

  return withTransaction(async (client) => {
    const inserted = await insertWebhookEvent(client, {
      provider: 'razorpay',
      providerEventId,
      signature,
      payload: event,
    });

    if (!inserted) {
      return { processed: true, deduplicated: true };
    }

    if (!['payment.captured', 'order.paid'].includes(event.event)) {
      return { processed: true, ignored: true };
    }

    const details = extractWebhookDetails(event);

    if (!details.providerOrderId) {
      return { processed: true, ignored: true };
    }

    const attempt = await findAttemptByProviderOrderId(details.providerOrderId, client);

    if (!attempt) {
      return { processed: true, ignored: true };
    }

    await finalizeSuccessfulPayment(client, attempt, details.providerPaymentId, event);

    return { processed: true };
  });
}
