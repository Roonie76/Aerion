import crypto from 'node:crypto';

export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function randomId(prefix = '') {
  return `${prefix}${crypto.randomUUID()}`;
}

export function generateNumericSuffix(length = 6) {
  const digits = '0123456789';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += digits[Math.floor(Math.random() * digits.length)];
  }

  return result;
}

export function constantTimeEquals(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

export function signHmacSha256(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
