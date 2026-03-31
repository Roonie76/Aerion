import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

function getTokenFromRequest(req) {
  const authorization = req.headers.authorization;

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  return req.cookies?.[env.ACCESS_COOKIE_NAME] || null;
}

export function authenticate(req, _res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }

    const decoded = verifyToken(token);
    req.auth = {
      userId: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (_error) {
    next(new AppError('Invalid or expired access token.', 401, 'INVALID_TOKEN'));
  }
}
