import { ComplianceControl } from '../types';

/**
 * Jeu de contrôles de démonstration inspiré (de façon non-exhaustive et simplifiée) de
 * l'OWASP ASVS et des exigences PCI-DSS. Ne constitue pas une checklist de conformité
 * officielle — sert uniquement à illustrer le fonctionnement de l'application.
 */
export function seedControls(): ComplianceControl[] {
  return [
    {
      id: 'ctrl-001',
      framework: 'OWASP_ASVS',
      code: 'V2.1.1',
      title: 'Politique de longueur de mot de passe',
      description:
        'Les mots de passe utilisateurs doivent faire au moins 12 caractères après normalisation Unicode.',
      status: 'COMPLIANT',
      owner: 'equipe-securite',
      lastReviewedAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'ctrl-002',
      framework: 'OWASP_ASVS',
      code: 'V3.2.1',
      title: 'Rotation des identifiants de session',
      description:
        "Un nouvel identifiant de session est généré à chaque changement de niveau d'authentification.",
      status: 'IN_PROGRESS',
      owner: 'equipe-backend',
      lastReviewedAt: null,
    },
    {
      id: 'ctrl-003',
      framework: 'OWASP_ASVS',
      code: 'V4.1.1',
      title: "Contrôle d'accès au niveau objet",
      description:
        "L'application impose le contrôle d'accès sur toute référence directe à un objet métier.",
      status: 'COMPLIANT',
      owner: 'equipe-backend',
      lastReviewedAt: '2026-08-15T00:00:00.000Z',
    },
    {
      id: 'ctrl-004',
      framework: 'PCI_DSS',
      code: '3.4',
      title: 'Illisibilité des données de titulaire de carte stockées',
      description:
        'Les PAN stockés sont rendus illisibles par chiffrement fort, hachage ou troncature.',
      status: 'NOT_STARTED',
      owner: null,
      lastReviewedAt: null,
    },
    {
      id: 'ctrl-005',
      framework: 'PCI_DSS',
      code: '8.3',
      title: 'Authentification multi-facteurs',
      description:
        "L'AMF est activée pour tout accès administrateur au périmètre de données de carte.",
      status: 'NON_COMPLIANT',
      owner: 'equipe-infra',
      lastReviewedAt: '2026-07-10T00:00:00.000Z',
    },
    {
      id: 'ctrl-006',
      framework: 'PCI_DSS',
      code: '10.2',
      title: 'Journalisation des accès aux données de titulaire',
      description:
        'Tous les accès individuels aux données de titulaire de carte sont journalisés et horodatés.',
      status: 'IN_PROGRESS',
      owner: 'equipe-securite',
      lastReviewedAt: null,
    },
  ];
}
