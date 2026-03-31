import Razorpay from 'razorpay';
import { env } from '../config/env.js';

let razorpayClient;

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
}
