import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as service from './returns.service.js';
import * as repo from './returns.repository.js';

export const submitRequest = asyncHandler(async (req, res) => {
  const { orderId, type, message } = req.body ?? {};
  const userEmail = req.user?.email;
  const actorUserId = req.user?._id?.toString?.() ?? req.user?.id ?? null;

  if (!orderId || !type || !message) {
    return res.status(400).json({ error: 'orderId, type, and message are required' });
  }
  if (!['cancel', 'return'].includes(type)) {
    return res.status(400).json({ error: 'type must be cancel or return' });
  }

  const result = await service.handleRequest(orderId, type, message, userEmail, actorUserId);
  res.json(result);
});

export const adminList = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const requests = await repo.listRequests(status || null);
  res.json(requests);
});
