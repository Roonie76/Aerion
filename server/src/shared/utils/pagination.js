export function parsePagination(query = {}) {
  const page = Math.max(Number.parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || '10', 10), 1), 100);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
