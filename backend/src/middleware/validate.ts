import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * Middleware générique de validation d'entrée (OWASP A03 - Injection / entrées non
 * validées). Toute route qui accepte un corps de requête DOIT passer par ce middleware
 * plutôt que de faire confiance directement à `req.body`.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const zodError = result.error as ZodError;
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Requête invalide',
        details: zodError.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
