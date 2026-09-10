import { randomUUID } from 'crypto';
import { seedControls } from '../data/seed';
import { ComplianceControl, ComplianceSummary, ControlStatus, Framework } from '../types';

export class ControlNotFoundError extends Error {
  constructor(id: string) {
    super(`Contrôle introuvable: ${id}`);
    this.name = 'ControlNotFoundError';
  }
}

export interface CreateControlInput {
  framework: Framework;
  code: string;
  title: string;
  description: string;
  owner?: string | null;
}

export interface UpdateStatusInput {
  status: ControlStatus;
  owner?: string | null;
}

/**
 * Persistance en mémoire, volontairement simple : ce projet a pour vocation de faire la
 * démonstration d'une chaîne CI/CD DevSecOps, pas d'une architecture de persistance
 * avancée. Le contrat (interface publique de la classe) est cependant conçu pour pouvoir
 * être remplacé par une implémentation base de données sans changer les routes.
 */
export class ControlService {
  private controls: Map<string, ComplianceControl>;

  constructor(initial: ComplianceControl[] = seedControls()) {
    this.controls = new Map(initial.map((c) => [c.id, c]));
  }

  list(filter?: { framework?: Framework; status?: ControlStatus }): ComplianceControl[] {
    let result = Array.from(this.controls.values());
    if (filter?.framework) {
      result = result.filter((c) => c.framework === filter.framework);
    }
    if (filter?.status) {
      result = result.filter((c) => c.status === filter.status);
    }
    return result.sort((a, b) => a.code.localeCompare(b.code));
  }

  getById(id: string): ComplianceControl {
    const control = this.controls.get(id);
    if (!control) {
      throw new ControlNotFoundError(id);
    }
    return control;
  }

  create(input: CreateControlInput): ComplianceControl {
    const control: ComplianceControl = {
      id: `ctrl-${randomUUID()}`,
      framework: input.framework,
      code: input.code,
      title: input.title,
      description: input.description,
      status: 'NOT_STARTED',
      owner: input.owner ?? null,
      lastReviewedAt: null,
    };
    this.controls.set(control.id, control);
    return control;
  }

  updateStatus(id: string, input: UpdateStatusInput): ComplianceControl {
    const existing = this.getById(id);
    const updated: ComplianceControl = {
      ...existing,
      status: input.status,
      owner: input.owner !== undefined ? input.owner : existing.owner,
      lastReviewedAt: new Date().toISOString(),
    };
    this.controls.set(id, updated);
    return updated;
  }

  summary(): ComplianceSummary {
    const controls = this.list();
    const byStatus: Record<ControlStatus, number> = {
      NOT_STARTED: 0,
      IN_PROGRESS: 0,
      COMPLIANT: 0,
      NON_COMPLIANT: 0,
    };
    const byFramework: Record<Framework, number> = {
      OWASP_ASVS: 0,
      PCI_DSS: 0,
    };
    for (const control of controls) {
      byStatus[control.status] += 1;
      byFramework[control.framework] += 1;
    }
    return { total: controls.length, byStatus, byFramework };
  }
}
