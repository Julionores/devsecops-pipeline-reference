## Description

<!-- Que fait cette PR et pourquoi ? -->

## Checklist DevSecOps

- [ ] Les tests unitaires passent localement (`npm test` dans `backend/` et `frontend/`)
- [ ] Aucun secret n'a été commité (vérifié par Gitleaks en CI)
- [ ] Les nouvelles dépendances ont été vérifiées (licence + vulnérabilités connues)
- [ ] Les changements au pipeline CI/CD sont documentés dans `docs/pipeline-architecture.md`
- [ ] Si l'API a changé : la documentation des endpoints dans le README est à jour

## Impact sécurité

<!-- Cette PR touche-t-elle l'authentification, la validation d'entrée, les permissions,
     les secrets, ou la configuration réseau ? Si oui, préciser. -->
