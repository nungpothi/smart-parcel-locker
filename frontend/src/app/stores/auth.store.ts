import { create } from "zustand";
import * as authApi from "../services/auth.api";
import { Role } from "../types/domain";

type AuthState = {
  userId: string | null;
  role: Role | null;
  phone: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, role: Role) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
  hydrateAuth: () => Promise<void>;
};

type AuthResponse = {
  user_id?: string;
  role?: Role;
  phone?: string;
  access_token?: string;
};

const initialState: AuthState = {
  userId: null,
  role: null,
  phone: null,
  accessToken: null,
  isAuthenticated: false
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  login: async (phone, password) => {
    const res = (await authApi.login({ phone, password })) as AuthResponse;
    if (res.access_token) {
      localStorage.setItem("AUTH_ACCESS_TOKEN", res.access_token);
    }
    set({
      userId: res.user_id ?? null,
      role: res.role ?? null,
      accessToken: res.access_token ?? null,
      isAuthenticated: true
    });
  },

  register: async (phone, password, role) => {
    await authApi.register({ phone, password, role });
    set({ ...initialState });
  },

  fetchMe: async () => {
    const res = (await authApi.me()) as AuthResponse;
    set((state) => ({
      userId: res.user_id ?? null,
      role: res.role ?? null,
      phone: res.phone ?? null,
      accessToken: state.accessToken,
      isAuthenticated: true
    }));
  },

  logout: async () => {
    await authApi.logout();
    localStorage.removeItem("AUTH_ACCESS_TOKEN");
    set({ ...initialState });
  },

  reset: () => set({ ...initialState }),

  hydrateAuth: async () => {
    const token = localStorage.getItem("AUTH_ACCESS_TOKEN");
    if (!token) return;
    set({ accessToken: token, isAuthenticated: true });
    try {
      await useAuthStore.getState().fetchMe();
    } catch (_error) {
      localStorage.removeItem("AUTH_ACCESS_TOKEN");
      set({ ...initialState });
    }
  }
}));
