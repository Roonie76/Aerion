import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const TAX_RATE = 0.12;

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return true; // mock mode — skip verification
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex');
  return expected === signature;
}

export const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!shippingAddress || !paymentMethod) {
    const err = new Error('shippingAddress and paymentMethod are required.');
    err.statusCode = 400;
    throw err;
  }

  // Verify Razorpay signature before trusting any payment status
  if (paymentMethod !== 'cod' && razorpayPaymentId) {
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      const err = new Error('Payment signature verification failed.');
      err.statusCode = 400;
      throw err;
    }
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty.');
    err.statusCode = 400;
    throw err;
  }

  // Fetch live prices from DB to prevent stale price exploits
  const productIds = cart.items.map((item) => item.product);
  const liveProducts = await Product.find({ _id: { $in: productIds } }).select('_id price name image isActive');

  const priceMap = new Map(liveProducts.map((p) => [p._id.toString(), p]));

  // Build order items with server-authoritative prices
  const orderItems = cart.items.map((item) => {
    const live = priceMap.get(item.product.toString());
    if (!live || !live.isActive) {
      const err = new Error(`Product "${item.name}" is no longer available.`);
      err.statusCode = 400;
      throw err;
    }
    return {
      product: live._id,
      name: item.name,
      image: item.image,
      price: live.price, // Always use live DB price, never trust cart snapshot
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const paymentStatus =
    paymentMethod === 'cod'
      ? 'pending'
      : razorpayPaymentId
        ? 'paid'
        : 'pending';

  // Use ACID transaction to prevent orphaned orders if cart clear fails
  const session = await mongoose.startSession();
  let order;

  await session.withTransaction(async () => {
    [order] = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          subtotal,
          tax,
          total,
          paymentStatus,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
      ],
      { session }
    );

    cart.items = [];
    cart.subtotal = 0;
    await cart.save({ session });
  });

  session.endSession();

  res.status(201).json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product');
  res.json({ success: true, data: orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');

  if (!order) {
    const err = new Error('Order not found.');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('Not authorized to view this order.');
    err.statusCode = 403;
    throw err;
  }

  res.json({ success: true, data: order });
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
  res.json({ success: true, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    const err = new Error('Order not found.');
    err.statusCode = 404;
    throw err;
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  res.json({ success: true, data: order });
});
