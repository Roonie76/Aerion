import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  addToCartController,
  clearCartController,
  deleteCartItemController,
  getCartController,
  removeFromCartController,
  updateCartItemController,
} from './cart.controller.js';
import { validateCartItemBody, validateCartParams, validateCartUpdateBody } from './cart.validators.js';

const router = Router();

router.use(authenticate);
router.get('/', getCartController);
router.post('/add', validate({ body: validateCartItemBody }), addToCartController);
router.post('/remove', validate({ body: validateCartItemBody }), removeFromCartController);
router.patch('/items/:productId', validate({ params: validateCartParams, body: validateCartUpdateBody }), updateCartItemController);
router.delete('/:productId', validate({ params: validateCartParams }), deleteCartItemController);
router.delete('/', clearCartController);

export default router;
