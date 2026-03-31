import { randomUUID } from 'node:crypto';

export function requestContext(req, _res, next) {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  next();
}
