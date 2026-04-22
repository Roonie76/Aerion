import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import productsRoutes from '../modules/products/products.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import returnsRoutes from '../modules/returns/returns.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/admin', adminRoutes);
router.use('/returns', returnsRoutes);

export default router;
