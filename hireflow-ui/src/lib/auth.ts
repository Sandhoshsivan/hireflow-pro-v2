import { create } from 'zustand';
import type { User } from '../types';
import api from './api';

// Bridges the gap between the .NET API user shape and the frontend User type.
// The API returns roleTitle (not role), plan as "Free" (not "free"), and isAdmin as boolean.
function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as number,
    name: (raw.name as string) ?? '',
    email: (raw.email as string) ?? '',
    role: raw.isAdmin ? 'admin' : (raw.roleTitle as string ?? 'user').toLowerCase(),
    plan: ((raw.plan as string) ?? 'free').toLowerCase(),
    isActive: (raw.isActive as boolean) ?? true,
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
    lastLogin: raw.lastLogin as string | undefined,
    applicationCount: raw.applicationCount as number | undefined,
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('hireflow_token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('hireflow_token'),
  isAdmin: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('hireflow_token', data.token);
      const normalizedUser = normalizeUser(data.user);
      set({
        user: normalizedUser,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.isAdmin === true || data.user.roleTitle === 'Admin',
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, role = 'user') => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('hireflow_token', data.token);
      const normalizedUser = normalizeUser(data.user);
      set({
        user: normalizedUser,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.isAdmin === true || data.user.roleTitle === 'Admin',
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('hireflow_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  fetchProfile: async () => {
    if (!get().token) return;
    set({ isLoading: true });
    try {
      // The .NET API exposes the profile at /api/auth/me (not /api/auth/profile)
      const { data } = await api.get('/auth/me');
      const raw = data.user ?? data;
      const normalizedUser = normalizeUser(raw);
      set({
        user: normalizedUser,
        isAuthenticated: true,
        isAdmin: raw.isAdmin === true || raw.roleTitle === 'Admin' || raw.role === 'admin',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    const token = localStorage.getItem('hireflow_token');
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchProfile();
    }
  },
}));
