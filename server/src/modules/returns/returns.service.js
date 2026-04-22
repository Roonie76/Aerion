import * as repo from './returns.repository.js';
import { decide } from './returns.llm.js';
import { sendEmail } from '../../shared/integrations/emailService.js';

function makeError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function handleRequest(orderId, type, customerMsg, userEmail, actorUserId = null) {
  const order = await repo.getOrderWithItems(orderId);
  if (!order) throw makeError('Order not found', 404);

  const existing = await repo.checkPendingRequest(orderId, type);
  if (existing) throw makeError('A pending request already exists for this order', 409);

  const request = await repo.createRequest(orderId, type, customerMsg);

  const decision = await decide(order, type, customerMsg);

  const resolved = await repo.resolveRequest(request.id, decision);

  if (decision.d === 'APPROVE') {
    const newStatus = type === 'cancel' ? 'cancelled' : 'return_initiated';
    await repo.updateOrderStatus(orderId, newStatus, actorUserId, `auto-${type}-approved`);
  }

  if (userEmail) {
    await sendEmail({
      to: userEmail,
      subject: `Your ${type} request — Order #${order.order_number}`,
      text: decision.msg,
    });
  }

  return {
    status: resolved.status,
    message: decision.msg,
    photoRequired: Boolean(decision.photo),
    requestId: request.id,
  };
}
