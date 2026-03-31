import { AppError } from './AppError.js';

export function requireString(value, field, { min = 1, max = 255, allowEmpty = false } = {}) {
  if (typeof value !== 'string') {
    throw new AppError(`${field} must be a string.`, 400, 'VALIDATION_ERROR');
  }

  const normalized = value.trim();

  if (!allowEmpty && normalized.length < min) {
    throw new AppError(`${field} must be at least ${min} characters.`, 400, 'VALIDATION_ERROR');
  }

  if (normalized.length > max) {
    throw new AppError(`${field} must be at most ${max} characters.`, 400, 'VALIDATION_ERROR');
  }

  return normalized;
}

export function requireEmail(value, field = 'email') {
  const email = requireString(value, field, { min: 5, max: 255 }).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError(`${field} is invalid.`, 400, 'VALIDATION_ERROR');
  }

  return email;
}

export function requirePassword(value, field = 'password') {
  const password = requireString(value, field, { min: 8, max: 128, allowEmpty: false });

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(`${field} must contain letters and numbers.`, 400, 'VALIDATION_ERROR');
  }

  return password;
}

export function requireUUID(value, field) {
  const normalized = requireString(value, field, { min: 36, max: 36 });
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(normalized)) {
    throw new AppError(`${field} must be a valid UUID.`, 400, 'VALIDATION_ERROR');
  }

  return normalized;
}

export function requirePositiveInteger(value, field, { min = 1, max = 100000 } = {}) {
  const numberValue = Number.parseInt(value, 10);

  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw new AppError(`${field} must be an integer between ${min} and ${max}.`, 400, 'VALIDATION_ERROR');
  }

  return numberValue;
}

export function optionalNumber(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    throw new AppError(`${field} must be a number.`, 400, 'VALIDATION_ERROR');
  }

  return numericValue;
}
