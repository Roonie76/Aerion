import { pool } from '../../shared/db/index.js';

function mapPaymentAttempt(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    attemptNumber: row.attempt_number,
    idempotencyKey: row.idempotency_key,
    providerOrderId: row.provider_order_id,
    providerPaymentId: row.provider_payment_id,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    requestPayload: row.request_payload,
    responsePayload: row.response_payload,
    failureReason: row.failure_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAttemptByOrderAndKey(orderId, idempotencyKey, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM payment_attempts
      WHERE order_id = $1 AND idempotency_key = $2
      LIMIT 1
    `,
    [orderId, idempotencyKey]
  );

  return rows[0] ? mapPaymentAttempt(rows[0]) : null;
}

export async function countAttemptsForOrder(orderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT COUNT(*)::int AS total
      FROM payment_attempts
      WHERE order_id = $1
    `,
    [orderId]
  );

  return rows[0].total;
}

export async function createPaymentAttempt(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO payment_attempts (
        order_id, provider, attempt_number, idempotency_key, provider_order_id, provider_payment_id,
        amount, currency, status, request_payload, response_payload, failure_reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    [
      payload.orderId,
      payload.provider,
      payload.attemptNumber,
      payload.idempotencyKey,
      payload.providerOrderId || null,
      payload.providerPaymentId || null,
      payload.amount,
      payload.currency,
      payload.status,
      JSON.stringify(payload.requestPayload || {}),
      JSON.stringify(payload.responsePayload || {}),
      payload.failureReason || null,
    ]
  );

  return mapPaymentAttempt(rows[0]);
}

export async function updatePaymentAttempt(client, attemptId, payload) {
  const { rows } = await client.query(
    `
      UPDATE payment_attempts
      SET provider_order_id = COALESCE($2, provider_order_id),
          provider_payment_id = COALESCE($3, provider_payment_id),
          status = COALESCE($4, status),
          request_payload = COALESCE($5, request_payload),
          response_payload = COALESCE($6, response_payload),
          failure_reason = COALESCE($7, failure_reason),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      attemptId,
      payload.providerOrderId || null,
      payload.providerPaymentId || null,
      payload.status || null,
      payload.requestPayload ? JSON.stringify(payload.requestPayload) : null,
      payload.responsePayload ? JSON.stringify(payload.responsePayload) : null,
      payload.failureReason || null,
    ]
  );

  return rows[0] ? mapPaymentAttempt(rows[0]) : null;
}

export async function findAttemptByProviderOrderId(providerOrderId, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM payment_attempts
      WHERE provider_order_id = $1
      LIMIT 1
    `,
    [providerOrderId]
  );

  return rows[0] ? mapPaymentAttempt(rows[0]) : null;
}

export async function insertWebhookEvent(client, payload) {
  const { rows } = await client.query(
    `
      INSERT INTO payment_webhooks (provider, provider_event_id, signature, payload, processed_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (provider, provider_event_id) DO NOTHING
      RETURNING *
    `,
    [payload.provider, payload.providerEventId, payload.signature, JSON.stringify(payload.payload)]
  );

  return rows[0] || null;
}
