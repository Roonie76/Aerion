import { parsePagination } from '../../shared/utils/pagination.js';
import {
  optionalNumber,
  requirePositiveInteger,
  requireString,
  requireUUID,
} from '../../shared/utils/validators.js';

export function validateProductQuery(query) {
  const pagination = parsePagination(query);

  return {
    ...pagination,
    search: query.search ? requireString(query.search, 'search', { min: 1, max: 100 }) : '',
    category: query.category ? requireString(query.category, 'category', { min: 1, max: 80 }) : '',
    minPrice: optionalNumber(query.minPrice, 'minPrice'),
    maxPrice: optionalNumber(query.maxPrice, 'maxPrice'),
    isActive:
      query.isActive === undefined ? true : ['1', 'true', 'yes'].includes(String(query.isActive).toLowerCase()),
  };
}

export function validateProductParams(params) {
  return {
    productId: params.productId,
  };
}

export function validateProductBody(body) {
  return {
    sku: requireString(body.sku, 'sku', { min: 2, max: 64 }).toUpperCase(),
    slug: requireString(body.slug, 'slug', { min: 2, max: 120 }).toLowerCase(),
    name: requireString(body.name, 'name', { min: 2, max: 150 }),
    category: requireString(body.category, 'category', { min: 2, max: 80 }),
    description: requireString(body.description, 'description', { min: 10, max: 4000 }),
    currency: body.currency ? requireString(body.currency, 'currency', { min: 3, max: 10 }).toUpperCase() : 'INR',
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice === undefined || body.compareAtPrice === null ? null : Number(body.compareAtPrice),
    imageUrl: body.imageUrl ? requireString(body.imageUrl, 'imageUrl', { min: 5, max: 2048 }) : null,
    attributes: typeof body.attributes === 'object' && body.attributes !== null ? body.attributes : {},
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    inventory: {
      availableQuantity: requirePositiveInteger(body.inventory?.availableQuantity ?? body.availableQuantity ?? 0, 'availableQuantity', {
        min: 0,
        max: 1000000,
      }),
      reorderThreshold: requirePositiveInteger(body.inventory?.reorderThreshold ?? body.reorderThreshold ?? 0, 'reorderThreshold', {
        min: 0,
        max: 100000,
      }),
    },
  };
}

export function validateProductUpdateBody(body) {
  return validateProductBody(body);
}
