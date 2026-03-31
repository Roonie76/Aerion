import { withTransaction } from '../db/transaction.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { addOutboxEvent } from './outbox.repository.js';
import { EVENT_TYPES } from './eventTypes.js';

let sweeper;

async function releaseExpiredReservations() {
  await withTransaction(async (client) => {
    const { rows } = await client.query(
      `
        SELECT ir.id, ir.order_id, ir.product_id, ir.quantity, o.order_number, u.email AS customer_email
        FROM inventory_reservations ir
        JOIN orders o ON o.id = ir.order_id
        JOIN users u ON u.id = o.user_id
        WHERE ir.status = 'active' AND ir.expires_at <= NOW()
        FOR UPDATE SKIP LOCKED
      `
    );

    const impactedOrders = new Map();

    for (const reservation of rows) {
      await client.query(
        `
          UPDATE inventory
          SET available_quantity = available_quantity + $2,
              reserved_quantity = reserved_quantity - $2,
              version = version + 1,
              updated_at = NOW()
          WHERE product_id = $1
        `,
        [reservation.product_id, reservation.quantity]
      );

      await client.query(
        `
          UPDATE inventory_reservations
          SET status = 'expired', released_at = NOW()
          WHERE id = $1
        `,
        [reservation.id]
      );
      impactedOrders.set(reservation.order_id, {
        orderNumber: reservation.order_number,
        customerEmail: reservation.customer_email,
      });
    }

    for (const [orderId, orderMeta] of impactedOrders.entries()) {
      const updateResult = await client.query(
        `
          UPDATE orders
          SET status = 'cancelled',
              payment_status = CASE WHEN payment_status = 'pending' THEN 'failed' ELSE payment_status END,
              cancelled_at = NOW(),
              updated_at = NOW()
          WHERE id = $1 AND status = 'pending'
          RETURNING id
        `,
        [orderId]
      );

      if (updateResult.rowCount === 0) {
        continue;
      }

      await client.query(
        `
          INSERT INTO order_status_history (order_id, from_status, to_status, note)
          VALUES ($1, 'pending', 'cancelled', 'Reservation expired before payment completion')
        `,
        [orderId]
      );

      await addOutboxEvent(client, {
        aggregateType: 'order',
        aggregateId: orderId,
        eventType: EVENT_TYPES.ORDER_CANCELLED,
        payload: {
          orderId,
          orderNumber: orderMeta.orderNumber,
          previousStatus: 'pending',
          status: 'cancelled',
          customerEmail: orderMeta.customerEmail,
        },
      });
    }
  });
}

export function startReservationSweeper() {
  if (sweeper) {
    return;
  }

  sweeper = setInterval(() => {
    releaseExpiredReservations().catch((error) => {
      logger.error('Reservation sweeper failed', { error: error.message });
    });
  }, env.RESERVATION_SWEEP_INTERVAL_MS);

  logger.info('Reservation sweeper started', { intervalMs: env.RESERVATION_SWEEP_INTERVAL_MS });
}

export function stopReservationSweeper() {
  if (sweeper) {
    clearInterval(sweeper);
    sweeper = null;
  }
}
