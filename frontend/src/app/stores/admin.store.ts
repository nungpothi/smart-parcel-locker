import { create } from "zustand";

type AdminState = Record<string, never>;

export const useAdminStore = create<AdminState>(() => ({}));
