import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export async function pushCrmEvent(eventType, payload) {
  if (!env.CRM_WEBHOOK_URL) {
    logger.info('CRM sync skipped because webhook URL is not configured', { eventType });
    return { delivered: false };
  }

  const response = await fetch(env.CRM_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eventType, payload }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CRM webhook failed with ${response.status}: ${body}`);
  }

  return { delivered: true };
}
