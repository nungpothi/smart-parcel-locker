import { create } from "zustand";

type AuthState = Record<string, never>;

export const useAuthStore = create<AuthState>(() => ({}));
