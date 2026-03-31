import { requireString, requireUUID } from '../../shared/utils/validators.js';

export function validatePaymentIntentBody(body) {
  return {
    orderId: requireUUID(body.orderId, 'orderId'),
    idempotencyKey: body.idempotencyKey
      ? requireString(body.idempotencyKey, 'idempotencyKey', { min: 8, max: 120 })
      : null,
  };
}

export function validateVerifyPaymentBody(body) {
  return {
    razorpayOrderId: requireString(body.razorpayOrderId, 'razorpayOrderId', { min: 5, max: 120 }),
    razorpayPaymentId: requireString(body.razorpayPaymentId, 'razorpayPaymentId', { min: 5, max: 120 }),
    razorpaySignature: requireString(body.razorpaySignature, 'razorpaySignature', { min: 5, max: 255 }),
  };
}
