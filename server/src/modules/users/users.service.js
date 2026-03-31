import { withTransaction } from '../../shared/db/transaction.js';
import { AppError } from '../../shared/utils/AppError.js';
import {
  clearDefaultAddressFlags,
  findAddressById,
  findUserById,
  insertAddress,
  listUserAddresses,
  listUsers,
  updateAddress,
  updateUserProfile,
} from './users.repository.js';

export async function getMyProfile(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const addresses = await listUserAddresses(userId);

  return {
    ...user,
    addresses,
  };
}

export async function updateMyProfile(userId, payload) {
  const user = await updateUserProfile(userId, payload);

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  return user;
}

export async function createMyAddress(userId, payload) {
  return withTransaction(async (client) => {
    await clearDefaultAddressFlags(client, userId, payload);
    return insertAddress(client, userId, payload);
  });
}

export async function updateMyAddress(userId, addressId, payload) {
  return withTransaction(async (client) => {
    const existing = await findAddressById(addressId, userId, client);

    if (!existing) {
      throw new AppError('Address not found.', 404, 'ADDRESS_NOT_FOUND');
    }

    await clearDefaultAddressFlags(client, userId, payload);
    return updateAddress(client, userId, addressId, payload);
  });
}

export async function listMyAddresses(userId) {
  return listUserAddresses(userId);
}

export async function listUsersForAdmin(options) {
  return listUsers(options);
}
