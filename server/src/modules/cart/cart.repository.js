import { pool } from '../../shared/db/index.js';

function mapCartItem(row) {
  const unitPrice = Number(row.price);
  const quantity = Number(row.quantity);

  return {
    id: row.product_id,
    productId: row.product_id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url,
    unitPrice,
    quantity,
    lineTotal: unitPrice * quantity,
  };
}

export async function ensureCart(userId, client = pool) {
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

export async function getCartByUserId(userId, client = pool) {
  const cart = await ensureCart(userId, client);
  const { rows } = await client.query(
    `
      SELECT
        c.id AS cart_id,
        ci.product_id,
        ci.quantity,
        p.sku,
        p.slug,
        p.name,
        p.category,
        p.description,
        p.image_url,
        p.price
      FROM carts c
      LEFT JOIN cart_items ci ON ci.cart_id = c.id
      LEFT JOIN products p ON p.id = ci.product_id
      WHERE c.id = $1
      ORDER BY ci.created_at ASC
    `,
    [cart.id]
  );

  const items = rows.filter((row) => row.product_id).map(mapCartItem);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    userId,
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    },
  };
}

export async function findCartItem(cartId, productId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
      LIMIT 1
    `,
    [cartId, productId]
  );

  return rows[0] || null;
}

export async function setCartItemQuantity(client, cartId, productId, quantity) {
  if (quantity <= 0) {
    await client.query(
      `
        DELETE FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
      `,
      [cartId, productId]
    );
    return;
  }

  await client.query(
    `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
    `,
    [cartId, productId, quantity]
  );

  await client.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
}

export async function deleteCartItem(client, cartId, productId) {
  await client.query(
    `
      DELETE FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
    `,
    [cartId, productId]
  );

  await client.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
}

export async function clearCartItems(client, cartId) {
  await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
  await client.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
}
