import { env, isProduction } from './env.js';

export function getAccessCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
    maxAge: 15 * 60 * 1000,
  };
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
