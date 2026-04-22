import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/authMiddleware.js';
import { submitRequest, adminList } from './returns.controller.js';

const router = Router();

router.post('/request', protect, submitRequest);
router.get('/admin', protect, adminOnly, adminList);

export default router;
