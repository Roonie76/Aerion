import bcrypt from 'bcryptjs';
import { withTransaction } from '../../shared/db/transaction.js';
import { AppError } from '../../shared/utils/AppError.js';
import { hashValue } from '../../shared/utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../../shared/utils/jwt.js';
import {
  createCartForUser,
  createRefreshTokenSession,
  createUser,
  findRefreshTokenSession,
  findUserAuthByEmail,
  findUserAuthById,
  revokeRefreshToken,
  revokeRefreshTokenById,
  serializeUser,
} from './auth.repository.js';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function buildAuthResponse(userRow) {
  const user = serializeUser(userRow);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

async function storeRefreshToken(client, user, refreshToken, metadata) {
  await createRefreshTokenSession(client, {
    userId: user.id,
    tokenHash: hashValue(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });
}

export async function register(payload, metadata) {
  return withTransaction(async (client) => {
    const existingUser = await findUserAuthByEmail(payload.email, client);

    if (existingUser) {
      throw new AppError('Email is already registered.', 409, 'EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await createUser(client, {
      name: payload.name,
      email: payload.email,
      passwordHash,
      phone: payload.phone,
    });

    await createCartForUser(client, user.id);

    const authPayload = buildAuthResponse(user);
    await storeRefreshToken(client, authPayload.user, authPayload.refreshToken, metadata);

    return authPayload;
  });
}

export async function login(payload, metadata) {
  return withTransaction(async (client) => {
    const user = await findUserAuthByEmail(payload.email, client);

    if (!user || !(await bcrypt.compare(payload.password, user.password_hash))) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active) {
      throw new AppError('Account is inactive.', 403, 'ACCOUNT_INACTIVE');
    }

    const authPayload = buildAuthResponse(user);
    await storeRefreshToken(client, authPayload.user, authPayload.refreshToken, metadata);

    return authPayload;
  });
}

export async function refreshSession(refreshToken, metadata) {
  let decoded;

  try {
    decoded = verifyToken(refreshToken);
  } catch (_error) {
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (decoded.tokenType !== 'refresh') {
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  return withTransaction(async (client) => {
    const session = await findRefreshTokenSession(hashValue(refreshToken), client);

    if (!session) {
      throw new AppError('Refresh token session not found.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await findUserAuthById(session.user_id, client);

    if (!user || !user.is_active) {
      throw new AppError('Account is inactive.', 403, 'ACCOUNT_INACTIVE');
    }

    await revokeRefreshTokenById(session.id, client);

    const authPayload = buildAuthResponse(user);
    await storeRefreshToken(client, authPayload.user, authPayload.refreshToken, metadata);

    return authPayload;
  });
}

export async function logout(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await revokeRefreshToken(hashValue(refreshToken));
}

export async function getCurrentUser(userId) {
  const user = await findUserAuthById(userId);

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  return serializeUser(user);
}
