import { Router } from 'express';
import {
  addToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/me', getMyCart);
router.post('/items', addToCart);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/clear', clearCart);

export default router;
