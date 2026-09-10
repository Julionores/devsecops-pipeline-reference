export type Framework = 'OWASP_ASVS' | 'PCI_DSS';

export type ControlStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLIANT' | 'NON_COMPLIANT';

export interface ComplianceControl {
  id: string;
  framework: Framework;
  code: string;
  title: string;
  description: string;
  status: ControlStatus;
  owner: string | null;
  lastReviewedAt: string | null;
}

export interface ComplianceSummary {
  total: number;
  byStatus: Record<ControlStatus, number>;
  byFramework: Record<Framework, number>;
}
