import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { asyncHandler } from '../middleware/asyncHandler.js';

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || Number(amount) <= 0) {
    const err = new Error('Valid amount is required.');
    err.statusCode = 400;
    throw err;
  }

  const client = getRazorpayClient();

  if (!client) {
    return res.json({
      success: true,
      mode: 'mock',
      data: {
        id: `mock_order_${Date.now()}`,
        amount: Number(amount),
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      },
    });
  }

  const order = await client.orders.create({
    amount: Number(amount),
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  });

  res.json({ success: true, mode: 'razorpay', data: order });
});

export const verifyPaymentSignature = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.json({ success: true, mode: 'mock', verified: true });
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

  res.json({
    success: true,
    mode: 'razorpay',
    verified: expected === razorpaySignature,
  });
});

export const getPublicKey = asyncHandler(async (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'mock_key' });
});
