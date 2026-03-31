import { normalizeAddress } from '../../shared/utils/address.js';
import { parsePagination } from '../../shared/utils/pagination.js';
import { AppError } from '../../shared/utils/AppError.js';
import { ORDER_STATUS } from '../../shared/utils/orderStateMachine.js';
import { requireString, requireUUID } from '../../shared/utils/validators.js';

export function validateCreateOrderBody(body) {
  const shippingAddress = body.shippingAddressId ? null : normalizeAddress(body.shippingAddress);
  const billingAddress = body.billingAddress ? normalizeAddress(body.billingAddress) : shippingAddress;

  return {
    shippingAddressId: body.shippingAddressId ? requireUUID(body.shippingAddressId, 'shippingAddressId') : null,
    shippingAddress,
    billingAddress,
    couponCode: body.couponCode ? requireString(body.couponCode, 'couponCode', { min: 3, max: 50 }).toUpperCase() : null,
    notes: body.notes ? requireString(body.notes, 'notes', { min: 1, max: 500 }) : null,
    paymentProvider: 'razorpay',
  };
}

export function validateOrderParams(params) {
  return {
    orderId: requireUUID(params.orderId, 'orderId'),
  };
}

export function validateAdminOrderUpdateBody(body) {
  const nextStatus = requireString(body.status, 'status', { min: 3, max: 30 }).toLowerCase();
  const allowedStatuses = Object.values(ORDER_STATUS);

  if (!allowedStatuses.includes(nextStatus)) {
    throw new AppError(`status must be one of: ${allowedStatuses.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  return {
    status: nextStatus,
    note: body.note ? requireString(body.note, 'note', { min: 1, max: 500 }) : null,
  };
}

export function validateOrderListQuery(query) {
  return parsePagination(query);
}

export function validateAdminOrderQuery(query) {
  const pagination = parsePagination(query);

  return {
    ...pagination,
    status: query.status ? requireString(query.status, 'status', { min: 3, max: 30 }).toLowerCase() : '',
    paymentStatus: query.paymentStatus
      ? requireString(query.paymentStatus, 'paymentStatus', { min: 3, max: 30 }).toLowerCase()
      : '',
    userId: query.userId ? requireUUID(query.userId, 'userId') : '',
  };
}
