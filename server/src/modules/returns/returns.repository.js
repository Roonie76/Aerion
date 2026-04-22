import { pool } from '../../shared/db/index.js';

export async function getOrderWithItems(orderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT o.*,
        u.email AS customer_email,
        u.name  AS customer_name,
        (
          SELECT sh.created_at
          FROM order_status_history sh
          WHERE sh.order_id = o.id AND sh.to_status = 'delivered'
          ORDER BY sh.created_at DESC
          LIMIT 1
        ) AS delivered_at,
        STRING_AGG(p.name || ' x' || oi.quantity, ', ') AS items
      FROM orders o
      LEFT JOIN users u       ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p    ON p.id = oi.product_id
      WHERE o.id = $1
      GROUP BY o.id, u.email, u.name
      LIMIT 1
    `,
    [orderId]
  );
  return rows[0] ?? null;
}

export async function checkPendingRequest(orderId, type, client = pool) {
  const { rows } = await client.query(
    `
      SELECT id FROM order_requests
      WHERE order_id = $1 AND type = $2 AND status IN ('pending','info_needed')
      LIMIT 1
    `,
    [orderId, type]
  );
  return rows[0] ?? null;
}

export async function createRequest(orderId, type, customerMsg, client = pool) {
  const { rows } = await client.query(
    `
      INSERT INTO order_requests (order_id, type, customer_msg)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [orderId, type, customerMsg]
  );
  return rows[0];
}

function statusFromDecision(d) {
  if (d === 'APPROVE') return 'approved';
  if (d === 'REJECT') return 'rejected';
  return 'info_needed';
}

export async function resolveRequest(requestId, decision, client = pool) {
  const status = statusFromDecision(decision.d);
  const { rows } = await client.query(
    `
      UPDATE order_requests SET
        status         = $2,
        llm_decision   = $3,
        llm_reason     = $4,
        customer_reply = $5,
        photo_needed   = $6,
        raw_llm_json   = $7,
        resolved_at    = CASE WHEN $2 <> 'info_needed' THEN NOW() ELSE NULL END
      WHERE id = $1
      RETURNING *
    `,
    [
      requestId,
      status,
      decision.d,
      decision.r,
      decision.msg,
      Boolean(decision.photo),
      JSON.stringify(decision),
    ]
  );
  return rows[0];
}

export async function updateOrderStatus(orderId, status, actorUserId = null, note = null, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE orders
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING status
    `,
    [orderId, status]
  );
  if (rows[0]) {
    await client.query(
      `
        INSERT INTO order_status_history (order_id, from_status, to_status, actor_user_id, note)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [orderId, null, status, actorUserId, note]
    );
  }
  return rows[0] ?? null;
}

export async function listRequests(status = null, client = pool) {
  const where = status ? 'WHERE r.status = $1' : '';
  const params = status ? [status] : [];
  const { rows } = await client.query(
    `
      SELECT r.*,
             o.order_number,
             o.status       AS order_status,
             o.total_amount
      FROM order_requests r
      JOIN orders o ON o.id = r.order_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT 100
    `,
    params
  );
  return rows;
}
