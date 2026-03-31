import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  cancelMyOrder,
  createOrderFromCart,
  getMyOrder,
  listMyOrders,
} from './orders.service.js';

export const createOrderController = asyncHandler(async (req, res) => {
  const data = await createOrderFromCart(req.auth.userId, req.validated.body);
  res.status(201).json({ success: true, data });
});

export const listMyOrdersController = asyncHandler(async (req, res) => {
  const data = await listMyOrders(req.auth.userId);
  res.json({ success: true, data });
});

export const getMyOrderController = asyncHandler(async (req, res) => {
  const data = await getMyOrder(req.auth.userId, req.validated.params.orderId);
  res.json({ success: true, data });
});

export const cancelMyOrderController = asyncHandler(async (req, res) => {
  const data = await cancelMyOrder(req.auth.userId, req.validated.params.orderId);
  res.json({ success: true, data });
});
