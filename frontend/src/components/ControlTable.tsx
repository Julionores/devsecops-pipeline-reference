import type { ComplianceControl, ControlStatus } from '../types';
import { StatusBadge } from './StatusBadge';

const STATUS_OPTIONS: ControlStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLIANT',
  'NON_COMPLIANT',
];

interface ControlTableProps {
  controls: ComplianceControl[];
  onStatusChange: (id: string, status: ControlStatus) => void;
}

export function ControlTable({ controls, onStatusChange }: ControlTableProps) {
  if (controls.length === 0) {
    return <p role="status">Aucun contrôle ne correspond aux filtres sélectionnés.</p>;
  }

  return (
    <table className="control-table">
      <thead>
        <tr>
          <th scope="col">Référentiel</th>
          <th scope="col">Code</th>
          <th scope="col">Contrôle</th>
          <th scope="col">Statut</th>
          <th scope="col">Responsable</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {controls.map((control) => (
          <tr key={control.id}>
            <td>{control.framework === 'OWASP_ASVS' ? 'OWASP ASVS' : 'PCI-DSS'}</td>
            <td>{control.code}</td>
            <td>
              <div className="control-title">{control.title}</div>
              <div className="control-description">{control.description}</div>
            </td>
            <td>
              <StatusBadge status={control.status} />
            </td>
            <td>{control.owner ?? '—'}</td>
            <td>
              <label className="visually-hidden" htmlFor={`status-${control.id}`}>
                Changer le statut de {control.title}
              </label>
              <select
                id={`status-${control.id}`}
                value={control.status}
                onChange={(event) =>
                  onStatusChange(control.id, event.target.value as ControlStatus)
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
