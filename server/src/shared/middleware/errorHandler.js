import { AppError, isAppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404, 'NOT_FOUND'));
}

export function errorHandler(error, req, res, _next) {
  const normalizedError = isAppError(error)
    ? error
    : new AppError(error.message || 'Internal server error', 500, 'INTERNAL_ERROR');

  logger.error('Request failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    error: normalizedError.message,
    code: normalizedError.code,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });

  res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    code: normalizedError.code,
    details: normalizedError.details,
    requestId: req.requestId,
  });
}
