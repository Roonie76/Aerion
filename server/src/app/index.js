import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from '../shared/config/env.js';
import { notFound, errorHandler } from '../shared/middleware/errorHandler.js';
import { requestContext } from '../shared/middleware/requestContext.js';
import { requestLogger } from '../shared/middleware/requestLogger.js';
import apiRoutes from './routes.js';
import { razorpayWebhookController } from '../modules/payments/payments.controller.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(requestContext);
  app.post(`${env.API_PREFIX}/payments/webhooks/razorpay`, express.raw({ type: 'application/json' }), razorpayWebhookController);
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.get(`${env.API_PREFIX}/health`, (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
      },
    });
  });

  app.use(env.API_PREFIX, apiRoutes);

  if (env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
