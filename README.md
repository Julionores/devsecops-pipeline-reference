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
> plus ciblée de la même discipline de sécurité à une API bancaire, et
> [`postgresql-ha-repmgr`](https://github.com/Julionores/postgresql-ha-repmgr), un cluster
> PostgreSQL à haute disponibilité avec failover automatique, et
> [`iso27001-isms-toolkit`](https://github.com/Julionores/iso27001-isms-toolkit), un SGSI
> ISO 27001 avec contrôles AWS automatisés. Côté Cloud AWS, voir aussi
> [`dynamodb-streams-cdc-pipeline`](https://github.com/Julionores/dynamodb-streams-cdc-pipeline),
> [`aws-troubleshooting-challenge`](https://github.com/Julionores/aws-troubleshooting-challenge),
> [`s3-cross-region-replication`](https://github.com/Julionores/s3-cross-region-replication),
> [`aws-alb-deployment-patterns`](https://github.com/Julionores/aws-alb-deployment-patterns) et
> [`aws-vpc-connectivity-patterns`](https://github.com/Julionores/aws-vpc-connectivity-patterns).
> Côté Machine Learning, voir aussi [`gradientforge`](https://github.com/Julionores/gradientforge),
> [`radar-risque-impaye`](https://github.com/Julionores/radar-risque-impaye),
> [`collecte-agricole-planner`](https://github.com/Julionores/collecte-agricole-planner),
> [`ticket-tide`](https://github.com/Julionores/ticket-tide),
> [`inspectline`](https://github.com/Julionores/inspectline),
> [`runbook-rag`](https://github.com/Julionores/runbook-rag), un assistant documentaire RAG,
> et [`agent-matching-recrutement`](https://github.com/Julionores/agent-matching-recrutement),
> un agent à outils multiples avec relâchement de contraintes.

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

Le code applicatif a été **réellement installé, linté, typé, testé et buildé** en local avant
publication :

| | Lint | Types | Tests | Build |
|---|---|---|---|---|
| Backend | ✅ ESLint | ✅ tsc strict | ✅ 11/11 (Jest) | ✅ |
| Frontend | ✅ oxlint | ✅ tsc strict | ✅ 4/4 (Vitest) | ✅ |

Le pipeline CI (`ci.yml`) a ensuite été **exécuté pour de vrai sur GitHub Actions**, pas
seulement validé syntaxiquement — voir le badge en tête de ce README ou
[l'historique des runs](https://github.com/Julionores/devsecops-pipeline-reference/actions).
Plusieurs bugs réels, invisibles en local, n'ont été découverts qu'à ce moment-là et ont été
corrigés (historique des commits `fix:`) : incompatibilité de version Node pour jsdom, nom de
repository GHCR devant être en minuscules, permission GitHub manquante pour l'attestation
SLSA, framework Checkov retiré dans une version récente, CVE sur des paquets OS déjà patchés
en amont — exactement le genre de choses qu'un simple linter YAML ne peut pas détecter.

Le CD (`deploy-staging`, `deploy-production`) reste non exécuté : il suppose un hôte SSH réel
(staging/prod) que ce projet de démonstration ne provisionne pas. Sa syntaxe est validée et son
fonctionnement documenté dans [`docs/pipeline-architecture.md`](docs/pipeline-architecture.md#secrets-requis).

## Configuration requise pour un déploiement réel

1. Renseigner les secrets listés dans `docs/pipeline-architecture.md` (accès SSH staging/prod, webhook Slack).
2. Remplacer `OWNER/REPO` dans `infra/docker-compose.prod.yml` par le chemin réel du dépôt GHCR.
3. Créer les environnements GitHub `staging` et `production` (Settings → Environments), et
   ajouter au moins un reviewer requis sur `production` pour activer la gate manuelle.
4. Adapter les URLs `staging.compliance-tracker.example.com` / `compliance-tracker.example.com`
   dans `cd.yml` à vos noms de domaine réels.

## Licence

MIT — voir [`LICENSE`](LICENSE). Projet à but pédagogique et de démonstration.
