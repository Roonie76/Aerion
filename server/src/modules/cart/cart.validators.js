import { requirePositiveInteger, requireUUID } from '../../shared/utils/validators.js';

export function validateCartItemBody(body) {
  return {
    productId: requireUUID(body.productId, 'productId'),
    quantity: requirePositiveInteger(body.quantity ?? 1, 'quantity', { min: 1, max: 100 }),
  };
}

export function validateCartUpdateBody(body) {
  return {
    quantity: requirePositiveInteger(body.quantity, 'quantity', { min: 1, max: 100 }),
  };
}

export function validateCartParams(params) {
  return {
    productId: requireUUID(params.productId, 'productId'),
  };
}
