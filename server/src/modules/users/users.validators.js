import { normalizeAddress } from '../../shared/utils/address.js';
import { requireString, requireUUID } from '../../shared/utils/validators.js';

export function validateProfileUpdateBody(body) {
  return {
    name: body.name ? requireString(body.name, 'name', { min: 2, max: 120 }) : null,
    phone: body.phone ? requireString(body.phone, 'phone', { min: 7, max: 30 }) : null,
  };
}

export function validateAddressBody(body) {
  return normalizeAddress(body);
}

export function validateAddressParams(params) {
  return {
    addressId: requireUUID(params.addressId, 'addressId'),
  };
}
