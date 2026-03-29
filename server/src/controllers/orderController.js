import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const TAX_RATE = 0.12;

export const createOrder = asyncHandler(async (req, res) => {
  const { 
    shippingAddress, 
    paymentMethod, 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature 
  } = req.body;

  if (!shippingAddress || !paymentMethod) {
    const err = new Error('shippingAddress and paymentMethod are required.');
    err.statusCode = 400;
    throw err;
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty.');
    err.statusCode = 400;
    throw err;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const order = await Order.create({
    user: req.user._id,
    items: cart.items,
    shippingAddress,
    paymentMethod,
    subtotal,
    tax,
    total,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : (razorpayPaymentId ? 'paid' : 'pending'),
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  // Clear cart
  cart.items = [];
  cart.subtotal = 0;
  await cart.save();

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

  if (orderStatus) {
    order.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  res.json({ success: true, data: order });
});
