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
    set({
      userId: res.user_id ?? null,
      role: res.role ?? null,
      phone: res.phone ?? null,
      accessToken: res.access_token ?? null,
      isAuthenticated: Boolean(res.access_token)
    });
  },

  register: async (phone, password, role) => {
    const res = (await authApi.register({ phone, password, role })) as AuthResponse;
    set({
      userId: res.user_id ?? null,
      role: res.role ?? null,
      phone: res.phone ?? null,
      accessToken: res.access_token ?? null,
      isAuthenticated: Boolean(res.access_token)
    });
  },

  fetchMe: async () => {
    const res = (await authApi.me()) as AuthResponse;
    set({
      userId: res.user_id ?? null,
      role: res.role ?? null,
      phone: res.phone ?? null,
      accessToken: res.access_token ?? null,
      isAuthenticated: Boolean(res.user_id)
    });
  },

  logout: async () => {
    await authApi.logout();
    set({ ...initialState });
  },

  reset: () => set({ ...initialState })
}));
