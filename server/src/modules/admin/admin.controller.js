import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.js';
import { listUsersForAdmin } from '../users/users.service.js';
import { getAdminAnalytics, listOrdersForAdmin, updateOrderStatusByAdmin } from '../orders/orders.service.js';

export const listAdminOrdersController = asyncHandler(async (req, res) => {
  const data = await listOrdersForAdmin(req.validated.query);
  res.json({ success: true, data });
});

export const updateAdminOrderController = asyncHandler(async (req, res) => {
  const data = await updateOrderStatusByAdmin(
    req.validated.params.orderId,
    req.validated.body.status,
    req.auth.userId,
    req.validated.body.note
  );
  res.json({ success: true, data });
});

export const listAdminUsersController = asyncHandler(async (req, res) => {
  const result = await listUsersForAdmin(req.validated.query);
  const data = {
    items: result.items,
    meta: buildPaginationMeta({
      page: req.validated.query.page,
      limit: req.validated.query.limit,
      total: result.total,
    }),
  };
  res.json({ success: true, data });
});

export const getAdminAnalyticsController = asyncHandler(async (_req, res) => {
  const data = await getAdminAnalytics();
  res.json({ success: true, data });
});
