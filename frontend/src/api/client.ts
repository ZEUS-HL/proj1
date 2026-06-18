import { Transaction, Summary } from '../types/transaction';

const BASE = '/api/transactions';

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Transaction[]>(`${BASE}${qs}`);
  },
  getSummary: () => request<Summary>(`${BASE}/summary`),
  createTransaction: (data: Omit<Transaction, 'id' | 'completed' | 'created_at'>) =>
    request<Transaction>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: Partial<Transaction>) =>
    request<Transaction>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleComplete: (id: number) =>
    request<Transaction>(`${BASE}/${id}/complete`, { method: 'PATCH' }),
  deleteTransaction: (id: number) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
