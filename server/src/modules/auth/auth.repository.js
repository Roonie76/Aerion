import { pool } from '../../shared/db/index.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeUser(row) {
  return mapUser(row);
}

export async function findUserAuthByEmail(email, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

export async function findUserAuthById(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

export async function createUser(client, { name, email, passwordHash, phone, role = 'user' }) {
  const { rows } = await client.query(
    `
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [name, email, passwordHash, phone || null, role]
  );

  return rows[0];
}

export async function createCartForUser(client, userId) {
  const { rows } = await client.query(
    `
      INSERT INTO carts (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
      RETURNING *
    `,
    [userId]
  );

  return rows[0];
}

export async function createRefreshTokenSession(
  client,
  { userId, tokenHash, expiresAt, userAgent, ipAddress }
) {
  const { rows } = await client.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [userId, tokenHash, expiresAt, userAgent || null, ipAddress || null]
  );

  return rows[0];
}

export async function findRefreshTokenSession(tokenHash, client = pool) {
  const { rows } = await client.query(
    `
      SELECT rt.*, u.id AS user_id, u.email, u.name, u.role, u.phone, u.is_active
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.token_hash = $1
        AND rt.revoked_at IS NULL
        AND rt.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
}

export async function revokeRefreshToken(tokenHash, client = pool) {
  await client.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}

export async function revokeRefreshTokenById(id, client = pool) {
  await client.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
        AND revoked_at IS NULL
    `,
    [id]
  );
}

export async function revokeAllRefreshTokensForUser(userId, client = pool) {
  await client.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
    `,
    [userId]
  );
}
