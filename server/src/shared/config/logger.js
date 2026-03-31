import winston from 'winston';
import { env } from './env.js';

const transports = [
  new winston.transports.Console({
    format:
      env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const serializedMeta = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} ${level}: ${message}${serializedMeta}`;
            })
          ),
  }),
];

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'aerion-api' },
  transports,
});
