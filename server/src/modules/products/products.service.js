import { withTransaction } from '../../shared/db/transaction.js';
import { AppError } from '../../shared/utils/AppError.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.js';
import { getJson, invalidatePrefix, setJson } from '../../shared/cache/cacheService.js';
import {
  createProduct,
  findProductByIdOrSlug,
  listProducts,
  softDeleteProduct,
  updateProduct,
  upsertInventory,
} from './products.repository.js';

function validatePrice(payload) {
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new AppError('price must be a positive number.', 400, 'VALIDATION_ERROR');
  }

  if (payload.compareAtPrice !== null && (!Number.isFinite(payload.compareAtPrice) || payload.compareAtPrice < 0)) {
    throw new AppError('compareAtPrice must be a positive number.', 400, 'VALIDATION_ERROR');
  }
}

export async function listCatalogProducts(filters) {
  const cacheKey = `catalog:${JSON.stringify(filters)}`;
  const cached = await getJson(cacheKey);

  if (cached) {
    return cached;
  }

  const result = await listProducts(filters);
  const response = {
    items: result.items,
    meta: buildPaginationMeta({ page: filters.page, limit: filters.limit, total: result.total }),
  };

  await setJson(cacheKey, response, 120);
  return response;
}

export async function getCatalogProduct(productIdOrSlug) {
  const cacheKey = `product:${productIdOrSlug}`;
  const cached = await getJson(cacheKey);

  if (cached) {
    return cached;
  }

  const product = await findProductByIdOrSlug(productIdOrSlug);

  if (!product || !product.isActive) {
    throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  }

  await setJson(cacheKey, product, 300);
  return product;
}

export async function createCatalogProduct(payload) {
  validatePrice(payload);

  const product = await withTransaction(async (client) => {
    const created = await createProduct(client, payload);
    await upsertInventory(client, created.id, payload.inventory);
    return findProductByIdOrSlug(created.id, client);
  });

  await invalidatePrefix('catalog:');
  await invalidatePrefix('product:');
  return product;
}

export async function updateCatalogProduct(productId, payload) {
  validatePrice(payload);

  const product = await withTransaction(async (client) => {
    const updated = await updateProduct(client, productId, payload);

    if (!updated) {
      throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
    }

    await upsertInventory(client, productId, payload.inventory);
    return findProductByIdOrSlug(productId, client);
  });

  await invalidatePrefix('catalog:');
  await invalidatePrefix('product:');
  return product;
}

export async function deleteCatalogProduct(productId) {
  const product = await withTransaction(async (client) => {
    const deleted = await softDeleteProduct(client, productId);

    if (!deleted) {
      throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
    }

    return deleted;
  });

  await invalidatePrefix('catalog:');
  await invalidatePrefix('product:');
  return product;
}
