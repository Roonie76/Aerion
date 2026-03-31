import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  addItemToCart,
  clearCart,
  deleteItemFromCart,
  getCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from './cart.service.js';

export const getCartController = asyncHandler(async (req, res) => {
  const data = await getCart(req.auth.userId);
  res.json({ success: true, data });
});

export const addToCartController = asyncHandler(async (req, res) => {
  const data = await addItemToCart(req.auth.userId, req.validated.body);
  res.json({ success: true, data });
});

export const updateCartItemController = asyncHandler(async (req, res) => {
  const data = await updateCartItemQuantity(
    req.auth.userId,
    req.validated.params.productId,
    req.validated.body.quantity
  );
  res.json({ success: true, data });
});

export const removeFromCartController = asyncHandler(async (req, res) => {
  const data = await removeItemFromCart(req.auth.userId, req.validated.body);
  res.json({ success: true, data });
});

export const deleteCartItemController = asyncHandler(async (req, res) => {
  const data = await deleteItemFromCart(req.auth.userId, req.validated.params.productId);
  res.json({ success: true, data });
});

export const clearCartController = asyncHandler(async (req, res) => {
  const data = await clearCart(req.auth.userId);
  res.json({ success: true, data });
});
