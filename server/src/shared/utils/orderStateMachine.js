import { AppError } from './AppError.js';

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const allowedTransitions = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export function assertValidOrderTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Invalid order transition from ${currentStatus} to ${nextStatus}.`,
      409,
      'INVALID_ORDER_TRANSITION'
    );
  }
}
