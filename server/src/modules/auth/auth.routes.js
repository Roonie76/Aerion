import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authRateLimiter } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
} from './auth.controller.js';
import { validateLoginBody, validateRegisterBody } from './auth.validators.js';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: validateRegisterBody }), registerController);
router.post('/login', authRateLimiter, validate({ body: validateLoginBody }), loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', authenticate, meController);

export default router;
