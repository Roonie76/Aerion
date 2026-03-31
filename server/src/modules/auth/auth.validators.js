import { requireEmail, requirePassword, requireString } from '../../shared/utils/validators.js';

export function validateRegisterBody(body) {
  return {
    name: requireString(body.name, 'name', { min: 2, max: 120 }),
    email: requireEmail(body.email),
    password: requirePassword(body.password),
    phone: body.phone ? requireString(body.phone, 'phone', { min: 7, max: 30 }) : null,
  };
}

export function validateLoginBody(body) {
  return {
    email: requireEmail(body.email),
    password: requirePassword(body.password),
  };
}
