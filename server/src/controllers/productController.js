import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getProducts = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.activeOnly !== 'false') {
    query.isActive = true;
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: product });
});
