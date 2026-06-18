import { create } from 'zustand';
import { User } from '../types/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const stored = (() => {
  try {
    const t = localStorage.getItem('et_token');
    const u = localStorage.getItem('et_user');
    return t && u ? { token: t, user: JSON.parse(u) as User } : null;
  } catch { return null; }
})();

export const useAuthStore = create<AuthStore>((set) => ({
  user: stored?.user ?? null,
  token: stored?.token ?? null,

  setAuth: (user, token) => {
    localStorage.setItem('et_token', token);
    localStorage.setItem('et_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
    set({ user: null, token: null });
  },
}));
