import { AppError } from '../../shared/utils/AppError.js';

export async function lockInventoryRows(client, productIds) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM inventory
      WHERE product_id = ANY($1::uuid[])
      FOR UPDATE
    `,
    [productIds]
  );

  return rows;
}

export async function reserveInventory(client, orderId, items, expiresAt) {
  for (const item of items) {
    const updateResult = await client.query(
      `
        UPDATE inventory
        SET available_quantity = available_quantity - $2,
            reserved_quantity = reserved_quantity + $2,
            version = version + 1,
            updated_at = NOW()
        WHERE product_id = $1
          AND available_quantity >= $2
      `,
      [item.productId, item.quantity]
    );

    if (updateResult.rowCount === 0) {
      throw new AppError(`Insufficient stock for ${item.name}.`, 409, 'INSUFFICIENT_STOCK');
    }

    await client.query(
      `
        INSERT INTO inventory_reservations (order_id, product_id, quantity, status, expires_at)
        VALUES ($1, $2, $3, 'active', $4)
      `,
      [orderId, item.productId, item.quantity, expiresAt]
    );
  }
}

export async function consumeReservations(client, orderId) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM inventory_reservations
      WHERE order_id = $1
        AND status = 'active'
      FOR UPDATE
    `,
    [orderId]
  );

  for (const reservation of rows) {
    await client.query(
      `
        UPDATE inventory
        SET reserved_quantity = reserved_quantity - $2,
            version = version + 1,
            updated_at = NOW()
        WHERE product_id = $1
      `,
      [reservation.product_id, reservation.quantity]
    );

    await client.query(
      `
        UPDATE inventory_reservations
        SET status = 'consumed',
            consumed_at = NOW()
        WHERE id = $1
      `,
      [reservation.id]
    );
  }
}

export async function releaseActiveReservations(client, orderId) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM inventory_reservations
      WHERE order_id = $1
        AND status = 'active'
      FOR UPDATE
    `,
    [orderId]
  );

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
        SET status = 'released',
            released_at = NOW()
        WHERE id = $1
      `,
      [reservation.id]
    );
  }

  return rows.length;
}

export async function restockConsumedReservations(client, orderId) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM inventory_reservations
      WHERE order_id = $1
        AND status = 'consumed'
      FOR UPDATE
    `,
    [orderId]
  );

  for (const reservation of rows) {
    await client.query(
      `
        UPDATE inventory
        SET available_quantity = available_quantity + $2,
            version = version + 1,
            updated_at = NOW()
        WHERE product_id = $1
      `,
      [reservation.product_id, reservation.quantity]
    );

    await client.query(
      `
        UPDATE inventory_reservations
        SET status = 'restocked',
            released_at = NOW()
        WHERE id = $1
      `,
      [reservation.id]
    );
  }

  return rows.length;
}
