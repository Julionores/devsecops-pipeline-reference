import { NextFunction, Request, Response } from 'express';
import { ControlNotFoundError } from '../services/controlService';

/**
 * Gestionnaire d'erreurs central. Comme dans le projet SecureBank API du même portfolio :
 * jamais de stack trace ni de message d'erreur interne renvoyé tel quel au client
 * (OWASP A05 - Security Misconfiguration).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ControlNotFoundError) {
    res.status(404).json({ error: 'NOT_FOUND', message: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Erreur non gérée:', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json({ error: 'ROUTE_NOT_FOUND', message: `Route inconnue: ${req.method} ${req.path}` });
}
