import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
}

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, data: cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    const err = new Error('Valid productId is required.');
    err.statusCode = 400;
    throw err;
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const err = new Error('Product unavailable.');
    err.statusCode = 404;
    throw err;
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += Number(quantity);
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: Number(quantity),
    });
  }

  cart.recalculate();
  await cart.save();

  res.json({ success: true, data: cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId) || !Number.isFinite(Number(quantity))) {
    const err = new Error('Valid product id and quantity are required.');
    err.statusCode = 400;
    throw err;
  }

  const cart = await getOrCreateCart(req.user._id);
  const index = cart.items.findIndex((item) => item.product.toString() === productId);

  if (index < 0) {
    const err = new Error('Cart item not found.');
    err.statusCode = 404;
    throw err;
  }

  if (Number(quantity) <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = Number(quantity);
  }

  cart.recalculate();
  await cart.save();

  res.json({ success: true, data: cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    const err = new Error('Valid product id is required.');
    err.statusCode = 400;
    throw err;
  }

  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  cart.recalculate();
  await cart.save();

  res.json({ success: true, data: cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.recalculate();
  await cart.save();

  res.json({ success: true, data: cart });
});
