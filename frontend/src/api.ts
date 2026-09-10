import type { ComplianceControl, ControlStatus } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(body.message ?? `Erreur HTTP ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export function fetchControls(): Promise<ComplianceControl[]> {
  return request<ComplianceControl[]>('/api/controls');
}

export function updateControlStatus(id: string, status: ControlStatus): Promise<ComplianceControl> {
  return request<ComplianceControl>(`/api/controls/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
