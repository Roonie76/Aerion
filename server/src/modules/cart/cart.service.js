import { withTransaction } from '../../shared/db/transaction.js';
import { AppError } from '../../shared/utils/AppError.js';
import { findProductByIdOrSlug } from '../products/products.repository.js';
import {
  clearCartItems,
  deleteCartItem,
  ensureCart,
  findCartItem,
  getCartByUserId,
  setCartItemQuantity,
} from './cart.repository.js';

async function assertSellableProduct(productId, client) {
  const product = await findProductByIdOrSlug(productId, client);

  if (!product || !product.isActive) {
    throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  }

  return product;
}

export async function getCart(userId) {
  return getCartByUserId(userId);
}

export async function addItemToCart(userId, payload) {
  return withTransaction(async (client) => {
    const cart = await ensureCart(userId, client);
    await assertSellableProduct(payload.productId, client);
    const existing = await findCartItem(cart.id, payload.productId, client);
    const nextQuantity = Number(existing?.quantity || 0) + payload.quantity;
    await setCartItemQuantity(client, cart.id, payload.productId, nextQuantity);
    return getCartByUserId(userId, client);
  });
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  return withTransaction(async (client) => {
    const cart = await ensureCart(userId, client);
    await assertSellableProduct(productId, client);
    await setCartItemQuantity(client, cart.id, productId, quantity);
    return getCartByUserId(userId, client);
  });
}

export async function removeItemFromCart(userId, payload) {
  return withTransaction(async (client) => {
    const cart = await ensureCart(userId, client);
    const existing = await findCartItem(cart.id, payload.productId, client);

    if (!existing) {
      throw new AppError('Cart item not found.', 404, 'CART_ITEM_NOT_FOUND');
    }

    const nextQuantity = Number(existing.quantity) - payload.quantity;
    await setCartItemQuantity(client, cart.id, payload.productId, nextQuantity);
    return getCartByUserId(userId, client);
  });
}

export async function deleteItemFromCart(userId, productId) {
  return withTransaction(async (client) => {
    const cart = await ensureCart(userId, client);
    await deleteCartItem(client, cart.id, productId);
    return getCartByUserId(userId, client);
  });
}

export async function clearCart(userId) {
  return withTransaction(async (client) => {
    const cart = await ensureCart(userId, client);
    await clearCartItems(client, cart.id);
    return getCartByUserId(userId, client);
  });
}
