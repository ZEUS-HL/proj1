import { Transaction, Summary } from '../types/transaction';
import { AuthResponse } from '../types/auth';

const BASE = '/api/transactions';
const AUTH = '/api/auth';

function getToken(): string | null {
  return localStorage.getItem('et_token');
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers, ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>(`${AUTH}/register`, { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>(`${AUTH}/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),

  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Transaction[]>(`${BASE}${qs}`);
  },
  getSummary: () => request<Summary>(`${BASE}/summary`),
  createTransaction: (data: Omit<Transaction, 'id' | 'completed' | 'created_at' | 'user_id'>) =>
    request<Transaction>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: Partial<Transaction>) =>
    request<Transaction>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleComplete: (id: number) =>
    request<Transaction>(`${BASE}/${id}/complete`, { method: 'PATCH' }),
  deleteTransaction: (id: number) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
