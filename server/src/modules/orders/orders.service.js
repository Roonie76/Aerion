import { addOutboxEvent } from '../../shared/events/outbox.repository.js';
import { EVENT_TYPES } from '../../shared/events/eventTypes.js';
import { withTransaction } from '../../shared/db/transaction.js';
import { AppError } from '../../shared/utils/AppError.js';
import { generateNumericSuffix } from '../../shared/utils/crypto.js';
import { assertValidOrderTransition, ORDER_STATUS, PAYMENT_STATUS } from '../../shared/utils/orderStateMachine.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.js';
import { clearCartItems } from '../cart/cart.repository.js';
import { lockInventoryForItems, releaseOrderReservations, reserveInventoryForOrder, restockOrderInventory } from '../inventory/inventory.service.js';
import { findAddressById, findUserById } from '../users/users.repository.js';
import {
  addOrderHistory,
  createOrder,
  createOrderItems,
  findCouponByCode,
  getAnalytics,
  getCartForCheckout,
  getCouponUsage,
  getOrderById,
  getOrderByIdForUser,
  getOrderForUpdate,
  getOrderItems,
  insertCouponRedemption,
  listAdminOrders,
  listOrdersForUser,
  updateOrder,
} from './orders.repository.js';

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `AER-${datePart}-${generateNumericSuffix(6)}`;
}

function calculateDiscount(subtotalAmount, coupon) {
  if (!coupon) {
    return 0;
  }

  if (coupon.discount_type === 'percent') {
    const computed = (subtotalAmount * Number(coupon.value)) / 100;
    const maxDiscount = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : computed;
    return Math.min(computed, maxDiscount);
  }

  return Math.min(Number(coupon.value), subtotalAmount);
}

async function resolveShippingAddress(client, userId, payload) {
  if (payload.shippingAddressId) {
    const address = await findAddressById(payload.shippingAddressId, userId, client);

    if (!address) {
      throw new AppError('Shipping address not found.', 404, 'ADDRESS_NOT_FOUND');
    }

    return address;
  }

  return payload.shippingAddress;
}

async function buildCouponContext(client, couponCode, userId, subtotalAmount) {
  if (!couponCode) {
    return { coupon: null, discountAmount: 0 };
  }

  const coupon = await findCouponByCode(couponCode, client);

  if (!coupon) {
    throw new AppError('Coupon not found or inactive.', 404, 'COUPON_NOT_FOUND');
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    throw new AppError('Coupon is not active yet.', 400, 'COUPON_NOT_ACTIVE');
  }

  if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) {
    throw new AppError('Coupon has expired.', 400, 'COUPON_EXPIRED');
  }

  if (subtotalAmount < Number(coupon.min_order_amount)) {
    throw new AppError('Coupon minimum order amount not met.', 400, 'COUPON_MINIMUM_NOT_MET');
  }

  const usage = await getCouponUsage(coupon.id, userId, client);

  if (coupon.usage_limit !== null && usage.total >= coupon.usage_limit) {
    throw new AppError('Coupon usage limit exceeded.', 400, 'COUPON_USAGE_LIMIT');
  }

  if (coupon.per_user_limit !== null && usage.perUser >= coupon.per_user_limit) {
    throw new AppError('Coupon already used.', 400, 'COUPON_ALREADY_USED');
  }

  return {
    coupon,
    discountAmount: calculateDiscount(subtotalAmount, coupon),
  };
}

function buildCheckoutItems(cartItems) {
  return cartItems.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    taxAmount: 0,
    lineTotal: item.price * item.quantity,
    snapshot: {
      slug: item.slug,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      attributes: item.attributes,
    },
  }));
}

async function loadOrderDetail(orderId, userId = null, client = undefined) {
  const order = userId ? await getOrderByIdForUser(orderId, userId, client) : await getOrderById(orderId, client);

  if (!order) {
    throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
  }

  const items = await getOrderItems(orderId, client);

  return {
    ...order,
    items,
  };
}

export async function createOrderFromCart(userId, payload) {
  return withTransaction(async (client) => {
    const user = await findUserById(userId, client);

    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const cartItems = await getCartForCheckout(userId, client);

    if (!cartItems.length) {
      throw new AppError('Cart is empty.', 400, 'CART_EMPTY');
    }

    if (cartItems.some((item) => !item.isActive)) {
      throw new AppError('Inactive products cannot be ordered.', 400, 'INACTIVE_PRODUCT_IN_CART');
    }

    await lockInventoryForItems(
      client,
      cartItems.map((item) => item.productId)
    );

    const shippingAddress = await resolveShippingAddress(client, userId, payload);
    const billingAddress = payload.billingAddress || shippingAddress;
    const checkoutItems = buildCheckoutItems(cartItems);
    const subtotalAmount = checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingAmount = 0;
    const taxAmount = 0;
    const { coupon, discountAmount } = await buildCouponContext(client, payload.couponCode, userId, subtotalAmount);
    const totalAmount = subtotalAmount - discountAmount + shippingAmount + taxAmount;

    const orderRecord = await createOrder(client, {
      orderNumber: generateOrderNumber(),
      userId,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      currency: 'INR',
      subtotalAmount,
      discountAmount,
      shippingAmount,
      taxAmount,
      totalAmount,
      couponId: coupon?.id || null,
      couponCode: coupon?.code || null,
      shippingAddress,
      billingAddress,
      notes: payload.notes,
      paymentProvider: payload.paymentProvider,
    });

    await createOrderItems(client, orderRecord.id, checkoutItems);
    await reserveInventoryForOrder(client, orderRecord.id, checkoutItems);
    await addOrderHistory(client, {
      orderId: orderRecord.id,
      fromStatus: null,
      toStatus: ORDER_STATUS.PENDING,
      actorUserId: userId,
      note: 'Order created from cart',
    });

    if (coupon) {
      await insertCouponRedemption(client, coupon.id, userId, orderRecord.id);
    }

    if (cartItems[0]?.cartId) {
      await clearCartItems(client, cartItems[0].cartId);
    }

    await addOutboxEvent(client, {
      aggregateType: 'order',
      aggregateId: orderRecord.id,
      eventType: EVENT_TYPES.ORDER_CREATED,
      payload: {
        orderId: orderRecord.id,
        orderNumber: orderRecord.order_number,
        totalAmount,
        currency: 'INR',
        customerEmail: user.email,
      },
    });

    return loadOrderDetail(orderRecord.id, null, client);
  });
}

export async function listMyOrders(userId) {
  const orders = await listOrdersForUser(userId);
  return Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await getOrderItems(order.id),
    }))
  );
}

export async function getMyOrder(userId, orderId) {
  return loadOrderDetail(orderId, userId);
}

async function updateOrderStatusInternal(client, order, nextStatus, actorUserId, note) {
  assertValidOrderTransition(order.status, nextStatus);

  if (nextStatus === ORDER_STATUS.CONFIRMED && order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw new AppError('Paid status is required before confirming the order.', 409, 'PAYMENT_REQUIRED');
  }

  if (nextStatus === ORDER_STATUS.CANCELLED) {
    if (order.status === ORDER_STATUS.PENDING) {
      await releaseOrderReservations(client, order.id);
    } else if (order.status === ORDER_STATUS.CONFIRMED) {
      await restockOrderInventory(client, order.id);
    }
  }

  const updatedOrder = await updateOrder(client, order.id, {
    status: nextStatus,
    cancelledAt: nextStatus === ORDER_STATUS.CANCELLED ? new Date() : null,
  });

  await addOrderHistory(client, {
    orderId: order.id,
    fromStatus: order.status,
    toStatus: nextStatus,
    actorUserId,
    note,
  });

  await addOutboxEvent(client, {
    aggregateType: 'order',
    aggregateId: order.id,
    eventType: nextStatus === ORDER_STATUS.CANCELLED ? EVENT_TYPES.ORDER_CANCELLED : EVENT_TYPES.ORDER_STATUS_UPDATED,
    payload: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      status: nextStatus,
      customerEmail: order.customerEmail,
    },
  });

  return updatedOrder;
}

export async function cancelMyOrder(userId, orderId) {
  return withTransaction(async (client) => {
    const order = await getOrderForUpdate(orderId, client);

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new AppError('Only pending orders can be cancelled by the customer.', 409, 'ORDER_NOT_CANCELLABLE');
    }

    await updateOrderStatusInternal(client, order, ORDER_STATUS.CANCELLED, userId, 'Cancelled by customer');
    return loadOrderDetail(orderId, userId, client);
  });
}

export async function listOrdersForAdmin(query) {
  const result = await listAdminOrders(query);
  return {
    items: result.items,
    meta: buildPaginationMeta({ page: query.page, limit: query.limit, total: result.total }),
  };
}

export async function updateOrderStatusByAdmin(orderId, nextStatus, actorUserId, note) {
  return withTransaction(async (client) => {
    const order = await getOrderForUpdate(orderId, client);

    if (!order) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    await updateOrderStatusInternal(client, order, nextStatus, actorUserId, note || 'Updated by admin');
    return loadOrderDetail(orderId, null, client);
  });
}

export async function getAdminAnalytics() {
  return getAnalytics();
}
