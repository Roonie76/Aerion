import { pool } from '../../shared/db/index.js';

function mapOrder(row) {
  const shippingAddress = row.shipping_address
    ? {
        ...row.shipping_address,
        address:
          row.shipping_address.address ||
          [row.shipping_address.line1, row.shipping_address.line2, row.shipping_address.city, row.shipping_address.state, row.shipping_address.postalCode]
            .filter(Boolean)
            .join(', '),
      }
    : null;

  return {
    id: row.id,
    _id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    status: row.status,
    orderStatus: row.status,
    paymentStatus: row.payment_status,
    currency: row.currency,
    subtotalAmount: Number(row.subtotal_amount),
    discountAmount: Number(row.discount_amount),
    shippingAmount: Number(row.shipping_amount),
    taxAmount: Number(row.tax_amount),
    totalAmount: Number(row.total_amount),
    total: Number(row.total_amount),
    couponCode: row.coupon_code,
    shippingAddress,
    billingAddress: row.billing_address,
    notes: row.notes,
    paymentProvider: row.payment_provider,
    placedAt: row.placed_at,
    paymentConfirmedAt: row.payment_confirmed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
  };
}

function mapOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    sku: row.sku,
    productName: row.product_name,
    name: row.product_name,
    productSnapshot: row.product_snapshot,
    unitPrice: Number(row.unit_price),
    price: Number(row.unit_price),
    taxAmount: Number(row.tax_amount),
    quantity: Number(row.quantity),
    lineTotal: Number(row.line_total),
    image: row.product_snapshot?.imageUrl || null,
  };
}

export async function getCartForCheckout(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT
        c.id AS cart_id,
        ci.product_id,
        ci.quantity,
        p.sku,
        p.name,
        p.slug,
        p.description,
        p.category,
        p.image_url,
        p.attributes,
        p.price,
        p.is_active
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products p ON p.id = ci.product_id
      WHERE c.user_id = $1
      ORDER BY ci.created_at ASC
    `,
    [userId]
  );

  return rows.map((row) => ({
    cartId: row.cart_id,
    productId: row.product_id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    attributes: row.attributes || {},
    quantity: Number(row.quantity),
    price: Number(row.price),
    isActive: row.is_active,
  }));
}

export async function findCouponByCode(code, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM coupons
      WHERE code = $1
        AND is_active = TRUE
      LIMIT 1
    `,
    [code]
  );

  return rows[0] || null;
}

export async function getCouponUsage(couponId, userId, client = pool) {
  const [totalResult, userResult] = await Promise.all([
    client.query(`SELECT COUNT(*)::int AS total FROM coupon_redemptions WHERE coupon_id = $1`, [couponId]),
    client.query(
      `SELECT COUNT(*)::int AS total FROM coupon_redemptions WHERE coupon_id = $1 AND user_id = $2`,
      [couponId, userId]
    ),
  ]);

  return {
    total: totalResult.rows[0].total,
    perUser: userResult.rows[0].total,
  };
}

export async function createOrder(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO orders (
        order_number, user_id, status, payment_status, currency, subtotal_amount, discount_amount,
        shipping_amount, tax_amount, total_amount, coupon_id, coupon_code, shipping_address,
        billing_address, notes, payment_provider
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `,
    [
      payload.orderNumber,
      payload.userId,
      payload.status,
      payload.paymentStatus,
      payload.currency,
      payload.subtotalAmount,
      payload.discountAmount,
      payload.shippingAmount,
      payload.taxAmount,
      payload.totalAmount,
      payload.couponId,
      payload.couponCode,
      JSON.stringify(payload.shippingAddress),
      JSON.stringify(payload.billingAddress),
      payload.notes,
      payload.paymentProvider,
    ]
  );

  return rows[0];
}

export async function createOrderItems(client, orderId, items) {
  for (const item of items) {
    await client.query(
      `
        INSERT INTO order_items (
          order_id, product_id, sku, product_name, product_snapshot, unit_price, tax_amount, quantity, line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        orderId,
        item.productId,
        item.sku,
        item.name,
        JSON.stringify(item.snapshot),
        item.unitPrice,
        item.taxAmount,
        item.quantity,
        item.lineTotal,
      ]
    );
  }
}

export async function insertCouponRedemption(client, couponId, userId, orderId) {
  await client.query(
    `
      INSERT INTO coupon_redemptions (coupon_id, user_id, order_id)
      VALUES ($1, $2, $3)
    `,
    [couponId, userId, orderId]
  );
}

export async function addOrderHistory(client, { orderId, fromStatus, toStatus, actorUserId, note }) {
  await client.query(
    `
      INSERT INTO order_status_history (order_id, from_status, to_status, actor_user_id, note)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [orderId, fromStatus || null, toStatus, actorUserId || null, note || null]
  );
}

export async function getOrderById(orderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.id = $1
      LIMIT 1
    `,
    [orderId]
  );

  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getOrderItems(orderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
    `,
    [orderId]
  );

  return rows.map(mapOrderItem);
}

export async function getOrderByIdForUser(orderId, userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.id = $1 AND o.user_id = $2
      LIMIT 1
    `,
    [orderId, userId]
  );

  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getOrderForUpdate(orderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.id = $1
      LIMIT 1
      FOR UPDATE
    `,
    [orderId]
  );

  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function updateOrder(client, orderId, payload) {
  const { rows } = await client.query(
    `
      UPDATE orders
      SET status = COALESCE($2, status),
          payment_status = COALESCE($3, payment_status),
          payment_confirmed_at = COALESCE($4, payment_confirmed_at),
          cancelled_at = $5,
          notes = COALESCE($6, notes),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      orderId,
      payload.status || null,
      payload.paymentStatus || null,
      payload.paymentConfirmedAt || null,
      payload.cancelledAt || null,
      payload.notes || null,
    ]
  );

  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function listOrdersForUser(userId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `,
    [userId]
  );

  return rows.map(mapOrder);
}

export async function listAdminOrders(filters, client = pool) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`o.status = $${params.length}`);
  }

  if (filters.paymentStatus) {
    params.push(filters.paymentStatus);
    conditions.push(`o.payment_status = $${params.length}`);
  }

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`o.user_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await client.query(
    `
      SELECT COUNT(*)::int AS total
      FROM orders o
      ${whereClause}
    `,
    params
  );

  params.push(filters.limit);
  params.push(filters.offset);

  const { rows } = await client.query(
    `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `,
    params
  );

  return {
    items: rows.map(mapOrder),
    total: countResult.rows[0].total,
  };
}

export async function getAnalytics(client = pool) {
  const [summaryResult, statusResult] = await Promise.all([
    client.query(
      `
        SELECT
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_orders,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0)::numeric AS revenue
        FROM orders
      `
    ),
    client.query(
      `
        SELECT status, COUNT(*)::int AS total
        FROM orders
        GROUP BY status
      `
    ),
  ]);

  return {
    totalOrders: summaryResult.rows[0].total_orders,
    paidOrders: summaryResult.rows[0].paid_orders,
    revenue: Number(summaryResult.rows[0].revenue),
    statusBreakdown: statusResult.rows.reduce((accumulator, row) => {
      accumulator[row.status] = row.total;
      return accumulator;
    }, {}),
  };
}
