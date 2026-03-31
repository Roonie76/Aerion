import { AppError } from './AppError.js';

export function normalizeAddress(input) {
  if (!input || typeof input !== 'object') {
    throw new AppError('Address is required.', 400, 'ADDRESS_REQUIRED');
  }

  const address = {
    label: input.label?.trim() || 'primary',
    recipientName: input.recipientName?.trim(),
    phone: input.phone?.trim(),
    line1: input.line1?.trim(),
    line2: input.line2?.trim() || null,
    city: input.city?.trim(),
    state: input.state?.trim(),
    postalCode: input.postalCode?.trim(),
    country: input.country?.trim() || 'India',
    isDefaultShipping: Boolean(input.isDefaultShipping),
    isDefaultBilling: Boolean(input.isDefaultBilling),
  };

  const requiredFields = ['recipientName', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'];

  for (const field of requiredFields) {
    if (!address[field]) {
      throw new AppError(`Address field "${field}" is required.`, 400, 'INVALID_ADDRESS');
    }
  }

  return address;
}
