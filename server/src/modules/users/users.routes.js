import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createMyAddressController,
  getMyProfileController,
  listMyAddressesController,
  updateMyAddressController,
  updateMyProfileController,
} from './users.controller.js';
import { validateAddressBody, validateAddressParams, validateProfileUpdateBody } from './users.validators.js';

const router = Router();

router.use(authenticate);
router.get('/me', getMyProfileController);
router.patch('/me', validate({ body: validateProfileUpdateBody }), updateMyProfileController);
router.get('/me/addresses', listMyAddressesController);
router.post('/me/addresses', validate({ body: validateAddressBody }), createMyAddressController);
router.patch(
  '/me/addresses/:addressId',
  validate({ params: validateAddressParams, body: validateAddressBody }),
  updateMyAddressController
);

export default router;
