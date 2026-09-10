import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { ApiError, fetchControls, updateControlStatus } from './api';
import { ControlTable } from './components/ControlTable';
import type { ComplianceControl, ControlStatus, Framework } from './types';

type LoadState = 'loading' | 'ready' | 'error';

function App() {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [frameworkFilter, setFrameworkFilter] = useState<Framework | 'ALL'>('ALL');

  useEffect(() => {
    let cancelled = false;

    fetchControls()
      .then((data) => {
        if (!cancelled) {
          setControls(data);
          setLoadState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof ApiError ? error.message : 'Impossible de contacter l’API.';
          setErrorMessage(message);
          setLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredControls = useMemo(() => {
    if (frameworkFilter === 'ALL') {
      return controls;
    }
    return controls.filter((control) => control.framework === frameworkFilter);
  }, [controls, frameworkFilter]);

  async function handleStatusChange(id: string, status: ControlStatus): Promise<void> {
    const previous = controls;
    // Mise à jour optimiste : l'UI réagit immédiatement, puis se resynchronise ou revient
    // en arrière si l'appel API échoue.
    setControls((current) => current.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      const updated = await updateControlStatus(id, status);
      setControls((current) => current.map((c) => (c.id === id ? updated : c)));
    } catch {
      setControls(previous);
    }
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>ComplianceTracker</h1>
        <p>
          Suivi des contrôles de conformité OWASP ASVS / PCI-DSS — projet de démonstration du
          pipeline DevSecOps.
        </p>
      </header>

      <div className="filters">
        <label htmlFor="framework-filter">Référentiel :</label>
        <select
          id="framework-filter"
          value={frameworkFilter}
          onChange={(event) => setFrameworkFilter(event.target.value as Framework | 'ALL')}
        >
          <option value="ALL">Tous</option>
          <option value="OWASP_ASVS">OWASP ASVS</option>
          <option value="PCI_DSS">PCI-DSS</option>
        </select>
      </div>

      {loadState === 'loading' && <p role="status">Chargement des contrôles…</p>}
      {loadState === 'error' && (
        <p role="alert" className="error-message">
          {errorMessage}
        </p>
      )}
      {loadState === 'ready' && (
        <ControlTable controls={filteredControls} onStatusChange={handleStatusChange} />
      )}
    </main>
  );
}

export default App;
