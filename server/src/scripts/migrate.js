import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../shared/db/index.js';
import { logger } from '../shared/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const schemaPath = path.join(__dirname, '../../sql/schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(sql);
  logger.info('Database schema applied successfully');
  await pool.end();
}

run().catch(async (error) => {
  logger.error('Database migration failed', { error: error.message });
  await pool.end();
  process.exit(1);
});
