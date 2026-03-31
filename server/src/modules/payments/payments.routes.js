import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createPaymentIntentController,
  getPaymentKeyController,
  verifyPaymentController,
} from './payments.controller.js';
import { validatePaymentIntentBody, validateVerifyPaymentBody } from './payments.validators.js';

const router = Router();

router.get('/key', getPaymentKeyController);
router.post('/intents', authenticate, validate({ body: validatePaymentIntentBody }), createPaymentIntentController);
router.post('/create-order', authenticate, validate({ body: validatePaymentIntentBody }), createPaymentIntentController);
router.post('/verify', authenticate, validate({ body: validateVerifyPaymentBody }), verifyPaymentController);

export default router;
