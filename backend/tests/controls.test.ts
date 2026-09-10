import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { ControlService } from '../src/services/controlService';
import { ComplianceControl } from '../src/types';

function buildTestControls(): ComplianceControl[] {
  return [
    {
      id: 'ctrl-test-1',
      framework: 'OWASP_ASVS',
      code: 'V1.1.1',
      title: 'Contrôle de test 1',
      description: 'Description de test',
      status: 'NOT_STARTED',
      owner: null,
      lastReviewedAt: null,
    },
    {
      id: 'ctrl-test-2',
      framework: 'PCI_DSS',
      code: '1.1',
      title: 'Contrôle de test 2',
      description: 'Description de test 2',
      status: 'COMPLIANT',
      owner: 'equipe-test',
      lastReviewedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
}

describe('API /api/controls', () => {
  // Une instance fraîche du service (et donc de l'état en mémoire) avant chaque test :
  // les tests ne doivent jamais dépendre de l'ordre d'exécution des autres tests.
  let app: Express;

  beforeEach(() => {
    app = createApp(new ControlService(buildTestControls()));
  });

  it('GET /api/health renvoie UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'UP' });
  });

  it('liste tous les contrôles', async () => {
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filtre par statut', async () => {
    const res = await request(app).get('/api/controls?status=COMPLIANT');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('ctrl-test-2');
  });

  it('ignore un paramètre de filtre invalide plutôt que d’échouer', async () => {
    const res = await request(app).get('/api/controls?framework=NOT_A_FRAMEWORK');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2); // filtre non reconnu -> pas de filtrage, pas d'erreur 500
  });

  it('filtre par framework', async () => {
    const res = await request(app).get('/api/controls?framework=PCI_DSS');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('ctrl-test-2');
  });

  it('renvoie 404 sur un contrôle inconnu', async () => {
    const res = await request(app).get('/api/controls/inconnu');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('crée un nouveau contrôle', async () => {
    const res = await request(app).post('/api/controls').send({
      framework: 'OWASP_ASVS',
      code: 'V9.9.9',
      title: 'Nouveau contrôle',
      description: 'Une description suffisamment longue',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('NOT_STARTED');
    expect(res.body.id).toMatch(/^ctrl-/);
  });

  it('rejette une création avec un framework invalide', async () => {
    const res = await request(app).post('/api/controls').send({
      framework: 'ISO_27001', // non supporté
      code: 'X.1',
      title: 'Invalide',
      description: 'Une description suffisamment longue',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('met à jour le statut d’un contrôle existant', async () => {
    const res = await request(app)
      .patch('/api/controls/ctrl-test-1/status')
      .send({ status: 'COMPLIANT', owner: 'equipe-securite' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLIANT');
    expect(res.body.owner).toBe('equipe-securite');
    expect(res.body.lastReviewedAt).not.toBeNull();
  });

  it('renvoie 404 en mettant à jour un contrôle inconnu', async () => {
    const res = await request(app)
      .patch('/api/controls/inconnu/status')
      .send({ status: 'COMPLIANT' });
    expect(res.status).toBe(404);
  });

  it('renvoie un résumé cohérent', async () => {
    const res = await request(app).get('/api/controls/summary');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.byFramework.PCI_DSS).toBe(1);
    expect(res.body.byFramework.OWASP_ASVS).toBe(1);
  });
});
