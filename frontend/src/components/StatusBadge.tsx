import type { ControlStatus } from '../types';

const LABELS: Record<ControlStatus, string> = {
  NOT_STARTED: 'Non démarré',
  IN_PROGRESS: 'En cours',
  COMPLIANT: 'Conforme',
  NON_COMPLIANT: 'Non conforme',
};

const CLASS_NAMES: Record<ControlStatus, string> = {
  NOT_STARTED: 'badge badge--neutral',
  IN_PROGRESS: 'badge badge--warning',
  COMPLIANT: 'badge badge--success',
  NON_COMPLIANT: 'badge badge--danger',
};

export function StatusBadge({ status }: { status: ControlStatus }) {
  return <span className={CLASS_NAMES[status]}>{LABELS[status]}</span>;
}
