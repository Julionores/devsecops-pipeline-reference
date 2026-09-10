import { Request, Router } from 'express';
import { z } from 'zod';
import { ControlService } from '../services/controlService';
import { validateBody } from '../middleware/validate';

const frameworkEnum = z.enum(['OWASP_ASVS', 'PCI_DSS']);
const statusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT']);

const createControlSchema = z.object({
  framework: frameworkEnum,
  code: z.string().min(1).max(20),
  title: z.string().min(3).max(150),
  description: z.string().min(3).max(1000),
  owner: z.string().max(100).nullable().optional(),
});

const updateStatusSchema = z.object({
  status: statusEnum,
  owner: z.string().max(100).nullable().optional(),
});

export function createControlsRouter(service: ControlService): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const framework = frameworkEnum.optional().safeParse(req.query.framework).data;
    const status = statusEnum.optional().safeParse(req.query.status).data;
    res.json(service.list({ framework, status }));
  });

  router.get('/summary', (_req, res) => {
    res.json(service.summary());
  });

  router.get('/:id', (req: Request<{ id: string }>, res, next) => {
    try {
      res.json(service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.post('/', validateBody(createControlSchema), (req, res) => {
    const created = service.create(req.body);
    res.status(201).json(created);
  });

  router.patch(
    '/:id/status',
    validateBody(updateStatusSchema),
    (req: Request<{ id: string }>, res, next) => {
      try {
        const updated = service.updateStatus(req.params.id, req.body);
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
