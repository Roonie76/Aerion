export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());

export const isIndianPhone = (v) =>
  /^[6-9]\d{9}$/.test((v || '').replace(/\s|-/g, '').replace(/^\+?91/, ''));

export const isPincode = (v) => /^[1-9]\d{5}$/.test((v || '').trim());

export const isNonEmpty = (v) => (v || '').trim().length > 0;

export const minLen = (n) => (v) => (v || '').length >= n;

export const isStrongPassword = (v) =>
  (v || '').length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

export function validate(values, schema) {
  const errors = {};

  Object.keys(schema).forEach((fieldName) => {
    const rules = Array.isArray(schema[fieldName]) ? schema[fieldName] : [schema[fieldName]];

    for (const rule of rules) {
      const validator = typeof rule === 'function' ? rule : rule?.test || rule?.validator;
      const message = typeof rule === 'string' ? rule : rule?.message || 'Invalid value.';

      if (typeof validator !== 'function') {
        continue;
      }

      if (!validator(values[fieldName], values)) {
        errors[fieldName] = message;
        break;
      }
    }
  });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
