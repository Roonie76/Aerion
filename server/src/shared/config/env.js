import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env'), quiet: true });
dotenv.config({ quiet: true });

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;

  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseNumber(process.env.PORT, 5000),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  APP_BASE_URL: process.env.APP_BASE_URL || `http://localhost:${parseNumber(process.env.PORT, 5000)}`,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  JWT_SECRET: required('JWT_SECRET', 'development-secret-change-me'),
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseNumber(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME || 'aerion',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_SSL: parseBoolean(process.env.DB_SSL, false),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  PAYMENTS_MOCK: parseBoolean(process.env.PAYMENTS_MOCK, false),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseNumber(process.env.SMTP_PORT, 587),
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@aerion.local',
  OPS_EMAIL: process.env.OPS_EMAIL || '',
  CRM_WEBHOOK_URL: process.env.CRM_WEBHOOK_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  OUTBOX_POLL_INTERVAL_MS: parseNumber(process.env.OUTBOX_POLL_INTERVAL_MS, 5000),
  OUTBOX_BATCH_SIZE: parseNumber(process.env.OUTBOX_BATCH_SIZE, 25),
  RESERVATION_TTL_MINUTES: parseNumber(process.env.RESERVATION_TTL_MINUTES, 15),
  RESERVATION_SWEEP_INTERVAL_MS: parseNumber(process.env.RESERVATION_SWEEP_INTERVAL_MS, 60000),
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME || 'aerion_access',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'aerion_refresh',
};

export function isProduction() {
  return env.NODE_ENV === 'production';
}
