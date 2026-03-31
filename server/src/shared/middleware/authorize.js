import { AppError } from '../utils/AppError.js';

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new AppError('Forbidden.', 403, 'FORBIDDEN'));
    }

    return next();
  };
}
