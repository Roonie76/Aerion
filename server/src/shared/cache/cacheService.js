import { createClient } from 'redis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let redisClientPromise;

async function getRedisClient() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const client = createClient({ url: env.REDIS_URL });
      client.on('error', (error) => {
        logger.error('Redis client error', { error: error.message });
      });
      await client.connect();
      logger.info('Redis cache connected');
      return client;
    })().catch((error) => {
      logger.warn('Redis unavailable, continuing without cache', { error: error.message });
      redisClientPromise = null;
      return null;
    });
  }

  return redisClientPromise;
}

export async function getJson(key) {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const raw = await client.get(key);
  return raw ? JSON.parse(raw) : null;
}

export async function setJson(key, value, ttlSeconds = 300) {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function deleteKeys(keys = []) {
  if (!keys.length) {
    return;
  }

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  await client.del(keys);
}

export async function invalidatePrefix(prefix) {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const keys = [];
  for await (const key of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
    keys.push(key);
  }

  if (keys.length) {
    await client.del(keys);
  }
}
