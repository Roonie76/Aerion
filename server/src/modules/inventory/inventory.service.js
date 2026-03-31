import { env } from '../../shared/config/env.js';
import {
  consumeReservations,
  lockInventoryRows,
  releaseActiveReservations,
  reserveInventory,
  restockConsumedReservations,
} from './inventory.repository.js';

export async function lockInventoryForItems(client, productIds) {
  return lockInventoryRows(client, productIds);
}

export async function reserveInventoryForOrder(client, orderId, items) {
  const expiresAt = new Date(Date.now() + env.RESERVATION_TTL_MINUTES * 60 * 1000);
  await reserveInventory(client, orderId, items, expiresAt);
  return expiresAt;
}

export async function consumeOrderReservations(client, orderId) {
  await consumeReservations(client, orderId);
}

export async function releaseOrderReservations(client, orderId) {
  await releaseActiveReservations(client, orderId);
}

export async function restockOrderInventory(client, orderId) {
  await restockConsumedReservations(client, orderId);
}
