import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  // Prefer cookie-based token; fall back to Authorization header for API clients
  let token = req.cookies?.aerion_token;

  if (!token) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    const err = new Error('Not authorized, token missing.');
    err.statusCode = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const err = new Error('JWT_SECRET is not configured.');
    err.statusCode = 500;
    throw err;
  }

  const decoded = jwt.verify(token, secret);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const err = new Error('Not authorized, user not found.');
    err.statusCode = 401;
    throw err;
  }

  req.user = user;
  next();
});

export function adminOnly(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    const err = new Error('Admin access required.');
    err.statusCode = 403;
    throw err;
  }

  next();
}
