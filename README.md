# DevSecOps Pipeline Reference — ComplianceTracker

[![CI - Intégration Continue DevSecOps](https://github.com/Julionores/devsecops-pipeline-reference/actions/workflows/ci.yml/badge.svg)](https://github.com/Julionores/devsecops-pipeline-reference/actions/workflows/ci.yml)

Une chaîne CI/CD DevSecOps de référence, volontairement exhaustive, appliquée à une petite
application web full-stack (TypeScript / React / Express). L'application — un outil de suivi
de contrôles de conformité OWASP ASVS / PCI-DSS — est le **véhicule** ; le pipeline qui la
construit, la sécurise et la déploie est le **véritable sujet** de ce projet.

> Projet réalisé par **Junior Tsafack Megnekeu** ([blog.jtmcloud.com](https://blog.jtmcloud.com) ·
> [GitHub](https://github.com/Julionores) ·
> [LinkedIn](https://www.linkedin.com/in/junior-tsafack-megnekeu-b673151b9)) — pièce d'un
> portfolio technique orienté Full Stack / DevSecOps pour le secteur bancaire. Voir aussi
> [`securebank-api`](https://github.com/Julionores/securebank-api), qui applique une version
> plus ciblée de la même discipline de sécurité à une API bancaire.

## Pourquoi ce projet

La plupart des pipelines CI qu'on trouve en exemple se limitent à "build + test". Un poste
de "DevOps Architect" en environnement bancaire attend davantage : sécurité du code (SAST),
sécurité des dépendances (SCA, licences, SBOM), sécurité de l'infrastructure (IaC), sécurité
de l'image (scan de conteneur, signature), sécurité à l'exécution (DAST), et un déploiement
continu qui reste sous contrôle humain avant la production. Ce projet assemble ces briques
dans un seul pipeline lisible, avec pour chaque étape une justification écrite plutôt qu'un
outil ajouté pour la forme — voir [`docs/pipeline-architecture.md`](docs/pipeline-architecture.md)
pour le détail complet, étape par étape.

## Ce que couvre le pipeline

**CI** (`.github/workflows/ci.yml`) : lint + typage + tests unitaires (backend et frontend
indépendamment) · scan de secrets (Gitleaks) · SAST double-moteur (Semgrep + CodeQL) · SCA
(`npm audit` + Dependency Review) · conformité des licences open source · génération de SBOM
(CycloneDX) · scan d'infrastructure as code (Checkov sur Dockerfiles/Kubernetes) ·
lint de Dockerfile (Hadolint) · build et publication d'image (GHCR) · scan de vulnérabilités
d'image (Trivy) · signature keyless et attestation de provenance SLSA (Sigstore/cosign).

**CD** (`.github/workflows/cd.yml`) : déploiement automatique en staging · DAST (OWASP ZAP)
contre l'environnement déployé · smoke tests · **gate d'approbation manuelle** (GitHub
Environments) avant toute mise en production · déploiement en production · notification
Slack · mécanisme de rollback via `workflow_dispatch`.

## L'application (ComplianceTracker)

Une petite API (Node.js/Express/TypeScript) et une interface (React/TypeScript/Vite) pour
suivre l'état de contrôles de conformité (OWASP ASVS, PCI-DSS) : liste filtrable, changement
de statut, résumé agrégé. Suffisamment réaliste pour donner du sens aux étapes du pipeline
(tests, build, image à sécuriser), suffisamment simple pour ne pas détourner l'attention de
l'objectif réel du projet.

```
backend/    API Express + TypeScript (Jest, Supertest)
frontend/   Interface React + TypeScript + Vite (Vitest, Testing Library)
infra/      docker-compose de production + manifestes Kubernetes d'exemple
.github/    Workflows CI/CD, Dependabot, CODEOWNERS
docs/       Détail du pipeline
```

## Démarrage local

```bash
# Backend
cd backend && npm install && npm run dev      # http://localhost:3000

# Frontend (dans un autre terminal)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

Ou avec Docker :

```bash
docker compose up --build
# Frontend : http://localhost:8080 — API : http://localhost:3000
```

## Vérification effectuée avant publication

Contrairement à un simple squelette, le code applicatif de ce dépôt a été **réellement
installé, linté, typé, testé et buildé** avant publication (environnement avec accès complet
au registre npm) :

| | Lint | Types | Tests | Build |
|---|---|---|---|---|
| Backend | ✅ ESLint | ✅ tsc strict | ✅ 11/11 (Jest) | ✅ |
| Frontend | ✅ oxlint | ✅ tsc strict | ✅ 4/4 (Vitest) | ✅ |

En revanche, la construction des images Docker et l'exécution complète des workflows GitHub
Actions (`build-images`, `scan-images`, `deploy-staging`, `deploy-production`) n'ont pas pu
être testées dans l'environnement de rédaction (pas d'accès à Docker Hub/GHCR ni à un hôte de
staging réel). Leur syntaxe YAML a été validée automatiquement ; leur exécution réelle reste
à vérifier au premier push sur GitHub, secrets renseignés (voir la liste dans
[`docs/pipeline-architecture.md`](docs/pipeline-architecture.md#secrets-requis)).

## Configuration requise pour un déploiement réel

1. Renseigner les secrets listés dans `docs/pipeline-architecture.md` (accès SSH staging/prod, webhook Slack).
2. Remplacer `OWNER/REPO` dans `infra/docker-compose.prod.yml` par le chemin réel du dépôt GHCR.
3. Créer les environnements GitHub `staging` et `production` (Settings → Environments), et
   ajouter au moins un reviewer requis sur `production` pour activer la gate manuelle.
4. Adapter les URLs `staging.compliance-tracker.example.com` / `compliance-tracker.example.com`
   dans `cd.yml` à vos noms de domaine réels.

## Licence

MIT — voir [`LICENSE`](LICENSE). Projet à but pédagogique et de démonstration.
