import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_ACCESS_TTL,
    }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      tokenType: 'refresh',
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_REFRESH_TTL,
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
