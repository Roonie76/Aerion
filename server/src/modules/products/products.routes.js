import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController,
} from './products.controller.js';
import {
  validateProductBody,
  validateProductQuery,
  validateProductUpdateBody,
} from './products.validators.js';

const router = Router();

router.get('/', validate({ query: validateProductQuery }), listProductsController);
router.get('/:productId', getProductController);

router.post('/', authenticate, authorize('admin'), validate({ body: validateProductBody }), createProductController);
router.patch(
  '/:productId',
  authenticate,
  authorize('admin'),
  validate({ body: validateProductUpdateBody }),
  updateProductController
);
router.delete('/:productId', authenticate, authorize('admin'), deleteProductController);

export default router;
