import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPaymentSignature,
  getPublicKey,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/key', getPublicKey);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentSignature);

export default router;
