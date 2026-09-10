# ComplianceTracker — Frontend

Interface React/TypeScript/Vite consommant l'API `../backend`. Voir le
[README du projet](../README.md) pour le contexte global (ce frontend n'est qu'une moitié
du véhicule applicatif du pipeline CI/CD DevSecOps qui est le sujet réel de ce dépôt).

## Commandes

```bash
npm install
npm run dev             # serveur de dev sur http://localhost:5173
npm run build            # build de production (tsc -b && vite build)
npm run lint              # oxlint
npm run format             # vérification Prettier
npm run test                # tests (Vitest + Testing Library)
npm run test:coverage        # tests avec couverture
```

## Configuration

Copier `.env.example` vers `.env.local` et ajuster `VITE_API_BASE_URL` si l'API ne tourne
pas sur `http://localhost:3000`.
