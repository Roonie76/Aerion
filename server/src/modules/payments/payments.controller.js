import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  createPaymentIntent,
  getPaymentConfiguration,
  handleRazorpayWebhook,
  verifyPaymentSignature,
} from './payments.service.js';

export const getPaymentKeyController = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: getPaymentConfiguration(),
  });
});

export const createPaymentIntentController = asyncHandler(async (req, res) => {
  const data = await createPaymentIntent(req.auth.userId, req.validated.body);
  res.status(201).json({ success: true, data });
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const data = await verifyPaymentSignature(req.validated.body);
  res.json({ success: true, data });
});

export const razorpayWebhookController = asyncHandler(async (req, res) => {
  const data = await handleRazorpayWebhook(req.body, req.headers['x-razorpay-signature'], req.headers);
  res.json({ success: true, data });
});
