import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import {
  createMyAddress,
  getMyProfile,
  listMyAddresses,
  updateMyAddress,
  updateMyProfile,
} from './users.service.js';

export const getMyProfileController = asyncHandler(async (req, res) => {
  const data = await getMyProfile(req.auth.userId);
  res.json({ success: true, data });
});

export const updateMyProfileController = asyncHandler(async (req, res) => {
  const data = await updateMyProfile(req.auth.userId, req.validated.body);
  res.json({ success: true, data });
});

export const listMyAddressesController = asyncHandler(async (req, res) => {
  const data = await listMyAddresses(req.auth.userId);
  res.json({ success: true, data });
});

export const createMyAddressController = asyncHandler(async (req, res) => {
  const data = await createMyAddress(req.auth.userId, req.validated.body);
  res.status(201).json({ success: true, data });
});

export const updateMyAddressController = asyncHandler(async (req, res) => {
  const data = await updateMyAddress(req.auth.userId, req.validated.params.addressId, req.validated.body);
  res.json({ success: true, data });
});
