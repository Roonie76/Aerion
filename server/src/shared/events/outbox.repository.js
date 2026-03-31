export async function addOutboxEvent(client, { aggregateType, aggregateId, eventType, payload }) {
  await client.query(
    `
      INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
      VALUES ($1, $2, $3, $4)
    `,
    [aggregateType, aggregateId, eventType, JSON.stringify(payload)]
  );
}

export async function claimOutboxEvents(client, batchSize) {
  const { rows } = await client.query(
    `
      WITH claimed AS (
        SELECT id
        FROM outbox_events
        WHERE status = 'pending' AND available_at <= NOW()
        ORDER BY created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox_events
      SET status = 'processing'
      WHERE id IN (SELECT id FROM claimed)
      RETURNING *
    `,
    [batchSize]
  );

  return rows;
}

export async function markOutboxProcessed(client, id) {
  await client.query(
    `
      UPDATE outbox_events
      SET status = 'processed', processed_at = NOW(), last_error = NULL
      WHERE id = $1
    `,
    [id]
  );
}

export async function markOutboxFailed(client, id, errorMessage) {
  await client.query(
    `
      UPDATE outbox_events
      SET status = CASE WHEN retries >= 4 THEN 'failed' ELSE 'pending' END,
          retries = retries + 1,
          available_at = NOW() + INTERVAL '30 seconds',
          last_error = $2
      WHERE id = $1
    `,
    [id, errorMessage]
  );
}
