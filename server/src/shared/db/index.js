import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const { Pool } = pg;

const pool = new Pool(
  env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
      }
);

pool.on('error', (error) => {
  logger.error('Unexpected PostgreSQL pool error', { error: error.message });
});

export { pool };

export async function query(text, params = [], client = pool) {
  return client.query(text, params);
}

export async function healthcheck() {
  await pool.query('SELECT 1');
}

export async function closePool() {
  await pool.end();
}
