import { pool } from '../../shared/db/index.js';

function mapProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    currency: row.currency,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    imageUrl: row.image_url,
    attributes: row.attributes || {},
    isActive: row.is_active,
    inventory: row.available_quantity !== undefined
      ? {
          availableQuantity: Number(row.available_quantity),
          reservedQuantity: Number(row.reserved_quantity),
          reorderThreshold: Number(row.reorder_threshold),
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildProductFilters(filters) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`p.category = $${params.length}`);
  }

  if (filters.isActive !== undefined) {
    params.push(filters.isActive);
    conditions.push(`p.is_active = $${params.length}`);
  }

  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    params.push(filters.minPrice);
    conditions.push(`p.price >= $${params.length}`);
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.push(filters.maxPrice);
    conditions.push(`p.price <= $${params.length}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

export async function listProducts(filters, client = pool) {
  const { whereClause, params } = buildProductFilters(filters);

  const countResult = await client.query(
    `SELECT COUNT(*)::int AS total FROM products p ${whereClause}`,
    params
  );

  const paginatedParams = [...params, filters.limit, filters.offset];
  const { rows } = await client.query(
    `
      SELECT p.*, i.available_quantity, i.reserved_quantity, i.reorder_threshold
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paginatedParams.length - 1}
      OFFSET $${paginatedParams.length}
    `,
    paginatedParams
  );

  return {
    items: rows.map(mapProduct),
    total: countResult.rows[0].total,
  };
}

export async function findProductByIdOrSlug(value, client = pool) {
  const { rows } = await client.query(
    `
      SELECT p.*, i.available_quantity, i.reserved_quantity, i.reorder_threshold
      FROM products p
      LEFT JOIN inventory i ON i.product_id = p.id
      WHERE p.id = $1 OR p.slug = $1
      LIMIT 1
    `,
    [value]
  );

  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function createProduct(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO products (
        sku, slug, name, category, description, currency, price, compare_at_price, image_url, attributes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [
      payload.sku,
      payload.slug,
      payload.name,
      payload.category,
      payload.description,
      payload.currency,
      payload.price,
      payload.compareAtPrice,
      payload.imageUrl,
      JSON.stringify(payload.attributes || {}),
      payload.isActive,
    ]
  );

  return rows[0];
}

export async function updateProduct(client, productId, payload) {
  const { rows } = await client.query(
    `
      UPDATE products
      SET sku = $2,
          slug = $3,
          name = $4,
          category = $5,
          description = $6,
          currency = $7,
          price = $8,
          compare_at_price = $9,
          image_url = $10,
          attributes = $11,
          is_active = $12,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      productId,
      payload.sku,
      payload.slug,
      payload.name,
      payload.category,
      payload.description,
      payload.currency,
      payload.price,
      payload.compareAtPrice,
      payload.imageUrl,
      JSON.stringify(payload.attributes || {}),
      payload.isActive,
    ]
  );

  return rows[0] || null;
}

export async function upsertInventory(client, productId, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO inventory (product_id, available_quantity, reserved_quantity, reorder_threshold)
      VALUES ($1, $2, 0, $3)
      ON CONFLICT (product_id)
      DO UPDATE SET available_quantity = $2, reorder_threshold = $3, updated_at = NOW()
      RETURNING *
    `,
    [productId, payload.availableQuantity, payload.reorderThreshold]
  );

  return rows[0];
}

export async function softDeleteProduct(client, productId) {
  const { rows } = await client.query(
    `
      UPDATE products
      SET is_active = FALSE,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [productId]
  );

  return rows[0] ? mapProduct(rows[0]) : null;
}
