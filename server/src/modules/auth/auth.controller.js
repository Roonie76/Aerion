import { env } from '../../shared/config/env.js';
import { getAccessCookieOptions, getRefreshCookieOptions } from '../../shared/config/cookies.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { getCurrentUser, login, logout, refreshSession, register } from './auth.service.js';

function buildRequestMetadata(req) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

function attachAuthCookies(res, authPayload) {
  res.cookie(env.ACCESS_COOKIE_NAME, authPayload.accessToken, getAccessCookieOptions());
  res.cookie(env.REFRESH_COOKIE_NAME, authPayload.refreshToken, getRefreshCookieOptions());
}

function clearAuthCookies(res) {
  res.clearCookie(env.ACCESS_COOKIE_NAME, { ...getAccessCookieOptions(), maxAge: undefined });
  res.clearCookie(env.REFRESH_COOKIE_NAME, { ...getRefreshCookieOptions(), maxAge: undefined });
}

export const registerController = asyncHandler(async (req, res) => {
  const authPayload = await register(req.validated.body, buildRequestMetadata(req));
  attachAuthCookies(res, authPayload);

  res.status(201).json({
    success: true,
    data: authPayload,
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const authPayload = await login(req.validated.body, buildRequestMetadata(req));
  attachAuthCookies(res, authPayload);

  res.json({
    success: true,
    data: authPayload,
  });
});

export const refreshController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  const authPayload = await refreshSession(refreshToken, buildRequestMetadata(req));
  attachAuthCookies(res, authPayload);

  res.json({
    success: true,
    data: authPayload,
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  await logout(refreshToken);
  clearAuthCookies(res);

  res.json({
    success: true,
    data: { loggedOut: true },
  });
});

export const meController = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.auth.userId);
  res.json({
    success: true,
    data: user,
  });
});
