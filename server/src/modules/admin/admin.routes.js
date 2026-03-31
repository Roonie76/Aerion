import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  getAdminAnalyticsController,
  listAdminOrdersController,
  listAdminUsersController,
  updateAdminOrderController,
} from './admin.controller.js';
import {
  validateAdminOrderParams,
  validateAdminOrderQuery,
  validateAdminOrderUpdateBody,
  validateAdminUserQuery,
} from './admin.validators.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/orders', validate({ query: validateAdminOrderQuery }), listAdminOrdersController);
router.patch(
  '/orders/:orderId',
  validate({ params: validateAdminOrderParams, body: validateAdminOrderUpdateBody }),
  updateAdminOrderController
);
router.get('/users', validate({ query: validateAdminUserQuery }), listAdminUsersController);
router.get('/analytics', getAdminAnalyticsController);

export default router;
