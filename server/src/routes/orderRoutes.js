import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
