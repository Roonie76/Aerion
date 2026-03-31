import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  cancelMyOrderController,
  createOrderController,
  getMyOrderController,
  listMyOrdersController,
} from './orders.controller.js';
import { validateCreateOrderBody, validateOrderParams } from './orders.validators.js';

const router = Router();

router.use(authenticate);
router.get('/', listMyOrdersController);
router.get('/my', listMyOrdersController);
router.get('/:orderId', validate({ params: validateOrderParams }), getMyOrderController);
router.post('/', validate({ body: validateCreateOrderBody }), createOrderController);
router.patch('/:orderId/cancel', validate({ params: validateOrderParams }), cancelMyOrderController);

export default router;
