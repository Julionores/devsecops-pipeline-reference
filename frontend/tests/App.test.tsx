import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { ComplianceControl } from '../src/types';

const sampleControls: ComplianceControl[] = [
  {
    id: 'ctrl-1',
    framework: 'OWASP_ASVS',
    code: 'V1.1.1',
    title: 'Contrôle A',
    description: 'Description A',
    status: 'NOT_STARTED',
    owner: null,
    lastReviewedAt: null,
  },
  {
    id: 'ctrl-2',
    framework: 'PCI_DSS',
    code: '3.4',
    title: 'Contrôle B',
    description: 'Description B',
    status: 'COMPLIANT',
    owner: 'equipe-securite',
    lastReviewedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.endsWith('/api/controls')) {
          return new Response(JSON.stringify(sampleControls), { status: 200 });
        }
        if (url.includes('/status')) {
          const updated: ComplianceControl = { ...sampleControls[0]!, status: 'COMPLIANT' };
          return new Response(JSON.stringify(updated), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche les contrôles renvoyés par l’API', async () => {
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Chargement');

    await waitFor(() => {
      expect(screen.getByText('Contrôle A')).toBeInTheDocument();
    });
    expect(screen.getByText('Contrôle B')).toBeInTheDocument();
  });

  it('filtre les contrôles par référentiel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Contrôle A')).toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText('Référentiel :'), 'PCI_DSS');

    expect(screen.queryByText('Contrôle A')).not.toBeInTheDocument();
    expect(screen.getByText('Contrôle B')).toBeInTheDocument();
  });

  it('met à jour le statut d’un contrôle via le sélecteur', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Contrôle A')).toBeInTheDocument());

    const row = screen.getByText('Contrôle A').closest('tr');
    expect(row).not.toBeNull();
    const select = within(row as HTMLElement).getByRole('combobox');

    await user.selectOptions(select, 'COMPLIANT');

    await waitFor(() => {
      expect(within(row as HTMLElement).getByText('Conforme')).toBeInTheDocument();
    });
  });

  it('affiche un message d’erreur si l’API est injoignable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
