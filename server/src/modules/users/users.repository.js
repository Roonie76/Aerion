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

function mapAddress(row) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserById(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return mapUser(rows[0]);
}

export async function updateUserProfile(userId, payload, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET name = COALESCE($2, name),
          phone = COALESCE($3, phone),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [userId, payload.name || null, payload.phone || null]
  );

  return mapUser(rows[0]);
}

export async function listUserAddresses(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows.map(mapAddress);
}

export async function insertAddress(client, userId, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO user_addresses (
        user_id, label, recipient_name, phone, line1, line2, city, state, postal_code, country,
        is_default_shipping, is_default_billing
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    [
      userId,
      payload.label,
      payload.recipientName,
      payload.phone,
      payload.line1,
      payload.line2,
      payload.city,
      payload.state,
      payload.postalCode,
      payload.country,
      payload.isDefaultShipping,
      payload.isDefaultBilling,
    ]
  );

  return mapAddress(rows[0]);
}

export async function updateAddress(client, userId, addressId, payload) {
  const { rows } = await client.query(
    `
      UPDATE user_addresses
      SET label = $3,
          recipient_name = $4,
          phone = $5,
          line1 = $6,
          line2 = $7,
          city = $8,
          state = $9,
          postal_code = $10,
          country = $11,
          is_default_shipping = $12,
          is_default_billing = $13,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [
      addressId,
      userId,
      payload.label,
      payload.recipientName,
      payload.phone,
      payload.line1,
      payload.line2,
      payload.city,
      payload.state,
      payload.postalCode,
      payload.country,
      payload.isDefaultShipping,
      payload.isDefaultBilling,
    ]
  );

  return mapAddress(rows[0]);
}

export async function clearDefaultAddressFlags(client, userId, payload) {
  const updates = [];
  const params = [userId];

  if (payload.isDefaultShipping) {
    updates.push('is_default_shipping = FALSE');
  }

  if (payload.isDefaultBilling) {
    updates.push('is_default_billing = FALSE');
  }

  if (!updates.length) {
    return;
  }

  await client.query(
    `
      UPDATE user_addresses
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
    `,
    params
  );
}

export async function findAddressById(addressId, userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM user_addresses
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [addressId, userId]
  );

  return rows[0] ? mapAddress(rows[0]) : null;
}

export async function listUsers({ limit, offset, search }, client = pool) {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await client.query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, params);

  params.push(limit);
  params.push(offset);

  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `,
    params
  );

  return {
    items: rows.map(mapUser),
    total: countResult.rows[0].total,
  };
}
