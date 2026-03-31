import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  createCatalogProduct,
  deleteCatalogProduct,
  getCatalogProduct,
  listCatalogProducts,
  updateCatalogProduct,
} from './products.service.js';

export const listProductsController = asyncHandler(async (req, res) => {
  const data = await listCatalogProducts(req.validated.query);
  res.json({ success: true, data });
});

export const getProductController = asyncHandler(async (req, res) => {
  const data = await getCatalogProduct(req.params.productId);
  res.json({ success: true, data });
});

export const createProductController = asyncHandler(async (req, res) => {
  const data = await createCatalogProduct(req.validated.body);
  res.status(201).json({ success: true, data });
});

export const updateProductController = asyncHandler(async (req, res) => {
  const data = await updateCatalogProduct(req.params.productId, req.validated.body);
  res.json({ success: true, data });
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const data = await deleteCatalogProduct(req.params.productId);
  res.json({ success: true, data });
});
