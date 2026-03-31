import { parsePagination } from '../../shared/utils/pagination.js';
import { requireString, requireUUID } from '../../shared/utils/validators.js';
import { validateAdminOrderQuery, validateAdminOrderUpdateBody } from '../orders/orders.validators.js';

export { validateAdminOrderQuery, validateAdminOrderUpdateBody };

export function validateAdminOrderParams(params) {
  return {
    orderId: requireUUID(params.orderId, 'orderId'),
  };
}

export function validateAdminUserQuery(query) {
  const pagination = parsePagination(query);
  return {
    ...pagination,
    search: query.search ? requireString(query.search, 'search', { min: 1, max: 100 }) : '',
  };
}
