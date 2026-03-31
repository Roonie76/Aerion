import { withTransaction } from '../db/transaction.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { claimOutboxEvents, markOutboxFailed, markOutboxProcessed } from './outbox.repository.js';
import { handleOutboxEvent } from './processor.js';

let poller;

export async function processOutboxBatch() {
  const events = await withTransaction((client) => claimOutboxEvents(client, env.OUTBOX_BATCH_SIZE));

  for (const event of events) {
    try {
      await handleOutboxEvent(event);
      await withTransaction((client) => markOutboxProcessed(client, event.id));
    } catch (error) {
      logger.error('Outbox event processing failed', {
        eventId: event.id,
        eventType: event.event_type,
        error: error.message,
      });
      await withTransaction((client) => markOutboxFailed(client, event.id, error.message));
    }
  }
}

export function startOutboxWorker() {
  if (poller) {
    return;
  }

  poller = setInterval(() => {
    processOutboxBatch().catch((error) => {
      logger.error('Outbox worker batch failed', { error: error.message });
    });
  }, env.OUTBOX_POLL_INTERVAL_MS);

  logger.info('Outbox worker started', { intervalMs: env.OUTBOX_POLL_INTERVAL_MS });
}

export function stopOutboxWorker() {
  if (poller) {
    clearInterval(poller);
    poller = null;
  }
}
