import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createControlsRouter } from './routes/controls';
import { ControlService } from './services/controlService';

export function createApp(service: ControlService = new ControlService()): Express {
  const app = express();

  // OWASP A05 - en-têtes de sécurité HTTP par défaut (CSP, nosniff, HSTS, etc.)
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ALLOWED_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    }),
  );
  app.use(express.json({ limit: '100kb' })); // limite de taille - protection basique anti-DoS applicatif
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'UP' });
  });

  app.use('/api/controls', createControlsRouter(service));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
