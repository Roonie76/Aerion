import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const err = new Error('name, email, and password are required.');
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken({ id: user._id, role: user.role });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error('email and password are required.');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});
